/**
 * Config quality warnings — non-blocking suggestions for suboptimal choices.
 */

import type { MaoConfig } from './types.js';

export function warnConfigIssues(config: MaoConfig): string[] {
  const warnings: string[] = [];

  // Too many agents
  if (config.agents.length > 8) {
    warnings.push(
      `${config.agents.length} agents configured — consider consolidating to ≤8 for better orchestration.`,
    );
  }

  // No QA agent
  if (!config.agents.includes('qa')) {
    warnings.push('No QA agent configured — consider adding one for testing coverage.');
  }

  // No phases
  if (config.phases.length === 0) {
    warnings.push('No phases defined — phases help structure development workflow.');
  }

  // Custom skills without references
  for (const skill of config.custom_skills) {
    if (skill.references.length === 0) {
      warnings.push(
        `Custom skill "${skill.name}" has no references — agents need reference documents for context.`,
      );
    }
  }

  return warnings;
}
