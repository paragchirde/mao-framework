/**
 * Scaffold engine — the central orchestration pipeline.
 *
 * Milestone 1D: Full implementation
 */

import { loadConfig } from '../config/loader.js';
import { buildContext } from './context.js';
import { log } from '../utils/logger.js';

export interface ScaffoldOptions {
  configPath: string;
  outputDir: string;
  merge?: boolean;
  force?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Run the scaffold pipeline:
 * 1. Load + validate config
 * 2. Assert no NEEDS_REVIEW flags
 * 3. Build template context
 * 4. Select templates from catalog
 * 5. Render templates
 * 6. Write files to .github/
 * 7. Save snapshot for future merge
 * 8. Print summary
 */
export async function scaffold(options: ScaffoldOptions): Promise<void> {
  log.info(`Loading config from ${options.configPath}...`);

  const { config, hasNeedsReview, needsReviewLocations } = await loadConfig(options.configPath);

  if (hasNeedsReview) {
    log.error('Config has unresolved NEEDS_REVIEW flags:');
    for (const loc of needsReviewLocations) {
      log.error(`  ${loc}`);
    }
    throw new Error(
      'Resolve all NEEDS_REVIEW flags in your config before scaffolding. ' +
        `Found ${needsReviewLocations.length} unresolved flag(s).`,
    );
  }

  const context = buildContext(config);
  log.success(`Config validated: ${context.project.name}`);

  // TODO (Milestone 1D): Template selection, rendering, writing, snapshot
  log.info('Scaffold pipeline stub — full implementation in Milestone 1D');
}
