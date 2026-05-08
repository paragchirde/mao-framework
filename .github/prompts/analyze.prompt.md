---
name: 'Analyze PRD'
description: 'Analyze a PRD document and generate mao.config.yaml'
---

# Analyze PRD

Analyze the PRD document and generate the MAO configuration files.

## Input

PRD document path: `{{'{{prd_path}}'}}`

## What To Do

1. **Load your skill references first** — read ALL files in the `prd-analysis` skill:
   - `references/config-schema.md` — the strict schema your output must conform to
   - `references/example-config.yaml` — the exact structure to follow
   - `references/extraction-rules.md` — how to extract information from different PRD quality tiers
2. **Read the entire PRD** before extracting anything
3. **Classify the PRD** — Comprehensive, Standard, or Minimal? This determines how many NEEDS_REVIEW flags you'll generate
4. **Extract** project metadata, tech stack, entities, business rules, phases, and custom skills
5. **Generate two files**:
   - `mao.config.yaml` — must pass strict Zod schema validation (only use values from config-schema.md)
   - `project-context.md` — human-readable summary of extracted domain knowledge
6. **Self-check before presenting**:
   - [ ] `orchestrator` is in the agents list
   - [ ] All phase agents exist in the top-level agents list
   - [ ] All custom skill agents exist in the top-level agents list
   - [ ] `stack.preset` is `react-express` or `custom`
   - [ ] Every `Enum` field has a `values` array
   - [ ] No invented enum values — all match config-schema.md exactly
   - [ ] NEEDS_REVIEW flags are inline YAML comments: `# NEEDS_REVIEW: reason`
7. **Present summary** — what was extracted, what was inferred, what needs human review

## Critical Constraints

- Only `react-express` and `custom` presets pass validation in this version
- Only these 10 agent roles exist: `orchestrator`, `database`, `backend`, `frontend`, `auth`, `qa`, `mobile`, `devops`, `cloud-infra`, `ai-ml`
- Using any invalid value will cause `pnpm scaffold` to fail with a Zod validation error
