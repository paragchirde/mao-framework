/**
 * Catalog — discover templates from catalog directory, map to output paths.
 *
 * Milestone 1C: Full implementation
 */

import fg from 'fast-glob';
import path from 'node:path';
import type { MaoConfig } from '../config/types.js';
import { presets } from '../config/presets.js';

export interface CatalogEntry {
  /** Absolute path to the .hbs template file */
  templatePath: string;
  /** Relative output path under .github/ (e.g., "agents/backend-agent.agent.md") */
  outputPath: string;
  /** Category: agents | skills | instructions | hooks | prompts | root */
  category: string;
}

/**
 * Map a catalog template path to its output path under .github/.
 *
 * Rules:
 * - Remove the .hbs extension
 * - Agent templates: catalog/agents/{role}.agent.md.hbs → agents/{role}-agent.agent.md
 *   (orchestrator: catalog/agents/_orchestrator.agent.md.hbs → agents/orchestrator.agent.md)
 * - Skill templates: catalog/skills/{preset}/{skill}/... → skills/{skill}/...
 * - Instructions: catalog/instructions/{preset}/... → instructions/...
 * - Hooks: catalog/hooks/... → hooks/...
 * - Prompts: catalog/prompts/... → prompts/...
 * - Root files: catalog/copilot-instructions.md.hbs → copilot-instructions.md
 */
function mapOutputPath(templateRelative: string): string {
  // Remove .hbs extension
  let output = templateRelative.replace(/\.hbs$/, '');

  // Agent name mapping: _orchestrator → orchestrator, others get -agent suffix
  if (output.startsWith('agents/')) {
    const basename = path.basename(output, '.agent.md');
    if (basename.startsWith('_')) {
      // _orchestrator → orchestrator
      const name = basename.slice(1);
      output = `agents/${name}.agent.md`;
    } else {
      output = `agents/${basename}-agent.agent.md`;
    }
  }

  // Skill templates: skills/{preset}/{skill}/... → skills/{skill}/...
  if (output.startsWith('skills/')) {
    const parts = output.split('/');
    // skills / preset / skill-name / rest...
    if (parts.length >= 3) {
      // Check if second segment looks like a preset name
      const maybePreset = parts[1];
      if (maybePreset && (maybePreset === '_base' || maybePreset in presets)) {
        // Remove the preset segment
        output = ['skills', ...parts.slice(2)].join('/');
      }
    }
  }

  // Instruction templates: instructions/{preset}/... → instructions/...
  if (output.startsWith('instructions/')) {
    const parts = output.split('/');
    if (parts.length >= 3) {
      const maybePreset = parts[1];
      if (maybePreset && maybePreset in presets) {
        output = ['instructions', ...parts.slice(2)].join('/');
      }
    }
  }

  return output;
}

/**
 * Determine the category from a relative template path.
 */
function getCategory(relativePath: string): string {
  const firstSegment = relativePath.split('/')[0];
  if (
    firstSegment &&
    ['agents', 'skills', 'instructions', 'hooks', 'prompts'].includes(firstSegment)
  ) {
    return firstSegment;
  }
  return 'root';
}

/**
 * Scan the catalog directory and return all template entries for a given preset.
 *
 * Template selection logic:
 * 1. All agent templates in catalog/agents/ (filtered by config.agents)
 * 2. Base skills from catalog/skills/_base/
 * 3. Preset-specific skills from catalog/skills/{preset}/
 * 4. Preset-specific instructions from catalog/instructions/{preset}/
 * 5. All hooks from catalog/hooks/
 * 6. All prompts from catalog/prompts/
 * 7. Root templates (copilot-instructions.md.hbs)
 */
export async function discoverTemplates(
  catalogDir: string,
  config: MaoConfig,
): Promise<CatalogEntry[]> {
  const preset = config.stack.preset;
  const configuredAgents = new Set<string>(config.agents);

  // Discover all .hbs files in catalog
  const allFiles = await fg(path.join(catalogDir, '**/*.hbs'), { absolute: true });

  const entries: CatalogEntry[] = [];

  for (const templatePath of allFiles) {
    const relative = path.relative(catalogDir, templatePath);
    const category = getCategory(relative);

    // Filter agent templates to only configured agents
    if (category === 'agents') {
      const basename = path.basename(relative, '.agent.md.hbs');
      const agentName = basename.startsWith('_') ? basename.slice(1) : basename;
      if (!configuredAgents.has(agentName)) {
        continue; // Skip unconfigured agents
      }
    }

    // Filter skill templates to only _base and the selected preset
    if (category === 'skills') {
      const parts = relative.split('/');
      const presetDir = parts[1];
      if (presetDir && presetDir !== '_base' && presetDir !== preset) {
        continue; // Skip skills for other presets
      }
    }

    // Filter instruction templates to only the selected preset
    if (category === 'instructions') {
      const parts = relative.split('/');
      const presetDir = parts[1];
      if (presetDir && presetDir !== preset) {
        continue; // Skip instructions for other presets
      }
    }

    entries.push({
      templatePath,
      outputPath: mapOutputPath(relative),
      category,
    });
  }

  return entries;
}

/**
 * Generate stub files for custom skills defined in config.
 * These aren't from catalog templates — they're programmatically created.
 */
export function generateCustomSkillStubs(
  config: MaoConfig,
): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];

  for (const skill of config.custom_skills) {
    // SKILL.md stub
    files.push({
      path: `skills/${skill.name}/SKILL.md`,
      content: [
        `# ${skill.name}`,
        '',
        `> ${skill.description}`,
        '',
        '## When to Use',
        '',
        '<!-- ENRICHMENT WILL FILL THIS FROM PRD -->',
        '',
        '## Procedure',
        '',
        '<!-- ENRICHMENT WILL FILL THIS FROM PRD -->',
        '',
        '## Key Rules',
        '',
        '<!-- ENRICHMENT WILL FILL THIS FROM PRD -->',
        '',
        '## References',
        '',
        ...skill.references.map((ref) => `- [${ref}](references/${ref})`),
        '',
      ].join('\n'),
    });

    // Reference file stubs
    for (const ref of skill.references) {
      files.push({
        path: `skills/${skill.name}/references/${ref}`,
        content: [
          `# ${ref.replace('.md', '')}`,
          '',
          `> Reference for: ${skill.name} — ${skill.description}`,
          '',
          '<!-- ENRICHMENT WILL FILL THIS FROM PRD -->',
          '',
        ].join('\n'),
      });
    }
  }

  return files;
}
