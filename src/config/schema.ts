/**
 * Zod schema definition for mao.config.yaml
 *
 * Milestone 1A: Complete schema with cross-field validation
 */

import { z } from 'zod';

// ─── Enums ───

const ProjectType = z.enum(['poc', 'mvp', 'production']);

const Preset = z.enum(['react-express', 'nextjs', 'react-python', 'vue-node', 'custom']);

const FrontendFramework = z.enum(['react', 'nextjs', 'vue', 'angular', 'svelte']);
const BackendFramework = z.enum(['express', 'fastapi', 'django', 'nestjs']);
const Language = z.enum(['typescript', 'javascript', 'python']);
const Styling = z.enum(['tailwindcss', 'styled-components', 'css-modules', 'sass', 'none']);
const StateManagement = z.enum(['tanstack-query', 'redux', 'zustand', 'pinia', 'none']);
const ComponentLibrary = z.enum(['shadcn', 'mui', 'ant-design', 'none']).optional();
const ApiType = z.enum(['rest', 'graphql']);
const DatabaseProvider = z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb']);
const ORM = z.enum(['prisma', 'typeorm', 'sqlalchemy', 'mongoose', 'drizzle']);
const AuthStrategy = z.enum([
  'google-oauth',
  'email-password',
  'auth0',
  'clerk',
  'custom',
  'none',
]);
const SessionType = z.enum(['jwt', 'session', 'none']);
const MergeStrategy = z.enum(['preserve-custom', 'overwrite', 'prompt']);

const AgentRole = z.enum([
  'orchestrator',
  'database',
  'backend',
  'frontend',
  'auth',
  'qa',
  'mobile',
  'devops',
  'cloud-infra',
  'ai-ml',
]);

const FieldType = z.enum([
  'UUID',
  'String',
  'Int',
  'Float',
  'Boolean',
  'DateTime',
  'Enum',
  'JSON',
]);

// ─── Sub-schemas ───

const FrontendSchema = z.object({
  framework: FrontendFramework,
  language: Language,
  styling: Styling.optional().default('tailwindcss'),
  state_management: StateManagement.optional().default('tanstack-query'),
  component_library: ComponentLibrary,
});

const BackendSchema = z.object({
  framework: BackendFramework,
  language: Language,
  api_type: ApiType.optional().default('rest'),
});

const DatabaseSchema = z.object({
  provider: DatabaseProvider,
  orm: ORM,
});

const AuthSchema = z.object({
  strategy: AuthStrategy,
  providers: z.array(z.string()).optional().default([]),
  session: SessionType.optional().default('jwt'),
});

const TestingSchema = z.object({
  unit: z.string().optional().default('vitest'),
  e2e: z.string().optional(),
});

const DeploymentSchema = z
  .object({
    platform: z.string().optional(),
    hosting: z.string().optional(),
  })
  .optional();

const StackSchema = z.object({
  preset: Preset,
  frontend: FrontendSchema.optional(),
  backend: BackendSchema.optional(),
  database: DatabaseSchema.optional(),
  auth: AuthSchema.optional(),
  testing: TestingSchema.optional(),
  deployment: DeploymentSchema,
});

const StructureSchema = z.object({
  frontend: z.string().default('client/src'),
  backend: z.string().default('server/src'),
  database: z.string().default('server/prisma'),
  shared: z.string().optional(),
});

const EntityFieldSchema = z.object({
  name: z.string().min(1),
  type: FieldType,
  primary: z.boolean().optional(),
  unique: z.boolean().optional(),
  required: z.boolean().optional(),
  references: z.string().optional(),
  values: z.array(z.string()).optional(),
});

const EntitySchema = z.object({
  name: z.string().min(1),
  fields: z.array(EntityFieldSchema).min(1),
});

const PhaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  agents: z.array(AgentRole),
  order: z.number().int().positive(),
});

const CustomSkillSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  agents: z.array(AgentRole),
  references: z.array(z.string()).optional().default([]),
});

const CommunitySkillSchema = z.string().min(1);

// ─── Root Schema ───

export const MaoConfigSchema = z
  .object({
    project: z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      type: ProjectType,
    }),
    stack: StackSchema,
    structure: StructureSchema.optional(),
    agents: z.array(AgentRole).min(1),
    phases: z.array(PhaseSchema).min(1),
    entities: z.array(EntitySchema).optional().default([]),
    custom_skills: z.array(CustomSkillSchema).optional().default([]),
    community_skills: z.array(CommunitySkillSchema).optional().default([]),
    merge_strategy: MergeStrategy.optional().default('preserve-custom'),
  })
  .refine((config) => config.agents.includes('orchestrator'), {
    message: 'agents must include "orchestrator"',
    path: ['agents'],
  })
  .refine(
    (config) => {
      // Every phase must only reference agents that are in the agents list
      return config.phases.every((phase) =>
        phase.agents.every((agent) => config.agents.includes(agent)),
      );
    },
    {
      message: 'Phase agents must be a subset of the configured agents list',
      path: ['phases'],
    },
  )
  .refine(
    (config) => {
      // Custom skill agents must be in the agents list
      return config.custom_skills.every((skill) =>
        skill.agents.every((agent) => config.agents.includes(agent)),
      );
    },
    {
      message: 'Custom skill agents must be a subset of the configured agents list',
      path: ['custom_skills'],
    },
  )
  .refine(
    (config) => {
      if (config.stack.preset !== 'custom' && config.stack.preset !== 'react-express') {
        // Only react-express is implemented for now
        return false;
      }
      return true;
    },
    {
      message:
        'Only "react-express" and "custom" presets are supported in this version. Other presets will be added via the skill expansion flow.',
      path: ['stack', 'preset'],
    },
  );

export type MaoConfigSchemaType = z.infer<typeof MaoConfigSchema>;

// Re-export enums for use in other modules
export {
  ProjectType,
  Preset,
  AgentRole,
  MergeStrategy,
  FrontendFramework,
  BackendFramework,
  DatabaseProvider,
  ORM,
  AuthStrategy,
  ApiType,
};
