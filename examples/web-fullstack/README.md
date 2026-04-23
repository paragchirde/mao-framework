# web-fullstack Example

A complete React + Express + Prisma + PostgreSQL project management platform demonstrating all MAO features.

## What This Example Shows

- Full 6-agent team (orchestrator, database, backend, frontend, auth, qa)
- 4 custom business-rule skills (task-numbering, sprint-capacity, task-workflow, time-logging)
- 7 entities with relationships
- 4 development phases
- `react-express` preset with all skill packs

## Quick Start

```bash
# 1. Copy this example config to your project root
cp examples/web-fullstack/mao.config.yaml ./mao.config.yaml

# 2. Scaffold the agent setup
pnpm scaffold

# 3. (Optional) Enrich from your PRD
#    @Enricher Enrich the generated agent setup from the PRD

# 4. Validate the setup
pnpm activate

# 5. Start developing
#    @Orchestrator Start Phase 1
```

## Generated Structure

After scaffolding, your `.github/` directory will contain:

```
.github/
├── agents/
│   ├── orchestrator.agent.md       ← Plans and delegates across all agents
│   ├── database-agent.agent.md     ← Prisma schema, migrations, seeds
│   ├── backend-agent.agent.md      ← Express routes, services, middleware
│   ├── frontend-agent.agent.md     ← React components, pages, hooks
│   ├── auth-agent.agent.md         ← Google OAuth, JWT sessions, guards
│   └── qa-agent.agent.md           ← Vitest unit tests, Playwright E2E
├── skills/
│   ├── api-conventions/            ← REST API standards
│   ├── error-handling/             ← Error patterns
│   ├── testing-patterns/           ← Test structure and mocking
│   ├── prisma-db/                  ← Prisma ORM patterns
│   ├── express-api/                ← Express route patterns
│   ├── react-ui/                   ← React component patterns
│   ├── auth/                       ← Auth flow patterns
│   ├── task-numbering/             ← Custom: sequential task IDs
│   ├── sprint-capacity/            ← Custom: capacity calculation
│   ├── task-workflow/              ← Custom: status transitions
│   └── time-logging/               ← Custom: time entry validation
├── instructions/
│   ├── prisma.instructions.md
│   ├── express-routes.instructions.md
│   ├── react-components.instructions.md
│   └── services.instructions.md
├── hooks/
│   └── prettier.json
├── prompts/
│   ├── start-phase.prompt.md
│   ├── verify-phase.prompt.md
│   ├── add-feature.prompt.md
│   └── review-code.prompt.md
└── copilot-instructions.md
```

## Configuration Walkthrough

See [mao.config.yaml](mao.config.yaml) for the full annotated config. Key sections:

### Agents

Six agents covering the full stack. The orchestrator delegates to specialists — it never edits files directly.

### Phases

| Phase            | Description                        | Agents                      |
| ---------------- | ---------------------------------- | --------------------------- |
| 1. Foundation    | Schema, auth, user/workspace CRUD  | database, backend, auth     |
| 2. Core Features | Projects, sprints, tasks, comments | database, backend, frontend |
| 3. Advanced      | Time logging, capacity, analytics  | database, backend, frontend |
| 4. Polish        | Dashboard, real-time, search       | frontend, backend, qa       |

### Custom Skills

Four business-rule skills extracted from the PRD:

- **task-numbering**: `{PROJECT_KEY}-{SEQUENTIAL_NUMBER}` format
- **sprint-capacity**: Story points × team velocity formula
- **task-workflow**: Status transition state machine (backlog → todo → in_progress → ...)
- **time-logging**: Daily limit validation and time entry constraints
