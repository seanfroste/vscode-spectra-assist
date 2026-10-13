import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ExtensionContext } from 'vscode';
import { getLanguageServerPath } from '../src/utils/binaryResolver';

// Mock the os module
vi.mock('node:os', () => ({
  platform: vi.fn(() => 'linux'),
  arch: vi.fn(() => 'x64'),
}));

describe('binaryResolver', () => {
  describe('getLanguageServerPath', () => {
    const mockContext = { extensionPath: '/test/extension' } as ExtensionContext;

    beforeEach(() => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(os.arch).mockReturnValue('x64');
    });

    it('should return correct path for Windows x64', () => {
      vi.mocked(os.platform).mockReturnValue('win32');
      vi.mocked(os.arch).mockReturnValue('x64');

      const result = getLanguageServerPath(mockContext);
      expect(result).toBe(path.join('/test/extension', 'bin', 'spectrals-windows-amd64.exe'));
    });

    it('should return correct path for macOS ARM64', () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      vi.mocked(os.arch).mockReturnValue('arm64');

      const result = getLanguageServerPath(mockContext);
      expect(result).toBe(path.join('/test/extension', 'bin', 'spectrals-darwin-arm64'));
    });

    it('should throw error for macOS x64', () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      vi.mocked(os.arch).mockReturnValue('x64');

      expect(() => getLanguageServerPath(mockContext)).toThrow(
        'Unsupported architecture: x64 on macOS. Only arm64 is supported.'
      );
    });

    it('should return correct path for Linux x64', () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(os.arch).mockReturnValue('x64');

      const result = getLanguageServerPath(mockContext);
      expect(result).toBe(path.join('/test/extension', 'bin', 'spectrals-linux-x64'));
    });

    it('should throw error for unsupported platform', () => {
      vi.mocked(os.platform).mockReturnValue('freebsd');

      expect(() => getLanguageServerPath(mockContext)).toThrow('Unsupported platform: freebsd');
    });
  });
});
