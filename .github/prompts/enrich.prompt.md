---
name: 'Enrich Skills'
description: 'Fill scaffolded skill stubs with domain knowledge from the PRD'
---

# Enrich Skills

Please enrich all scaffolded skill stubs with real domain knowledge from the PRD.

## Pre-Enrichment: Load References (do this FIRST)

1. Load the `skill-enrichment` skill
2. Read `references/enrichment-example.md` — **this is your quality bar, match it**
3. Read `references/enrichment-rules.md` — file inventory and priority order
4. Read `references/quality-markers.md` — minimum content thresholds

## Inputs to Read

5. Read the PRD (path from `mao.config.yaml` → `project.prd`)
6. Read `mao.config.yaml` — entities, custom_skills, phases, stack config
7. Read `project-context.md` — domain summary

## Enrichment (follow priority order)

8. Scan `.github/` for all `<!-- ENRICHMENT WILL FILL THIS FROM PRD -->` markers — report count
9. Enrich in this order:
   - Database schemas (`prisma-db/references/schema-template.md`)
   - API validators (`express-api/references/validator-template.md`)
   - Custom skill stubs (all `skills/{custom-skill}/` files)
   - API routes (`express-api/references/route-template.md`)
   - Auth references (`auth/references/`)
   - UI templates (`react-ui/references/`)
   - Seed data (`prisma-db/references/seed-template.md`)
   - Orchestrator (`agents/orchestrator.agent.md`)
   - Copilot instructions (`copilot-instructions.md`)
10. For every enriched section, add:
    - `<!-- Source: PRD §X.X — "brief quote" -->`
    - `<!-- Confidence: HIGH|MEDIUM|LOW -->`

## Post-Enrichment Verification (MANDATORY)

11. Re-scan for remaining `<!-- ENRICHMENT WILL FILL THIS -->` markers — must be **zero**
12. Verify minimum thresholds from quality-markers.md:
    - Custom skill SKILL.md: "When to Use" ≥3 bullets, "Procedure" ≥4 steps, "Key Rules" ≥3 bullets
    - Reference files: >200 chars, has Overview + Edge Cases sections
    - Every entity from config in schema-template, seed-template, and validator-template
13. List all `NEEDS_HUMAN_REVIEW` flags with file paths and reasons
14. Present enrichment summary table (files enriched, markers filled, review items)
