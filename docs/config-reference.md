# Config Reference

Complete reference for `mao.config.yaml` — every field, valid values, and defaults.

## Root Fields

| Field              | Type   | Required | Description                    |
| ------------------ | ------ | -------- | ------------------------------ |
| `project`          | object | Yes      | Project metadata               |
| `stack`            | object | Yes      | Technology stack configuration |
| `structure`        | object | No       | Directory path overrides       |
| `agents`           | array  | Yes      | Agent roles to generate        |
| `phases`           | array  | Yes      | Implementation phases          |
| `entities`         | array  | No       | Data model entities            |
| `custom_skills`    | array  | No       | Project-specific skills        |
| `community_skills` | array  | No       | Community skill references     |
| `merge_strategy`   | string | No       | Re-scaffold merge behavior     |

---

## `project`

| Field         | Type   | Required | Description                   |
| ------------- | ------ | -------- | ----------------------------- |
| `name`        | string | Yes      | Project name (min 1 char)     |
| `description` | string | Yes      | Brief project description     |
| `type`        | enum   | Yes      | `poc`, `mvp`, or `production` |

```yaml
project:
  name: 'TaskForge'
  description: 'A project management tool with sprint planning'
  type: mvp
```

---

## `stack`

### `stack.preset`

| Value           | Description                                             |
| --------------- | ------------------------------------------------------- |
| `react-express` | React + Express + Prisma + PostgreSQL (fully supported) |
| `custom`        | Manual stack configuration (all sub-fields required)    |
| `nextjs`        | Next.js full-stack (planned)                            |
| `react-python`  | React + FastAPI/Django (planned)                        |
| `vue-node`      | Vue + Express/NestJS (planned)                          |

### `stack.frontend`

| Field               | Type | Values                                                            | Default          |
| ------------------- | ---- | ----------------------------------------------------------------- | ---------------- |
| `framework`         | enum | `react`, `nextjs`, `vue`, `angular`, `svelte`                     | —                |
| `language`          | enum | `typescript`, `javascript`, `python`                              | —                |
| `styling`           | enum | `tailwindcss`, `styled-components`, `css-modules`, `sass`, `none` | `tailwindcss`    |
| `state_management`  | enum | `tanstack-query`, `redux`, `zustand`, `pinia`, `none`             | `tanstack-query` |
| `component_library` | enum | `shadcn`, `mui`, `ant-design`, `none`                             | —                |

### `stack.backend`

| Field       | Type | Values                                   | Default |
| ----------- | ---- | ---------------------------------------- | ------- |
| `framework` | enum | `express`, `fastapi`, `django`, `nestjs` | —       |
| `language`  | enum | `typescript`, `javascript`, `python`     | —       |
| `api_type`  | enum | `rest`, `graphql`                        | `rest`  |

### `stack.database`

| Field      | Type | Values                                                   | Default |
| ---------- | ---- | -------------------------------------------------------- | ------- |
| `provider` | enum | `postgresql`, `mysql`, `sqlite`, `mongodb`               | —       |
| `orm`      | enum | `prisma`, `typeorm`, `sqlalchemy`, `mongoose`, `drizzle` | —       |

### `stack.auth`

| Field       | Type  | Values                                                               | Default |
| ----------- | ----- | -------------------------------------------------------------------- | ------- |
| `strategy`  | enum  | `google-oauth`, `email-password`, `auth0`, `clerk`, `custom`, `none` | —       |
| `providers` | array | string[]                                                             | `[]`    |
| `session`   | enum  | `jwt`, `session`, `none`                                             | `jwt`   |

### `stack.testing`

| Field  | Type   | Default  |
| ------ | ------ | -------- |
| `unit` | string | `vitest` |
| `e2e`  | string | —        |

### `stack.deployment` (optional)

| Field      | Type   |
| ---------- | ------ |
| `platform` | string |
| `hosting`  | string |

### react-express defaults

When `preset: react-express`, these defaults apply automatically:

```yaml
stack:
  preset: react-express
  frontend:
    framework: react
    language: typescript
    styling: tailwindcss
    state_management: tanstack-query
    component_library: shadcn
  backend:
    framework: express
    language: typescript
    api_type: rest
  database:
    provider: postgresql
    orm: prisma
  auth:
    strategy: google-oauth
    providers: [google]
    session: jwt
  testing:
    unit: vitest
    e2e: playwright
```

---

## `structure`

Override default directory paths:

