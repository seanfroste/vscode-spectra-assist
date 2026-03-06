import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock VS Code APIs before importing extension
vi.mock('vscode', () => ({
  window: {
    createOutputChannel: vi.fn(),
    showErrorMessage: vi.fn(),
  },
  workspace: {
    createFileSystemWatcher: vi.fn(),
    getConfiguration: vi.fn(),
  },
}));

// Mock file system operations
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// Mock path operations
vi.mock('path', () => ({
  join: vi.fn(),
}));

// Mock binaryResolver
vi.mock('../src/utils/binaryResolver', () => ({
  getLanguageServerPath: vi.fn(),
  getPlatformInfo: vi.fn(),
}));

// Mock LanguageClient
vi.mock('vscode-languageclient/node', () => ({
  LanguageClient: vi.fn(),
  TransportKind: {
    stdio: 0,
  },
}));

// Import after mocks are set up
import { activate, deactivate } from '../src/extension';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getLanguageServerPath, getPlatformInfo } from '../src/utils/binaryResolver';
import { LanguageClient } from 'vscode-languageclient/node';

describe('Extension', () => {
  let mockContext: any;
  let mockOutputChannel: any;

  beforeEach(() => {
    // Reset module state to avoid test interference
    vi.resetModules();

    mockContext = {
      extensionPath: '/mock/extension',
    };
    mockOutputChannel = {
      appendLine: vi.fn(),
      dispose: vi.fn(),
    };

    // Reset mocks
    vi.clearAllMocks();

    // Re-import after reset
    vi.doMock('vscode', () => ({
      window: {
        createOutputChannel: vi.fn(),
        showErrorMessage: vi.fn(),
      },
      workspace: {
        createFileSystemWatcher: vi.fn(),
        getConfiguration: vi.fn(),
      },
    }));

    vi.doMock('fs', () => ({
      existsSync: vi.fn(),
      statSync: vi.fn(),
      readdirSync: vi.fn(),
    }));

    vi.doMock('path', () => ({
      join: vi.fn(),
    }));

    vi.doMock('../src/utils/binaryResolver', () => ({
      getLanguageServerPath: vi.fn(),
      getPlatformInfo: vi.fn(),
    }));

    vi.doMock('vscode-languageclient/node', () => ({
      LanguageClient: vi.fn(),
      TransportKind: {
        stdio: 0,
      },
    }));

    // Setup default mocks
    (vscode.window.createOutputChannel as any).mockReturnValue(mockOutputChannel);
    (vscode.workspace.getConfiguration as any).mockReturnValue({
      get: vi.fn((key: string, defaultValue: any) => defaultValue),
    });
    (fs.existsSync as any).mockReturnValue(true);
    (fs.statSync as any).mockReturnValue({ size: 1000, isFile: () => true });
    (fs.readdirSync as any).mockReturnValue(['spectrals-windows-amd64.exe']);
    (path.join as any).mockImplementation((...args: string[]) => args.join('/'));
    (getLanguageServerPath as any).mockReturnValue('/mock/path/spectrals.exe');
    (getPlatformInfo as any).mockReturnValue('mock-platform');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('activate', () => {
    it('should be a function', () => {
      expect(typeof activate).toBe('function');
    });

    it('should create output channel and log activation', async () => {
      (LanguageClient as any).mockImplementation(() => ({
        start: vi.fn(() => Promise.resolve()),
      }));

      await activate(mockContext);

      expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('Spectra LSP');
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Spectra LSP extension activated');
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Platform: mock-platform');
    });

    it('should resolve server path and check binary existence', async () => {
      (LanguageClient as any).mockImplementation(() => ({
        start: vi.fn(() => Promise.resolve()),
      }));

      await activate(mockContext);

      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Extension path: /mock/extension');
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Server path resolved: /mock/path/spectrals.exe');
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/path/spectrals.exe');
    });

    it('should start language client successfully', async () => {
      const mockClient = {
        start: vi.fn(() => Promise.resolve()),
      };
      (LanguageClient as any).mockImplementation(() => mockClient);

      await activate(mockContext);

      expect(LanguageClient).toHaveBeenCalled();
      expect(mockClient.start).toHaveBeenCalled();
      // Note: Success message logging happens asynchronously
    });

    it('should handle binary not found error', async () => {
      (fs.existsSync as any).mockReturnValue(false);

      await activate(mockContext);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Language server binary not found: /mock/path/spectrals.exe'
      );
    });

    it('should handle server path resolution error', async () => {
      (getLanguageServerPath as any).mockImplementation(() => {
        throw new Error('Unsupported platform');
      });

      await activate(mockContext);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Failed to get language server path: Unsupported platform'
      );
    });
  });

  describe('deactivate', () => {
    it('should be a function', () => {
      expect(typeof deactivate).toBe('function');
    });

    it('should stop language client when client exists', async () => {
      const mockClient = {
        start: vi.fn(() => Promise.resolve()),
        stop: vi.fn(() => Promise.resolve()),
      };
      (LanguageClient as any).mockImplementation(() => mockClient);

      await activate(mockContext);
      const result = await deactivate();

      expect(mockClient.stop).toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(mockOutputChannel.dispose).toHaveBeenCalled();
    });
  });
});