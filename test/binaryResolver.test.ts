import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import { getLanguageServerPath, getPlatformInfo } from '../src/utils/binaryResolver';

// Mock the os module
vi.mock('os', () => ({
  platform: vi.fn(() => 'linux'),
  arch: vi.fn(() => 'x64')
}));

// Mock the fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  statSync: vi.fn(() => ({ size: 1000, isFile: () => true }))
}));

describe('binaryResolver', () => {
  describe('getPlatformInfo', () => {
    it('should return platform and architecture', () => {
      const result = getPlatformInfo();
      expect(result).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });
  });

  describe('getLanguageServerPath', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        extensionPath: '/test/extension'
      };
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

    it('should return correct path for macOS x64', () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      vi.mocked(os.arch).mockReturnValue('x64');

      const result = getLanguageServerPath(mockContext);
      expect(result).toBe(path.join('/test/extension', 'bin', 'spectrals-darwin-amd64'));
    });

    it('should return correct path for Linux x64', () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(os.arch).mockReturnValue('x64');

      const result = getLanguageServerPath(mockContext);
      expect(result).toBe(path.join('/test/extension', 'bin', 'spectrals-linux-amd64'));
    });

    it('should throw error for unsupported platform', () => {
      vi.mocked(os.platform).mockReturnValue('unsupported' as any);

      expect(() => getLanguageServerPath(mockContext)).toThrow('Unsupported platform: unsupported');
    });
  });
});