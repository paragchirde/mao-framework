/**
 * Handlebars renderer — initialize, register helpers/partials, render templates.
 *
 * Milestone 1B: Full implementation
 */

import Handlebars from 'handlebars';
import { registerHelpers } from './helpers.js';

let initialized = false;

/** Initialize Handlebars with all custom helpers and partials */
export function initRenderer(): typeof Handlebars {
  if (!initialized) {
    registerHelpers(Handlebars);
    initialized = true;
  }
  return Handlebars;
}

/**
 * Render a Handlebars template string with the given context.
 */
export function render(templateSource: string, context: Record<string, unknown>): string {
  const hbs = initRenderer();
  const template = hbs.compile(templateSource, { strict: false });
  return template(context);
}
