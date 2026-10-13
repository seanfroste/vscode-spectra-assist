# Spectra Assist

Extension-only context: experimental/pre-release VS Code language-server branch. No proprietary syntax/examples.

## Branch scope

`lang-server`: experimental language-server integration; `main`: release branch for static syntax highlighting/snippets.

## Extension vocabulary

- **IntelliSense**: hover information and code completion.
- **Go to definition**: navigation to the definition at the current location.
- **Find references**: navigation to usages of a symbol or statement.
- **Diagnostics**: extension-reported validation and error information for editor documents.
- **SPECTRA input files**: `.in` files targeted by the `spectra-in` language identifier.

## Public extension surface

`package.json`: extension entrypoint, language contributions, settings, commands. `src/`: extension implementation; `dist/`: bundled entrypoint. Config/tests define exact behavior.

## Closed-source boundary

Target SPECTRA software/language closed source. Public context covers VS Code only; private implementation references are not language docs. See `AGENTS.md` for `spectrals/` pin/exclusion rules.
