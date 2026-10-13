import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock VS Code APIs before importing extension
vi.mock('vscode', () => ({
  window: {
    createOutputChannel: vi.fn(),
    showErrorMessage: vi.fn(),
  },
  workspace: {
    createFileSystemWatcher: vi.fn(),
    getConfiguration: vi.fn(),
    onDidChangeConfiguration: vi.fn(() => ({ dispose: vi.fn() })),
  },
}));

// Mock file system operations
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// Mock path operations
vi.mock('node:path', () => ({
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
  RevealOutputChannelOn: { Error: 2 },
}));

// Import after mocks are set up
import { activate } from '../src/extension';
import * as vscode from 'vscode';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getLanguageServerPath, getPlatformInfo } from '../src/utils/binaryResolver';
import type { ExtensionContext, OutputChannel } from 'vscode';

describe('Extension', () => {
  let mockContext: Pick<ExtensionContext, 'extensionPath' | 'subscriptions'>;
  let mockOutputChannel: Pick<OutputChannel, 'appendLine' | 'dispose'>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockContext = {
      extensionPath: '/mock/extension',
      subscriptions: [],
    };
    mockOutputChannel = {
      appendLine: vi.fn(),
      dispose: vi.fn(),
    };

    vi.mocked(vscode.window.createOutputChannel).mockReturnValue(
      mockOutputChannel as ReturnType<typeof vscode.window.createOutputChannel>
    );
    vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
      get: <T>(_key: string, defaultValue: T): T => defaultValue,
    } as vscode.WorkspaceConfiguration);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({
      size: 1000,
      isFile: () => true,
    } as ReturnType<typeof fs.statSync>);

    vi.mocked(path.join).mockImplementation((...args: string[]) => args.join('/'));
    vi.mocked(getLanguageServerPath).mockReturnValue('/mock/path/spectrals.exe');
    vi.mocked(getPlatformInfo).mockReturnValue('mock-platform');
  });

  describe('activate', () => {
    it('should handle binary not found error', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await activate(mockContext as ExtensionContext);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Language server binary not found: /mock/path/spectrals.exe'
      );
    });

    it('should handle server path resolution error', async () => {
      vi.mocked(getLanguageServerPath).mockImplementation(() => {
        throw new Error('Unsupported platform');
      });

      await activate(mockContext as ExtensionContext);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Failed to get language server path: Unsupported platform'
      );
    });
  });
});
