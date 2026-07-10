# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT-MAP.md` at the repo root.
- The `CONTEXT.md` file for the area you are working in.
- `docs/adr/` for repo-wide architectural decisions.
- A context-specific `docs/adr/` directory if one exists for the area you are working in.

If any of these files do not exist, proceed silently. Do not block on missing docs.

## File structure

Multi-context repo:

```
/
├── CONTEXT-MAP.md
├── CONTEXT.md
├── docs/adr/
├── src/
└── spectrals/
    └── CONTEXT.md
```

## Use the glossary's vocabulary

When your output names a domain concept, use the term as defined in the relevant `CONTEXT.md`.

If the concept you need is not in the glossary yet, that is a signal to add it to the relevant context doc or record the gap for domain modeling.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it.