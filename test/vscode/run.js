import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

async function waitForTestResult(file) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const result = await readFile(file, 'utf8');
      if (result === 'passed') return;
      if (result.length > 0)
        throw new Error(`Extension-host suite reported unexpected result: ${result}`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Extension-host suite did not report completion within 30 seconds');
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const work = await mkdtemp(path.join(os.tmpdir(), 'spectra-assist-host-'));
try {
  const goTest = await readFile(path.join(root, 'spectrals/tests/lsp_test.go'), 'utf8');
  const fixture = goTest.match(/text := ("(?:[^"\\]|\\.)*")/);
  const changed = goTest.match(
    /"contentChanges": \[\]any\{map\[string\]any\{"text": ("(?:[^"\\]|\\.)*")/
  );
  assert(fixture && changed, 'Private tagged contract fixture missing');
  const workspace = path.join(work, 'workspace');
  await mkdir(workspace);
  const fixturePath = path.join(workspace, 'probe.in');
  await writeFile(fixturePath, JSON.parse(fixture[1]), 'utf8');
  process.env.SPECTRA_TEST_FIXTURE = fixturePath;
  process.env.SPECTRA_CHANGED_FIXTURE = JSON.parse(changed[1]);
  const testResultPath = path.join(work, 'test-result');
  process.env.SPECTRA_HOST_TEST_RESULT = testResultPath;

  const result = await runTests({
    ...(process.env.VSCODE_EXECUTABLE
      ? { vscodeExecutablePath: process.env.VSCODE_EXECUTABLE }
      : {}),
    extensionDevelopmentPath: root,
    extensionTestsPath: path.join(root, 'test/vscode/suite/index.js'),
    launchArgs: [
      workspace,
      '--disable-extensions',
      `--user-data-dir=${path.join(work, 'user-data')}`,
      `--extensions-dir=${path.join(work, 'extensions')}`,
    ],
  });
  await waitForTestResult(testResultPath);
  if (typeof result === 'number' && result !== 0) process.exitCode = result;
} finally {
  await rm(work, { recursive: true, force: true });
}
