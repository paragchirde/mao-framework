# Writing Custom Skills

How to create custom skills for your MAO-generated agent team.

## What Are Custom Skills?

Custom skills teach agents project-specific knowledge that isn't covered by preset skill packs. Examples:

- A task-numbering algorithm unique to your project
- Sprint capacity calculation formulas
- Domain-specific workflow state machines
- Business rule validation logic

## Skill Structure

Every custom skill lives in `.github/skills/<skill-name>/`:

```
.github/skills/task-numbering/
├── SKILL.md                          ← Agent reads this first
└── references/
    └── algorithm.md                  ← Detailed implementation reference
```

## Writing SKILL.md

The `SKILL.md` is what the agent reads to understand when and how to use the skill. Follow this structure:

```markdown
# Task Numbering

## When to Use

- Creating new tasks or issues
- Assigning task identifiers in bulk
- Migrating tasks between projects

## Procedure

1. Read the project prefix from configuration
2. Query the last assigned number for this project
3. Increment and format: `{PREFIX}-{NUMBER:04d}`
4. Validate uniqueness before assigning

## Key Rules

- Numbers are never reused, even after deletion
- Prefix is always uppercase, 2-5 characters
- Padding is always 4 digits minimum

## References

- [algorithm.md](references/algorithm.md) — Full numbering algorithm with edge cases
```

### Required Sections

| Section         | Purpose                                         |
| --------------- | ----------------------------------------------- |
| **When to Use** | Tells the agent exactly when to load this skill |
| **Procedure**   | Step-by-step instructions the agent follows     |
| **Key Rules**   | Hard constraints that must never be violated    |
| **References**  | Links to detailed reference documents           |

## Writing Reference Files

Reference files contain the detailed knowledge — algorithms, code patterns, formulas, schemas. They should be:

- **Actionable** — Include code examples, not just descriptions
- **Complete** — Cover inputs, outputs, edge cases, error handling
- **Traceable** — Link back to PRD sections where possible

### Example: `references/algorithm.md`

```markdown
# Task Number Generation Algorithm

## Inputs

- `projectPrefix`: string (2-5 uppercase chars)
- `lastNumber`: integer (from database)

## Output

- `taskId`: string formatted as `{PREFIX}-{NUMBER:04d}`

## Algorithm

\`\`\`typescript
function generateTaskId(prefix: string, lastNumber: number): string {
const next = lastNumber + 1;
return `${prefix}-${String(next).padStart(4, '0')}`;
}
\`\`\`

## Edge Cases

- **First task in project**: `lastNumber` is 0 → output is `PREFIX-0001`
- **Overflow**: If number exceeds 9999, padding extends → `PREFIX-10000`
- **Concurrent creation**: Use database sequence or atomic increment
```

## Registering Custom Skills in Config

Add your custom skills to `mao.config.yaml`:

```yaml
custom_skills:
  - name: task-numbering
    description: 'Generates sequential task identifiers with project prefix'
    agents: [backend, database]
    references:
      - algorithm.md
```

### Fields

| Field         | Required | Description                                                     |
| ------------- | -------- | --------------------------------------------------------------- |
| `name`        | Yes      | Skill directory name (kebab-case)                               |
| `description` | Yes      | One-line description for agent context                          |
| `agents`      | Yes      | Which agents should have access to this skill                   |
| `references`  | No       | List of reference file names (created as stubs during scaffold) |

## Scaffold Behavior

When you run `pnpm scaffold`, custom skills are created as stubs:

```
.github/skills/task-numbering/
├── SKILL.md                 ← Contains enrichment placeholder
└── references/
    └── algorithm.md         ← Contains enrichment placeholder
```

The Enricher agent then fills these stubs with content extracted from your PRD.

## Quality Checklist

Before considering a custom skill complete:

- [ ] `SKILL.md` has all four required sections
- [ ] Reference files have code examples, not just prose
- [ ] Edge cases are documented
- [ ] Algorithm inputs and outputs are typed
- [ ] The skill is referenced by at least one agent in the config
- [ ] Running `pnpm activate` passes with no errors for this skill

## Tips

- **One concept per skill** — Don't bundle unrelated logic into one skill
- **Be specific** — "task-numbering" is better than "utilities"
- **Include types** — TypeScript interfaces help agents generate correct code
- **Test with the agent** — After enrichment, ask the agent to use the skill and verify output quality
