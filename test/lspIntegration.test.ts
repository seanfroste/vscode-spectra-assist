import { afterAll, describe, expect, it } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BIN_DIR = path.join(PROJECT_ROOT, 'bin');
const URI = 'file:///demo.in';
const TIMEOUT_MS = 5000;
const RANGE = (line: number, start: number, end: number) => ({
  start: { line, character: start },
  end: { line, character: end },
});

function getLspBinaryPath(): string | null {
  const names: Record<string, string> = {
    'win32-arm64': 'spectrals-windows-arm64.exe',
    'win32-x64': 'spectrals-windows-amd64.exe',
    'darwin-arm64': 'spectrals-darwin-arm64',
    'darwin-x64': 'spectrals-darwin-amd64',
    'linux-arm64': 'spectrals-linux-arm64',
    'linux-x64': 'spectrals-linux-amd64',
  };
  const name = names[`${process.platform}-${process.arch}`];
  if (!name) return null;
  const binary = path.join(BIN_DIR, name);
  return fs.existsSync(binary) ? binary : null;
}

function contractFixture() {
  const goTest = fs.readFileSync(path.join(PROJECT_ROOT, 'spectrals/tests/lsp_test.go'), 'utf8');
  const textLiteral = goTest.match(/text := ("(?:[^"\\]|\\.)*")/);
  const changeLiteral = goTest.match(/"contentChanges": \[\]any\{map\[string\]any\{"text": ("(?:[^"\\]|\\.)*")/);
  if (!textLiteral || !changeLiteral) throw new Error('Private tagged protocol fixture missing');
  return {
    text: JSON.parse(textLiteral[1]) as string,
    changed: JSON.parse(changeLiteral[1]) as string,
  };
}

type Message = Record<string, any>;

class Protocol {
  private buffer = Buffer.alloc(0);
  private readonly messages: Message[] = [];
  private readonly waiters: Array<{
    match: (message: Message) => boolean;
    resolve: (message: Message) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];
  private readonly errors: string[] = [];

  constructor(readonly process: ChildProcess) {
    process.stderr?.on('data', data => this.errors.push(data.toString()));
    process.stdout?.on('data', data => {
      this.buffer = Buffer.concat([this.buffer, data]);
      try {
        for (;;) {
          const headerEnd = this.buffer.indexOf('\r\n\r\n');
          if (headerEnd < 0) return;
          const header = this.buffer.subarray(0, headerEnd).toString('ascii');
          const match = header.match(/^Content-Length:\s*(\d+)$/im);
          if (!match) throw new Error(`Malformed LSP frame header: ${header}`);
          const length = Number(match[1]);
          if (this.buffer.length < headerEnd + 4 + length) return;
          const message = JSON.parse(
            this.buffer.subarray(headerEnd + 4, headerEnd + 4 + length).toString('utf8')
          );
          this.buffer = this.buffer.subarray(headerEnd + 4 + length);
          if (message.jsonrpc !== '2.0') throw new Error(`Malformed JSON-RPC message: ${JSON.stringify(message)}`);
          const index = this.waiters.findIndex(waiter => waiter.match(message));
          if (index >= 0) {
            const [waiter] = this.waiters.splice(index, 1);
            clearTimeout(waiter.timer);
            waiter.resolve(message);
          } else {
            this.messages.push(message);
          }
        }
      } catch (error) {
        this.rejectAll(error instanceof Error ? error : new Error(String(error)));
      }
    });
    process.on('error', error => this.rejectAll(error));
    process.on('exit', code => {
      if (this.waiters.length) this.rejectAll(new Error(`Server exited (${code}); stderr: ${this.errors.join('')}`));
    });
  }

  private rejectAll(error: Error) {
    for (const waiter of this.waiters.splice(0)) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }

  private receive(match: (message: Message) => boolean): Promise<Message> {
    const index = this.messages.findIndex(match);
    if (index >= 0) return Promise.resolve(this.messages.splice(index, 1)[0]);
    return new Promise((resolve, reject) => {
      const waiter = {
        match, resolve, reject,
        timer: setTimeout(() => {
          this.waiters.splice(this.waiters.indexOf(waiter), 1);
          reject(new Error(`Timed out waiting for protocol message; stderr: ${this.errors.join('')}`));
        }, TIMEOUT_MS),
      };
      this.waiters.push(waiter);
    });
  }

  send(method: string, params?: object, id?: number) {
    const body = JSON.stringify({
      jsonrpc: '2.0', method,
      ...(params === undefined ? {} : { params }),
      ...(id === undefined ? {} : { id }),
    });
    this.process.stdin?.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
  }

  async request(method: string, params?: object) {
    const id = Math.floor(Math.random() * 0x7fffffff);
    const responsePromise = this.receive(message => message.id === id);
    this.send(method, params, id);
    const response = await responsePromise;
    if (response.error) throw new Error(`${method} error: ${JSON.stringify(response.error)}`);
    if (!Object.hasOwn(response, 'result')) throw new Error(`${method} response has no result`);
    return response.result;
  }

  diagnostics(uri = URI) {
    return this.receive(message => message.method === 'textDocument/publishDiagnostics' && message.params?.uri === uri)
      .then(message => message.params.diagnostics as Message[]);
  }
}

function position(line: number, character: number) {
  return { textDocument: { uri: URI }, position: { line, character } };
}

describe('LSP Integration', () => {
  const binaryPath = getLspBinaryPath();
  let serverProcess: ChildProcess | undefined;
  afterAll(() => {
    if (serverProcess && serverProcess.exitCode === null) serverProcess.kill();
  });

  it.skipIf(!binaryPath)('exposes the exact v0.4.0 initialize contract and shuts down cleanly', async () => {
    serverProcess = spawn(binaryPath!, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    const protocol = new Protocol(serverProcess);
    const init = await protocol.request('initialize', { capabilities: {} });
    expect(init).toEqual({
      capabilities: {
        textDocumentSync: 1, hoverProvider: true, completionProvider: {},
        definitionProvider: true, referencesProvider: true, documentSymbolProvider: true,
      },
      serverInfo: { name: 'spectrals', version: '0.4.0' },
    });
    protocol.send('initialized', {});
    expect(await protocol.request('shutdown', {})).toBeNull();
    protocol.send('exit');
    await expect(new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server did not exit after shutdown')), TIMEOUT_MS);
      serverProcess!.once('exit', code => {
        clearTimeout(timer);
        code === 0 ? resolve() : reject(new Error(`Server exit code ${code}`));
      });
    })).resolves.toBeUndefined();
  });

  it.skipIf(!binaryPath)('serves diagnostics and semantic LSP features across settings and document lifecycle', async () => {
    const { text, changed } = contractFixture();
    const lines = text.split('\n');
    const lastName = lines[6].split(' ')[0];
    const parameter = lines[6].slice(5).split('=')[0];
    const detail = lines[6].slice(10);
    const catalogue = fs.readFileSync(path.join(PROJECT_ROOT, 'spectrals/internal/catalogue/data.go'), 'utf8');
    const sourceEntry = [...catalogue.matchAll(/\{Name: ("(?:[^"\\]|\\.)*"), MinLength: \d+, Description: ("(?:[^"\\]|\\.)*")/g)]
      .find(match => JSON.parse(match[1]) === lastName);
    if (!sourceEntry) throw new Error('Private catalogue entry missing');
    const hoverDescription = JSON.parse(sourceEntry[2]);

    serverProcess = spawn(binaryPath!, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    const protocol = new Protocol(serverProcess);
    const init = await protocol.request('initialize', { initializationOptions: { diagnosticsSeverity: 'warning' } });
    protocol.send('initialized', {});
    protocol.send('textDocument/didOpen', {
      textDocument: { uri: URI, languageId: 'spectra-in', version: 1, text },
    });
    const diagnostics = await protocol.diagnostics();
    expect(diagnostics).toHaveLength(4);
    expect(diagnostics.map(({ source, code, severity, range }) => ({ source, code, severity, range }))).toEqual([
      { source: 'spectrals', code: 'unknown-statement', severity: 2, range: RANGE(3, 0, 7) },
      { source: 'spectrals', code: 'statement-after-end', severity: 2, range: RANGE(5, 0, 5) },
      { source: 'spectrals', code: 'unknown-statement', severity: 2, range: RANGE(5, 0, 5) },
      { source: 'spectrals', code: 'statement-after-end', severity: 2, range: RANGE(6, 0, 4) },
    ]);
    expect(init.capabilities).toHaveProperty('documentSymbolProvider', true);

    expect(await protocol.request('textDocument/hover', position(6, 1))).toEqual({ contents: hoverDescription });
    const completion = await protocol.request('textDocument/completion', position(6, 5));
    expect(completion).toContainEqual(expect.objectContaining({ label: parameter, kind: 6 }));
    expect(await protocol.request('textDocument/definition', position(2, 20))).toEqual({
      uri: URI, range: RANGE(1, 0, 6),
    });
    expect(await protocol.request('textDocument/references', {
      ...position(2, 20), context: { includeDeclaration: true },
    })).toEqual([
      { uri: URI, range: RANGE(1, 0, 6) },
      { uri: URI, range: RANGE(2, 18, 24) },
    ]);
    const symbols = await protocol.request('textDocument/documentSymbol', { textDocument: { uri: URI } });
    const save = symbols.at(-1);
    expect({ name: save.name, kind: save.kind, selectionRange: save.selectionRange })
      .toEqual({ name: lastName, kind: 20, selectionRange: RANGE(6, 0, 4) });
    expect(save.children[0]).toMatchObject({
      name: parameter, kind: 7, detail, selectionRange: RANGE(6, 5, 9),
    });

    protocol.send('workspace/didChangeConfiguration', {
      settings: { diagnosticsSeverity: 'error', maxDiagnosticsPerFile: 1 },
    });
    expect(await protocol.diagnostics()).toEqual([]);
    protocol.send('textDocument/didChange', {
      textDocument: { uri: URI, version: 2 }, contentChanges: [{ text: `${text}\n${changed}` }],
    });
    const mixedDiagnostics = await protocol.diagnostics();
    expect(mixedDiagnostics.map(({ code, severity }) => ({ code, severity }))).toEqual([
      { code: 'syntax-error', severity: 1 },
    ]);
    protocol.send('textDocument/didChange', {
      textDocument: { uri: URI, version: 3 }, contentChanges: [{ text: changed }],
    });
    const changedDiagnostics = await protocol.diagnostics();
    expect(changedDiagnostics).toHaveLength(1);
    expect(changedDiagnostics[0]).toMatchObject({ source: 'spectrals', code: 'syntax-error', severity: 1 });

    protocol.send('workspace/didChangeConfiguration', {
      settings: { intellisense: false, navigation: false, diagnostics: false },
    });
    expect(await protocol.diagnostics()).toEqual([]);
    expect(await protocol.request('textDocument/hover', position(2, 1))).toBeNull();
    expect(await protocol.request('textDocument/completion', position(2, 5))).toEqual([]);
    expect(await protocol.request('textDocument/definition', position(2, 1))).toBeNull();
    expect(await protocol.request('textDocument/references', {
      ...position(2, 1), context: { includeDeclaration: true },
    })).toEqual([]);
    expect((await protocol.request('textDocument/documentSymbol', { textDocument: { uri: URI } })).at(-1).name)
      .toBe(lastName);

    protocol.send('textDocument/didClose', { textDocument: { uri: URI } });
    expect(await protocol.diagnostics()).toEqual([]);
    expect(await protocol.request('textDocument/documentSymbol', { textDocument: { uri: URI } })).toEqual([]);
    expect(await protocol.request('shutdown', {})).toBeNull();
    protocol.send('exit');
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server did not exit after shutdown')), TIMEOUT_MS);
      serverProcess!.once('exit', code => {
        clearTimeout(timer);
        code === 0 ? resolve() : reject(new Error(`Server exit code ${code}`));
      });
    });
  });
});
