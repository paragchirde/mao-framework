# PRD Analysis

> Skill for the Analyzer Agent — extract structured project configuration from PRD documents.

## When to Use

Load this skill when analyzing a PRD document to generate `mao.config.yaml`. **Always read ALL reference files before starting extraction.**

## Before You Start

Read these references in order:

1. **`references/config-schema.md`** — The strict schema. Every value you output must exist here. This is non-negotiable.
2. **`references/example-config.yaml`** — A complete, valid config. Match this structure exactly.
3. **`references/extraction-rules.md`** — Rules for extracting entities, business rules, and phases from different quality PRDs.

## Extraction Procedure

### 1. Classify the PRD

| Quality           | Indicators                                            | NEEDS_REVIEW density |
| ----------------- | ----------------------------------------------------- | -------------------- |
| **Comprehensive** | Data model tables, API specs, tech stack, field types | Low (0–3 flags)      |
| **Standard**      | Feature list, user roles, some entity descriptions    | Medium (4–8 flags)   |
| **Minimal**       | Just description and feature ideas                    | High (8+ flags)      |

### 2. Project Metadata

- **name**: Extract from title or first heading. Use PascalCase.
- **description**: First sentence or paragraph that describes the project purpose.
- **type**: `poc` (prototype/experiment), `mvp` (minimum viable product), `production` (full product). Default to `mvp` when unclear.

### 3. Tech Stack

Look for sections mentioning technology choices. If not specified:

- Default to `react-express` preset for full-stack web projects
- Use project-type defaults from config-schema.md (Recommended Defaults section)
- Mark **every** default as `# NEEDS_REVIEW: inferred, not specified in PRD`

**CRITICAL**: Only use values listed in config-schema.md. The most common mistake is using values that sound right but aren't in the schema.

### 4. Data Model Entities

For each entity mentioned in the PRD:

- Extract name (PascalCase)
- Extract fields with types — **only use these 8 types**: `UUID`, `String`, `Int`, `Float`, `Boolean`, `DateTime`, `Enum`, `JSON`
- Mark primary keys, unique fields, required fields
- Note relations between entities (use `references` field)
- Every `Enum` type field **must** have a `values` array

When PRD has no explicit data model, **infer entities from features** (see extraction-rules.md "Entity Inference from Features").

### 5. Business Rules → Custom Skills

Group related business logic into skills:

- Each distinct algorithm or formula → one custom skill
- Each domain-specific workflow → one custom skill
- Map skills to agents (which agent needs this knowledge)
- List reference files needed
- Do NOT create custom skills for standard CRUD — those are covered by preset stack skills

### 6. Features → Phases

Group features into implementation phases:

- Phase 1: Foundation (DB schema, auth, core models)
- Phase 2: Core features (main business logic)
- Phase 3: Supporting features (notifications, reports, filtering)
- Phase 4: Polish (UX improvements, performance, testing)

### 7. Agent Selection

From the **10 valid roles** (no others exist):

- `orchestrator` — **always required**
- `database` — if project has a database
- `backend` — if project has backend API
- `frontend` — if project has frontend UI
- `auth` — if project has authentication
- `qa` — recommended for mvp/production
- `mobile`, `devops`, `cloud-infra`, `ai-ml` — only when project explicitly requires them

### 8. Self-Check Before Output

Before writing files, verify:

- [ ] `orchestrator` is in agents list
- [ ] All phase agents are subset of agents list
- [ ] All custom skill agents are subset of agents list
- [ ] `stack.preset` is `react-express` or `custom`
- [ ] Every `Enum` field has `values` array
- [ ] All enum values match config-schema.md exactly
- [ ] NEEDS_REVIEW markers use format: `# NEEDS_REVIEW: reason`

## Key Rules

- Extract ONLY what the PRD states — never invent
- When ambiguous, mark `# NEEDS_REVIEW: <reason>` as inline YAML comment
- Prefer conservative estimates over optimistic ones
- **Every enum value must exist in config-schema.md** — using an invalid value will crash the pipeline

## References

- [config-schema](references/config-schema.md) — **Source of truth** for all valid values
- [example-config](references/example-config.yaml) — Complete working config example
- [extraction-rules](references/extraction-rules.md) — Detailed extraction and inference rules
