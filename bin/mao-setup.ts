#!/usr/bin/env tsx
/**
 * MAO Setup CLI — Guided pipeline that runs the full 6-step setup.
 *
 * Usage:
 *   pnpm setup                          → Interactive guided setup
 *   pnpm setup -- --config <path>       → Use existing config
 *   pnpm setup -- --output <dir>        → Custom output directory
 */

import { Command } from 'commander';
import { access } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import chalk from 'chalk';
import { loadConfig, ConfigValidationError } from '../src/config/loader.js';
import { detectStack } from '../src/config/detect.js';
import { scaffold } from '../src/engine/scaffold.js';
import { activate } from '../src/engine/validator.js';
import { warnConfigIssues } from '../src/config/warnings.js';

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function banner() {
  console.log('');
  console.log(chalk.bold.cyan('  ╔══════════════════════════════════════════╗'));
  console.log(
    chalk.bold.cyan('  ║') +
      chalk.bold('   MAO — Multi-Agent Orchestration Setup  ') +
      chalk.bold.cyan('║'),
  );
  console.log(chalk.bold.cyan('  ╚══════════════════════════════════════════╝'));
  console.log('');
}

function step(n: number, total: number, name: string) {
  console.log('');
  console.log(chalk.bold(`  Step ${n}/${total}: ${name}`));
  console.log(chalk.dim('  ' + '─'.repeat(40)));
}

function gate(message: string) {
  console.log('');
  console.log(chalk.yellow(`  ⏸  ${message}`));
}

const program = new Command();

program
  .name('mao-setup')
  .description('Guided MAO setup — walks through the full pipeline')
  .version('0.1.0')
  .option('-c, --config <path>', 'Path to mao.config.yaml', 'mao.config.yaml')
  .option('-o, --output <dir>', 'Output directory', '.')
  .action(async (options) => {
    const configPath = options.config as string;
    const outputDir = options.output as string;

    try {
      banner();

      // ── Step 1: Check for PRD ──
      step(1, 6, 'Analyze PRD');

      const hasPrd = await fileExists('prd.md');
      if (hasPrd) {
        console.log(chalk.green('  ✔ Found prd.md'));
      } else {
        console.log(chalk.dim('  No prd.md found in current directory.'));
      }

      const hasConfig = await fileExists(configPath);
      if (!hasConfig) {
        if (hasPrd) {
          console.log('');
          console.log('  To generate your config, open VS Code Copilot Chat and run:');
          console.log(
            chalk.bold.white(
              '  @Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml',
            ),
          );
        } else {
          console.log('');
          console.log('  Place your PRD at ./prd.md, then run:');
          console.log(
            chalk.bold.white(
              '  @Analyzer Analyze the PRD at ./prd.md and generate mao.config.yaml',
            ),
          );
          console.log('');
          console.log('  Or create mao.config.yaml manually. See docs/config-reference.md');
        }

        // Try auto-detection
        const { evidence } = await detectStack(outputDir);
        if (evidence.length > 0) {
          console.log('');
          console.log(chalk.cyan('  Stack auto-detection found:'));
          for (const e of evidence.slice(0, 8)) {
            console.log(chalk.dim(`    • ${e}`));
          }
          if (evidence.length > 8) {
            console.log(chalk.dim(`    ... and ${evidence.length - 8} more`));
          }
        }

        gate('Create mao.config.yaml, then re-run: pnpm setup');
        rl.close();
        return;
      }

      // ── Step 2: Validate Config ──
      step(2, 6, 'Validate Config');

      try {
        const { config, hasNeedsReview, needsReviewLocations } = await loadConfig(configPath);
        console.log(chalk.green(`  ✔ Config valid: ${config.project.name}`));

        // Show warnings
        const warnings = warnConfigIssues(config);
        for (const w of warnings) {
          console.log(chalk.yellow(`  ⚠ ${w}`));
        }

        if (hasNeedsReview) {
          console.log('');
          console.log(
            chalk.yellow(`  ⚠ ${needsReviewLocations.length} NEEDS_REVIEW flag(s) found:`),
          );
          for (const loc of needsReviewLocations) {
            console.log(chalk.dim(`    • ${loc}`));
          }
          gate('Resolve all NEEDS_REVIEW flags in mao.config.yaml, then re-run: pnpm setup');
          rl.close();
          return;
        }
      } catch (error) {
        if (error instanceof ConfigValidationError) {
          console.log(chalk.red(`  ✗ Config validation failed:`));
          for (const issue of error.issues) {
            console.log(chalk.red(`    • ${issue.path}: ${issue.message}`));
          }
          gate('Fix config errors, then re-run: pnpm setup');
          rl.close();
          return;
        }
        throw error;
      }

      // ── Step 3: Scaffold ──
      step(3, 6, 'Scaffold Agent Setup');

      const answer = await ask('  Scaffold now? (Y/n) ');
      if (answer.toLowerCase() === 'n') {
        console.log(chalk.dim('  Skipped. Run manually: pnpm scaffold'));
      } else {
        await scaffold({
          configPath,
          outputDir,
          verbose: true,
        });
        console.log(chalk.green('  ✔ Scaffold complete'));
      }

      // ── Step 4: Enrich ──
      step(4, 6, 'Enrich Agent Setup');

      console.log('  Open VS Code Copilot Chat and run:');
      console.log(chalk.bold.white('  @Enricher Enrich the generated agent setup from the PRD'));
      console.log('');
      const enrichDone = await ask('  Done enriching? (Y to continue, n to skip) ');
      if (enrichDone.toLowerCase() === 'n') {
        console.log(chalk.dim('  Skipped enrichment — you can run it later.'));
      }

      // ── Step 5: Review ──
      step(5, 6, 'Review Enriched Files');

      console.log('  Check the enriched files for accuracy:');
      console.log(chalk.dim('    • Do skill references contain correct business logic?'));
      console.log(chalk.dim('    • Are entity schemas complete?'));
      console.log(chalk.dim('    • Look for <!-- NEEDS_HUMAN_REVIEW --> markers'));
      console.log('');
      await ask('  Press Enter when review is complete... ');

      // ── Step 6: Activate ──
      step(6, 6, 'Activate');

      const result = await activate({
        configPath,
        githubDir: `${outputDir}/.github`,
        verbose: true,
      });

      if (result.passed) {
        console.log('');
        console.log(chalk.bold.green('  🎉 Setup complete! Your agent team is ready.'));
        console.log('');
        console.log('  Try in VS Code Copilot Chat:');
        console.log(chalk.bold.white('    @Orchestrator Start Phase 1'));
        console.log('');
      } else {
        console.log('');
        console.log(chalk.yellow('  Setup finished with issues. Fix the errors above and run:'));
        console.log(chalk.bold.white('    pnpm activate'));
      }

      rl.close();
    } catch (error) {
      rl.close();
      console.error(chalk.red(error instanceof Error ? error.message : 'Setup failed'));
      process.exit(1);
    }
  });

program.parse();
