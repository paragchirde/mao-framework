# Merge Strategy

How MAO handles re-scaffolding when your config changes.

## Overview

When you modify `mao.config.yaml` (add agents, change phases, update entities) and re-scaffold, MAO uses a three-way merge to preserve your customizations:

```bash
pnpm scaffold -- --merge
```

## How It Works

MAO compares three versions of each file:

1. **Snapshot** — What MAO generated last time (stored in `.mao/generated/`)
2. **Disk** — What's currently on disk (may include your edits)
3. **New** — What MAO would generate now

## Decision Matrix

| Snapshot | Disk | New | Action        | Reason                               |
| -------- | ---- | --- | ------------- | ------------------------------------ |
| A        | A    | A   | **Skip**      | Nothing changed                      |
| A        | A    | B   | **Overwrite** | Template updated, you didn't edit    |
| A        | B    | A   | **Skip**      | You customized, template unchanged   |
| A        | B    | B   | **Skip**      | You and template converged           |
| A        | B    | C   | **Conflict**  | Both you and template changed        |
| —        | —    | A   | **Create**    | New file                             |
| A        | —    | A   | **Skip**      | You deleted it, template unchanged   |
| A        | —    | B   | **Warn**      | You deleted it, but template updated |

## Merge Strategies

Set in `mao.config.yaml`:

```yaml
merge_strategy: preserve-custom # default
```

### `preserve-custom` (default)

On conflict (both user and template changed):

- **Keeps your version** on disk
- Logs what the template wanted to change

Best for: Most projects. Your enriched content is never lost.

### `overwrite`

On conflict:

- **Replaces with new template** output
- Exception: Custom skill references are **always preserved** regardless

Best for: When you want to pick up all template improvements and re-enrich.

### `prompt`

On conflict:

- **Flags the file** as a conflict
- Reports both versions for manual resolution

Best for: When you want to review each conflict individually.

## Special Rules

### Custom Skill References Are Always Preserved

Files under `skills/{custom-skill}/references/` are **never overwritten**, regardless of merge strategy. These contain PRD-enriched content that would be lost on overwrite.

### New Files Are Always Created

When a new agent is added to config, its file is created even in merge mode.

### Deletions Are Respected

If you intentionally delete a generated file, MAO won't recreate it (unless the template also changed).

## Commands

```bash
# First-time scaffold (full write)
pnpm scaffold

# Re-scaffold with merge
pnpm scaffold -- --merge

# Re-scaffold, overwrite everything (with snapshot update)
pnpm scaffold -- --force

# Preview what would change
pnpm scaffold -- --merge --dry-run
```

## Snapshot Storage

Snapshots are stored in `.mao/generated/` and should be committed to git. They track what MAO generated so the merge engine can detect your edits.
