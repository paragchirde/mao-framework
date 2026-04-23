# Extraction Rules

## Entity Extraction

When reading a PRD, look for entities in these patterns:

1. **Explicit data model sections** — tables, diagrams, field lists
2. **User stories** — "As a [User], I can create [Task]" → User and Task are entities
3. **Feature descriptions** — "Each project has multiple sprints" → Project, Sprint entities
4. **Business rules** — "Allocations must sum to 100%" → Allocation entity

### Field Type Mapping

| PRD Language | Field Type |
|---|---|
| "name", "title", "description", "email" | String |
| "count", "number of", "quantity" | Int |
| "price", "amount", "percentage" | Float |
| "is active", "enabled", "flag" | Boolean |
| "date", "created", "timestamp" | DateTime |
| "id", "identifier", "uuid" | UUID |
| "status", "role", "type" (finite set) | Enum |

### Relation Detection

| PRD Pattern | Relation |
|---|---|
| "has many", "contains multiple" | One-to-many |
| "belongs to", "is owned by" | Many-to-one |
| "has one", "is associated with" | One-to-one |
| "can have multiple ... each can belong to multiple" | Many-to-many |

## Business Rule Extraction

Convert PRD rules into structured format:

```yaml
rule:
  name: "descriptive-name"
  source: "PRD §X.X"
  inputs: [list of input values]
  output: "what the rule produces"
  formula: "if applicable"
  edge_cases:
    - "what happens when X"
    - "what happens when Y"
```

## Phase Planning Rules

- **Dependencies**: DB before backend, backend before frontend, auth early
- **Agent assignment**: Match features to the agent whose scope covers those files
- **Phase size**: 3-7 tasks per phase is ideal
- **Acceptance criteria**: Every phase must have verifiable deliverables
