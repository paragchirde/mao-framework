# Contributing Skills to MAO

This guide covers how to create and contribute community skills to the MAO framework.

## What Is a Skill?

A skill is a package of knowledge that an AI agent loads before performing a specific type of task. It contains:

- **SKILL.md** — Instructions telling the agent _when_ and _how_ to use the skill
- **references/** — Concrete code patterns, templates, and conventions the agent should follow

## Creating a Skill

### 1. Start from the Template

```bash
cp -r community/TEMPLATE community/your-skill-name
```

### 2. Fill in manifest.yaml

```yaml
name: your-skill-name
version: '1.0.0'
description: 'What this skill provides in one sentence'
author: 'Your Name <email>'
compatible_presets:
  - react-express # List all presets you've tested with
agents:
  - backend # Which agents should load this skill
tags:
  - payments # Searchable discovery tags
```

**Manifest fields:**

| Field                | Required | Description                                      |
| -------------------- | -------- | ------------------------------------------------ |
| `name`               | Yes      | Kebab-case identifier matching directory name    |
| `version`            | Yes      | Semver version string                            |
| `description`        | Yes      | One-sentence description                         |
| `author`             | Yes      | Name and email                                   |
| `compatible_presets` | Yes      | Array of tested preset names                     |
| `agents`             | Yes      | Array of agent roles that should load this skill |
| `tags`               | No       | Array of discovery tags                          |

### 3. Write SKILL.md

Your SKILL.md must include these sections:

#### `## When to Use`

Clear trigger conditions. The agent reads this to decide whether to load the skill for a given task.

```markdown
## When to Use

Use this skill when:

- Building payment processing endpoints
- Implementing Stripe webhook handlers
- Creating subscription management logic
```

#### `## Procedure`

Step-by-step instructions the agent follows. Be specific and actionable.

```markdown
## Procedure

1. Read `references/stripe-integration.md` for the integration pattern
2. Create the payment service in `{structure.backend}/services/payment.service.ts`
3. Implement webhook handler following the pattern in `references/webhook-handling.md`
4. Add Zod validation schemas for all payment-related request bodies
5. Create corresponding API routes in `{structure.backend}/routes/payment.routes.ts`
```

#### `## Key Rules`

Constraints the agent must follow. Include anti-patterns.

```markdown
## Key Rules

- NEVER store raw credit card numbers — use Stripe tokens exclusively
- Always verify webhook signatures before processing events
- Use idempotency keys for all payment creation requests
- Log payment events to an audit trail, never to stdout
```

#### `## References`

List reference files with brief descriptions.

### 4. Write Reference Files

Reference files contain **actionable code patterns**, not just descriptions. Each file should be at least 100 characters.

Good reference content:

- Complete code snippets with imports and types
- Decision trees for choosing between approaches
- Error handling patterns specific to the domain
- Configuration templates

### 5. Write README.md

Cover: overview, tested presets, installation instructions, what files are generated, and author info.

### 6. Test Your Skill

Add your skill to a test config and verify it scaffolds correctly:

```yaml
# test-config.yaml
community_skills:
  - 'your-skill-name'
```

```bash
npm run scaffold -- --config test-config.yaml --output /tmp/test-output
```

Verify:

- [ ] Skill directory appears in output under `skills/your-skill-name/`
- [ ] SKILL.md renders without errors
- [ ] All reference files are copied
- [ ] No Handlebars artifacts (`{{`, `}}`) remain in rendered output

## Submitting

1. Fork the repository
2. Create your skill in `community/your-skill-name/`
3. Ensure all quality checks pass (see below)
4. Submit a pull request

## Quality Checklist

Before submitting, verify:

- [ ] `manifest.yaml` has all required fields
- [ ] `SKILL.md` has all four required sections (When to Use, Procedure, Key Rules, References)
- [ ] Every file in `references/` is at least 100 characters
- [ ] Skill has been tested with at least one preset
- [ ] `README.md` exists with installation instructions
- [ ] Directory name matches `manifest.yaml` name field
- [ ] No sensitive data (API keys, passwords, internal URLs)
