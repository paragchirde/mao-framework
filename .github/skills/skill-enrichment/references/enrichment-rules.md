# Enrichment Rules

> Read `enrichment-example.md` first — it shows complete before→after examples of what good enrichment looks like.

---

## Scaffolded File Inventory (react-express preset)

After `pnpm scaffold` runs, these files exist in `.github/`. Files marked with **[ENRICH]** contain `<!-- ENRICHMENT WILL FILL THIS FROM PRD -->` markers that you must fill.

### Agents (6 files)

| File                             | Enrichment needed?                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `agents/orchestrator.agent.md`   | **[ENRICH]** — Add detailed phase task breakdown with file paths, acceptance criteria |
| `agents/database-agent.agent.md` | No — structure is complete from template                                              |
| `agents/backend-agent.agent.md`  | No — structure is complete from template                                              |
| `agents/frontend-agent.agent.md` | No — structure is complete from template                                              |
| `agents/auth-agent.agent.md`     | No — structure is complete from template                                              |
| `agents/qa-agent.agent.md`       | No — structure is complete from template                                              |

### Skills — Base (always included)

| File                                               | Enrichment needed? |
| -------------------------------------------------- | ------------------ |
| `skills/api-conventions/SKILL.md`                  | No                 |
| `skills/api-conventions/references/conventions.md` | No                 |
| `skills/error-handling/SKILL.md`                   | No                 |
| `skills/error-handling/references/patterns.md`     | No                 |
| `skills/testing-patterns/SKILL.md`                 | No                 |
| `skills/testing-patterns/references/patterns.md`   | No                 |

### Skills — Preset (react-express)

| File                                                  | Enrichment needed?                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| `skills/prisma-db/SKILL.md`                           | No                                                                          |
| `skills/prisma-db/references/schema-template.md`      | **[ENRICH]** — Add entity relations, constraints, indexes, enum definitions |
| `skills/prisma-db/references/seed-template.md`        | **[ENRICH]** — Add realistic domain-appropriate sample data                 |
| `skills/express-api/SKILL.md`                         | No                                                                          |
| `skills/express-api/references/route-template.md`     | **[ENRICH]** — Add entity-specific route details, request/response shapes   |
| `skills/express-api/references/validator-template.md` | **[ENRICH]** — Add real Zod schemas with field constraints and enum values  |
| `skills/react-ui/SKILL.md`                            | No                                                                          |
| `skills/react-ui/references/page-template.md`         | **[ENRICH]** — Add domain page layouts and data requirements                |
| `skills/react-ui/references/hook-template.md`         | **[ENRICH]** — Add domain-specific data fetching hooks                      |
| `skills/react-ui/references/component-template.md`    | **[ENRICH]** — Add domain component patterns                                |
| `skills/auth/SKILL.md`                                | No                                                                          |
| `skills/auth/references/auth-flow.md`                 | **[ENRICH]** — Add project-specific auth flow details                       |
| `skills/auth/references/middleware-template.md`       | **[ENRICH]** — Add role-based access rules from PRD                         |

### Skills — Custom (from config `custom_skills`)

**All files are stubs that need full enrichment:**

| File pattern                              | Enrichment needed?                                              |
| ----------------------------------------- | --------------------------------------------------------------- |
| `skills/{skill-name}/SKILL.md`            | **[ENRICH]** — Fill "When to Use", "Procedure", "Key Rules"     |
| `skills/{skill-name}/references/{ref}.md` | **[ENRICH]** — Fill with algorithm, types, edge cases, examples |

### Root & Other Files

| File                             | Enrichment needed?                                                    |
| -------------------------------- | --------------------------------------------------------------------- |
| `copilot-instructions.md`        | **[ENRICH]** — Add business rules, domain context, naming conventions |
| `prompts/start-phase.prompt.md`  | No                                                                    |
| `prompts/verify-phase.prompt.md` | No                                                                    |
| `prompts/add-feature.prompt.md`  | No                                                                    |
| `prompts/review-code.prompt.md`  | No                                                                    |
| `hooks/prettier.json`            | No                                                                    |

---

## Enrichment Priority Order

Enrich files in this exact order (each step builds on the previous):

1. **Database schemas** — `prisma-db/references/schema-template.md` (entity relations, indexes, enums)
2. **API validators** — `express-api/references/validator-template.md` (field constraints, enum values)
3. **Custom skill stubs** — All `skills/{custom-skill}/` files (domain algorithms, business logic)
4. **API routes** — `express-api/references/route-template.md` (entity-specific CRUD details)
5. **Auth references** — `auth/references/auth-flow.md` and `middleware-template.md`
6. **UI templates** — `react-ui/references/` (pages, hooks, components)
7. **Seed data** — `prisma-db/references/seed-template.md` (realistic sample data)
8. **Orchestrator** — `agents/orchestrator.agent.md` (detailed phase task breakdown)
9. **Copilot instructions** — `copilot-instructions.md` (business rules, domain context summary)

---

## Custom Skill Reference Format

Each reference file should follow this structure:

````markdown
# [Reference Name]

<!-- Source: PRD §X.X — "brief quote or summary" -->
<!-- Confidence: HIGH|MEDIUM|LOW -->

## Overview

Brief description of what this reference covers.

## Algorithm / Logic

Step-by-step pseudocode or detailed logic.

## Types

```typescript
// Input and output types
```
````

## Edge Cases

- Case 1: description → expected behavior
- Case 2: description → expected behavior

## Examples

Concrete examples with inputs and expected outputs.

```

---

## Stack Skill Reference Enrichment

### Schema Templates (`prisma-db/references/schema-template.md`)

- Replace `<!-- ENRICHMENT -->` markers with:
  - Entity relation definitions (which models reference which)
  - Index definitions for commonly queried fields
  - Enum definitions in Prisma format (UPPER_SNAKE_CASE values)
  - Unique constraints for business keys

### Seed Templates (`prisma-db/references/seed-template.md`)

- Replace `<!-- ENRICHMENT -->` markers with:
  - 3-5 realistic records per entity
  - Domain-appropriate fake data (no real PII)
  - Respect foreign key order (referenced tables first)
  - Include all enum values in seed data

### Validator Templates (`express-api/references/validator-template.md`)

- Add Zod schemas with real field constraints
- Include min/max lengths from PRD requirements
- Add enum constraints with actual values
- Add custom validation for business rules

### Route Templates (`express-api/references/route-template.md`)

- Add entity-specific route details
- Include request/response shapes
- Note any custom business logic routes (beyond standard CRUD)

### UI Templates (`react-ui/references/`)

- Map entities to page layouts
- Add form fields matching entity schema
- Include data display components
- Note which pages need which data hooks

### Auth References (`auth/references/`)

- Specify the exact auth flow (registration → login → token → protected routes)
- Define role-based access rules per entity/action
- Specify middleware chain for protected routes

---

## Enrichment Order

1. Database schemas (foundation for everything)
2. API validators (depend on entity types)
3. Custom skill references (domain logic)
4. API routes (depend on validators and business logic)
5. Auth references (depend on user roles from PRD)
6. UI templates (depend on API contracts)
7. Seed data (depend on complete entity definitions)
8. Orchestrator phase breakdown (depends on all above)
9. Copilot instructions (summary of all above)
```
