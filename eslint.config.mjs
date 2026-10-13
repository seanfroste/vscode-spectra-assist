import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import jsonc from 'eslint-plugin-jsonc';
import n from 'eslint-plugin-n';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, globalIgnores } from 'eslint/config';
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));
const jsonRules = (...configs) => Object.assign({}, ...configs.map(config => config.rules));

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/.git/**',
    'spectrals/**',
    'bin/**',
    'dist/**',
    'out/**',
    'coverage/**',
    '.nyc_output/**',
    '.vscode-test/**',
    '.vscode-test-web/**',
    'package-lock.json',
    '**/*.vsix',
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir,
      },
    },
    plugins: { n },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { checkThenables: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'n/prefer-node-protocol': 'error',
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    plugins: { n },
    extends: ['n/recommended-module'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    settings: { node: { version: '>=22.13.0' } },
    rules: {
      'n/prefer-node-protocol': 'error',
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': ['error', { allowModules: ['vscode'] }],
      'n/no-extraneous-import': ['error', { allowModules: ['vscode'] }],
    },
  },
  {
    files: ['test/**/*.test.ts'],
    plugins: { vitest },
    extends: [vitest.configs.recommended],
    rules: {
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/prefer-vi-mocked': 'error',
      'vitest/prefer-called-exactly-once-with': 'error',
      'vitest/prefer-mock-promise-shorthand': 'error',
      '@typescript-eslint/unbound-method': 'off',
      'vitest/unbound-method': 'error',
    },
  },
  {
    files: ['test/lspIntegration.test.ts'],
    rules: {
      'vitest/no-disabled-tests': 'off',
    },
  },
  {
    files: ['test/vscode/suite/lsp.test.js'],
    languageOptions: { globals: { suite: 'readonly', test: 'readonly' } },
  },
  {
    files: ['**/*.json', '.prettierrc'],
    ignores: ['.vscode/**/*.json', 'tsconfig*.json'],
    language: 'jsonc/json',
    plugins: { jsonc },
    rules: {
      ...jsonRules(...jsonc.configs['flat/recommended-with-json']),
      'jsonc/no-comments': 'off',
    },
  },
  {
    files: ['**/*.code-snippets', '.vscode/**/*.json', 'tsconfig*.json', '**/*.jsonc'],
    language: 'jsonc/jsonc',
    plugins: { jsonc },
    rules: jsonRules(...jsonc.configs['flat/recommended-with-jsonc']),
  },
  jsonc.configs['flat/prettier'],
  prettier,
]);
