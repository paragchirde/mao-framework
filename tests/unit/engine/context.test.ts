import { describe, it, expect } from 'vitest';
import { buildContext } from '../../../src/engine/context.js';
import type { MaoConfig } from '../../../src/config/types.js';

// A minimal valid config that matches the schema output shape
const sampleConfig = {
  project: { name: 'TestProject', description: 'A test', type: 'mvp' as const },
  stack: {
    preset: 'react-express' as const,
    frontend: {
      framework: 'react' as const,
      language: 'typescript' as const,
      styling: 'tailwindcss' as const,
      state_management: 'tanstack-query' as const,
    },
    backend: {
      framework: 'express' as const,
      language: 'typescript' as const,
      api_type: 'rest' as const,
    },
    database: { provider: 'postgresql' as const, orm: 'prisma' as const },
    auth: {
      strategy: 'google-oauth' as const,
      providers: ['google'],
      session: 'jwt' as const,
    },
    testing: { unit: 'vitest' },
  },
  structure: {
    frontend: 'client/src',
    backend: 'server/src',
    database: 'server/prisma',
  },
  agents: ['orchestrator', 'database', 'backend', 'frontend', 'auth', 'qa'] as MaoConfig['agents'],
  phases: [
    {
      name: 'Phase 1',
      description: 'Foundation',
      agents: ['database' as const, 'backend' as const],
      order: 1,
    },
  ],
  entities: [
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'UUID' as const, primary: true },
        { name: 'email', type: 'String' as const, unique: true, required: true },
      ],
    },
  ],
  custom_skills: [
    {
      name: 'task-numbering',
      description: 'Auto task numbers',
      agents: ['backend' as const, 'database' as const],
      references: ['algorithm.md'],
    },
  ],
  community_skills: [],
  merge_strategy: 'preserve-custom' as const,
} satisfies MaoConfig;

describe('buildContext', () => {
  it('should pass through project, stack, and structure', () => {
    const ctx = buildContext(sampleConfig);
    expect(ctx.project.name).toBe('TestProject');
    expect(ctx.stack.preset).toBe('react-express');
    expect(ctx.structure.frontend).toBe('client/src');
  });

  it('should compute stack skill names from config', () => {
    const ctx = buildContext(sampleConfig);
    expect(ctx.stack_skill_names.db).toBe('prisma-postgresql');
    expect(ctx.stack_skill_names.api).toBe('express-api');
    expect(ctx.stack_skill_names.ui).toBe('react-ui');
    expect(ctx.stack_skill_names.auth).toBe('google-oauth');
  });

  it('should compute agent_list with -agent suffix', () => {
    const ctx = buildContext(sampleConfig);
    expect(ctx.agent_list).toContain('orchestrator');
    expect(ctx.agent_list).toContain('backend-agent');
    expect(ctx.agent_list).toContain('frontend-agent');
    expect(ctx.agent_list).not.toContain('orchestrator-agent');
  });

  it('should compute boolean flags from agents list', () => {
    const ctx = buildContext(sampleConfig);
    expect(ctx.has_frontend).toBe(true);
    expect(ctx.has_backend).toBe(true);
    expect(ctx.has_database).toBe(true);
    expect(ctx.has_auth).toBe(true);
    expect(ctx.has_qa).toBe(true);
    expect(ctx.has_mobile).toBe(false);
  });

  it('should filter custom skills by agent', () => {
    const ctx = buildContext(sampleConfig);
    expect(ctx.custom_skills_for_backend).toHaveLength(1);
    expect(ctx.custom_skills_for_backend[0]?.name).toBe('task-numbering');
    expect(ctx.custom_skills_for_database).toHaveLength(1);
    expect(ctx.custom_skills_for_frontend).toHaveLength(0);
  });

  it('should extract entity names', () => {
    const ctx = buildContext(sampleConfig);
    expect(ctx.entity_names).toEqual(['User']);
  });

  it('should handle config with no frontend agent', () => {
    const config = {
      ...sampleConfig,
      agents: ['orchestrator', 'backend', 'database'] as MaoConfig['agents'],
    };
    const ctx = buildContext(config);
    expect(ctx.has_frontend).toBe(false);
    expect(ctx.has_backend).toBe(true);
  });
});
