# Issue tracker: GitHub

Issues/specs live in GitHub Issues. Use `gh` CLI for all operations.

## Conventions

- Create: `gh issue create --title "..." --body "..."`. Use heredoc for multi-line bodies.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- Comment: `gh issue comment <number> --body "..."`.
- Labels: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- Close: `gh issue close <number> --comment "..."`.

Infer repo from `git remote -v`; `gh` resolves it inside clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

Skill says "publish to the issue tracker": create GitHub issue.

Skill says "fetch the relevant ticket": read issue as above.
