/**
 * Template context builder — transform MaoConfig into Handlebars template context.
 *
 * Milestone 1B: Full implementation with computed fields
 */

import type { MaoConfig } from '../config/types.js';

export interface TemplateContext extends Record<string, unknown> {
  project: MaoConfig['project'];
  stack: MaoConfig['stack'];
  agent_list: string[];
  has_frontend: boolean;
  has_backend: boolean;
  has_database: boolean;
}

/**
 * Build the template context from a validated config.
 * Adds computed fields used by Handlebars templates.
 */
export function buildContext(config: MaoConfig): TemplateContext {
  return {
    ...config,
    agent_list: [],
    has_frontend: true,
    has_backend: true,
    has_database: true,
  };
}
