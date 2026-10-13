# Domain Docs

How the engineering skills should consume this repo's extension domain documentation.

## Before exploring, read these

- Read extension-only `CONTEXT.md` at repo root.
- Read relevant repo-wide decisions in `docs/adr/`.

If files do not exist, proceed silently. Do not block on missing docs.

## File structure

Single extension context: root `CONTEXT.md`, optional `docs/adr/`. Create glossary/ADR only when a term or decision warrants one.

## Use the context vocabulary

Use extension terms from `CONTEXT.md`; record genuine terminology gaps for domain modeling.

## Flag ADR conflicts

Surface conflicts with existing ADRs explicitly rather than silently overriding.
