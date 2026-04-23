/**
 * File writer — write rendered files to .github/, create directories, generate stubs.
 *
 * Milestone 1D: Full implementation
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface GeneratedFile {
  /** Relative path under the output directory */
  path: string;
  /** File content */
  content: string;
}

/**
 * Write generated files to the output directory.
 */
export async function writeFiles(files: GeneratedFile[], outputDir: string): Promise<void> {
  for (const file of files) {
    const fullPath = path.join(outputDir, file.path);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.content, 'utf-8');
  }
}
