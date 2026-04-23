/**
 * Catalog — discover templates from catalog directory, map to output paths.
 *
 * Milestone 1C: Full implementation
 */

import fg from 'fast-glob';
import path from 'node:path';

export interface CatalogEntry {
  /** Absolute path to the .hbs template file */
  templatePath: string;
  /** Relative output path under .github/ */
  outputPath: string;
  /** Category: agents | skills | instructions | hooks | prompts | root */
  category: string;
}

/**
 * Scan the catalog directory and return all template entries for a given preset.
 */
export async function discoverTemplates(
  catalogDir: string,
  _preset: string,
): Promise<CatalogEntry[]> {
  const patterns = [path.join(catalogDir, '**/*.hbs')];
  const files = await fg(patterns, { absolute: true });

  return files.map((templatePath) => {
    const relative = path.relative(catalogDir, templatePath);
    const outputPath = relative.replace(/\.hbs$/, '');
    const category = relative.split(path.sep)[0] ?? 'root';

    return { templatePath, outputPath, category };
  });
}
