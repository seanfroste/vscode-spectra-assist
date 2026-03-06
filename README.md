# Spectra Assist

[![Version](https://img.shields.io/badge/version-0.12.0-blue.svg)](https://github.com/seanfroste/vscode-spectra-assist/releases)
[![VSCode](https://img.shields.io/badge/VSCode-1.87.0+-green.svg)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Intelligent support for SPECTRA 3D Device Simulator input files (*.in). Provides syntax highlighting, code snippets, and full Language Server Protocol (LSP) features including hover information, auto-completion, diagnostics, go-to-definition, and find references.

## Features

- **Syntax Highlighting**: Full color-coded highlighting for SPECTRA input files
- **Code Snippets**: Intelligent snippets for common statements and parameters
- **Hover Information**: Instant documentation on hover
- **Auto-Completion**: Context-aware suggestions for statements and parameters
- **Real-Time Diagnostics**: Error and warning detection as you type
- **Go to Definition**: Navigate to variable definitions
- **Find All References**: Locate all usages of defined variables
- **Document Validation**: Automatic validation with configurable severity levels

## Requirements

- Visual Studio Code 1.87.0+
- Windows, macOS, or Linux (x64 or ARM64)

## Extension Settings

This extension contributes the following settings:

- `spectrals.intellisense` (boolean, default: true): Enable hover information and code completion
- `spectrals.navigation` (boolean, default: true): Enable go-to-definition and find-references features
- `spectrals.diagnostics` (boolean, default: true): Enable syntax validation and error reporting
- `spectrals.traceLevel` (string, default: "messages"): Logging verbosity (off, messages, verbose)
- `spectrals.diagnosticsSeverity` (string, default: "error"): Minimum diagnostic severity level (error, warning, info)
- `spectrals.maxDiagnosticsPerFile` (number, default: 100): Maximum number of diagnostics per file (0 = unlimited)
- `spectrals.lsp.logging` (boolean, default: false): Enable LSP communication logging to output channel

## Known Issues

None currently reported. For issues or feature requests, please visit the [GitHub repository](https://github.com/seanfroste/vscode-spectra-assist).

## Contributing

Contributions are welcome! Please see the [GitHub repository](https://github.com/seanfroste/vscode-spectra-assist) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This extension is not affiliated with, endorsed by, or officially associated with Link Research Corporation or the SPECTRA 3D Device Simulator.
