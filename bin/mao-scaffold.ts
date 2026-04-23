#!/usr/bin/env tsx
/**
 * MAO Scaffold CLI
 *
 * Usage:
 *   npm run scaffold                     → First-time scaffold from config
 *   npm run scaffold -- --merge          → Re-scaffold with merge strategy
 *   npm run scaffold -- --force          → Overwrite everything
 *   npm run scaffold -- --config <path>  → Use custom config path
 *   npm run scaffold -- --dry-run        → Preview without writing
 */

import { Command } from 'commander';
import { scaffold } from '../src/engine/scaffold.js';

const program = new Command();

program
  .name('mao-scaffold')
  .description('Generate VS Code Copilot agent setup from mao.config.yaml')
  .version('0.1.0')
  .option('-c, --config <path>', 'Path to mao.config.yaml', 'mao.config.yaml')
  .option('-o, --output <dir>', 'Output directory', '.github')
  .option('--merge', 'Re-scaffold with three-way merge strategy')
  .option('--force', 'Overwrite all existing files (with confirmation)')
  .option('--dry-run', 'Preview generated files without writing')
  .option('--verbose', 'Show detailed progress')
  .action(async (options) => {
    try {
      await scaffold({
        configPath: options.config as string,
        outputDir: options.output as string,
        merge: options.merge as boolean | undefined,
        force: options.force as boolean | undefined,
        dryRun: options.dryRun as boolean | undefined,
        verbose: options.verbose as boolean | undefined,
      });
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : 'Scaffold failed with an unknown error',
      );
      process.exit(1);
    }
  });

program.parse();
