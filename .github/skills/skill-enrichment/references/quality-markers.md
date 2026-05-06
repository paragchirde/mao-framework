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

---

## Minimum Content Thresholds

**An enriched file is considered INCOMPLETE unless it meets these minimums.** Do not proceed to the next file until the current file passes.

### Custom Skill SKILL.md

| Section          | Minimum            | What "minimum" means                                         |
| ---------------- | ------------------ | ------------------------------------------------------------ |
| `## When to Use` | ≥ 3 bullet points  | Each describes a concrete scenario the skill applies to      |
| `## Procedure`   | ≥ 4 numbered steps | Each step is an actionable instruction, not vague guidance   |
| `## Key Rules`   | ≥ 3 bullet points  | Each is a hard constraint or invariant the agent must follow |
| `## References`  | ≥ 1 link           | Must match actual files in `references/`                     |

### Custom Skill Reference Files

| Criterion                   | Minimum                                                    |
| --------------------------- | ---------------------------------------------------------- |
| Character count             | > 200 characters (excluding HTML comments and blank lines) |
| Has `## Overview` section   | Yes                                                        |
| Has `## Edge Cases` section | Yes, with ≥ 2 cases                                        |
| Has traceability comment    | Yes (`<!-- Source: ... -->`)                               |
| Has confidence comment      | Yes (`<!-- Confidence: ... -->`)                           |

### Stack Skill References (preset files)

| Criterion                                                 | Minimum                             |
| --------------------------------------------------------- | ----------------------------------- |
| No remaining `<!-- ENRICHMENT WILL FILL THIS -->` markers | Zero markers remaining              |
| Every entity from config appears                          | At least once in the file's content |
| Character count added by enrichment                       | > 200 characters per entity         |

### Orchestrator Agent

| Criterion                          | Minimum                |
| ---------------------------------- | ---------------------- |
| Each phase has explicit task list  | ≥ 3 tasks per phase    |
| Each task names a target file path | Yes                    |
| Each task has acceptance criteria  | Yes, at least one line |

### Copilot Instructions (`copilot-instructions.md`)

| Criterion                  | Minimum                             |
| -------------------------- | ----------------------------------- |
| Business domain context    | ≥ 3 sentences describing the domain |
| Naming conventions section | Present                             |
| Entity names mentioned     | All entities from config listed     |

---

## Entity Coverage Rule

**Every entity** defined in `mao.config.yaml` must appear in **at least** these files:

1. `prisma-db/references/schema-template.md` — schema definition
2. `prisma-db/references/seed-template.md` — sample data
3. `express-api/references/validator-template.md` — validation rules
4. At least one custom skill reference (if the entity is involved in any business rule)

If an entity is missing from any of these locations, the enrichment is incomplete.

---

## NEEDS_HUMAN_REVIEW Protocol

### When to Flag

- Algorithm details not fully specified in PRD
- Multiple valid interpretations of a business rule
- Mathematical formulas that need domain verification
- Edge cases not addressed in PRD
- Security-sensitive logic (auth rules, permissions)
- Any section with LOW confidence

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

---

## Post-Enrichment Verification Checklist

Before declaring enrichment complete, verify:

- [ ] **Zero `<!-- ENRICHMENT WILL FILL THIS -->` markers** remain in any `.github/` file
- [ ] **All custom skill SKILL.md** files meet minimum section thresholds (above)
- [ ] **All custom skill reference files** are > 200 chars with Overview + Edge Cases
- [ ] **All entities** appear in schema-template, seed-template, and validator-template
- [ ] **All enriched sections** have `<!-- Source: ... -->` and `<!-- Confidence: ... -->` comments
- [ ] **LOW confidence sections** also have `<!-- NEEDS_HUMAN_REVIEW: ... -->` tags
- [ ] **No orphan references** — every link in a SKILL.md `## References` section points to a file that exists
