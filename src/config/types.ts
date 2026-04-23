/**
 * TypeScript types inferred from the Zod config schema.
 *
 * Milestone 1A: Full type exports
 */

import type { z } from 'zod';
import type { MaoConfigSchema } from './schema.js';

/** Validated MAO configuration */
export type MaoConfig = z.infer<typeof MaoConfigSchema>;
