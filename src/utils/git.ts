/**
 * Git-independent file change detection via content hashing.
 *
 * Milestone 2B: Hash comparison for merge decisions.
 */

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/** Hash file content for change detection (SHA-256, truncated to 16 hex chars) */
export function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex').slice(0, 16);
}

/** Read a file from disk, returning null if it doesn't exist */
export async function readDiskFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/** Recursively collect all files under a directory as relative path → content */
export async function collectDiskFiles(dir: string): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  await walk(dir, dir, results);
  return results;
}

async function walk(
  currentDir: string,
  rootDir: string,
  results: Map<string, string>,
): Promise<void> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await readdir(currentDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      // Skip .mao snapshot directory
      if (entry.name === '.mao') continue;
      await walk(fullPath, rootDir, results);
    } else {
      const content = await readFile(fullPath, 'utf-8');
      results.set(path.relative(rootDir, fullPath), content);
    }
  }
}
