# Issue tracker: GitHub

Repo issues live in GitHub Issues; use `gh` for all operations.

## Conventions

- Create: `gh issue create --title "..." --body "..."`.
- Read: `gh issue view <number> --comments`.
- List: `gh issue list --state open`.
- Comment: `gh issue comment <number> --body "..."`.
- Labels: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- Close: `gh issue close <number> --comment "..."`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

Skill says "publish to the issue tracker": create a GitHub issue.

Skill says "fetch the relevant ticket": run `gh issue view <number> --comments`.
