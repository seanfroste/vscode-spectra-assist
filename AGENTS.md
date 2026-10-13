# Agent instructions

## Conversation start

1. Invoke `using-superpowers` before any response, question, or tool, except the skill-loading call itself.
2. Invoke `ask-matt` next, before any other response, question, or tool.
3. Follow its selected flow and load the applicable task skill before further responses, questions, or tools. Approved plan: resume execution, not idea discovery.

## Branch and scope

- `lang-server` is experimental/pre-release; `main` remains the release branch.
- Target SPECTRA software/language closed source; exclude proprietary syntax/examples/private material from public docs and changes.
- Derive commands from config, e.g. `package.json`.

## Agent skills

### Issue tracker

GitHub Issues are request surface; external PRs are not. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

Use five labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

Read [docs/agents/domain.md](docs/agents/domain.md) + extension-only [CONTEXT.md](CONTEXT.md); missing docs non-blocking.

## Private reference checkout

- `spectrals/`: optional LSP implementation/feature-set reference only; never runtime dependency or source for vendoring code/examples.
- Upstream: `https://gitlab.com/sean.froste/spectrals.git`. Use newest stable semver release; current pin: `v0.4.0` (commit `8b5f06d4232dd6e031d5c0b0ccc4a62b5c8940c9`; annotated tag object `1cc60dc479149c9ed72ca9371d623929df74b38e`). From repo root, shallow clone:
  `git clone --depth 1 --branch v0.4.0 https://gitlab.com/sean.froste/spectrals.git spectrals`
- All branches: NEVER commit or publish/package `spectrals/` or contents from this repo. Preserve Git `spectrals/` ignore + VSIX `spectrals/**` exclusion.
