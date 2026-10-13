import * as path from 'node:path';
import * as fs from 'node:fs';
import type { ExtensionContext, OutputChannel } from 'vscode';
import { workspace, window } from 'vscode';
import type {
  LanguageClientOptions,
  ServerOptions,
  ExecutableOptions,
} from 'vscode-languageclient/node';
import { LanguageClient, RevealOutputChannelOn } from 'vscode-languageclient/node';
import { getLanguageServerPath, getPlatformInfo } from './utils/binaryResolver';

let client: LanguageClient;
let outputChannel: OutputChannel;

export async function activate(context: ExtensionContext) {
  // Create output channel for logging
  outputChannel = window.createOutputChannel('Spectra LSP');
  outputChannel.appendLine('Spectra LSP extension activated');
  outputChannel.appendLine(`Platform: ${getPlatformInfo()}`);

  // Get the language server binary path
  let serverPath: string;
  try {
    serverPath = getLanguageServerPath(context);
    outputChannel.appendLine(`Extension path: ${context.extensionPath}`);
    outputChannel.appendLine(`Server path resolved: ${serverPath}`);
    outputChannel.appendLine(`Server path exists: ${fs.existsSync(serverPath)}`);
    try {
      const stats = fs.statSync(serverPath);
      outputChannel.appendLine(`Server file stats: size=${stats.size}, isFile=${stats.isFile()}`);
    } catch (e) {
      outputChannel.appendLine(
        `Server file stat error: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    outputChannel.appendLine(`Debug - Extension path: ${context.extensionPath}`);
    outputChannel.appendLine(`Debug - Server path: ${serverPath}`);
    outputChannel.appendLine(`Debug - Path exists check: ${fs.existsSync(serverPath)}`);

    // Check if bin directory exists
    const binDir = path.join(context.extensionPath, 'bin');
    outputChannel.appendLine(`Debug - Bin dir: ${binDir}`);
    outputChannel.appendLine(`Debug - Bin dir exists: ${fs.existsSync(binDir)}`);

    // List files in bin directory
    try {
      if (fs.existsSync(binDir)) {
        const files = fs.readdirSync(binDir);
        outputChannel.appendLine(`Debug - Bin contents: ${files.join(', ')}`);
      }
    } catch (e) {
      outputChannel.appendLine(
        `Debug - Error reading bin: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  } catch (err) {
    const errorMsg = `Failed to get language server path: ${err instanceof Error ? err.message : String(err)}`;
    outputChannel.appendLine(errorMsg);
    void window.showErrorMessage(errorMsg);
    return;
  }

  // Verify the binary exists
  if (!fs.existsSync(serverPath)) {
    const errorMsg = `Language server binary not found: ${serverPath}`;
    outputChannel.appendLine(errorMsg);
    void window.showErrorMessage(errorMsg);
    return;
  }

  outputChannel.appendLine(`Using language server: ${serverPath}`);

  // Server options - run the binary as an executable
  const executableOptions: ExecutableOptions = {
    cwd: context.extensionPath,
    env: process.env,
  };

  const serverOptions: ServerOptions = {
    run: {
      command: serverPath,
      options: executableOptions,
    },
    debug: {
      command: serverPath,
      options: executableOptions,
    },
  };

  const readServerSettings = () => {
    const configuration = workspace.getConfiguration('spectrals');
    return {
      intellisense: configuration.get('intellisense', true),
      navigation: configuration.get('navigation', true),
      diagnostics: configuration.get('diagnostics', true),
      traceLevel: configuration.get('traceLevel', 'messages'),
      diagnosticsSeverity: configuration.get('diagnosticsSeverity', 'error'),
      maxDiagnosticsPerFile: configuration.get('maxDiagnosticsPerFile', 100),
    };
  };
  const serverSettings = readServerSettings();

  // Client options - configure which documents to sync
  const clientOptions: LanguageClientOptions = {
    // Register the server for .in files (spectra-in language)
    documentSelector: [
      { scheme: 'file', language: 'spectra-in' },
      { scheme: 'untitled', language: 'spectra-in' },
    ],
    synchronize: {
      // Notify the server about file changes in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/*.in'),
    },
    diagnosticCollectionName: 'spectrals',
    outputChannel,
    revealOutputChannelOn: RevealOutputChannelOn.Error,
    initializationOptions: serverSettings,
  };

  // Create the language client
  client = new LanguageClient('spectrals', 'SPECTRA Language Server', serverOptions, clientOptions);

  // Start the client. This will also launch the server
  outputChannel.appendLine('Starting language server...');

  try {
    await client.start();
    outputChannel.appendLine('Language server started successfully');

    const sendServerSettings = async () => {
      try {
        await client.sendNotification('workspace/didChangeConfiguration', {
          settings: readServerSettings(),
        });
      } catch (error) {
        outputChannel.appendLine(
          `Failed to update language server settings: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };
    context.subscriptions.push(
      workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('spectrals')) {
          void sendServerSettings();
        }
      })
    );
    await sendServerSettings();
  } catch (error) {
    const errorMsg = `Failed to start language server: ${error instanceof Error ? error.message : String(error)}`;
    outputChannel.appendLine(errorMsg);
    void window.showErrorMessage(errorMsg);
  }
}

export function deactivate(): Promise<void> | undefined {
  outputChannel?.appendLine('Spectra LSP extension deactivating...');

  if (!client) {
    return undefined;
  }

  return client.stop().then(
    () => {
      outputChannel?.appendLine('Language server stopped');
      outputChannel?.dispose();
    },
    (error: unknown) => {
      outputChannel?.appendLine(
        `Error stopping language server: ${error instanceof Error ? error.message : String(error)}`
      );
      outputChannel?.dispose();
    }
  );
}
