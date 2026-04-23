# Enrichment Rules

## Custom Skill Reference Format

Each reference file should follow this structure:

```markdown
# [Reference Name]

<!-- Source: PRD §X.X -->
<!-- Confidence: HIGH|MEDIUM|LOW -->

## Overview
Brief description of what this reference covers.

## Algorithm / Logic
Step-by-step pseudocode or detailed logic.

## Types
```typescript
// Input and output types
```

## Edge Cases
- Case 1: description → expected behavior
- Case 2: description → expected behavior

## Examples
Concrete examples with inputs and expected outputs.
```

## Stack Skill Reference Enrichment

### Schema Templates
- Replace `// <!-- ENRICHMENT -->` with real entity fields
- Add proper Prisma types, relations, and constraints
- Include enums with real values from PRD

### Seed Templates
- Generate 3-5 realistic records per entity
- Use domain-appropriate fake data
- Respect foreign key relationships
- Include all enum values in seed data

### Validator Templates
- Add Zod schemas with real field constraints
- Include min/max lengths from PRD requirements
- Add enum constraints
- Add custom validation for business rules

### UI Templates
- Map entities to page layouts
- Add form fields matching entity schema
- Include data display components

## Enrichment Order

1. Database schemas (foundation for everything)
2. API validators (depend on entity types)
3. Custom skill references (domain logic)
4. UI templates (depend on API contracts)
5. Orchestrator phase breakdown (depends on all above)
6. Copilot instructions (summary of all above)
