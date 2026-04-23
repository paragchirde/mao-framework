# react-express Skill Pack

Skills included with the `react-express` preset.

## Base Skills (all presets)

### api-conventions

**Agents**: All backend-facing agents
**Scope**: API response format, HTTP status codes, endpoint naming

Contains:

- `SKILL.md` — When to use, procedure, rules
- `references/conventions.md` — Full API conventions reference

### error-handling

**Agents**: backend, frontend
**Scope**: Error class hierarchy, async wrappers, error propagation

Contains:

- `SKILL.md` — Error handling strategy
- `references/patterns.md` — Error patterns per stack

### testing-patterns

**Agents**: qa
**Scope**: Test structure, mocking, assertions, naming, coverage

Contains:

- `SKILL.md` — Testing strategy
- `references/patterns.md` — Testing patterns per stack

## Preset Skills

### prisma-db

**Agents**: database
**Scope**: Prisma schema, migrations, client usage, seeding

Contains:

- `SKILL.md` — ORM workflow and rules
- `references/schema-template.md` — Full schema example with config entities
- `references/seed-template.md` — Seed script pattern with domain data

### express-api

**Agents**: backend
**Scope**: Route handlers, middleware, Zod validation

Contains:

- `SKILL.md` — Express API patterns and rules
- `references/route-template.md` — CRUD route handler template
- `references/validator-template.md` — Zod validation schema template

### react-ui

**Agents**: frontend
**Scope**: Components, pages, hooks, forms

Contains:

- `SKILL.md` — React patterns and rules
- `references/page-template.md` — Page layout pattern
- `references/component-template.md` — Component pattern
- `references/hook-template.md` — TanStack Query hook pattern

### auth

**Agents**: auth
**Scope**: Auth flow, middleware, frontend guards

Contains:

- `SKILL.md` — Auth strategy implementation
- `references/auth-flow.md` — Auth flow diagram and code
- `references/middleware-template.md` — Auth middleware template

## Instructions

Instructions apply file-specific rules via `applyTo` glob patterns:

| Instruction        | Applies To                   | Key Rules                                |
| ------------------ | ---------------------------- | ---------------------------------------- |
| `prisma`           | `**/*.prisma`                | Provider constraints, naming, migrations |
| `express-routes`   | `{backend}/routes/**/*.ts`   | Response format, asyncHandler, Zod       |
| `react-components` | `{frontend}/**/*.tsx`        | Component library, styling, queries      |
| `services`         | `{backend}/services/**/*.ts` | No HTTP, typed errors, Prisma usage      |

## Hooks

| Hook       | Output          | Purpose                |
| ---------- | --------------- | ---------------------- |
| `prettier` | `prettier.json` | Prettier configuration |

## Prompts

| Prompt         | Agent        | Slash Command         |
| -------------- | ------------ | --------------------- |
| `start-phase`  | orchestrator | `/start-phase {N}`    |
| `verify-phase` | orchestrator | `/verify-phase {N}`   |
| `add-feature`  | orchestrator | `/add-feature {desc}` |
| `review-code`  | qa           | `/review-code {file}` |

## File Tree (after scaffold)

```
.github/
├── agents/
│   ├── orchestrator.agent.md
│   ├── database-agent.agent.md
│   ├── backend-agent.agent.md
│   ├── frontend-agent.agent.md
│   ├── auth-agent.agent.md
│   └── qa-agent.agent.md
├── skills/
│   ├── api-conventions/
│   │   ├── SKILL.md
│   │   └── references/conventions.md
│   ├── error-handling/
│   │   ├── SKILL.md
│   │   └── references/patterns.md
│   ├── testing-patterns/
│   │   ├── SKILL.md
│   │   └── references/patterns.md
│   ├── prisma-db/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── schema-template.md
│   │       └── seed-template.md
│   ├── express-api/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── route-template.md
│   │       └── validator-template.md
│   ├── react-ui/
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── page-template.md
│   │       ├── component-template.md
│   │       └── hook-template.md
│   └── auth/
│       ├── SKILL.md
│       └── references/
│           ├── auth-flow.md
│           └── middleware-template.md
├── instructions/
│   ├── prisma.instructions.md
│   ├── express-routes.instructions.md
│   ├── react-components.instructions.md
│   └── services.instructions.md
├── hooks/
│   └── prettier.json
└── prompts/
    ├── start-phase.prompt.md
    ├── verify-phase.prompt.md
    ├── add-feature.prompt.md
    └── review-code.prompt.md
copilot-instructions.md
```
