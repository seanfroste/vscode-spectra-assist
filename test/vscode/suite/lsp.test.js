import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as vscode from 'vscode';

const suiteDirectory = path.dirname(fileURLToPath(import.meta.url));

const fixturePath = process.env.SPECTRA_TEST_FIXTURE;
const changedFixture = process.env.SPECTRA_CHANGED_FIXTURE;
assert(fixturePath && changedFixture, 'Temporary protocol fixture environment is required');
const documentUri = vscode.Uri.file(fixturePath);
const fixtureText = fs.readFileSync(fixturePath, 'utf8');
const lines = fixtureText.split('\n');
const lastName = lines[6].split(' ')[0];
const parameter = lines[6].slice(5).split('=')[0];
const parameterDetail = lines[6].slice(10);
const catalogue = fs.readFileSync(path.resolve(suiteDirectory, '../../../spectrals/internal/catalogue/data.go'), 'utf8');
const statement = [...catalogue.matchAll(/\{Name: ("(?:[^"\\]|\\.)*"), MinLength: \d+, Description: ("(?:[^"\\]|\\.)*")/g)]
  .find(match => JSON.parse(match[1]) === lastName);
assert(statement, 'Private contract catalogue entry missing');
const statementDescription = JSON.parse(statement[2]);

function range(line, start, end) {
  return new vscode.Range(line, start, line, end);
}

function diagnosticSnapshot(diagnostic) {
  return {
    source: diagnostic.source,
    code: diagnostic.code,
    severity: diagnostic.severity,
    start: [diagnostic.range.start.line, diagnostic.range.start.character],
    end: [diagnostic.range.end.line, diagnostic.range.end.character],
  };
}

function waitForDiagnostics(predicate) {
  const { promise, resolve, reject } = Promise.withResolvers();
  const timer = setTimeout(() => {
    disposable.dispose();
    reject(new Error(
      `Timed out waiting for diagnostics; got ${JSON.stringify(vscode.languages.getDiagnostics(documentUri).map(diagnosticSnapshot))}`
    ));
  }, 10000);
  const finish = diagnostics => {
    clearTimeout(timer);
    disposable.dispose();
    resolve(diagnostics);
  };
  const disposable = vscode.languages.onDidChangeDiagnostics(event => {
    if (event.uris.some(uri => uri.toString() === documentUri.toString())) {
      const diagnostics = vscode.languages.getDiagnostics(documentUri);
      if (predicate(diagnostics)) finish(diagnostics);
    }
  });
  const current = vscode.languages.getDiagnostics(documentUri);
  if (predicate(current)) finish(current);
  return promise;
}

suite('Spectra Assist real Language Server', function () {
  test('provides concrete protocol features and applies settings, full changes, and close clearing', async function () {
    const extension = vscode.extensions.getExtension('seanfroste.vscode-spectra-assist');
    assert(extension, 'Spectra Assist extension must be installed in the development host');
    await extension.activate();

    await vscode.commands.executeCommand('vscode.open', documentUri);
    const editor = vscode.window.activeTextEditor;
    assert(editor);
    const document = editor.document;
    assert.equal(document.languageId, 'spectra-in');

    const configuration = vscode.workspace.getConfiguration('spectrals');
    await configuration.update('diagnosticsSeverity', 'warning', vscode.ConfigurationTarget.Workspace);
    const initialDiagnostics = await waitForDiagnostics(items => items.length === 4);
    assert.deepEqual(initialDiagnostics.map(diagnosticSnapshot), [
      { source: 'spectrals', code: 'unknown-statement', severity: vscode.DiagnosticSeverity.Warning, start: [3, 0], end: [3, 7] },
      { source: 'spectrals', code: 'statement-after-end', severity: vscode.DiagnosticSeverity.Warning, start: [5, 0], end: [5, 5] },
      { source: 'spectrals', code: 'unknown-statement', severity: vscode.DiagnosticSeverity.Warning, start: [5, 0], end: [5, 5] },
      { source: 'spectrals', code: 'statement-after-end', severity: vscode.DiagnosticSeverity.Warning, start: [6, 0], end: [6, 4] },
    ]);

    const hover = await vscode.commands.executeCommand('vscode.executeHoverProvider', documentUri, new vscode.Position(6, 1));
    assert.equal(hover.length, 1);
    assert(hover[0].contents.some(content => content.value === statementDescription));

    const completion = await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider', documentUri, new vscode.Position(6, 5)
    );
    assert(completion.items.some(item => item.label === parameter && item.kind === vscode.CompletionItemKind.Variable));

    const definitions = await vscode.commands.executeCommand(
      'vscode.executeDefinitionProvider', documentUri, new vscode.Position(2, 20)
    );
    assert.equal(definitions.length, 1);
    assert.equal(definitions[0].uri.toString(), documentUri.toString());
    assert.deepEqual(definitions[0].range, range(1, 0, 6));

    const references = await vscode.commands.executeCommand(
      'vscode.executeReferenceProvider', documentUri, new vscode.Position(2, 20), { includeDeclaration: true }
    );
    assert.deepEqual(references.map(location => [location.uri.toString(), location.range.start.line, location.range.start.character, location.range.end.character]), [
      [documentUri.toString(), 1, 0, 6], [documentUri.toString(), 2, 18, 24],
    ]);

    const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', documentUri);
    const symbol = symbols.at(-1);
    assert.equal(symbol.name, lastName);
    assert.equal(symbol.kind, vscode.SymbolKind.Key);
    assert.deepEqual(symbol.selectionRange, range(6, 0, 4));
    assert.equal(symbol.children.length, 1);
    assert.equal(symbol.children[0].name, parameter);
    assert.equal(symbol.children[0].kind, vscode.SymbolKind.Property);
    assert.equal(symbol.children[0].detail, parameterDetail);
    assert.deepEqual(symbol.children[0].selectionRange, range(6, 5, 9));

    await configuration.update('diagnosticsSeverity', 'error', vscode.ConfigurationTarget.Workspace);
    await waitForDiagnostics(items => items.length === 0);
    const changed = waitForDiagnostics(items => items.length === 1 && items[0].code === 'syntax-error');
    await editor.edit(edit => edit.replace(new vscode.Range(0, 0, document.lineCount, 0), changedFixture));
    const updatedDiagnostics = await changed;
    assert.deepEqual(diagnosticSnapshot(updatedDiagnostics[0]), {
      source: 'spectrals', code: 'syntax-error', severity: vscode.DiagnosticSeverity.Error,
      start: [1, 9], end: [1, 10],
    });

    await configuration.update('intellisense', false, vscode.ConfigurationTarget.Workspace);
    await configuration.update('navigation', false, vscode.ConfigurationTarget.Workspace);
    await configuration.update('diagnostics', false, vscode.ConfigurationTarget.Workspace);
    await waitForDiagnostics(items => items.length === 0);
    const disabledHover = await vscode.commands.executeCommand('vscode.executeHoverProvider', documentUri, new vscode.Position(2, 1));
    assert.deepEqual(disabledHover, []);
    const disabledCompletion = await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider', documentUri, new vscode.Position(2, 5)
    );
    assert(!disabledCompletion.items.some(item => item.label === parameter));
    assert.deepEqual(await vscode.commands.executeCommand(
      'vscode.executeDefinitionProvider', documentUri, new vscode.Position(2, 1)
    ), []);
    assert.deepEqual(await vscode.commands.executeCommand(
      'vscode.executeReferenceProvider', documentUri, new vscode.Position(2, 1), { includeDeclaration: true }
    ), []);
    const symbolsWhenDisabled = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', documentUri);
    assert.equal(symbolsWhenDisabled.at(-1).name, lastName);

    await configuration.update('diagnostics', true, vscode.ConfigurationTarget.Workspace);
    await configuration.update('diagnosticsSeverity', 'warning', vscode.ConfigurationTarget.Workspace);
    await waitForDiagnostics(items => items.length > 0);
    await document.save();
    const cleared = waitForDiagnostics(items => items.length === 0);
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    await cleared;
    assert(!vscode.workspace.textDocuments.some(open => open.uri.toString() === documentUri.toString()));
  });
});
