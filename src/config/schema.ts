/**
 * Zod schema definition for mao.config.yaml
 *
 * Milestone 1A: Full schema with cross-field validation
 */

import { z } from 'zod';

// ─── Stub schema — will be fully defined in Milestone 1A ───

export const MaoConfigSchema = z.object({
  project: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(['poc', 'mvp', 'production']),
  }),
  stack: z.object({
    preset: z.enum(['react-express', 'nextjs', 'react-python', 'vue-node', 'custom']),
  }),
});

export type MaoConfigSchemaType = z.infer<typeof MaoConfigSchema>;
