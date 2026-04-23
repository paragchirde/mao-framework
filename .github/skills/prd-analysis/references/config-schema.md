# Config Schema Reference

Full schema for `mao.config.yaml` — all valid values, types, and constraints.

## Required Fields

| Field | Type | Values |
|---|---|---|
| `project.name` | string | PascalCase or kebab-case |
| `project.description` | string | One-line description |
| `project.type` | enum | `poc`, `mvp`, `production` |
| `stack.preset` | enum | `react-express`, `custom` |
| `agents` | array | Must include `orchestrator` |
| `phases` | array | At least 1 phase |
| `entities` | array | At least 1 entity |
| `merge_strategy` | enum | `preserve-custom`, `overwrite`, `prompt` |

## Stack — Frontend

| Field | Values |
|---|---|
| `framework` | `react`, `nextjs`, `vue`, `angular`, `svelte`, `none` |
| `language` | `typescript`, `javascript` |
| `styling` | `tailwindcss`, `css-modules`, `styled-components`, `vanilla` |
| `state_management` | `tanstack-query`, `swr`, `redux`, `pinia`, `zustand`, `none` |

## Stack — Backend

| Field | Values |
|---|---|
| `framework` | `express`, `fastapi`, `django`, `nestjs`, `flask`, `none` |
| `language` | `typescript`, `javascript`, `python`, `go` |
| `api_type` | `rest`, `graphql`, `trpc` |

## Stack — Database

| Field | Values |
|---|---|
| `provider` | `postgresql`, `mysql`, `sqlite`, `mongodb`, `none` |
| `orm` | `prisma`, `drizzle`, `typeorm`, `mongoose`, `sqlalchemy`, `none` |

## Stack — Auth

| Field | Values |
|---|---|
| `strategy` | `google-oauth`, `email-password`, `auth0`, `clerk`, `firebase`, `none` |
| `session` | `jwt`, `session`, `none` |

## Agent Roles

Core: `orchestrator`, `database`, `backend`, `frontend`, `auth`, `qa`
Extended: `mobile`, `devops`, `cloud-infra`, `ai-ml`, `docs`, `security`, `data-engineer`, `designer`

## Entities

```yaml
entities:
  - name: "PascalCase"
    fields:
      - name: "fieldName"
        type: "String | Int | Float | Boolean | DateTime | UUID | JSON | Enum"
        primary: true    # optional
        unique: true     # optional
        required: true   # optional
```

## Custom Skills

```yaml
custom_skills:
  - name: "kebab-case"
    description: "What this skill contains"
    agents: ["backend", "database"]    # Which agents load this skill
    references: ["algorithm.md"]        # Reference files to create
```

## Cross-Field Validation Rules

1. `orchestrator` must always be in the agents list
2. Phase agents must be a subset of the main agents list
3. Custom skill agents must be a subset of the main agents list
