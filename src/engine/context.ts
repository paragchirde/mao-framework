/**
 * Template context builder — transform MaoConfig into Handlebars template context.
 *
 * Milestone 1B: Full implementation with computed fields
 */

import type { MaoConfig } from '../config/types.js';

export interface CustomSkillContext {
  name: string;
  description: string;
  agents: string[];
  references: string[];
}

export interface TemplateContext extends Record<string, unknown> {
  // Direct from config
  project: MaoConfig['project'];
  stack: MaoConfig['stack'];
  structure: NonNullable<MaoConfig['structure']>;
  agents: MaoConfig['agents'];
  phases: MaoConfig['phases'];
  entities: MaoConfig['entities'];
  custom_skills: CustomSkillContext[];
  merge_strategy: MaoConfig['merge_strategy'];

  // Computed — skill names derived from stack
  stack_skill_names: {
    db: string;
    api: string;
    ui: string;
    auth: string;
  };

  // Computed — custom skills filtered by agent role
  custom_skills_for_backend: CustomSkillContext[];
  custom_skills_for_frontend: CustomSkillContext[];
  custom_skills_for_database: CustomSkillContext[];

  // Computed — agent list as kebab-case names
  agent_list: string[];

  // Computed — booleans for conditional rendering
  has_frontend: boolean;
  has_backend: boolean;
  has_database: boolean;
  has_mobile: boolean;
  has_auth: boolean;
  has_qa: boolean;

  // Computed — entity names
  entity_names: string[];
}

function skillsForAgent(skills: CustomSkillContext[], agent: string): CustomSkillContext[] {
  return skills.filter((s) => s.agents.includes(agent));
}

function deriveDbSkillName(config: MaoConfig): string {
  const db = config.stack.database;
  if (!db) return 'database';
  return `${db.orm}-${db.provider}`;
}

function deriveApiSkillName(config: MaoConfig): string {
  const be = config.stack.backend;
  if (!be) return 'api';
  return `${be.framework}-api`;
}

function deriveUiSkillName(config: MaoConfig): string {
  const fe = config.stack.frontend;
  if (!fe) return 'ui';
  return `${fe.framework}-ui`;
}

function deriveAuthSkillName(config: MaoConfig): string {
  const auth = config.stack.auth;
  if (!auth) return 'auth';
  return auth.strategy;
}

/**
 * Build the template context from a validated config.
 * Adds computed fields used by Handlebars templates.
 */
export function buildContext(config: MaoConfig): TemplateContext {
  const agents = config.agents;
  const customSkills: CustomSkillContext[] = config.custom_skills.map((s) => ({
    name: s.name,
    description: s.description,
    agents: [...s.agents],
    references: [...s.references],
  }));

  const structure = config.structure ?? {
    frontend: 'client/src',
    backend: 'server/src',
    database: 'server/prisma',
  };

  return {
    // Pass-through
    project: config.project,
    stack: config.stack,
    structure,
    agents,
    phases: config.phases,
    entities: config.entities,
    custom_skills: customSkills,
    merge_strategy: config.merge_strategy,

    // Computed skill names
    stack_skill_names: {
      db: deriveDbSkillName(config),
      api: deriveApiSkillName(config),
      ui: deriveUiSkillName(config),
      auth: deriveAuthSkillName(config),
    },

    // Filtered custom skills per agent
    custom_skills_for_backend: skillsForAgent(customSkills, 'backend'),
    custom_skills_for_frontend: skillsForAgent(customSkills, 'frontend'),
    custom_skills_for_database: skillsForAgent(customSkills, 'database'),

    // Agent list as kebab-case
    agent_list: agents.map((a) => (a === 'orchestrator' ? 'orchestrator' : `${a}-agent`)),

    // Booleans for conditional rendering
    has_frontend: agents.includes('frontend'),
    has_backend: agents.includes('backend'),
    has_database: agents.includes('database'),
    has_mobile: agents.includes('mobile'),
    has_auth: agents.includes('auth'),
    has_qa: agents.includes('qa'),

    // Entity names
    entity_names: config.entities.map((e) => e.name),
  };
}
