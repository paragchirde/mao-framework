/**
 * TypeScript types inferred from the Zod config schema.
 *
 * Milestone 1A: Full type exports
 */

import type { z } from 'zod';
import type { MaoConfigSchema } from './schema.js';

/** Validated MAO configuration (output of Zod parse — refinements applied) */
export type MaoConfig = z.infer<typeof MaoConfigSchema>;

/** Raw input shape before Zod transforms (for z.input) */
export type MaoConfigInput = z.input<typeof MaoConfigSchema>;
