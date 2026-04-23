import { describe, it, expect } from 'vitest';
import { generateCustomSkillStubs } from '../../../src/engine/catalog.js';
import type { MaoConfig } from '../../../src/config/types.js';

const sampleConfig = {
  project: { name: 'Test', description: 'Test', type: 'mvp' as const },
  stack: { preset: 'react-express' as const },
  agents: ['orchestrator', 'backend'] as MaoConfig['agents'],
  phases: [{ name: 'P1', description: 'D', agents: ['backend' as const], order: 1 }],
  entities: [],
  custom_skills: [
    {
      name: 'task-numbering',
      description: 'Auto task numbers',
      agents: ['backend' as const],
      references: ['algorithm.md', 'edge-cases.md'],
    },
    {
      name: 'billing',
      description: 'Billing logic',
      agents: ['backend' as const],
      references: ['stripe.md'],
    },
  ],
  community_skills: [],
  merge_strategy: 'preserve-custom' as const,
} satisfies MaoConfig;

describe('generateCustomSkillStubs', () => {
  it('should generate SKILL.md stub for each custom skill', () => {
    const files = generateCustomSkillStubs(sampleConfig);
    const skillFiles = files.filter((f) => f.path.endsWith('SKILL.md'));
    expect(skillFiles).toHaveLength(2);
    expect(skillFiles[0]?.path).toBe('skills/task-numbering/SKILL.md');
    expect(skillFiles[1]?.path).toBe('skills/billing/SKILL.md');
  });

  it('should include enrichment markers in skill stubs', () => {
    const files = generateCustomSkillStubs(sampleConfig);
    const skillMd = files.find((f) => f.path === 'skills/task-numbering/SKILL.md');
    expect(skillMd?.content).toContain('<!-- ENRICHMENT WILL FILL THIS FROM PRD -->');
    expect(skillMd?.content).toContain('Auto task numbers');
  });

  it('should generate reference file stubs', () => {
    const files = generateCustomSkillStubs(sampleConfig);
    const refs = files.filter((f) => f.path.includes('references/'));
    // task-numbering: 2 refs, billing: 1 ref = 3 total
    expect(refs).toHaveLength(3);
    expect(refs[0]?.path).toBe('skills/task-numbering/references/algorithm.md');
    expect(refs[1]?.path).toBe('skills/task-numbering/references/edge-cases.md');
    expect(refs[2]?.path).toBe('skills/billing/references/stripe.md');
  });

  it('should include enrichment markers in reference stubs', () => {
    const files = generateCustomSkillStubs(sampleConfig);
    const ref = files.find((f) => f.path === 'skills/task-numbering/references/algorithm.md');
    expect(ref?.content).toContain('<!-- ENRICHMENT WILL FILL THIS FROM PRD -->');
  });

  it('should return empty array for config with no custom skills', () => {
    const config = { ...sampleConfig, custom_skills: [] };
    const files = generateCustomSkillStubs(config);
    expect(files).toHaveLength(0);
  });
});
