# MAO Framework

**Multi-Agent Orchestration** — Generate VS Code Copilot multi-agent development environments from a PRD and declarative configuration.

> ⚠️ **Alpha** (`0.x`) — Breaking changes may occur. See [CHANGELOG.md](CHANGELOG.md).

## What is MAO?

MAO is a GitHub template repository that generates a complete VS Code Copilot agent setup for your project. Starting from a Product Requirements Document (PRD), MAO:

1. **Analyzes** your PRD to extract entities, business rules, tech stack, and phases
2. **Generates** a `mao.config.yaml` for human review
3. **Scaffolds** a complete `.github/` directory with agents, skills, instructions, hooks, and prompts
4. **Enriches** stub files with project-specific content extracted from the PRD
5. **Validates** the generated setup for completeness and consistency
6. **Activates** a working multi-agent team in VS Code

### The 6-Step Pipeline

```
PRD → [Analyze] → Config → [Review] → [Scaffold] → .github/ → [Enrich] → [Review] → [Activate] → Working Agents
       (LLM)              (Human)    (Deterministic)            (LLM)     (Human)    (Deterministic)
```

## Features

- **Declarative config** — Define your project stack, agents, and phases in YAML
- **Smart scaffolding** — Handlebars templates generate production-quality agent definitions
- **Three-way merge** — Re-scaffold safely with `--merge` — your customizations are preserved
- **Stack auto-detection** — Infer config from existing `package.json`, `prisma/schema.prisma`, etc.
- **Custom skills** — Define project-specific skills enriched from your PRD
- **Community skills** — Use and contribute reusable skill packs
- **Activation validation** — Verify completeness before going live

## Quick Start

```bash
# 1. Use this template
gh repo create my-project --template mao-framework/mao-framework
cd my-project && pnpm install

# 2. Analyze your PRD (VS Code Copilot Chat)
# @Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml

# 3. Review and edit mao.config.yaml — resolve any NEEDS_REVIEW flags

# 4. Scaffold the agent setup
pnpm scaffold

# 5. Enrich with project-specific content (VS Code Copilot Chat)
# @Enricher Enrich the generated agent setup from the PRD

# 6. Validate and activate
pnpm activate

# 7. Start coding with your agent team!
# @Orchestrator Start Phase 1
```

See [Getting Started](docs/getting-started.md) for the full walkthrough.

## Current Preset

- **react-express** — React + Express + Prisma + PostgreSQL (6 agents, 7 skills, 4 instructions)

## Generated Agents

| Agent            | Role                                           |
| ---------------- | ---------------------------------------------- |
| **Orchestrator** | Plans, delegates, verifies — never writes code |
| **Database**     | Schema, migrations, seed data                  |
| **Backend**      | Routes, services, middleware                   |
| **Frontend**     | Components, pages, hooks                       |
| **Auth**         | Authentication flow and guards                 |
| **QA**           | Testing and review (read-only)                 |

## CLI

```bash
pnpm scaffold                    # First-time scaffold
pnpm scaffold -- --merge         # Re-scaffold preserving edits
pnpm scaffold -- --dry-run       # Preview without writing
pnpm activate                    # Validate completeness
pnpm setup                       # Guided 6-step setup
```

## Project Structure

```
mao-framework/
├── bin/          → CLI entry points (mao-scaffold, mao-activate)
├── src/          → Core engine (config, scaffold, renderer, validator, merge)
├── catalog/      → Handlebars templates for agents, skills, instructions
├── tests/        → Unit, integration, E2E tests (150+ tests)
├── docs/         → Documentation
├── community/    → Community skill contributions
└── .github/      → Framework agents (Analyzer, Enricher)
```

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build CLI
pnpm test             # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm typecheck        # Type check
pnpm lint             # Lint
pnpm format           # Format code
```

## Documentation

- [Getting Started](docs/getting-started.md) — Full setup walkthrough
- [Config Reference](docs/config-reference.md) — Every field, valid value, and default
- [Agent Catalog](docs/agent-catalog.md) — 6 core agents with descriptions and scope
- [Skill Packs](docs/skill-packs.md) — react-express preset contents and file tree
- [Writing Custom Skills](docs/writing-custom-skills.md) — How to create project-specific skills
- [Merge Strategy](docs/merge-strategy.md) — How re-scaffolding preserves your edits
- [Best Practices](docs/best-practices.md) — Agent design patterns and tips
- [Troubleshooting](docs/troubleshooting.md) — Common issues and solutions
- [Contributing Skills](docs/contributing-skills.md) — How to create community skills

## Contributing

Community skill contributions welcome. See [Contributing Skills](docs/contributing-skills.md) and the [community/TEMPLATE/](community/TEMPLATE/) starter.

## License

[MIT](LICENSE)
