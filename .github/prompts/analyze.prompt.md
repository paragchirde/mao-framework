---
name: 'Analyze PRD'
description: 'Analyze a PRD document and generate mao.config.yaml'
---

# Analyze PRD

Please analyze the PRD document and generate the MAO configuration.

## Input

PRD document path: {{ "{{prd_path}}" }}

## Steps

1. Read the entire PRD document
2. Load the `prd-analysis` skill
3. Extract project metadata, tech stack, entities, business rules, and phases
4. Generate `mao.config.yaml` and `project-context.md`
5. Present a summary of what was extracted and what needs review
