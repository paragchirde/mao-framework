/**
 * Config loader — read YAML file, parse, validate, return typed config.
 *
 * Milestone 1A: Full implementation with NEEDS_REVIEW detection
 */

import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { MaoConfigSchema } from './schema.js';
import type { MaoConfig } from './types.js';

export interface LoadConfigResult {
  config: MaoConfig;
  hasNeedsReview: boolean;
  needsReviewLocations: string[];
}

/**
 * Load and validate a mao.config.yaml file.
 *
 * @param configPath - Absolute or relative path to mao.config.yaml
 * @returns Validated config with NEEDS_REVIEW detection
 */
export async function loadConfig(configPath: string): Promise<LoadConfigResult> {
  const raw = await readFile(configPath, 'utf-8');

  // Detect NEEDS_REVIEW flags in raw YAML before parsing
  const needsReviewLocations: string[] = [];
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.includes('NEEDS_REVIEW')) {
      needsReviewLocations.push(`Line ${i + 1}: ${lines[i]?.trim()}`);
    }
  }

  const parsed: unknown = parseYaml(raw);
  const config = MaoConfigSchema.parse(parsed);

  return {
    config,
    hasNeedsReview: needsReviewLocations.length > 0,
    needsReviewLocations,
  };
}
