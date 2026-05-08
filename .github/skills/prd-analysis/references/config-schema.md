# Config Schema Reference

> **This file is the Analyzer's source of truth.** Every enum value listed here is validated by a strict Zod schema. Using any value NOT listed here will cause a pipeline failure. Do not invent, guess, or approximate — only use exact values from the tables below.

Full schema for `mao.config.yaml` — all valid values, types, constraints, and defaults.

---

## Root Structure

```yaml
project: # REQUIRED — project metadata
stack: # REQUIRED — tech stack configuration
structure: # OPTIONAL — folder paths (has defaults)
agents: # REQUIRED — list of agent roles (min 1, must include orchestrator)
phases: # REQUIRED — implementation phases (min 1)
entities: # OPTIONAL — data model entities (defaults to [])
custom_skills: # OPTIONAL — project-specific domain skills (defaults to [])
community_skills: # OPTIONAL — community skill names (defaults to [])
merge_strategy: # OPTIONAL — defaults to 'preserve-custom'
```

---

## project (REQUIRED)

| Field         | Type   | Constraints     | Values / Format              |
| ------------- | ------ | --------------- | ---------------------------- |
| `name`        | string | Required, min 1 | PascalCase or kebab-case     |
| `description` | string | Required, min 1 | One-line project description |
| `type`        | enum   | Required        | `poc`, `mvp`, `production`   |

---

## stack (REQUIRED)

### stack.preset

| Value           | Status                                                     |
| --------------- | ---------------------------------------------------------- |
| `react-express` | **Fully supported** — use this for web full-stack projects |
| `custom`        | Supported — no preset templates, you provide everything    |
| `nextjs`        | Schema-valid but **no templates yet** — will fail scaffold |
| `react-python`  | Schema-valid but **no templates yet** — will fail scaffold |
| `vue-node`      | Schema-valid but **no templates yet** — will fail scaffold |

> **CRITICAL**: Only `react-express` and `custom` will pass scaffold validation in this version. Always use `react-express` for full-stack web projects. Use `custom` only if the project clearly doesn't fit any preset.

### stack.frontend (OPTIONAL)

| Field               | Type | Valid Values                                                      | Default          |
| ------------------- | ---- | ----------------------------------------------------------------- | ---------------- |
| `framework`         | enum | `react`, `nextjs`, `vue`, `angular`, `svelte`                     | —                |
| `language`          | enum | `typescript`, `javascript`, `python`                              | —                |
| `styling`           | enum | `tailwindcss`, `styled-components`, `css-modules`, `sass`, `none` | `tailwindcss`    |
| `state_management`  | enum | `tanstack-query`, `redux`, `zustand`, `pinia`, `none`             | `tanstack-query` |
| `component_library` | enum | `shadcn`, `mui`, `ant-design`, `none`                             | —                |

### stack.backend (OPTIONAL)

| Field       | Type | Valid Values                             | Default |
| ----------- | ---- | ---------------------------------------- | ------- |
| `framework` | enum | `express`, `fastapi`, `django`, `nestjs` | —       |
| `language`  | enum | `typescript`, `javascript`, `python`     | —       |
| `api_type`  | enum | `rest`, `graphql`                        | `rest`  |

### stack.database (OPTIONAL)

| Field      | Type | Valid Values                                             |
| ---------- | ---- | -------------------------------------------------------- |
| `provider` | enum | `postgresql`, `mysql`, `sqlite`, `mongodb`               |
| `orm`      | enum | `prisma`, `typeorm`, `sqlalchemy`, `mongoose`, `drizzle` |

### stack.auth (OPTIONAL)

| Field       | Type  | Valid Values                                                         | Default |
| ----------- | ----- | -------------------------------------------------------------------- | ------- |
| `strategy`  | enum  | `google-oauth`, `email-password`, `auth0`, `clerk`, `custom`, `none` | —       |
| `providers` | array | Array of strings (e.g., `['google']`)                                | `[]`    |
| `session`   | enum  | `jwt`, `session`, `none`                                             | `jwt`   |

### stack.testing (OPTIONAL)

| Field  | Type   | Notes                              | Default  |
| ------ | ------ | ---------------------------------- | -------- |
| `unit` | string | Free text (e.g., `vitest`, `jest`) | `vitest` |
| `e2e`  | string | Free text (e.g., `playwright`)     | —        |

### stack.deployment (OPTIONAL)

| Field      | Type   | Notes                                |
| ---------- | ------ | ------------------------------------ |
| `platform` | string | Free text (e.g., `docker`, `vercel`) |
| `hosting`  | string | Free text (e.g., `railway`, `aws`)   |

---

## structure (OPTIONAL)

| Field      | Type   | Default         |
| ---------- | ------ | --------------- |
| `frontend` | string | `client/src`    |
| `backend`  | string | `server/src`    |
| `database` | string | `server/prisma` |
| `shared`   | string | —               |

---

## agents (REQUIRED)

Array of agent role strings. Must include `orchestrator`. Minimum 1 entry.

**All valid agent roles (exactly these 10, no others):**

| Role           | Description                                | When to include                        |
| -------------- | ------------------------------------------ | -------------------------------------- |
| `orchestrator` | Plans and delegates, never writes code     | **Always required**                    |
| `database`     | Schema, migrations, seed data              | Project has a database                 |
| `backend`      | Routes, services, middleware, validators   | Project has a backend API              |
| `frontend`     | Pages, components, hooks, state management | Project has a frontend UI              |
| `auth`         | Authentication flows, guards, middleware   | Project has user authentication        |
| `qa`           | Testing and code review (read-only)        | Recommended for mvp/production         |
| `mobile`       | Mobile app development                     | Project has a native mobile app        |
| `devops`       | CI/CD, deployment, infrastructure          | Project needs DevOps automation        |
| `cloud-infra`  | Cloud architecture (AWS, Azure, GCP)       | Project has cloud infrastructure needs |
| `ai-ml`        | AI/ML models, pipelines, embeddings        | Project has AI/ML features             |

