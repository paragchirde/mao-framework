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

## Quick Start

```bash
# 1. Use this template
gh repo create my-project --template mao-framework/mao-framework

# 2. Install dependencies
pnpm install

# 3. Place your PRD
cp your-prd.md ./prd.md

# 4. Run the Analyzer (VS Code Copilot Chat)
# @Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml

# 5. Review the generated config
# Edit mao.config.yaml — resolve any NEEDS_REVIEW flags

# 6. Scaffold
pnpm scaffold

# 7. Run the Enricher (VS Code Copilot Chat)
# @Enricher Enrich the generated agent setup from the PRD

# 8. Review enriched files

# 9. Activate (validate)
pnpm activate

# 10. Start coding with your agent team!
# @Orchestrator Start Phase 1
```

## Current Preset

- **react-express** — React + Express + Prisma + PostgreSQL

## Project Structure

```
mao-framework/
├── bin/          → CLI entry points (mao-scaffold, mao-activate)
├── src/          → Core engine (config, scaffold, renderer, validator)
├── catalog/      → Handlebars templates for agents, skills, instructions
├── tests/        → Unit, integration, E2E tests
├── docs/         → Documentation
├── examples/     → Example configurations and outputs
└── community/    → Community skill contributions
```

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build CLI
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm lint             # Lint
pnpm typecheck        # Type check
pnpm format           # Format code
```

## Documentation

- [Getting Started](docs/getting-started.md) _(coming soon)_
- [Config Reference](docs/config-reference.md) _(coming soon)_
- [Agent Catalog](docs/agent-catalog.md) _(coming soon)_

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) _(coming soon)_

## License

[MIT](LICENSE)
