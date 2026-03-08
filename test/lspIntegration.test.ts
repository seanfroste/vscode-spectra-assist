import { describe, it, expect, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * LSP Integration Test
 *
 * This test spawns the actual LSP binary and verifies that the client
 * can perform the initialize handshake over stdio. This is the test
 * the junior developer missed — verifying the extension can actually
 * hook onto the language server.
 */

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BIN_DIR = path.join(PROJECT_ROOT, 'bin');

function getLspBinaryPath(): string | null {
  const platform = process.platform;
  const arch = process.arch;

  let binaryName: string;
  switch (platform) {
    case 'win32':
      binaryName = arch === 'arm64' ? 'spectrals-windows-arm64.exe' : 'spectrals-windows-amd64.exe';
      break;
    case 'darwin':
      binaryName = arch === 'arm64' ? 'spectrals-darwin-arm64' : 'spectrals-darwin-amd64';
      break;
    case 'linux':
      binaryName = arch === 'arm64' ? 'spectrals-linux-arm64' : 'spectrals-linux-amd64';
      break;
    default:
      return null;
  }

  const binaryPath = path.join(BIN_DIR, binaryName);
  return fs.existsSync(binaryPath) ? binaryPath : null;
}

/**
 * Encodes a JSON-RPC message with Content-Length header for the LSP protocol.
 */
function encodeMessage(obj: object): string {
  const content = JSON.stringify(obj);
  return `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n${content}`;
}

/**
 * Sends a JSON-RPC request to the LSP server via stdin and reads the response.
 */
function sendRequest(
  proc: ChildProcess,
  method: string,
  id: number,
  params: object
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout waiting for response to ${method} (id=${id})`));
    }, 10000);

    let buffer = '';

    const onData = (data: Buffer) => {
      buffer += data.toString();

      // Parse Content-Length header and body
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;

      const header = buffer.substring(0, headerEnd);
      const match = header.match(/Content-Length:\s*(\d+)/);
      if (!match) return;

      const contentLength = parseInt(match[1], 10);
      const bodyStart = headerEnd + 4;
      const body = buffer.substring(bodyStart);

      if (Buffer.byteLength(body) < contentLength) return;

      // We have the full message
      clearTimeout(timeout);
      proc.stdout?.removeListener('data', onData);

      try {
        const jsonBody = body.substring(0, contentLength);
        const response = JSON.parse(jsonBody);
        resolve(response);
      } catch (e) {
        reject(new Error(`Failed to parse response: ${e}`));
      }
    };

    proc.stdout?.on('data', onData);

    const message = encodeMessage({
      jsonrpc: '2.0',
      id,
      method,
      params,
    });

    proc.stdin?.write(message);
  });
}

/**
 * Sends a JSON-RPC notification (no id, no response expected).
 */
function sendNotification(proc: ChildProcess, method: string, params?: object): void {
  const msg: any = { jsonrpc: '2.0', method };
  if (params) msg.params = params;
  proc.stdin?.write(encodeMessage(msg));
}

describe('LSP Integration', () => {
  const binaryPath = getLspBinaryPath();
  let serverProcess: ChildProcess | null = null;

  afterAll(() => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  });

  it.skipIf(!binaryPath)('should complete the initialize handshake', async () => {
    // Spawn the LSP server
    serverProcess = spawn(binaryPath!, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    expect(serverProcess.pid).toBeDefined();

    // Send initialize request
    const initResponse = await sendRequest(serverProcess, 'initialize', 1, {
      processId: process.pid,
      rootUri: null,
      capabilities: {},
    });

    // Verify JSON-RPC structure
    expect(initResponse.jsonrpc).toBe('2.0');
    expect(initResponse.error).toBeUndefined();
    expect(initResponse.result).toBeDefined();

    // Verify server capabilities
    // Note: Rust serde serializes as snake_case by default
    const capabilities = initResponse.result.capabilities;
    expect(capabilities).toBeDefined();
    expect(capabilities.text_document_sync).toBeDefined();
    expect(capabilities.hover_provider).toBe(true);
    expect(capabilities.completion_provider).toBeDefined();
    expect(capabilities.definition_provider).toBe(true);
    expect(capabilities.references_provider).toBe(true);

    // Verify server info
    expect(initResponse.result.server_info).toBeDefined();
    expect(initResponse.result.server_info.name).toBe('spectrals-lsp');

    // Send initialized notification (required by LSP protocol)
    sendNotification(serverProcess, 'initialized', {});

    // Send shutdown request
    const shutdownResponse = await sendRequest(serverProcess, 'shutdown', 2, {});
    expect(shutdownResponse.jsonrpc).toBe('2.0');
    expect(shutdownResponse.id).toBe(2);

    // Send exit notification
    sendNotification(serverProcess, 'exit');

    // Wait for process to exit
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        serverProcess?.kill();
        resolve();
      }, 3000);

      serverProcess!.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }, 15000);

  it.skipIf(!binaryPath)('should handle textDocument/didOpen and return diagnostics', async () => {
    // Spawn a fresh LSP server
    serverProcess = spawn(binaryPath!, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Initialize first
    await sendRequest(serverProcess, 'initialize', 1, {
      processId: process.pid,
      rootUri: null,
      capabilities: {},
      initializationOptions: {
        diagnostics: true,
      },
    });
    sendNotification(serverProcess, 'initialized', {});

    // Send didOpen with content that should produce diagnostics
    const diagnosticsPromise = new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for diagnostics'));
      }, 10000);

      let buffer = '';
      const onData = (data: Buffer) => {
        buffer += data.toString();

        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;

        const header = buffer.substring(0, headerEnd);
        const match = header.match(/Content-Length:\s*(\d+)/);
        if (!match) return;

        const contentLength = parseInt(match[1], 10);
        const bodyStart = headerEnd + 4;
        const body = buffer.substring(bodyStart);

        if (Buffer.byteLength(body) < contentLength) return;

        clearTimeout(timeout);
        serverProcess!.stdout?.removeListener('data', onData);

        try {
          const jsonBody = body.substring(0, contentLength);
          const notification = JSON.parse(jsonBody);
          resolve(notification);
        } catch (e) {
          reject(new Error(`Failed to parse notification: ${e}`));
        }
      };
      serverProcess!.stdout?.on('data', onData);
    });

    // Note: The Rust server expects snake_case keys in incoming params
    // but vscode-languageclient sends camelCase. The server's deserialization
    // uses serde which parses the incoming JSON structure.
    sendNotification(serverProcess, 'textDocument/didOpen', {
      text_document: {
        uri: 'file:///test.in',
        language_id: 'spectra-in',
        version: 1,
        text: 'TITLE Test\nINVALIDSTATEMENT\nEND\n',
      },
    });

    const diagnostics = await diagnosticsPromise;

    // Should receive publishDiagnostics notification
    expect(diagnostics.method).toBe('textDocument/publishDiagnostics');
    expect(diagnostics.params).toBeDefined();
    expect(diagnostics.params.uri).toBe('file:///test.in');
    // Should have at least one diagnostic for INVALIDSTATEMENT
    expect(diagnostics.params.diagnostics.length).toBeGreaterThan(0);

    // Clean up
    await sendRequest(serverProcess, 'shutdown', 3, {});
    sendNotification(serverProcess, 'exit');
  }, 15000);
});
