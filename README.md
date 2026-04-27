# MAO Framework

**Multi-Agent Orchestration** — Generate a team of AI coding assistants inside VS Code from your project description.

> ⚠️ **Alpha** (`0.x`) — Breaking changes may occur. See [CHANGELOG.md](CHANGELOG.md).

---

## What is MAO?

You describe the software you want to build in a document (called a **PRD** — Product Requirements Document). MAO reads it and generates a team of AI agents inside VS Code that understand your project's tech stack, data model, business rules, and development phases.

Each agent is a specialist — one handles the database, another writes API routes, another builds the UI — and an Orchestrator agent manages the whole team.

**The result:** You type `@Orchestrator Start Phase 1` in VS Code Copilot Chat, and the agents plan, delegate, and build your project step by step.

### How It Works (6 Steps)

```
  Your PRD
     ↓
  1. Analyze    — AI reads your PRD, extracts requirements
  2. Review     — You check and adjust the generated config
  3. Scaffold   — MAO generates agent files into .github/
  4. Enrich     — AI fills in project-specific details
  5. Review     — You verify the enriched content
  6. Activate   — MAO validates everything is complete
     ↓
  Working AI Agent Team in VS Code
```

---

## Prerequisites

Before you start, make sure you have:

| Requirement             | Version / Details   | How to install                                                                                 |
| ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| **Node.js**             | >= 20               | [nodejs.org](https://nodejs.org/) or `brew install node`                                       |
| **pnpm**                | Latest              | `npm install -g pnpm`                                                                          |
| **VS Code**             | Latest              | [code.visualstudio.com](https://code.visualstudio.com/)                                        |
| **GitHub Copilot**      | Active subscription | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)      |
| **GitHub Copilot Chat** | Extension installed | [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) |

> **Note:** Steps 1 (Analyze) and 4 (Enrich) use GitHub Copilot Chat's AI capabilities. You need an active Copilot subscription for these steps.

You'll also need a **PRD** — a document describing what your app does. This can be as simple as a few paragraphs or as detailed as a full spec. See [Getting Started](docs/getting-started.md) for PRD writing tips.

---

## Quick Start

### Step 1: Set up the project

```bash
# Clone the template repository
git clone https://github.com/your-org/mao-framework.git my-project
cd my-project

# Install dependencies
pnpm install
```

### Step 2: Add your PRD

Create a file called `prd.md` in the project root. Describe your app — what it does, what data it stores, what tech stack you want. The more detail you include, the better the AI agents will be.

### Step 3: Run the guided setup

```bash
pnpm setup-mao
```

This walks you through all 6 steps interactively. It will prompt you when you need to do something in VS Code Copilot Chat, like:

- **"Generate config"** — Open VS Code Copilot Chat and type:
  ```
  @Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml
  ```
- **"Enrich the setup"** — Open VS Code Copilot Chat and type:
  ```
  @Enricher Enrich the generated agent setup from the PRD
  ```

### Step 4: Start coding with your AI team

Once setup is complete, open VS Code Copilot Chat and type:

```
@Orchestrator Start Phase 1
```

The Orchestrator reads your project plan, breaks it into tasks, and delegates to specialist agents.

---

### Alternative: Manual Setup (Step by Step)

If you prefer to run each step yourself instead of using `pnpm setup-mao`:

```bash
# 1. Generate config from your PRD (in VS Code Copilot Chat):
#    @Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml

# 2. Review mao.config.yaml — fix any NEEDS_REVIEW flags

# 3. Scaffold the agent files into .github/
pnpm scaffold

# 4. Enrich with project-specific content (in VS Code Copilot Chat):
#    @Enricher Enrich the generated agent setup from the PRD

# 5. Review the enriched files in .github/

# 6. Validate everything is complete
pnpm activate
```

---

## What Gets Generated

Running `pnpm scaffold` creates a `.github/` directory with your entire agent team:

```
.github/
├── agents/                  ← Your AI agent team
│   ├── orchestrator.agent.md    — Plans and delegates (never writes code)
│   ├── database-agent.agent.md  — Schema, migrations, seed data
│   ├── backend-agent.agent.md   — Routes, services, middleware
│   ├── frontend-agent.agent.md  — Components, pages, hooks
│   ├── auth-agent.agent.md      — Authentication flow and guards
│   └── qa-agent.agent.md        — Testing and review (read-only)
├── skills/                  ← Knowledge packs agents use as reference
├── instructions/            ← File-specific coding rules
├── hooks/                   ← Auto-formatting config
├── prompts/                 ← Slash commands (/start-phase, /review-code, etc.)
└── copilot-instructions.md  ← Project-wide context for all agents
```

## Current Preset

- **react-express** — React + Express + Prisma + PostgreSQL (6 agents, 7 skills, 4 instructions)

More presets (Next.js, Vue, Python) coming after v1.0.

---

## CLI Commands

| Command                      | What it does                                                            |
| ---------------------------- | ----------------------------------------------------------------------- |
| `pnpm setup-mao`             | **Recommended.** Guided setup — walks through all 6 steps interactively |
| `pnpm scaffold`              | Generate agent files into `.github/` from your config                   |
| `pnpm scaffold -- --merge`   | Re-generate while preserving your manual edits                          |
| `pnpm scaffold -- --dry-run` | Preview what would be generated (no files written)                      |
| `pnpm activate`              | Validate that `.github/` is complete and consistent                     |

---

## Project Structure

```
my-project/
├── prd.md              ← Your project description (you create this)
├── mao.config.yaml     ← Generated config (AI creates, you review)
├── .github/            ← Generated agent team (MAO creates this)
│   ├── agents/
│   ├── skills/
│   ├── instructions/
│   ├── hooks/
│   └── prompts/
├── bin/                ← CLI entry points
├── src/                ← MAO engine source code
├── catalog/            ← Agent/skill templates
├── community/          ← Community skill contributions
├── docs/               ← Documentation
└── tests/              ← 150+ automated tests
```

---

## Documentation

| Guide                                                  | Description                                    |
| ------------------------------------------------------ | ---------------------------------------------- |
| [Getting Started](docs/getting-started.md)             | Full walkthrough from setup to coding          |
| [Config Reference](docs/config-reference.md)           | Every config field, valid values, and defaults |
| [Agent Catalog](docs/agent-catalog.md)                 | What each of the 6 agents does                 |
| [Skill Packs](docs/skill-packs.md)                     | What skills come with the react-express preset |
| [Writing Custom Skills](docs/writing-custom-skills.md) | How to add project-specific skills             |
| [Merge Strategy](docs/merge-strategy.md)               | How re-scaffolding preserves your edits        |
| [Best Practices](docs/best-practices.md)               | Tips for getting the best agent output         |
| [Troubleshooting](docs/troubleshooting.md)             | Common issues and how to fix them              |
| [Contributing Skills](docs/contributing-skills.md)     | How to contribute community skills             |

---

## For Contributors / Developers

If you're working on the MAO framework itself:

```bash
pnpm install          # Install dependencies
pnpm build            # Build CLI
pnpm test             # Run unit tests (143 tests)
pnpm test:e2e         # Run end-to-end tests (11 tests)
pnpm typecheck        # Type check
pnpm lint             # Lint
pnpm format           # Format code
```

Community skill contributions are welcome. See [Contributing Skills](docs/contributing-skills.md) and the [community/TEMPLATE/](community/TEMPLATE/) starter template.

---

## License

[MIT](LICENSE)
