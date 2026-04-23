# Agent Catalog

MAO generates specialist agents for your project. Each agent has a specific role, scope, and set of constraints.

## Orchestrator

**Role**: Project coordinator — plans work, delegates to specialists, verifies completion.

- **User-invocable**: Yes (the only directly invocable agent)
- **Tools**: `codebase` (read-only) — never has `edit`
- **Scope**: Entire project at a planning level

**What it does**:

1. Reads the phase plan and lists tasks
2. Presents task breakdown for user confirmation
3. Delegates tasks to specialist agents
4. Verifies completion before marking done
5. Reports progress summary

**When to include**: Always required (enforced by config validation).

**Key constraint**: The orchestrator never writes code. It plans, delegates, and verifies.

---

## Database Agent

**Role**: Schema design, migrations, and seed data.

- **User-invocable**: No
- **Tools**: `codebase`, `edit`, `terminal`
- **Scope**: `{structure.database}/**` (default: `server/prisma/**`)

**What it does**:

- Designs and modifies the database schema
- Creates and runs migrations
- Writes seed scripts with domain-appropriate test data
- Manages database provider configuration

**Skills loaded**: `prisma-db` (or ORM-specific skill), `api-conventions`

**When to include**: Any project with a database.

---

## Backend Agent

**Role**: API routes, services, middleware, and business logic.

- **User-invocable**: No
- **Tools**: `codebase`, `edit`, `terminal`
- **Scope**: `{structure.backend}/**` (default: `server/src/**`)

**What it does**:

- Creates API route handlers with validation
- Implements service layer business logic
- Writes middleware (error handling, auth guards)
- Integrates with the database layer via ORM client

**Skills loaded**: `express-api`, `api-conventions`, `error-handling`, plus any custom skills assigned to `backend`

**When to include**: Any project with a server-side API.

---

## Frontend Agent

**Role**: UI components, pages, hooks, and client-side state.

- **User-invocable**: No
- **Tools**: `codebase`, `edit`, `terminal`
- **Scope**: `{structure.frontend}/**` (default: `client/src/**`)

**What it does**:

- Creates page components following project structure
- Builds reusable UI components
- Writes data-fetching hooks (TanStack Query, SWR, etc.)
- Implements forms with validation
- Follows the configured styling approach

**Skills loaded**: `react-ui`, `error-handling`, plus any custom skills assigned to `frontend`

**When to include**: Any project with a web UI.

---

## Auth Agent

**Role**: Authentication and authorization flow.

- **User-invocable**: No
- **Tools**: `codebase`, `edit`, `terminal`
- **Scope**: Auth-related files across frontend and backend

**What it does**:

- Implements the configured auth strategy (OAuth, email/password, etc.)
- Creates auth middleware for protected routes
- Builds frontend auth guards and login/logout flows
- Manages session/token handling

**Skills loaded**: `auth` (parameterized by strategy)

**When to include**: Projects with user authentication.

---

## QA Agent

**Role**: Testing and code review.

- **User-invocable**: No
- **Tools**: `codebase`, `terminal` — **no `edit`**
- **Scope**: Entire codebase (read-only)

**What it does**:

- Writes unit tests following project testing patterns
- Reviews code for bugs, security issues, and style violations
- Verifies test coverage meets thresholds
- Reports issues without directly fixing source code

**Skills loaded**: `testing-patterns`, `error-handling`

**Key constraint**: The QA agent reviews and tests but never modifies source code directly. It reports findings for other agents or the developer to fix.

**When to include**: Recommended for all projects.

---

## Extended Agents (Planned)

These agents are defined in the schema but templates are not yet available:

| Agent         | Role                                 | Status  |
| ------------- | ------------------------------------ | ------- |
| `mobile`      | React Native / Flutter development   | Planned |
| `devops`      | CI/CD, Docker, deployment            | Planned |
| `cloud-infra` | Terraform, AWS, Azure infrastructure | Planned |
| `ai-ml`       | LangChain, RAG, ML pipelines         | Planned |

---

## Agent Interaction Pattern

```
User → @Orchestrator "Start Phase 1"
         │
         ├─ Orchestrator reads phase plan
         ├─ Presents task list to user
         ├─ [User confirms]
         │
         ├─ Delegates Task 1 → @DatabaseAgent
         │    └─ Database agent loads prisma-db skill
         │    └─ Creates schema, runs migration
         │    └─ Reports completion
         │
         ├─ Delegates Task 2 → @BackendAgent
         │    └─ Backend agent loads express-api skill
         │    └─ Creates routes, services
         │    └─ Reports completion
         │
         └─ Orchestrator verifies all tasks → reports to user
```

## Customizing Agents

After scaffolding, agent files are in `.github/agents/`. You can:

1. **Add custom sections** — The merge engine preserves your edits on re-scaffold
2. **Modify scope** — Adjust file path patterns
3. **Change tools** — Add or remove tool access
4. **Add instructions** — Include project-specific rules

Custom skill references (enriched from your PRD) are **never overwritten** on re-scaffold.
