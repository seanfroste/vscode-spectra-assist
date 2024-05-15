# Change Log

All notable changes to the "vscode-spectra-assist" extension will be documented in this file.

Format loosely based on [Keep a Changelog](http://keepachangelog.com/)

- [Change Log](#change-log)
  - [\[0.8.0\]](#080)
    - [Added](#added)
  - [\[0.7.0\]](#070)
    - [Fixed](#fixed)
  - [\[0.6.1\]](#061)
    - [Fixed](#fixed-1)
  - [\[0.6.0\]](#060)
    - [Fixed](#fixed-2)
  - [\[0.3.2\]](#032)
    - [Added](#added-1)
  - [\[0.3.1\]](#031)
    - [Added](#added-2)
  - [\[0.3.0\]](#030)
    - [Added](#added-3)
  - [\[0.2.0\]](#020)
    - [Fixed](#fixed-3)
  - [\[0.1.1\] - 2021-04-24](#011---2021-04-24)
    - [Added](#added-4)
    - [Fixed](#fixed-4)
    - [Removed](#removed)
  - [\[0.1.0\] - 2024-03-23](#010---2024-03-23)
    - [Added](#added-5)

## [0.8.0]

### Added

- statements are indentable

## [0.7.0]

### Fixed

- better scope definition for negative numeric parameter values
- non-interference with numbers in regular parameter values

## [0.6.1]

### Fixed

- improved parameter value expression using nested matching

## [0.6.0]

### Fixed

- DOPE statement does not require bounds all the time, so removed X/Y/Z MIN/MAX params from snippet

## [0.3.2]

### Added

- Published the extension to the marketplace

## [0.3.1]

### Added

- Refactored `in.tmLanguage.json` to more modularly highlight fields
- minor improvements in scopes and definitions for expressions within braces or parentheses
- bracket support for `&[...]` blocks

## [0.3.0]

### Added

- Code Snippets for calculation statements
- Code Snippets for parameter names

## [0.2.0]

### Fixed

- Better, organised scoping and improved scope definitions for (almost) all scopes
- grouping parameter scopes into their own rule in the repository

## [0.1.1] - 2021-04-24

### Added

- Rules for numeric series

### Fixed

- Statement name highlighting to reflect as a more unique scope

### Removed

- Extra rules

## [0.1.0] - 2024-03-23

### Added

- Basic highlighting for statements, parameter names, parameter values, number series
