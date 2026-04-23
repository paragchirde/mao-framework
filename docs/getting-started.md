# Getting Started with MAO

This guide walks you through setting up MAO and generating your first multi-agent development environment.

## Prerequisites

- **Node.js** >= 20
- **pnpm** (recommended) or npm
- **VS Code** with GitHub Copilot Chat extension
- A **Product Requirements Document** (PRD) for your project

## Step 1: Create Your Project

```bash
# Option A: Use as a GitHub template
gh repo create my-project --template mao-framework/mao-framework
cd my-project

# Option B: Clone directly
git clone https://github.com/mao-framework/mao-framework.git my-project
cd my-project
```

Install dependencies:

```bash
pnpm install
```

## Step 2: Write Your PRD

Place your PRD in the project root:

```bash
cp your-prd.md ./prd.md
```

### PRD Quality Tiers

The quality of your generated agent setup depends on your PRD:

| Tier              | PRD Contains                                     | Result                                |
| ----------------- | ------------------------------------------------ | ------------------------------------- |
| **Minimal**       | Project description + feature list               | Config with many `NEEDS_REVIEW` flags |
| **Standard**      | + data model + tech preferences + business rules | Config with few flags, good setup     |
| **Comprehensive** | + API specs + user roles + phases + edge cases   | Near-zero flags, excellent setup      |

**Tip**: Include explicit entities with field types, business rules with formulas, implementation phases, and your preferred tech stack for the best results.

## Step 3: Analyze the PRD

Open VS Code Copilot Chat and run:

```
@Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml
```

The Analyzer agent reads your PRD and produces:

- `mao.config.yaml` — Your project configuration
- `project-context.md` — Extracted entities, business rules, and features

## Step 4: Review the Config

Open `mao.config.yaml` and review:

1. **Resolve `NEEDS_REVIEW` flags** — The Analyzer marks uncertain items. Replace them with correct values.
2. **Verify entities** — Check field names, types, and relationships.
3. **Check agents** — Ensure the right specialist agents are included.
4. **Review phases** — Confirm implementation order makes sense.

Example config structure:

```yaml
project:
  name: 'My Project'
  description: 'A project management tool'
  type: mvp

stack:
  preset: react-express
  frontend:
    framework: react
    language: typescript
    styling: tailwindcss
  backend:
    framework: express
    language: typescript
  database:
    provider: postgresql
    orm: prisma
  auth:
    strategy: google-oauth

agents:
  - orchestrator
  - database
  - backend
  - frontend
  - auth
  - qa

phases:
  - name: 'Foundation'
    description: 'Database schema and API scaffolding'
    agents: [database, backend]
    order: 1
  - name: 'Core Features'
    description: 'Main application features'
    agents: [backend, frontend]
    order: 2
```

## Step 5: Scaffold

Generate the agent setup:

```bash
pnpm scaffold
```

This creates the `.github/` directory with:

- Agent definitions (`.agent.md` files)
- Skills with reference patterns
- Instruction files for file-specific rules
- Prompt files for slash commands
- Hook configurations
- `copilot-instructions.md` for workspace context

## Step 6: Enrich

In VS Code Copilot Chat:

```
@Enricher Enrich the generated agent setup from the PRD
```

The Enricher fills stub content with project-specific patterns extracted from your PRD:

- Custom skill references get real algorithms and business logic
- Schema templates get your actual entity definitions
- Route templates get your CRUD patterns
- The orchestrator gets a detailed phase plan

## Step 7: Review Enriched Files

Check the enriched files for accuracy:

- Do skill references contain correct business logic?
- Are entity schemas complete?
- Does the orchestrator phase plan match your roadmap?

Look for `<!-- NEEDS_HUMAN_REVIEW -->` markers indicating uncertain extractions.

## Step 8: Activate

Validate the complete setup:

```bash
pnpm activate
```

A passing result looks like:

```
✔ MAO Activation Check — PASSED

Agents:       6/6 valid
Skills:       11/11 complete
Instructions: 4/4 valid
Hooks:        1/1 valid
Prompts:      4/4 valid
Config:       0 unresolved flag(s)
Markers:      0 remaining
```

## Step 9: Start Coding

Open VS Code Chat and try:

```
@Orchestrator Start Phase 1
```

The Orchestrator reads the phase plan, lists tasks, and delegates to specialist agents. Each agent loads its assigned skills and follows scope constraints.

### Available Slash Commands

| Command               | Agent        | Description               |
| --------------------- | ------------ | ------------------------- |
| `/start-phase {N}`    | Orchestrator | Begin a development phase |
| `/verify-phase {N}`   | Orchestrator | Validate phase completion |
| `/add-feature {desc}` | Orchestrator | Add a feature mid-project |
| `/review-code {file}` | QA           | Review code for issues    |

## Re-scaffolding

When your config changes (new agents, updated phases, etc.):

```bash
pnpm scaffold -- --merge
```

The merge engine:

- **Creates** new files that didn't exist before
- **Preserves** files you've customized
- **Updates** files you haven't touched when the template changes
- **Never overwrites** custom skill references

See [Merge Strategy](merge-strategy.md) for details.

## Stack Auto-Detection

If you have an existing project, MAO can detect your stack:

```typescript
import { detectStack } from './src/config/detect.js';

const { detected, evidence } = await detectStack('./my-existing-project');
// detected.stack.frontend.framework → "react"
// detected.stack.backend.framework → "express"
// evidence → ["Found package.json", "Detected React from...", ...]
```

Detection reads: `package.json`, `requirements.txt`, `pyproject.toml`, `prisma/schema.prisma`, `tsconfig.json`, `Dockerfile`, and `.github/workflows/`.

## Troubleshooting

### Config validation errors

Run `pnpm scaffold` and read the error messages — they point to exact fields with issues. Common causes:

- Missing `orchestrator` in agents list
- Phase referencing an agent not in the agents list
- Unsupported preset (only `react-express` and `custom` currently)

### Enrichment markers remaining

Run `pnpm activate` — it reports remaining markers. Re-run the Enricher or fill them manually.

### Agents not appearing in VS Code

Ensure files are in `.github/agents/` (not `.github/skills/` or another location). Restart VS Code after scaffolding.
