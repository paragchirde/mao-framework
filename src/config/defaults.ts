/**
 * Default config values per preset.
 *
 * Milestone 1A: Full defaults for react-express
 */

import type { MaoConfigInput } from './types.js';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const presetDefaults: Record<string, DeepPartial<MaoConfigInput>> = {
  'react-express': {
    stack: {
      preset: 'react-express',
      frontend: {
        framework: 'react',
        language: 'typescript',
        styling: 'tailwindcss',
        state_management: 'tanstack-query',
        component_library: 'shadcn',
      },
      backend: {
        framework: 'express',
        language: 'typescript',
        api_type: 'rest',
      },
      database: {
        provider: 'postgresql',
        orm: 'prisma',
      },
      auth: {
        strategy: 'google-oauth',
        providers: ['google'],
        session: 'jwt',
      },
      testing: {
        unit: 'vitest',
        e2e: 'playwright',
      },
    },
    structure: {
      frontend: 'client/src',
      backend: 'server/src',
      database: 'server/prisma',
    },
    agents: ['orchestrator', 'database', 'backend', 'frontend', 'auth', 'qa'],
    merge_strategy: 'preserve-custom',
  },
};
