# Enrichment Example

This shows complete before→after examples of enrichment, so you know the expected quality bar.

---

## Example 1: Custom Skill Stub → Enriched

### BEFORE (scaffold output): `skills/task-numbering/SKILL.md`

```markdown
# task-numbering

> Auto-generation of sequential task numbers per project (BR-1)

## When to Use

<!-- ENRICHMENT WILL FILL THIS FROM PRD -->

## Procedure

<!-- ENRICHMENT WILL FILL THIS FROM PRD -->

## Key Rules

<!-- ENRICHMENT WILL FILL THIS FROM PRD -->

## References

- [algorithm.md](references/algorithm.md)
```

### AFTER (enriched): `skills/task-numbering/SKILL.md`

```markdown
# task-numbering

> Auto-generation of sequential task numbers per project (BR-1)

## When to Use

<!-- Source: PRD §3.4 — "Each task gets a unique number scoped to its project" -->
<!-- Confidence: HIGH -->

- Creating a new task in any project
- Importing or migrating tasks from external systems
- Displaying task identifiers in the UI (e.g., "TF-0042")

## Procedure

1. Read the project's `key` field (e.g., "TF" for TaskForge)
2. Query the maximum `taskNumber` for tasks in this project
3. If no tasks exist, start at 1
4. Increment: `newNumber = maxTaskNumber + 1`
5. Format the display string: `{project.key}-{newNumber:04d}` (zero-padded to 4 digits)
6. Assign `taskNumber` to the new task record
7. The display format is computed, not stored — only `taskNumber` (Int) is persisted

## Key Rules

- Task numbers are **never reused**, even after task deletion or archival
- Numbers are scoped per project — each project has its own sequence starting at 1
- The numbering must be atomic — use a database transaction to prevent race conditions
- The display format (`TF-0042`) is derived from `project.key` + `task.taskNumber`, not stored as a field

## References

- [algorithm.md](references/algorithm.md) — Full numbering algorithm with edge cases and pseudocode
```

---

## Example 2: Custom Skill Reference Stub → Enriched

### BEFORE (scaffold output): `skills/task-numbering/references/algorithm.md`

```markdown
# algorithm

> Reference for: task-numbering — Auto-generation of sequential task numbers per project (BR-1)

<!-- ENRICHMENT WILL FILL THIS FROM PRD -->
```

### AFTER (enriched): `skills/task-numbering/references/algorithm.md`

````markdown
# Task Numbering Algorithm

<!-- Source: PRD §3.4 — task numbering, §2.1 — project keys -->
<!-- Confidence: HIGH -->

## Overview

Each task in a project gets a sequential, human-readable identifier formatted as `{PROJECT_KEY}-{NUMBER}`. The number is scoped to the project and never reused.

## Algorithm

```pseudocode
function assignTaskNumber(projectId: UUID): { taskNumber: Int, displayId: String }
  BEGIN TRANSACTION
    project = db.project.findUnique(projectId)
    maxNumber = db.task.aggregate({
      where: { projectId },
      _max: { taskNumber }
    })
    newNumber = (maxNumber ?? 0) + 1
    displayId = format("{}-{:04d}", project.key, newNumber)
    RETURN { taskNumber: newNumber, displayId }
  COMMIT TRANSACTION
```
````

## Types

```typescript
interface TaskNumberResult {
  taskNumber: number; // Persisted integer (e.g., 42)
  displayId: string; // Computed display string (e.g., "TF-0042")
}
```

## Edge Cases

- **First task in project**: `maxNumber` is null → default to 0, assign 1
- **Concurrent creation**: Use database transaction with row-level locking on the project
- **Deleted/archived tasks**: Numbers are NOT recycled — the sequence only moves forward
- **Project key changes**: Display IDs change retroactively (they're computed, not stored)
- **Bulk import**: Assign numbers in a single transaction, incrementing sequentially

## Examples

| Project Key | Existing Max | New Task Number | Display ID |
| ----------- | ------------ | --------------- | ---------- |
| TF          | 0 (none)     | 1               | TF-0001    |
| TF          | 41           | 42              | TF-0042    |
| PROJ        | 999          | 1000            | PROJ-1000  |

````

---

## Example 3: Stack Skill Reference → Enriched

### BEFORE (scaffold output): `skills/prisma-db/references/schema-template.md`

Contains the Prisma schema template with entity models generated from config, followed by:

```markdown
<!-- ENRICHMENT WILL FILL THIS FROM PRD — entity relations, constraints, indexes -->
````

### AFTER (enriched): Replace the `<!-- ENRICHMENT -->` marker with:

````markdown
## Entity Relations

<!-- Source: PRD §3 — Data Model -->
<!-- Confidence: HIGH -->

- User → Workspace: One-to-many (User.id → Workspace.ownerId)
- Workspace → Project: One-to-many (Workspace.id → Project.workspaceId)
- Project → Sprint: One-to-many (Project.id → Sprint.projectId)
- Project → Task: One-to-many (Project.id → Task.projectId)
- Sprint → Task: One-to-many (Sprint.id → Task.sprintId), nullable (tasks can be unassigned)
- User → Task (assignee): One-to-many (User.id → Task.assigneeId), nullable
- User → Task (reporter): One-to-many (User.id → Task.reporterId)
- Task → Comment: One-to-many (Task.id → Comment.taskId)
- User → Comment: One-to-many (User.id → Comment.authorId)
- Task → TimeEntry: One-to-many (Task.id → TimeEntry.taskId)
- User → TimeEntry: One-to-many (User.id → TimeEntry.userId)

## Indexes

- `User`: unique index on `email`
- `Workspace`: unique index on `slug`
- `Project`: unique index on `key`, index on `workspaceId`
- `Task`: index on `projectId`, index on `sprintId`, index on `assigneeId`, composite index on `(projectId, taskNumber)`
- `Comment`: index on `taskId`
- `TimeEntry`: index on `taskId`, index on `userId`

## Enum Definitions

```prisma
enum UserRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
}

enum SprintStatus {
  PLANNING
  ACTIVE
  COMPLETED
}

enum TaskStatus {
  BACKLOG
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum TaskPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}
```
````

```

---

## Key Patterns to Follow

1. **Every enriched section starts with a traceability comment**: `<!-- Source: PRD §X.X — "brief quote" -->`
2. **Every section has a confidence marker**: `<!-- Confidence: HIGH|MEDIUM|LOW -->`
3. **Algorithms include**: pseudocode, TypeScript types, edge cases, examples
4. **Entity references include**: complete field listings, relations, indexes, enum definitions
5. **When uncertain, flag it**: `<!-- NEEDS_HUMAN_REVIEW: reason -->`
```
