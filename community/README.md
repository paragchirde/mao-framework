# MAO Community Skills

Community-contributed skill packs that extend the MAO framework with domain-specific knowledge and patterns.

## Quality Bar

All community skills must meet these standards:

1. **Complete SKILL.md** — Must include `## When to Use`, `## Procedure`, `## Key Rules`, and `## References` sections
2. **Actionable references** — Reference files must contain concrete code patterns, not just descriptions (minimum 100 characters each)
3. **Valid manifest** — `manifest.yaml` must specify name, version, compatible presets, and author
4. **Tested** — Skill must render cleanly with at least one preset configuration
5. **Documented** — README.md must explain what the skill does and how to use it

## Using Community Skills

Reference community skills in your `mao.config.yaml`:

```yaml
community_skills:
  - 'payment-processing'
  - 'file-upload'
```

The scaffold engine copies community skills into your `.github/skills/` directory during generation.

## Contributing

See [Contributing Skills Guide](../docs/contributing-skills.md) for the full process.

### Quick Start

1. Copy the `TEMPLATE/` directory as your starting point
2. Fill in `manifest.yaml` with your skill metadata
3. Write your `SKILL.md` with all required sections
4. Add reference files with actionable patterns
5. Write a `README.md` explaining your skill
6. Submit a PR

### Review Process

1. Automated checks validate manifest schema and file structure
2. Maintainer reviews content quality and accuracy
3. Skill is tested against compatible presets
4. Merged into `community/` on approval

## Skill Structure

Each community skill follows this structure:

```
skill-name/
├── SKILL.md             → Skill definition (When to Use, Procedure, Key Rules, References)
├── references/          → Reference files with actionable patterns
│   └── *.md
├── README.md            → Description, tested-with, author
└── manifest.yaml        → Metadata: name, version, compatible presets, author
```

## Available Skills

_(None yet — be the first contributor!)_
