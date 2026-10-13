import Mocha from 'mocha';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run() {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 30000 });
  mocha.addFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'lsp.test.js'));
  await mocha.loadFilesAsync();
  const { promise, resolve, reject } = Promise.withResolvers();
  const runner = mocha.run(failures => {
    if (failures) reject(new Error(`${failures} Extension Development Host test(s) failed`));
    else resolve();
  });
  runner.on('fail', (test, error) => {
    process.stderr.write(`Host failure in ${test.title}: ${error.message}\n${error.stack}\n`);
  });
  await promise;
  const resultPath = process.env.SPECTRA_HOST_TEST_RESULT;
  if (!resultPath) throw new Error('Extension-host result path is required');
  await writeFile(resultPath, 'passed', 'utf8');
}
