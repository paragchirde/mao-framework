# Extraction Rules

## Reading Strategy

Before extracting anything, read the **entire** PRD document. Then classify it:

| PRD Quality       | Indicators                                                | Approach                                            |
| ----------------- | --------------------------------------------------------- | --------------------------------------------------- |
| **Comprehensive** | Has data model tables, API specs, tech stack, field types | Extract directly — few NEEDS_REVIEW flags           |
| **Standard**      | Has feature list, user roles, some entity descriptions    | Extract what's there, infer missing, mark uncertain |
| **Minimal**       | Just a description and feature ideas, no tech details     | Infer everything, mark most things as NEEDS_REVIEW  |

---

## Handling Minimal PRDs

When a PRD is light on detail (no explicit tech stack, no data model tables, no API specs), follow these rules:

### Tech Stack Inference

1. If PRD says nothing about tech → use `react-express` preset with project-type defaults (see config-schema.md) and mark ALL stack choices as `# NEEDS_REVIEW: inferred, not specified in PRD`
2. If PRD mentions a framework by name (e.g., "we want to use React") → use it, no NEEDS_REVIEW
3. If PRD mentions a language (e.g., "Python backend") → choose the best-fit framework for that language (`fastapi` for Python) and mark framework as NEEDS_REVIEW
4. If PRD mentions "simple" or "lightweight" → prefer `sqlite` for poc, `postgresql` for mvp

### Entity Inference from Features

When the PRD has no explicit data model section, extract entities from feature descriptions:

1. **Nouns that are created/managed** — "Users can create **boards**" → Board is an entity
2. **Nouns with properties** — "Each **card** has a title, description, and due date" → Card entity with those fields
3. **Nouns in relationships** — "A board has multiple **lists**, each list has multiple **cards**" → List and Card entities with foreign keys
4. **User roles mentioned** — "The board **owner** can invite **members**" → User entity with a role field or a membership join entity
5. **Status/state mentions** — "Cards can be moved between lists" → implies a status or position field
6. **Actions that imply data** — "Track activity when cards are moved" → Activity entity

For inferred entities:

- Always include `id` (UUID, primary), `createdAt` (DateTime)
- Include `updatedAt` (DateTime) for entities that can be edited
- Mark inferred entities as `# Entity inferred from feature descriptions — verify fields`

### Phase Inference

When the PRD has no explicit phases:

1. **Phase 1 — Foundation**: Database schema for ALL entities, authentication, user management
2. **Phase 2 — Core Features**: The main functionality described in the PRD (the "what it does" features)
3. **Phase 3 — Enhancements**: Secondary features, filtering, search, activity tracking
4. **Phase 4 — Polish**: UI refinement, responsive design, error handling, testing

### Custom Skill Inference

When to create a custom skill vs. rely on preset stack skills:

- **Create a custom skill** when the PRD describes a specific algorithm, formula, calculation, workflow state machine, or domain-specific validation rule
- **Do NOT create a custom skill** for standard CRUD operations, basic auth flows, or generic API patterns — these are handled by preset stack skills
- When uncertain, create the skill — it's better to have an extra stub than to miss domain logic

---

## Entity Extraction

When reading a PRD, look for entities in these patterns:

1. **Explicit data model sections** — tables, diagrams, field lists
2. **User stories** — "As a [User], I can create [Task]" → User and Task are entities
3. **Feature descriptions** — "Each project has multiple sprints" → Project, Sprint entities
4. **Business rules** — "Allocations must sum to 100%" → Allocation entity
5. **Screens/pages** — "Board View shows lists and cards" → Board, List, Card entities
6. **Roles and permissions** — "Only the owner can delete" → implies ownership field or membership entity

### Field Type Mapping

| PRD Language                                     | Field Type |
| ------------------------------------------------ | ---------- |
| "name", "title", "description", "email"          | String     |
| "count", "number of", "quantity"                 | Int        |
| "price", "amount", "percentage"                  | Float      |
| "is active", "enabled", "flag"                   | Boolean    |
| "date", "created", "timestamp"                   | DateTime   |
| "id", "identifier", "uuid"                       | UUID       |
| "status", "role", "type" (finite set)            | Enum       |
| "metadata", "settings", "details" (unstructured) | JSON       |
| "position", "order", "rank" (sort order)         | Int        |
| "color", "url", "slug"                           | String     |

### Relation Detection

| PRD Pattern                                         | Relation     | Config Representation                             |
| --------------------------------------------------- | ------------ | ------------------------------------------------- |
| "has many", "contains multiple"                     | One-to-many  | FK field on the "many" side: `references: Parent` |
| "belongs to", "is owned by"                         | Many-to-one  | FK field: `references: Owner`                     |
| "has one", "is associated with"                     | One-to-one   | FK field with `unique: true`                      |
| "can have multiple ... each can belong to multiple" | Many-to-many | Create a join entity with two FK fields           |

---

## Business Rule Extraction

Convert PRD rules into structured format:

```yaml
rule:
  name: 'descriptive-name'
  source: 'PRD §X.X'
  inputs: [list of input values]
  output: 'what the rule produces'
  formula: 'if applicable'
  edge_cases:
    - 'what happens when X'
    - 'what happens when Y'
```

### Identifying Business Rules

Look for these signal words:

- **Calculations**: "calculate", "compute", "based on", "formula", "total"
- **Validations**: "must", "cannot", "maximum", "minimum", "between", "at least", "at most"
- **Workflows**: "status", "transition", "state", "approve", "lifecycle", "moved"
- **Access control**: "only", "owner", "member", "permission", "allowed"
- **Automation**: "automatically", "when X then Y", "triggers"

---

## Phase Planning Rules

- **Dependencies**: DB before backend, backend before frontend, auth early
- **Agent assignment**: Match features to the agent whose scope covers those files
- **Phase size**: 3-7 tasks per phase is ideal
- **Acceptance criteria**: Every phase must have verifiable deliverables
- **Agent roles in phases**: Only include agents that have active work in that phase — don't include `qa` in every phase unless testing is the focus

---

## Project Type Recommendations

| Indicator in PRD                               | Recommended `project.type` |
| ---------------------------------------------- | -------------------------- |
| "prototype", "experiment", "proof of concept"  | `poc`                      |
| "MVP", "minimum viable", "v1", "first version" | `mvp`                      |
| "production", "enterprise", "scale", "launch"  | `production`               |
| No indicator                                   | `mvp` (safe default)       |
