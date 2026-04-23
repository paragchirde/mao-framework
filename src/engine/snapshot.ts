/**
 * Snapshot manager — save/load generation snapshots for merge strategy.
 *
 * Milestone 1D (save) + Milestone 2A (load + compare)
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { GeneratedFile } from './writer.js';

const SNAPSHOT_DIR = '.mao/generated';

/**
 * Save a snapshot of all generated files for future three-way merge comparison.
 */
export async function saveSnapshot(files: GeneratedFile[], baseDir: string): Promise<void> {
  const snapshotDir = path.join(baseDir, SNAPSHOT_DIR);

  for (const file of files) {
    const fullPath = path.join(snapshotDir, file.path);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.content, 'utf-8');
  }
}

/**
 * Load a previously saved snapshot file.
 */
export async function loadSnapshot(filePath: string, baseDir: string): Promise<string | null> {
  try {
    const fullPath = path.join(baseDir, SNAPSHOT_DIR, filePath);
    return await readFile(fullPath, 'utf-8');
  } catch {
    return null;
  }
}
