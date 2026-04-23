/**
 * Three-way merge engine — compare snapshot, disk, and new generation to decide actions.
 *
 * Milestone 2B: Full implementation
 */

import type { GeneratedFile } from './writer.js';
import type { MaoConfig } from '../config/types.js';
import { hashContent, readDiskFile } from '../utils/git.js';
import { loadAllSnapshots } from './snapshot.js';
import { log } from '../utils/logger.js';
import path from 'node:path';

export type MergeStrategy = 'preserve-custom' | 'overwrite' | 'prompt';

export type MergeAction =
  | 'create' // New file, doesn't exist on disk
  | 'overwrite' // Update — user didn't modify, template changed
  | 'skip' // User customized or no change
  | 'conflict' // User and template both changed — depends on strategy
  | 'delete' // File removed from generation (warn only)
  | 'warn'; // User deleted, but template updated

export interface MergeDecision {
  filePath: string;
  action: MergeAction;
  reason: string;
  /** New content to write (for create/overwrite actions) */
  newContent?: string;
  /** Existing disk content (for conflict display) */
  diskContent?: string;
}

export interface MergeResult {
  decisions: MergeDecision[];
  created: number;
  overwritten: number;
  skipped: number;
  conflicts: number;
  warnings: number;
}

/**
 * Compute merge decisions by comparing three versions of each file:
 * - snapshot: what we generated last time
 * - disk: what's currently on disk (may have user edits)
 * - newGen: what we'd generate now
 */
export async function computeMergeDecisions(
  newFiles: GeneratedFile[],
  outputDir: string,
  strategy: MergeStrategy,
  config: MaoConfig,
): Promise<MergeDecision[]> {
  const snapshots = await loadAllSnapshots(outputDir);
  const snapshotMap = new Map(snapshots.map((f) => [f.path, f.content]));
  const newMap = new Map(newFiles.map((f) => [f.path, f.content]));

  const decisions: MergeDecision[] = [];
  const allPaths = new Set([...snapshotMap.keys(), ...newMap.keys()]);

  for (const filePath of allPaths) {
    const snapshotContent = snapshotMap.get(filePath) ?? null;
    const diskContent = await readDiskFile(path.join(outputDir, filePath));
    const newContent = newMap.get(filePath) ?? null;

    const decision = decideAction(
      filePath,
      snapshotContent,
      diskContent,
      newContent,
      strategy,
      config,
    );
    decisions.push(decision);
  }

  return decisions;
}

/**
 * Apply the merge decision matrix for a single file.
 */