> **There are no other roles.** Do not use `docs`, `security`, `data-engineer`, `designer`, or any custom role name. The schema will reject them.

---

## phases (REQUIRED)

Array of phase objects. Minimum 1 phase.

```yaml
phases:
  - name: 'Phase Name' # REQUIRED — string, min 1 char
    description: 'What this phase covers' # REQUIRED — string, min 1 char
    agents: [database, backend] # REQUIRED — array of AgentRole (must be subset of agents list)
    order: 1 # REQUIRED — positive integer
```

**Rules:**

- Every agent referenced in a phase's `agents` array must also appear in the top-level `agents` array
- Phase `order` values should be sequential positive integers starting from 1
- Typical phase structure: Foundation (1) → Core Features (2) → Advanced Features (3) → Polish (4)

---

## entities (OPTIONAL, defaults to [])

Array of entity objects. Each entity must have a `name` and at least 1 field.

```yaml
entities:
  - name: 'User' # REQUIRED — PascalCase, min 1 char
    fields:
      - name: 'id' # REQUIRED — camelCase field name
        type: 'UUID' # REQUIRED — one of the valid field types
        primary: true # OPTIONAL — boolean
      - name: 'email'
        type: 'String'
        unique: true # OPTIONAL — boolean
        required: true # OPTIONAL — boolean
      - name: 'role'
        type: 'Enum'
        values: [admin, member] # REQUIRED when type is Enum
      - name: 'projectId'
        type: 'UUID'
        references: 'Project' # OPTIONAL — name of related entity
```

**Valid field types (exactly these 8):**

| Type       | Use for                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| `UUID`     | Identifiers, primary keys, foreign keys                                 |
| `String`   | Text: names, emails, descriptions, URLs                                 |
| `Int`      | Whole numbers: counts, positions, quantities                            |
| `Float`    | Decimal numbers: prices, percentages, scores                            |
| `Boolean`  | Flags: isActive, isArchived, enabled                                    |
| `DateTime` | Timestamps: createdAt, updatedAt, dueDate                               |
| `Enum`     | Finite value sets: status, role, priority (must include `values` array) |
| `JSON`     | Unstructured data: metadata, settings, details                          |

**Entity field properties:**

| Property     | Type    | Notes                                                 |
| ------------ | ------- | ----------------------------------------------------- |
| `name`       | string  | Required. camelCase.                                  |
| `type`       | enum    | Required. One of the 8 types above.                   |
| `primary`    | boolean | Optional. Marks the primary key field.                |
| `unique`     | boolean | Optional. Adds a unique constraint.                   |
| `required`   | boolean | Optional. Field is non-nullable.                      |
| `references` | string  | Optional. Name of the referenced entity (PascalCase). |
| `values`     | array   | Required when type is `Enum`. Array of string values. |

---

## custom_skills (OPTIONAL, defaults to [])

```yaml
custom_skills:
  - name: 'task-numbering' # REQUIRED — kebab-case, min 1 char
    description: 'What this skill contains' # REQUIRED — min 1 char
    agents: [backend, database] # REQUIRED — array of AgentRole (must be subset of agents list)
    references: # OPTIONAL — defaults to []
      - algorithm.md # Reference files that will be created as stubs
```

**When to create a custom skill:**

- A business rule involves a specific algorithm or formula → custom skill
- A domain-specific workflow or state machine → custom skill
- Validation logic unique to the project → custom skill
- Generic CRUD operations → NOT a custom skill (covered by preset stack skills)

---

## community_skills (OPTIONAL, defaults to [])

Array of community skill name strings.

---

## merge_strategy (OPTIONAL)

| Value             | Behavior                                       | Default |
| ----------------- | ---------------------------------------------- | ------- |
| `preserve-custom` | On conflict, keeps user's version              | **Yes** |
| `overwrite`       | On conflict, replaces with new template output |         |
| `prompt`          | On conflict, flags for manual resolution       |         |

---

## Cross-Field Validation Rules

These rules are enforced by the Zod schema. Violating any of them will cause config validation to fail:

1. **`orchestrator` must be in `agents`** — The agents array must always include `orchestrator`
2. **Phase agents must be a subset** — Every agent listed in any phase's `agents` must also appear in the top-level `agents` array
3. **Custom skill agents must be a subset** — Every agent listed in any custom skill's `agents` must also appear in the top-level `agents` array
4. **Preset restriction** — Only `react-express` and `custom` presets pass validation in this version. Other presets (`nextjs`, `react-python`, `vue-node`) are defined in the schema but have no templates and will fail during scaffold

---

## Recommended Defaults by Project Type

When the PRD does not specify tech stack choices, use these defaults and mark them as `# NEEDS_REVIEW`:

| Project Type | Preset          | Database     | ORM      | Auth             | Testing                 |
| ------------ | --------------- | ------------ | -------- | ---------------- | ----------------------- |
| `poc`        | `react-express` | `sqlite`     | `prisma` | `email-password` | `vitest`                |
| `mvp`        | `react-express` | `postgresql` | `prisma` | `email-password` | `vitest` + `playwright` |
| `production` | `react-express` | `postgresql` | `prisma` | `google-oauth`   | `vitest` + `playwright` |

---

## Complete Example

See [example-config.yaml](example-config.yaml) for a complete, valid, working `mao.config.yaml` that passes all validation rules.
