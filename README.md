# vscode-spectra-assist

## Features

Syntax Highlighting for spectra `*.in` files (specifically calculation statements in input files)

Makes the code just that _**little**_ bit easier on the eyes.

## Extension Setup

### From the Marketplace

Search for the `Spectra Assist` extension by `seanfroste` in the VSCode Extensions tab

### From VSIX

1. Grab the VSIX package from the [Releases](https://github.com/seanfroste/vscode-spectra-assist/releases) page
2. Open the command palette (`F1` or `Ctrl+P`)
3. Use the `Extensions: Install from VSIX...` command and to select the VSIX package you just downloaded

### From Source

1. Clone this extension into the VSCode extensions folder (`%USERPROFILE%\\.vscode\\extensions\\` on Windows, `~/.vscode/extensions/`)
2. Just open a `*.in` file! if you don't see any syntax highlighting on what you think is a valid file, open the command palette (F1) and try "Change Language Mode".
3. Type in "spectra" to filter the languages and select `spectra-in` as your language of choice.

## Feature requests

Just open an issue! make sure to provide details, screenshots, anything that'll get your idea across! If it sounds concrete and I have time, I'll implement it!

## DISCLAIMER

I am not affiliated with Link Research Corporation or the SPECTRA 3d device simulator.

This extension was written for recreation over a couple of weeks, and to learn how language extensions work
