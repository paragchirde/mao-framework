/**
 * Scaffold engine — the central orchestration pipeline.
 *
 * Milestone 1D + 2C: Full implementation with merge support
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../config/loader.js';
import { buildContext } from './context.js';
import { discoverTemplates, generateCustomSkillStubs } from './catalog.js';
import { render } from './renderer.js';
import type { GeneratedFile } from './writer.js';
import { writeFiles } from './writer.js';
import { saveSnapshot, hasSnapshot } from './snapshot.js';
import { computeMergeDecisions, summarizeMerge, logMergeResult } from './merge.js';
import { log } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CATALOG_DIR = path.resolve(__dirname, '../../catalog');

export interface ScaffoldOptions {
  configPath: string;
  outputDir: string;
  catalogDir?: string;
  merge?: boolean;
  force?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export interface ScaffoldResult {
  files: GeneratedFile[];
  skipped: string[];
  totalGenerated: number;
}

/**
 * Run the scaffold pipeline:
 * 1. Load + validate config
 * 2. Assert no NEEDS_REVIEW flags
 * 3. Build template context
 * 4. Select templates from catalog
 * 5. Render templates
 * 6. Generate custom skill stubs
 * 7. Write files to .github/
 * 8. Save snapshot for future merge
 * 9. Print summary
 */
export async function scaffold(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const catalogDir = options.catalogDir ?? DEFAULT_CATALOG_DIR;

  // 1. Load + validate config
  log.info(`Loading config from ${options.configPath}...`);
  const { config, hasNeedsReview, needsReviewLocations } = await loadConfig(options.configPath);

  // 2. Assert no NEEDS_REVIEW flags
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

  // 3. Build template context
  const context = buildContext(config);
  log.success(`Config validated: ${context.project.name}`);

  // 4. Select templates from catalog
  const catalogEntries = await discoverTemplates(catalogDir, config);
  if (options.verbose) {
    log.info(`Discovered ${catalogEntries.length} template(s) from catalog`);
  }

  // 5. Render templates
  const rendered: GeneratedFile[] = [];
  const skipped: string[] = [];

  for (const entry of catalogEntries) {
    try {
      const templateSource = await readFile(entry.templatePath, 'utf-8');
      const content = render(templateSource, context as unknown as Record<string, unknown>);
      rendered.push({ path: entry.outputPath, content });
      if (options.verbose) {
        log.file.created(entry.outputPath);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn(`Skipping ${entry.outputPath}: ${message}`);
      skipped.push(entry.outputPath);
    }
  }

  // 6. Generate custom skill stubs
  const customStubs = generateCustomSkillStubs(config);
  rendered.push(...customStubs);

  if (options.verbose && customStubs.length > 0) {
    log.info(`Generated ${customStubs.length} custom skill stub(s)`);
  }

  // 7. Write files (unless dry-run)
  if (!options.dryRun) {
    if (options.merge) {
      // Merge mode: compare snapshot → disk → new generation
      const snapshotExists = await hasSnapshot(options.outputDir);
      if (!snapshotExists) {
        log.warn('No previous snapshot found — performing full write instead of merge');
      }

      if (snapshotExists) {
        const strategy = config.merge_strategy ?? 'preserve-custom';
        const decisions = await computeMergeDecisions(
          rendered,
          options.outputDir,
          strategy,
          config,
        );
        const result = summarizeMerge(decisions);

        // Apply decisions
        const toWrite = decisions
          .filter((d) => (d.action === 'create' || d.action === 'overwrite') && d.newContent)
          .map((d) => ({ path: d.filePath, content: d.newContent! }));

        if (toWrite.length > 0) {
          await writeFiles(toWrite, options.outputDir);
        }

        logMergeResult(result, options.verbose ?? false);

        if (result.conflicts > 0) {
          log.warn(`${result.conflicts} conflict(s) need manual resolution`);
        }

        // Save updated snapshot
        await saveSnapshot(rendered, options.outputDir);

        return {
          files: toWrite,
          skipped: decisions.filter((d) => d.action === 'skip').map((d) => d.filePath),
          totalGenerated: toWrite.length,
        };
      }
    }

    // First-time scaffold (or merge without snapshot) — write everything
    await writeFiles(rendered, options.outputDir);
    log.success(`Wrote ${rendered.length} file(s) to ${options.outputDir}`);

    // 8. Save snapshot for future merge
    await saveSnapshot(rendered, options.outputDir);
    if (options.verbose) {
      log.info('Snapshot saved for future merge comparison');
    }
  } else {
    log.info(`[dry-run] Would write ${rendered.length} file(s) to ${options.outputDir}`);
    for (const file of rendered) {
      log.info(`  ${file.path}`);
    }
  }

  // 9. Summary
  if (skipped.length > 0) {
    log.warn(`Skipped ${skipped.length} template(s) due to errors`);
  }

  return { files: rendered, skipped, totalGenerated: rendered.length };
}
