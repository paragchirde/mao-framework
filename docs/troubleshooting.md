# Troubleshooting

Common issues and solutions when working with MAO.

## Scaffold Issues

### "Config validation failed"

**Cause**: Your `mao.config.yaml` has invalid values or missing required fields.

**Fix**: Check the error output — it lists the exact field and issue. Common problems:

```
agents must include "orchestrator"     → Add "orchestrator" to your agents list
Phase agents must be a subset...       → A phase references an agent not in the agents list
Only "react-express" and "custom"...   → Other presets aren't supported yet
```

See [config-reference.md](config-reference.md) for all valid field values.

### "NEEDS_REVIEW flags found — resolve before scaffolding"

**Cause**: The Analyzer flagged uncertain choices in your config. The scaffold engine refuses to generate with unresolved flags.

**Fix**: Search your `mao.config.yaml` for `NEEDS_REVIEW` and replace each with a concrete value:

```yaml
# Before:
auth:
  strategy: NEEDS_REVIEW  # PRD mentions "login" but doesn't specify method

# After:
auth:
  strategy: google-oauth
```

### "Cannot find mao.config.yaml"

**Cause**: Running `pnpm scaffold` from the wrong directory, or the config has a different name.

**Fix**: Either `cd` to the project root, or specify the path:

```bash
pnpm scaffold -- --config path/to/mao.config.yaml
```

### "Warning: .github/ already exists"

**Cause**: Running `pnpm scaffold` again after a previous scaffold.

**Fix**: Use merge mode to preserve your changes:

```bash
pnpm scaffold -- --merge
```

Or use `--force` to overwrite everything (with confirmation):

```bash
pnpm scaffold -- --force
```

## Activation Issues

### "Missing agent file: backend-agent.agent.md"

**Cause**: An agent listed in the config doesn't have a corresponding `.agent.md` file.

**Fix**: Re-run scaffold to generate missing files:

```bash
pnpm scaffold -- --merge
```

### "Agent file is empty"

**Cause**: The file exists but has no content. Usually means the template rendered to empty output.

**Fix**: Check that your config has the necessary stack settings for this agent. For example, a `database` agent needs `stack.database.provider` and `stack.database.orm` to be set.

### "Enrichment markers remaining"

**Cause**: `<!-- ENRICHMENT WILL FILL THIS FROM PRD -->` placeholders weren't replaced by the Enricher.

**Fix**: Run the Enricher agent in VS Code Copilot Chat:

```
@Enricher Enrich the generated agent setup from the PRD
```

If some markers persist, fill them manually with project-specific content.

### "Orchestrator references agent X but file does not exist"

**Cause**: The orchestrator template listed an agent that doesn't have a `.agent.md` file on disk.

**Fix**: Either create the missing agent file, or remove the agent from the `agents` list in your config and re-scaffold.

## Merge Issues

### "Conflict: file modified by both user and template"

**Cause**: You edited a generated file, and the template also changed (e.g., after a config update).

**Fix**: Depends on your `merge_strategy`:

- `preserve-custom` (default): Your version is kept. Check the log for what the template wanted to change.
- `overwrite`: Template version replaces yours. Back up first.
- `prompt`: You'll be asked interactively per file.

### Custom skill references are empty after merge

**Cause**: This shouldn't happen — custom skill references are always preserved during merge. If it does:

**Fix**: Check `.mao/generated/` for the snapshot of the previous generation. Your content should be recoverable from there.

## VS Code Copilot Issues

### Agent doesn't appear in Chat

**Cause**: VS Code Copilot may not have detected the `.github/agents/` files.

**Fix**:

1. Ensure files are in `.github/agents/` (not `.github/agent/`)
2. Reload VS Code: `Cmd+Shift+P` → "Developer: Reload Window"
3. Check that the file has valid YAML frontmatter with `name:` and `description:`

### Agent ignores skills

**Cause**: The agent's instructions may not reference the skill, or the skill directory is misnamed.

**Fix**:

1. Check the agent `.agent.md` file references the skill name correctly
2. Verify the skill directory exists at `.github/skills/<skill-name>/`
3. Ensure `SKILL.md` exists inside the skill directory (not `skill.md`)

### Slash commands don't appear

**Cause**: Prompt files may be missing or have incorrect frontmatter.

**Fix**: Check `.github/prompts/*.prompt.md` files have:

```yaml
---
mode: agent
agent: orchestrator
description: Start a development phase
---
```

## Performance Issues

### Scaffold is slow

**Cause**: Large number of templates or slow disk I/O.

**Fix**: Use `--dry-run` to preview without writing:

```bash
pnpm scaffold -- --dry-run
```

This shows what would be generated without touching the filesystem.

## Getting Help

If your issue isn't listed here:

1. Run `pnpm activate -- --verbose` for detailed diagnostics
2. Check the [config reference](config-reference.md) for valid values
3. Open an issue on GitHub with your config (redact sensitive project details)
