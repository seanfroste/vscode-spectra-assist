import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // VS Code extensions run in Node.js
    include: ['test/**/*.test.ts'],
  },
});