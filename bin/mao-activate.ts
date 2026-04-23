#!/usr/bin/env tsx
/**
 * MAO Activate CLI
 *
 * Validates the generated .github/ directory for completeness and consistency.
 *
 * Usage:
 *   npm run activate                     → Validate .github/ setup
 *   npm run activate -- --config <path>  → Use custom config path
 *   npm run activate -- --verbose        → Show detailed validation results
 */

import { Command } from 'commander';
import { activate } from '../src/engine/validator.js';

const program = new Command();

program
  .name('mao-activate')
  .description('Validate VS Code Copilot agent setup for completeness and consistency')
  .version('0.1.0')
  .option('-c, --config <path>', 'Path to mao.config.yaml', 'mao.config.yaml')
  .option('-d, --dir <path>', 'Path to .github/ directory', '.github')
  .option('--verbose', 'Show detailed validation results')
  .action(async (options) => {
    try {
      const passed = await activate({
        configPath: options.config as string,
        githubDir: options.dir as string,
        verbose: options.verbose as boolean | undefined,
      });
      process.exit(passed ? 0 : 1);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : 'Activation check failed with an unknown error',
      );
      process.exit(1);
    }
  });

program.parse();
