import { describe, it, expect } from 'vitest';
import { MaoConfigSchema } from '../../../src/config/schema.js';

describe('MaoConfigSchema', () => {
  it('should accept a valid minimal config', () => {
    const validConfig = {
      project: {
        name: 'TestProject',
        description: 'A test project',
        type: 'mvp',
      },
      stack: {
        preset: 'react-express',
      },
    };

    const result = MaoConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject empty project name', () => {
    const invalidConfig = {
      project: {
        name: '',
        description: 'A test project',
        type: 'mvp',
      },
      stack: {
        preset: 'react-express',
      },
    };

    const result = MaoConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should reject invalid project type', () => {
    const invalidConfig = {
      project: {
        name: 'Test',
        description: 'A test project',
        type: 'prototype',
      },
      stack: {
        preset: 'react-express',
      },
    };

    const result = MaoConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should reject invalid preset', () => {
    const invalidConfig = {
      project: {
        name: 'Test',
        description: 'A test project',
        type: 'mvp',
      },
      stack: {
        preset: 'angular',
      },
    };

    const result = MaoConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should accept all valid project types', () => {
    for (const type of ['poc', 'mvp', 'production']) {
      const config = {
        project: { name: 'Test', description: 'Desc', type },
        stack: { preset: 'react-express' },
      };
      expect(MaoConfigSchema.safeParse(config).success).toBe(true);
    }
  });

  it('should accept all valid presets', () => {
    for (const preset of ['react-express', 'nextjs', 'react-python', 'vue-node', 'custom']) {
      const config = {
        project: { name: 'Test', description: 'Desc', type: 'mvp' },
        stack: { preset },
      };
      expect(MaoConfigSchema.safeParse(config).success).toBe(true);
    }
  });
});
