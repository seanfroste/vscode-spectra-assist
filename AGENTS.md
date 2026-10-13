# Spectra Assist agent entrypoint

## Conversation start

1. Invoke `using-superpowers` before any response, question, or tool, except the skill-loading call itself.
2. Invoke `ask-matt` next, before any other response, question, or tool.
3. Follow its selected flow and load the applicable task skill before further responses, questions, or tools.

## Branch and scope

- `main` is the release branch. `lang-server` is experimental/pre-release.
- This extension supports syntax highlighting and snippets only on `main`; language-server features belong to `lang-server`.
- Target SPECTRA software/language remain closed source. Keep proprietary syntax, examples, and private reference material out of public documentation and changes.
- Derive commands from config: `package.json` and `.vscode/launch.json`; do not invent build or test commands.

## Agent skills

### Issue tracker

Read [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md) for issue work. Requests live in GitHub Issues; external pull requests are not a request surface.

### Domain docs

Before exploring, read [docs/agents/domain.md](docs/agents/domain.md) and [CONTEXT.md](CONTEXT.md). One public extension context; missing ADRs non-blocking.
