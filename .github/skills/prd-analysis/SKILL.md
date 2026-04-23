# PRD Analysis

> Skill for the Analyzer Agent — extract structured project configuration from PRD documents.

## When to Use

Load this skill when analyzing a PRD document to generate `mao.config.yaml`.

## Extraction Procedure

### 1. Project Metadata

- **name**: Extract from title or first heading. Use PascalCase.
- **description**: First sentence or paragraph that describes the project purpose.
- **type**: `poc` (prototype/experiment), `mvp` (minimum viable product), `production` (full product)

### 2. Tech Stack

Look for sections mentioning technology choices. If not specified:

- Default to `react-express` preset for full-stack web projects
- Mark all defaults as `NEEDS_REVIEW`

### 3. Data Model Entities

For each entity mentioned in the PRD:

- Extract name (PascalCase)
- Extract fields with types (String, Int, Float, Boolean, DateTime, UUID, JSON, Enum)
- Mark primary keys, unique fields, required fields
- Note relations between entities
- Tag with `prd_ref` to source section

### 4. Business Rules → Custom Skills

Group related business logic into skills:

- Each distinct algorithm or formula = one custom skill
- Each domain-specific workflow = one custom skill
- Map skills to agents (which agent needs this knowledge)
- List reference files needed

### 5. Features → Phases

Group features into implementation phases:

- Phase 1: Foundation (DB schema, auth, core models)
- Phase 2: Core features (main business logic)
- Phase 3: Supporting features (notifications, reports)
- Phase 4: Polish (UX improvements, performance)

### 6. Agent Selection

From the 14-role catalog, select agents based on:

- `orchestrator` — always required
- `database` — if project has a database
- `backend` — if project has backend API
- `frontend` — if project has frontend UI
- `auth` — if project has authentication
- `qa` — recommended for mvp/production
- Extended roles only when project explicitly requires them

## Key Rules

- Extract ONLY what the PRD states — never invent
- When ambiguous, mark `NEEDS_REVIEW` and explain why
- Prefer conservative estimates over optimistic ones
- Every extracted item must have a `prd_ref`

## References

- [extraction-rules](references/extraction-rules.md)
- [config-schema](references/config-schema.md)
