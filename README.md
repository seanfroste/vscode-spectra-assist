# Spectra Assist

[![Version](https://img.shields.io/badge/version-0.12.0-blue.svg)](https://github.com/seanfroste/vscode-spectra-assist/releases)
[![VSCode](https://img.shields.io/badge/VSCode-1.140.0+-green.svg)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Intelligent support for SPECTRA 3D Device Simulator input files (*.in). Provides syntax highlighting, code snippets, and Language Server Protocol (LSP) features including hover information, auto-completion, diagnostics, go-to-definition, find references, and document symbols.

## Features

- **Syntax Highlighting**: Full color-coded highlighting for SPECTRA input files
- **Code Snippets**: Intelligent snippets for common statements and parameters
- **Hover Information**: Instant documentation on hover
- **Auto-Completion**: Context-aware suggestions for statements and parameters
- **Real-Time Diagnostics**: Error and warning detection as you type
- **Go to Definition**: Navigate to variable definitions
- **Find All References**: Locate all usages of defined variables
- **Document Symbols**: View statements and nested parameters in the document outline

## Requirements

- Visual Studio Code 1.140.0+
- Windows, macOS, or Linux (x64 or ARM64)

## Extension Settings

This extension contributes the following settings:

- `spectrals.intellisense` (boolean, default: `true`): Enable hover information and code completion.
- `spectrals.navigation` (boolean, default: `true`): Enable go-to-definition and find-references features.
- `spectrals.diagnostics` (boolean, default: `true`): Enable or disable server diagnostics.
- `spectrals.traceLevel` (string, default: `"messages"`): Server logging verbosity (`off`, `messages`, or `verbose`); server logs go to standard error.
- `spectrals.diagnosticsSeverity` (string, default: `"error"`): Minimum diagnostic severity (`error`, `warning`, or `info`). Warning includes errors and warnings; info includes all diagnostics.
- `spectrals.maxDiagnosticsPerFile` (number, default: `100`): Maximum published diagnostics per file; `0` means unlimited. Severity filtering happens before the cap.

The LSP server receives exactly these six settings. Document symbols are always available, independently of the IntelliSense and navigation settings.

## Known Issues

None currently reported. For issues or feature requests, please visit the [GitHub repository](https://github.com/seanfroste/vscode-spectra-assist).

## Contributing

Contributions are welcome! Please see the [GitHub repository](https://github.com/seanfroste/vscode-spectra-assist) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This extension is not affiliated with, endorsed by, or officially associated with Link Research Corporation or the SPECTRA 3D Device Simulator.
