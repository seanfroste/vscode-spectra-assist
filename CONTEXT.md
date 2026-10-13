# Spectra Assist

Public VS Code extension context: syntax highlighting/snippets only. No proprietary language syntax/examples.

## Branch scope

`main` is the release branch: static editor contributions only. `lang-server` hosts experimental/pre-release language-server integration; outside this branch's scope.

## Extension vocabulary

- **SPECTRA input files**: `.in` documents associated with the `spectra-in` language identifier.
- **Syntax highlighting**: TextMate grammar scopes used by VS Code to style editor tokens.
- **Snippets**: VS Code editor templates contributed for the extension's language identifier.

## Public extension surfaces

`package.json` defines language, grammar, snippet, and engine contributions. `language-configuration.json`, `syntaxes/`, and `snippets/` implement the static editor surface. Read config there; no language-definition copy here.

## Closed-source boundary

Target SPECTRA software/language remain closed source. Limit public changes to extension-facing behavior. Private implementation references outside context; see `AGENTS.md` for the reference-checkout policy.
