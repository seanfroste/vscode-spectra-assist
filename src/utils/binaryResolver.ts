import * as path from "path";
import * as os from "os";
import { ExtensionContext } from "vscode";

/**
 * Gets the platform-appropriate language server binary path
 * Based on OS and architecture from the bin/ directory
 */
export function getLanguageServerPath(context: ExtensionContext): string {
  const platform = os.platform();
  const arch = os.arch();

  let binaryName: string;

  // Map Node.js platform/arch to binary names
  // Binaries available: spectrals-darwin-amd64, spectrals-darwin-arm64,
  // spectrals-linux-amd64, spectrals-linux-arm64,
  // spectrals-windows-amd64.exe, spectrals-windows-arm64.exe

  switch (platform) {
    case "darwin":
      binaryName =
        arch === "arm64" ? "spectrals-darwin-arm64" : "spectrals-darwin-amd64";
      break;
    case "linux":
      binaryName =
        arch === "arm64" ? "spectrals-linux-arm64" : "spectrals-linux-amd64";
      break;
    case "win32":
      binaryName =
        arch === "arm64"
          ? "spectrals-windows-arm64.exe"
          : "spectrals-windows-amd64.exe";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Path to the binary within the extension
  const binaryPath = path.join(context.extensionPath, "bin", binaryName);

  return binaryPath;
}

/**
 * Gets the platform name for display/logging purposes
 */
export function getPlatformInfo(): string {
  return `${os.platform()}-${os.arch()}`;
}
