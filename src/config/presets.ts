/**
 * Preset definitions — which agents, skills, instructions each preset includes.
 *
 * Milestone 1A: Full preset registry for react-express
 */

export interface PresetDefinition {
  name: string;
  description: string;
  agents: string[];
  skills: string[];
  instructions: string[];
  hooks: string[];
  prompts: string[];
}

export const presets: Record<string, PresetDefinition> = {
  'react-express': {
    name: 'react-express',
    description: 'React + Express + Prisma + PostgreSQL full-stack preset',
    agents: ['orchestrator', 'database', 'backend', 'frontend', 'auth', 'qa'],
    skills: [
      'api-conventions',
      'error-handling',
      'testing-patterns',
      'prisma-postgresql',
      'express-api',
      'react-ui',
      'auth',
    ],
    instructions: ['prisma', 'express-routes', 'react-components', 'services'],
    hooks: ['prettier'],
    prompts: ['start-phase', 'verify-phase', 'add-feature', 'review-code'],
  },
};
