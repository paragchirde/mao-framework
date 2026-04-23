import { describe, it, expect } from 'vitest';
import { MaoConfigSchema } from '../../../src/config/schema.js';

const validFullConfig = {
  project: { name: 'TaskForge', description: 'Project management', type: 'mvp' },
  stack: {
    preset: 'react-express',
    frontend: { framework: 'react', language: 'typescript', styling: 'tailwindcss' },
    backend: { framework: 'express', language: 'typescript', api_type: 'rest' },
    database: { provider: 'postgresql', orm: 'prisma' },
    auth: { strategy: 'google-oauth', providers: ['google'], session: 'jwt' },
    testing: { unit: 'vitest', e2e: 'playwright' },
  },
  structure: { frontend: 'client/src', backend: 'server/src', database: 'server/prisma' },
  agents: ['orchestrator', 'database', 'backend', 'frontend', 'auth', 'qa'],
  phases: [
    { name: 'Foundation', description: 'DB + Auth', agents: ['database', 'backend', 'auth'], order: 1 },
    { name: 'Core', description: 'Main features', agents: ['backend', 'frontend'], order: 2 },
  ],
  entities: [
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'UUID', primary: true },
        { name: 'email', type: 'String', unique: true, required: true },
        { name: 'name', type: 'String', required: true },
        { name: 'role', type: 'Enum', values: ['admin', 'member'] },
      ],
    },
  ],
  custom_skills: [
    { name: 'task-numbering', description: 'Auto task numbers', agents: ['backend'], references: ['algo.md'] },
  ],
  merge_strategy: 'preserve-custom',
};

describe('MaoConfigSchema', () => {
  it('should accept a valid full config', () => {
    const result = MaoConfigSchema.safeParse(validFullConfig);
    expect(result.success).toBe(true);
  });

  it('should reject empty project name', () => {
    const config = { ...validFullConfig, project: { ...validFullConfig.project, name: '' } };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should reject invalid project type', () => {
    const config = { ...validFullConfig, project: { ...validFullConfig.project, type: 'prototype' } };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should accept all valid project types', () => {
    for (const type of ['poc', 'mvp', 'production']) {
      const config = { ...validFullConfig, project: { ...validFullConfig.project, type } };
      expect(MaoConfigSchema.safeParse(config).success).toBe(true);
    }
  });

  it('should require orchestrator in agents list', () => {
    const config = { ...validFullConfig, agents: ['backend', 'frontend'] };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(' ');
      expect(msg).toContain('orchestrator');
    }
  });

  it('should reject phases referencing agents not in the agents list', () => {
    const config = {
      ...validFullConfig,
      agents: ['orchestrator', 'backend'],
      phases: [
        { name: 'Phase 1', description: 'Test', agents: ['backend', 'mobile'], order: 1 },
      ],
    };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should reject custom skill agents not in the agents list', () => {
    const config = {
      ...validFullConfig,
      agents: ['orchestrator', 'backend'],
      custom_skills: [
        { name: 'skill', description: 'Test', agents: ['frontend'], references: [] },
      ],
    };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should reject unsupported presets (only react-express and custom)', () => {
    const config = {
      ...validFullConfig,
      stack: { ...validFullConfig.stack, preset: 'nextjs' },
    };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should accept custom preset', () => {
    const config = {
      ...validFullConfig,
      stack: { ...validFullConfig.stack, preset: 'custom' },
    };
    const result = MaoConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should default merge_strategy to preserve-custom', () => {
    const { merge_strategy: _, ...configNoMerge } = validFullConfig;
    const result = MaoConfigSchema.safeParse(configNoMerge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.merge_strategy).toBe('preserve-custom');
    }
  });

  it('should default empty arrays for entities and custom_skills', () => {
    const { entities: _e, custom_skills: _c, ...configMinimal } = validFullConfig;
    const result = MaoConfigSchema.safeParse(configMinimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entities).toEqual([]);
      expect(result.data.custom_skills).toEqual([]);
    }
  });

  it('should accept valid entity field types', () => {
    for (const type of ['UUID', 'String', 'Int', 'Float', 'Boolean', 'DateTime', 'Enum', 'JSON']) {
      const config = {
        ...validFullConfig,
        entities: [{ name: 'Test', fields: [{ name: 'f', type }] }],
      };
      expect(MaoConfigSchema.safeParse(config).success).toBe(true);
    }
  });

  it('should reject entities with no fields', () => {
    const config = {
      ...validFullConfig,
      entities: [{ name: 'Empty', fields: [] }],
    };
    expect(MaoConfigSchema.safeParse(config).success).toBe(false);
  });

  it('should require at least one phase', () => {
    const config = { ...validFullConfig, phases: [] };
    expect(MaoConfigSchema.safeParse(config).success).toBe(false);
  });

  it('should validate all merge strategies', () => {
    for (const strategy of ['preserve-custom', 'overwrite', 'prompt']) {
      const config = { ...validFullConfig, merge_strategy: strategy };
      expect(MaoConfigSchema.safeParse(config).success).toBe(true);
    }
  });
});
