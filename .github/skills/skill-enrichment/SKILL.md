# Skill Enrichment

> Skill for the Enricher Agent — fill scaffolded stubs with real domain knowledge from the PRD.

## When to Use

Load this skill when enriching scaffolded `.github/` skill stubs after the scaffold step.

## Enrichment Procedure

### 1. Find Stubs

Search for `<!-- ENRICHMENT WILL FILL THIS -->` markers in all files under `.github/`.

### 2. Custom Skill Enrichment

For each custom skill in `mao.config.yaml`:

1. Read the `source_sections` (PRD section references)
2. Find those sections in the PRD document
3. Extract:
   - **Algorithms** — step-by-step logic, formulas, pseudocode
   - **Data structures** — input/output types, constraints
   - **Edge cases** — boundary conditions, error scenarios
   - **Business rules** — validation logic, state machines
4. Write to `references/*.md` with structured format

### 3. Stack Skill Enrichment

For each stack skill reference (schema-template, seed-template, etc.):

1. Replace generic entity placeholders with real entities from config
2. Add domain-specific field constraints
3. Generate realistic seed data
4. Add domain-specific validation rules

### 4. Orchestrator Enrichment

Add detailed phase task breakdown:

- Specific file paths to create/modify
- Dependencies between tasks
- Acceptance criteria per task
- Estimated complexity

### 5. Copilot Instructions Enrichment

Add to the workspace-level instructions:

- Business domain context
- Key business rules (summarized)
- Naming conventions specific to the domain
- Common patterns used across the project

## Quality Markers

### Confidence Levels

- **HIGH** — Directly stated in PRD with clear specification
- **MEDIUM** — Inferred from PRD context, reasonable interpretation
- **LOW** — Partially specified, gaps filled with common patterns

### Traceability Format

```markdown
<!-- Source: PRD §X.X — "[quoted text from PRD]" -->
<!-- Confidence: HIGH|MEDIUM|LOW -->
```

### NEEDS_HUMAN_REVIEW

Use when:

- PRD is vague about algorithm details
- Multiple valid interpretations exist
- Business logic requires domain expertise to validate
- Formula or calculation needs verification

Format:

```markdown
<!-- NEEDS_HUMAN_REVIEW: [reason] -->
```

## References

- [enrichment-rules](references/enrichment-rules.md)
- [quality-markers](references/quality-markers.md)