function decideAction(
  filePath: string,
  snapshot: string | null,
  disk: string | null,
  newGen: string | null,
  strategy: MergeStrategy,
  config: MaoConfig,
): MergeDecision {
  const snapshotHash = snapshot ? hashContent(snapshot) : null;
  const diskHash = disk ? hashContent(disk) : null;
  const newHash = newGen ? hashContent(newGen) : null;

  // Custom skill references are ALWAYS preserved
  if (isCustomSkillReference(filePath, config)) {
    if (disk !== null) {
      return { filePath, action: 'skip', reason: 'Custom skill reference — always preserved' };
    }
    if (newGen !== null) {
      return {
        filePath,
        action: 'create',
        reason: 'New custom skill reference',
        newContent: newGen,
      };
    }
    return { filePath, action: 'skip', reason: 'Custom skill reference — no action needed' };
  }

  // Case: File only in new generation (never existed before)
  if (snapshot === null && disk === null && newGen !== null) {
    return { filePath, action: 'create', reason: 'New file', newContent: newGen };
  }

  // Case: File removed from new generation
  if (snapshot !== null && newGen === null) {
    if (disk === null) {
      return { filePath, action: 'skip', reason: 'Already deleted' };
    }
    return {
      filePath,
      action: 'warn',
      reason: 'File removed from generation but exists on disk — manual cleanup may be needed',
      diskContent: disk,
    };
  }

  // Case: No snapshot (first scaffold for this file), but file exists on disk
  if (snapshot === null && disk !== null && newGen !== null) {
    if (diskHash === newHash) {
      return { filePath, action: 'skip', reason: 'Disk matches new generation' };
    }
    // Treat as conflict — something exists that we didn't generate
    return resolveConflict(
      filePath,
      strategy,
      newGen,
      disk,
      'File exists on disk but no previous snapshot',
    );
  }

  // Case: All three exist — the standard three-way merge
  if (snapshot !== null && disk !== null && newGen !== null) {
    // A=A=A — no changes
    if (snapshotHash === diskHash && diskHash === newHash) {
      return { filePath, action: 'skip', reason: 'No changes' };
    }

    // A=A, new=B — user didn't touch, template updated
    if (snapshotHash === diskHash && diskHash !== newHash) {
      return {
        filePath,
        action: 'overwrite',
        reason: 'Template updated, user unchanged',
        newContent: newGen,
      };
    }

    // A→B, new=A — user customized, template unchanged
    if (snapshotHash !== diskHash && snapshotHash === newHash) {
      return { filePath, action: 'skip', reason: 'User customized, template unchanged' };
    }

    // A→B, new=B — user and template converged (unlikely but possible)
    if (snapshotHash !== diskHash && diskHash === newHash) {
      return { filePath, action: 'skip', reason: 'User edit matches new template' };
    }

    // A→B, new=C — true conflict
    return resolveConflict(filePath, strategy, newGen, disk, 'Both user and template changed');
  }

  // Case: Snapshot exists, disk deleted, new exists
  if (snapshot !== null && disk === null && newGen !== null) {
    if (snapshotHash === newHash) {
      // User deleted, template unchanged — respect deletion
      return {
        filePath,
        action: 'skip',
        reason: 'User deleted file, template unchanged — respecting deletion',
      };
    }
    // User deleted, template updated — warn
    return {
      filePath,
      action: 'warn',
      reason: 'User deleted file but template was updated',
      newContent: newGen,
    };
  }

  return { filePath, action: 'skip', reason: 'Unhandled case — skipping for safety' };
}

/**
 * Resolve a conflict based on the merge strategy.
 */
function resolveConflict(
  filePath: string,
  strategy: MergeStrategy,
  newContent: string,
  diskContent: string,
  reason: string,
): MergeDecision {
  switch (strategy) {
    case 'preserve-custom':
      return { filePath, action: 'skip', reason: `${reason} — preserving user version` };

    case 'overwrite':
      return {
        filePath,
        action: 'overwrite',
        reason: `${reason} — overwriting per strategy`,
        newContent,
      };

    case 'prompt':
      return { filePath, action: 'conflict', reason, newContent, diskContent };
  }
}

/**
 * Check if a file is a custom skill reference (these are always preserved).
 */
function isCustomSkillReference(filePath: string, config: MaoConfig): boolean {
  for (const skill of config.custom_skills) {
    if (filePath.startsWith(`skills/${skill.name}/references/`)) {
      return true;
    }
  }
  return false;
}

/**
 * Summarize merge decisions into a result.
 */
export function summarizeMerge(decisions: MergeDecision[]): MergeResult {
  let created = 0;
  let overwritten = 0;
  let skipped = 0;
  let conflicts = 0;
  let warnings = 0;

  for (const d of decisions) {
    switch (d.action) {
      case 'create':
        created++;
        break;
      case 'overwrite':
        overwritten++;
        break;
      case 'skip':
        skipped++;
        break;
      case 'conflict':
        conflicts++;
        break;
      case 'warn':
      case 'delete':
        warnings++;
        break;
    }
  }

  return { decisions, created, overwritten, skipped, conflicts, warnings };
}

/**
 * Log merge decisions to terminal.
 */
export function logMergeResult(result: MergeResult, verbose: boolean): void {
  for (const d of result.decisions) {
    switch (d.action) {
      case 'create':
        log.file.created(d.filePath);
        break;
      case 'overwrite':
        log.file.updated(d.filePath);
        break;
      case 'skip':
        if (verbose) log.file.skipped(`${d.filePath} (${d.reason})`);
        break;
      case 'conflict':
        log.file.conflict(`${d.filePath} — ${d.reason}`);
        break;
      case 'warn':
        log.warn(`${d.filePath}: ${d.reason}`);
        break;
    }
  }

  log.info('');
  log.info(
    `Merge: ${result.created} created, ${result.overwritten} updated, ` +
      `${result.skipped} skipped, ${result.conflicts} conflicts, ${result.warnings} warnings`,
  );
}
