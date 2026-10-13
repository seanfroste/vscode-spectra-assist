import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Build for Node.js (SSR mode) to prevent bundling the browser version of vscode-languageclient
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: true,
    target: 'node16',
    lib: {
      entry: resolve(import.meta.dirname, 'src/extension.ts'),
      formats: ['cjs'],
      fileName: 'extension',
    },
    rolldownOptions: {
      external: ['vscode', 'path', 'fs', 'os'],
      output: {
        format: 'cjs',
        exports: 'named',
        globals: {
          vscode: 'vscode',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});
