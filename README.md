# Spectra Assist

<!-- Logo Placeholder - Add your extension logo here (recommended size: 128x128px) -->
<!-- ![Spectra Assist Logo](images/logo.png) -->

[![Version](https://img.shields.io/badge/version-0.8.1-blue.svg)](https://github.com/seanfroste/vscode-spectra-assist/releases)
[![VSCode](https://img.shields.io/badge/VSCode-1.87.0+-green.svg)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black.svg)](https://github.com/seanfroste/vscode-spectra-assist)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/seanfroste.vscode-spectra-assist)

Intelligent IDE support for SPECTRA 3D Device Simulator input files (\*.in)

---

- [Spectra Assist](#spectra-assist)
  - [Introduction](#introduction)
  - [Features](#features)
    - [Syntax Highlighting](#syntax-highlighting)
    - [Code Snippets](#code-snippets)
    - [Language Server Protocol (LSP) Features](#language-server-protocol-lsp-features)
      - [Hover Information](#hover-information)
      - [Auto-Completion](#auto-completion)
      - [Real-Time Diagnostics](#real-time-diagnostics)
      - [Go to Definition](#go-to-definition)
      - [Find All References](#find-all-references)
      - [Document Validation](#document-validation)
  - [Screenshots](#screenshots)
    - [Syntax Highlighting](#syntax-highlighting-1)
    - [Auto-Completion Demo](#auto-completion-demo)
    - [Hover Information](#hover-information-1)
    - [Diagnostics \& Error Detection](#diagnostics--error-detection)
  - [Quick Start](#quick-start)
    - [Installation from Marketplace](#installation-from-marketplace)
    - [Installation from VSIX](#installation-from-vsix)
    - [Installation from Source](#installation-from-source)
    - [Getting Started](#getting-started)
  - [Supported Platforms](#supported-platforms)
  - [Configuration](#configuration)
    - [To change settings](#to-change-settings)
    - [Troubleshooting](#troubleshooting)
  - [Requirements](#requirements)
  - [Known Issues](#known-issues)
  - [Contributing](#contributing)
  - [License](#license)
  - [Disclaimer](#disclaimer)

---

## Introduction

**Spectra Assist** provides comprehensive IDE support for working with SPECTRA 3D Device Simulator input files (`.in`). [SPECTRA](https://www.spectrasim.com/) is a powerful 3D semiconductor device simulator used for TCAD (Technology Computer-Aided Design) simulations.

This extension transforms your VSCode editor into a powerful development environment for SPECTRA input files, offering intelligent code assistance, real-time diagnostics, and productivity-enhancing features that make writing and maintaining complex device simulation scripts easier and more efficient.

Whether you're creating device structures, defining mesh geometries, or setting up complex simulation parameters, Spectra Assist helps you write correct, well-formatted code faster with intelligent autocompletion, instant error detection, and comprehensive documentation at your fingertips.

---

## Features

### Syntax Highlighting

- Full color-coded syntax highlighting for `.in` files
- Distinguishes statements, parameters, values, comments, and special constructs
- Makes complex simulation scripts easy to read and navigate
- Customizable through VSCode's color theme settings

### Code Snippets

- Rapid development with intelligent code snippets
- Quick insertion of common calculation statements
- Pre-filled parameter templates for faster coding
- Supports statement aliases for flexible workflow

### Language Server Protocol (LSP) Features

#### Hover Information

Hover over any statement or parameter to instantly see:

- Documentation and descriptions
- Parameter types and expected values
- Usage examples

#### Auto-Completion

- Context-aware statement completions
- Parameter name suggestions with type hints
- Automatic parameter value suggestions
- Smart filtering based on current context

#### Real-Time Diagnostics

Instant error and warning detection as you type:

- **Unknown Statement Detection**: Flags unrecognized statements
- **Invalid Parameter Validation**: Identifies incorrect parameter usage
- **Missing Arguments**: Detects required parameters that are missing
- **Type Checking**: Validates parameter values against expected types

#### Go to Definition

- Navigate directly to variable definitions
- Full support for `DEFINE NAME=...` variables
- Quickly understand where variables are declared

#### Find All References

- Locate all usages of defined variables
- Supports `@VarName` reference syntax
- Rename refactoring support through reference analysis

#### Document Validation

- Automatic validation when opening files
- Validation on save
- Continuous background checking for errors

---

## Screenshots

<!-- Add screenshots to the images/ directory and update paths below -->

### Syntax Highlighting

<!-- ![Syntax Highlighting](images/syntax-highlighting.png) -->

_Color-coded syntax makes complex simulation files easy to read and understand._

### Auto-Completion Demo

<!-- ![Auto-Completion](images/autocompletion.png) -->

_Intelligent suggestions for statements and parameters as you type._

### Hover Information

<!-- ![Hover Info](images/hover-info.png) -->

_Instant documentation at your fingertips - hover over any element to learn more._

### Diagnostics & Error Detection

<!-- ![Diagnostics](images/diagnostics.png) -->

_Real-time error detection helps catch mistakes before simulation runtime._

---

## Quick Start

### Installation from Marketplace

1. Open **VSCode**
2. Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for **`Spectra Assist`** by **seanfroste**
4. Click **Install**

### Installation from VSIX

1. Download the latest `.vsix` from the [Releases](https://github.com/seanfroste/vscode-spectra-assist/releases) page
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type **"Extensions: Install from VSIX"**
4. Select the downloaded `.vsix` file

### Installation from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/seanfroste/vscode-spectra-assist.git
   cd vscode-spectra-assist
   ```

2. Copy to VSCode extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS/Linux**: `~/.vscode/extensions/`
3. Open a `.in` file in VSCode

### Getting Started

1. Open any file with the `.in` extension
2. If syntax highlighting doesn't appear automatically:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Select **"Change Language Mode"**
   - Type "spectra" and select **SPECTRA Calculation Input**
3. Start coding with intelligent assistance!

---

## Supported Platforms

The language server binaries are included for all major platforms:

| Platform | Architecture          | Binary                        |
| -------- | --------------------- | ----------------------------- |
| Windows  | x64 (AMD64)           | `spectrals-windows-amd64.exe` |
| Windows  | ARM64                 | `spectrals-windows-arm64.exe` |
| macOS    | Intel (AMD64)         | `spectrals-darwin-amd64`      |
| macOS    | Apple Silicon (ARM64) | `spectrals-darwin-arm64`      |
| Linux    | x64 (AMD64)           | `spectrals-linux-amd64`       |
| Linux    | ARM64                 | `spectrals-linux-arm64`       |

---

## Configuration

Configure Spectra Assist settings in VSCode:

| Setting               | Type    | Default | Description                                                     |
| --------------------- | ------- | ------- | --------------------------------------------------------------- |
| `spectra.lsp.logging` | boolean | `false` | Enable detailed LSP communication logging to the output channel |

### To change settings

1. Open **Settings** (`Ctrl+,` or `Cmd+,`)
2. Search for **"Spectra LSP"**
3. Toggle the desired options

### Troubleshooting

If the language server fails to start:

1. **Check the Output Channel**: Go to `View → Output` and select "Spectra LSP" from the dropdown
2. **Enable Logging**: Set `spectra.lsp.logging` to `true` for detailed diagnostics
3. **Verify Platform Support**: Ensure your OS and architecture are supported
4. **Check Binary Location**: Verify the binary exists in the extension's `bin/` directory

---

## Requirements

- **Visual Studio Code**: Version 1.87.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Architecture**: x64 (AMD64) or ARM64

---

## Known Issues

- None currently reported

If you encounter any issues, please [open an issue](https://github.com/seanfroste/vscode-spectra-assist/issues) with details about your environment and the problem.

---

## Contributing

Contributions are welcome! Whether you want to:

- Report bugs,
- Suggest new features,
- Submit pull requests for features you've implemented yourself,
- Improve the documentation

Please feel free to [open an issue](https://github.com/seanfroste/vscode-spectra-assist/issues) or submit a pull request.
Please make sure to provide clear details and screenshots when reporting bugs or requesting features.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Disclaimer

**This extension is not affiliated with, endorsed by, or officially associated with Link Research Corporation or the SPECTRA 3D Device Simulator.**

This is an independently-developed project created for educational and recreational purposes, for a friend, by a friend. SPECTRA is a trademark of Link Research Corporation.
