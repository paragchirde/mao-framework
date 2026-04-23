# Catalog — Template Directory

This directory contains all Handlebars templates (`.hbs`) that the scaffold engine uses to generate the `.github/` agent setup.

## Directory Structure

```
catalog/
├── agents/          → Agent .agent.md templates
├── skills/          → Skill SKILL.md + references templates
├── instructions/    → File-scoped instruction templates
├── hooks/           → Hook configuration templates
├── prompts/         → Slash command prompt templates
└── copilot-instructions.md.hbs  → Workspace-level instructions
```

## Conventions

| Aspect | Convention |
|--------|-----------|
| **Agent templates** | `{role}.agent.md.hbs` — orchestrator prefixed with `_` to sort first |
| **Skill directories** | `{skill-name}/SKILL.md.hbs` + `references/{ref-name}.md.hbs` |
| **Instructions** | `{context}.instructions.md.hbs` |
| **Path mapping** | Template path → output path: strip `catalog/` prefix, remove `.hbs` extension |

## Template Context

All templates receive the full `TemplateContext` object (see `src/engine/context.ts`).

## Custom Helpers

Available in all templates:

- `{{#if (eq a b)}}` — equality
- `{{#if (neq a b)}}` — not-equal
- `{{#if (includes arr val)}}` — array includes
- `{{#if (or condA condB)}}` — logical OR
- `{{#if (and condA condB)}}` — logical AND
- `{{kebab "Hello World"}}` → `hello-world`
- `{{pascal "hello-world"}}` → `HelloWorld`
- `{{join arr ", "}}` — join array
- `{{json obj}}` — JSON.stringify
