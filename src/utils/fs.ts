/**
 * File system helpers.
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Check if a file or directory exists */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** Ensure a directory exists, creating it recursively if needed */
export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

/** Read a file as UTF-8 string, or return null if it doesn't exist */
export async function readFileOrNull(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/** Write a file, creating parent directories as needed */
export async function writeFileWithDir(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}
