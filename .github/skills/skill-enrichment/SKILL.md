# Skill Enrichment

> Skill for the Enricher Agent — fill scaffolded stubs with real domain knowledge from the PRD.

## When to Use

Load this skill when enriching scaffolded `.github/` skill stubs after the scaffold step.

## Before You Start

Read these references in order:

1. **`references/enrichment-example.md`** — Golden before→after examples. **This is your quality bar.**
2. **`references/enrichment-rules.md`** — File inventory (which files need enrichment) and priority order.
3. **`references/quality-markers.md`** — Confidence levels, minimum content thresholds, and verification checklist.

## Enrichment Procedure

### 1. Inventory

Scan `.github/` for all `<!-- ENRICHMENT WILL FILL THIS FROM PRD -->` markers. Report the count.

### 2. Custom Skill Enrichment

For each custom skill in `mao.config.yaml`:

1. Read the `source_sections` (PRD section references)
2. Find those sections in the PRD document
3. Extract:
   - **Algorithms** — step-by-step logic, formulas, pseudocode
   - **Data structures** — input/output types, constraints
   - **Edge cases** — boundary conditions, error scenarios (minimum 2)
   - **Business rules** — validation logic, state machines
4. Write SKILL.md: "When to Use" (≥3 bullets), "Procedure" (≥4 steps), "Key Rules" (≥3 bullets)
5. Write references: Overview, Algorithm/Logic, Types, Edge Cases, Examples

### 3. Stack Skill Enrichment

For each stack skill reference (schema-template, seed-template, etc.):

1. Replace `<!-- ENRICHMENT -->` markers with real domain content
2. Add domain-specific field constraints, relations, and indexes
3. Generate realistic seed data (3–5 records per entity)
4. Add domain-specific validation rules and enum values
5. Every entity from config must appear in schema-template, seed-template, and validator-template

### 4. Orchestrator Enrichment

Add detailed phase task breakdown:

- Specific file paths to create/modify
- Dependencies between tasks
- Acceptance criteria per task (at least one line each)
- ≥3 tasks per phase

### 5. Copilot Instructions Enrichment

Add to the workspace-level instructions:

- Business domain context (≥3 sentences)
- Key business rules (summarized)
- Naming conventions specific to the domain
- All entity names from config mentioned

### 6. Verification (MANDATORY)

- Re-scan: zero `<!-- ENRICHMENT WILL FILL THIS -->` markers remaining
- Check minimum thresholds from quality-markers.md
- List all `NEEDS_HUMAN_REVIEW` tags

## Quality Markers

### Confidence Levels

- **HIGH** — Directly stated in PRD with clear specification
- **MEDIUM** — Inferred from PRD context, reasonable interpretation
- **LOW** — Partially specified, gaps filled with common patterns → must also add `NEEDS_HUMAN_REVIEW`

### Traceability Format

Every enriched section must have both comments:

```markdown
<!-- Source: PRD §X.X — "[quoted text or summary]" -->
<!-- Confidence: HIGH|MEDIUM|LOW -->
```

### NEEDS_HUMAN_REVIEW

Use when:

- PRD is vague about algorithm details
- Multiple valid interpretations exist
- Business logic requires domain expertise to validate
- Formula or calculation needs verification
- Confidence is LOW

Format:

```markdown
<!-- NEEDS_HUMAN_REVIEW: [reason] -->
```

## References

- [enrichment-example](references/enrichment-example.md) — **Read first.** Golden before→after examples.
- [enrichment-rules](references/enrichment-rules.md) — File inventory and priority order.
- [quality-markers](references/quality-markers.md) — Minimum thresholds and verification checklist.