| Field      | Type   | Default         |
| ---------- | ------ | --------------- |
| `frontend` | string | `client/src`    |
| `backend`  | string | `server/src`    |
| `database` | string | `server/prisma` |
| `shared`   | string | —               |

```yaml
structure:
  frontend: 'src/client'
  backend: 'src/server'
  database: 'prisma'
```

---

## `agents`

Array of agent roles to generate. Must include `orchestrator`.

| Role           | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `orchestrator` | **Required**. Plans, delegates, coordinates. Never writes code. |
| `database`     | Schema design, migrations, seed data                            |
| `backend`      | API routes, services, middleware                                |
| `frontend`     | Components, pages, hooks, state                                 |
| `auth`         | Authentication flow, middleware, guards                         |
| `qa`           | Testing, code review (read-only — never modifies source)        |
| `mobile`       | Mobile app development                                          |
| `devops`       | CI/CD, deployment                                               |
| `cloud-infra`  | Cloud infrastructure                                            |
| `ai-ml`        | AI/ML features                                                  |

```yaml
agents:
  - orchestrator
  - database
  - backend
  - frontend
  - auth
  - qa
```

### Cross-field validation

- `agents` must always include `orchestrator`
- Phase agents must be a subset of this list
- Custom skill agents must be a subset of this list

---

## `phases`

Implementation phases with assigned agents:

| Field         | Type    | Required                 |
| ------------- | ------- | ------------------------ |
| `name`        | string  | Yes                      |
| `description` | string  | Yes                      |
| `agents`      | array   | Yes (subset of `agents`) |
| `order`       | integer | Yes (positive)           |

```yaml
phases:
  - name: 'Foundation'
    description: 'Database schema, authentication, and API scaffolding'
    agents: [database, backend, auth]
    order: 1
  - name: 'Core Features'
    description: 'Main application features and UI'
    agents: [backend, frontend]
    order: 2
  - name: 'Polish'
    description: 'Testing, optimization, and deployment'
    agents: [qa, backend, frontend]
    order: 3
```

---

## `entities`

Data model entities for schema generation:

| Field    | Type   | Required    |
| -------- | ------ | ----------- |
| `name`   | string | Yes         |
| `fields` | array  | Yes (min 1) |

Each field:

| Field        | Type    | Required                       |
| ------------ | ------- | ------------------------------ |
| `name`       | string  | Yes                            |
| `type`       | enum    | Yes                            |
| `primary`    | boolean | No                             |
| `unique`     | boolean | No                             |
| `required`   | boolean | No                             |
| `references` | string  | No (entity name for relations) |
| `values`     | array   | No (for Enum type)             |

Valid field types: `UUID`, `String`, `Int`, `Float`, `Boolean`, `DateTime`, `Enum`, `JSON`

```yaml
entities:
  - name: User
    fields:
      - { name: id, type: UUID, primary: true }
      - { name: email, type: String, unique: true, required: true }
      - { name: name, type: String, required: true }
      - { name: role, type: Enum, values: [admin, member, viewer] }
      - { name: createdAt, type: DateTime }
  - name: Project
    fields:
      - { name: id, type: UUID, primary: true }
      - { name: name, type: String, required: true }
      - { name: ownerId, type: UUID, references: User }
```

---

## `custom_skills`

Project-specific skills (stubs generated, enriched from PRD):

| Field         | Type   | Required                 |
| ------------- | ------ | ------------------------ |
| `name`        | string | Yes                      |
| `description` | string | Yes                      |
| `agents`      | array  | Yes (subset of `agents`) |
| `references`  | array  | No                       |

```yaml
custom_skills:
  - name: sprint-capacity
    description: 'Sprint capacity calculation algorithm'
    agents: [backend]
    references: [formula.md]
  - name: task-workflow
    description: 'Task state machine and transitions'
    agents: [backend, frontend]
    references: [state-machine.md]
```

---

## `community_skills`

References to skills from the `community/` directory:

```yaml
community_skills:
  - 'payment-processing'
  - 'file-upload'
```

Version pinning: `"skill-name@v2"` (strips version suffix, uses local directory).

---

## `merge_strategy`

Controls behavior when re-scaffolding with `--merge`:

| Value             | Behavior                                                    |
| ----------------- | ----------------------------------------------------------- |
| `preserve-custom` | Keep user modifications, skip conflicts (default)           |
| `overwrite`       | Replace with new generated (except custom skill references) |
| `prompt`          | Flag conflicts for manual resolution                        |

```yaml
merge_strategy: preserve-custom
```
