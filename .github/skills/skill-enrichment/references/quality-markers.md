# Quality Markers

## Confidence Levels

### HIGH

- Information is **directly and explicitly stated** in the PRD
- Quotes can be provided from the source text
- No interpretation needed
- Example: "Users can have roles: ADMIN, MANAGER, MEMBER" → HIGH confidence for User.role enum

### MEDIUM

- Information is **inferred from context** but not explicitly stated
- Reasonable interpretation based on domain knowledge
- Example: PRD says "users can manage projects" → MEDIUM confidence that Project has a userId foreign key

### LOW

- Information is **partially specified** or ambiguous
- Gaps filled with common industry patterns
- Should be flagged for human review
- Example: PRD mentions "scoring algorithm" but doesn't detail the formula → LOW confidence

## Traceability Comment Format

Every enriched section must include a source comment:

```markdown
<!-- Source: PRD §3.2 — "Each team member has an allocation percentage per project" -->
<!-- Confidence: HIGH -->
```

For multi-source sections:

```markdown
<!-- Source: PRD §3.2, §4.1 — allocation rules and capacity planning -->
<!-- Confidence: MEDIUM -->
```

## NEEDS_HUMAN_REVIEW Protocol

### When to Flag

- Algorithm details not fully specified in PRD
- Multiple valid interpretations of a business rule
- Mathematical formulas that need domain verification
- Edge cases not addressed in PRD
- Security-sensitive logic (auth rules, permissions)

### Format

```markdown
<!-- NEEDS_HUMAN_REVIEW: The PRD mentions a "scoring algorithm" (§5.3) but does not
specify the exact formula. The implementation below uses weighted average based on
context clues. Please verify the formula with the domain expert. -->
```

### Resolution

After human review:

- Replace `NEEDS_HUMAN_REVIEW` with `REVIEWED` and the reviewer's name
- Update confidence to HIGH
- Adjust content based on reviewer feedback
