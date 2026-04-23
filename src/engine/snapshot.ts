/**
 * Snapshot manager — save/load generation snapshots for merge strategy.
 *
 * Milestone 1D (save) + Milestone 2A (full snapshot tracking)
 */

import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
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

/**
 * Check if a snapshot exists (i.e., a previous scaffold has been run).
 */
export async function hasSnapshot(baseDir: string): Promise<boolean> {
  try {
    const snapshotDir = path.join(baseDir, SNAPSHOT_DIR);
    const entries = await readdir(snapshotDir);
    return entries.length > 0;
  } catch {
    return false;
  }
}

/**
 * Load all snapshot files as GeneratedFile[] for merge comparison.
 */
export async function loadAllSnapshots(baseDir: string): Promise<GeneratedFile[]> {
  const snapshotDir = path.join(baseDir, SNAPSHOT_DIR);
  return collectFiles(snapshotDir, snapshotDir);
}

/** Recursively collect all files from a directory as GeneratedFile[] */
async function collectFiles(dir: string, rootDir: string): Promise<GeneratedFile[]> {
  const results: GeneratedFile[] = [];
  let entries: import('node:fs').Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(fullPath, rootDir)));
    } else {
      const content = await readFile(fullPath, 'utf-8');
      results.push({ path: path.relative(rootDir, fullPath), content });
    }
  }
  return results;
}
