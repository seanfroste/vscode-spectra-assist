# Spectra Assist

This context covers the VS Code extension code for Spectra Assist and the vocabulary the extension uses to describe its editor features.

## Language

**Intellisense**:
An umbrella capability covering hover information and code completion.
_Avoid_: autocomplete, smart hints

**Go to definition**:
A navigation capability that jumps to the symbol or statement definition for the current location.
_Avoid_: jump to source, definition lookup

**Find references**:
A navigation capability that locates all usages of a symbol or statement.
_Avoid_: search references, usages lookup

**Diagnostics**:
An umbrella capability covering validation and error reporting for SPECTRA input files.
_Avoid_: linting, error checking

**SPECTRA input files**:
The `.in` files the extension targets.
_Avoid_: input files, calculation files

**local reference clone**:
A checked-out copy of the SPECTRALS LSP project kept for implementation context.
_Avoid_: dependency, upstream project