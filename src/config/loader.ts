/**
 * Config loader — read YAML file, parse, validate, return typed config.
 *
 * Milestone 1A: Full implementation with NEEDS_REVIEW detection
 */

import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { ZodError } from 'zod';
import { MaoConfigSchema } from './schema.js';
import type { MaoConfig } from './types.js';

export interface LoadConfigResult {
  config: MaoConfig;
  hasNeedsReview: boolean;
  needsReviewLocations: string[];
  rawYaml: string;
}

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Scan raw YAML for NEEDS_REVIEW flags without parsing/validating.
 * Used by scaffold to pre-check before running validation.
 */
export function detectNeedsReview(rawYaml: string): string[] {
  const locations: string[] = [];
  const lines = rawYaml.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.includes('NEEDS_REVIEW')) {
      locations.push(`Line ${i + 1}: ${lines[i]?.trim()}`);
    }
  }
  return locations;
}

/**
 * Load and validate a mao.config.yaml file.
 *
 * @param configPath - Absolute or relative path to mao.config.yaml
 * @returns Validated config with NEEDS_REVIEW detection
 * @throws ConfigValidationError if schema validation fails
 */
export async function loadConfig(configPath: string): Promise<LoadConfigResult> {
  const raw = await readFile(configPath, 'utf-8');
  const needsReviewLocations = detectNeedsReview(raw);
  const parsed: unknown = parseYaml(raw);

  try {
    const config = MaoConfigSchema.parse(parsed);
    return {
      config,
      hasNeedsReview: needsReviewLocations.length > 0,
      needsReviewLocations,
      rawYaml: raw,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      const formatted = issues.map((i) => `  ${i.path}: ${i.message}`).join('\n');

      throw new ConfigValidationError(`Config validation failed:\n${formatted}`, issues);
    }
    throw error;
  }
}
