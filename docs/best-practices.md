# Best Practices

Patterns and tips for getting the most out of your MAO-generated agent team.

## Agent Design

### Keep Agent Scope Narrow

Each agent should own a single concern. The default 6-agent setup works well for most full-stack projects:

| Agent        | Owns                         | Never touches         |
| ------------ | ---------------------------- | --------------------- |
| Database     | Schema, migrations, seeds    | Routes, UI components |
| Backend      | Routes, services, middleware | Database schema, UI   |
| Frontend     | Components, pages, hooks     | API routes, schema    |
| Auth         | Auth flows, guards, sessions | Business logic        |
| QA           | Tests, reviews               | Source code fixes     |
| Orchestrator | Planning, delegation         | Direct file edits     |

### Orchestrator Is a Manager, Not a Worker

The orchestrator should never have `edit` in its tools list. Its job is to:

1. Understand the request
2. Break it into tasks
3. Delegate to specialist agents
4. Verify the results
5. Report back

### Don't Over-Specialize

Adding too many agents (>8) increases orchestration complexity. If you find yourself creating a "validation-agent" and a "serialization-agent", those are better as skills on the backend agent.

## Skill Authoring

### Reference Files Are the Secret Weapon

The biggest quality difference comes from reference files. A skill with a detailed `references/schema-template.md` will produce dramatically better agent output than one with just a `SKILL.md`.

### Include Real Code Patterns

Don't write: "Use the standard error handling pattern."
Write: Here's the exact pattern with code, inputs, outputs, and edge cases.

### Keep Skills Discoverable

Use clear `## When to Use` sections so the orchestrator knows when to assign each skill. Vague triggers like "when doing backend stuff" are less effective than "when creating new Express route handlers."

## Configuration

### Start with a Preset

Always start with a preset (`react-express`) and customize from there. The `custom` preset requires significantly more configuration work.

### Use `mvp` for Most Projects

The project type affects how detailed the generated output is:

| Type         | Best for                                  |
| ------------ | ----------------------------------------- |
| `poc`        | Quick experiments, fewer validations      |
| `mvp`        | Most real projects, balanced detail       |
| `production` | Enterprise projects needing full coverage |

### Review NEEDS_REVIEW Flags

When the Analyzer flags something as `NEEDS_REVIEW`, it means:

- The PRD was ambiguous about that choice
- Multiple valid interpretations exist
- A human decision is required

Don't just pick defaults — the flag is there because the choice matters.

## Development Workflow

### Follow the Phase Plan

The generated phases represent a recommended build order. Phase 1 typically sets up foundations (schema, base routes, auth), while later phases add features. Resist the urge to jump ahead.

### Use Slash Commands

The generated prompts create VS Code slash commands:

```
/start-phase 1      → Begin Phase 1 with task breakdown
/verify-phase 1     → QA agent reviews Phase 1 deliverables
/add-feature login   → Plan and implement a new feature
/review-code file.ts → QA agent reviews specific code
```

### Re-Scaffold When Config Changes

If you add agents, skills, or change stack settings:

```bash
pnpm scaffold --merge
```

This preserves your customizations while applying config changes.

## Common Pitfalls

### Don't Edit Generated YAML Frontmatter

Agent `.agent.md` files have YAML frontmatter that controls VS Code Copilot behavior. Edit the body content freely, but be careful with frontmatter fields like `tools` and `description`.

### Don't Remove Skills Referenced by Agents

If an agent template references `@prisma-db`, deleting that skill directory will break the agent's workflow. Remove the reference from the config and re-scaffold instead.

### Don't Skip Enrichment

Scaffolded files contain placeholder content. The Enricher agent fills these with PRD-specific knowledge. Skipping enrichment means your agents have generic, less useful instructions.

### Don't Manually Edit the Orchestrator Agent List

The orchestrator's agent list is generated from config. Manual edits will be lost on re-scaffold. Add or remove agents in `mao.config.yaml` instead.
