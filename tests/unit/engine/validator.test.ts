import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { activate } from '../../../src/engine/validator.js';

const FIXTURE_CONFIG = path.resolve('tests/fixtures/sample-config-fullstack.yaml');

describe('activation validator', () => {
  let githubDir: string;

  beforeEach(async () => {
    githubDir = await mkdtemp(path.join(tmpdir(), 'mao-validator-'));
  });

  afterEach(async () => {
    await rm(githubDir, { recursive: true, force: true });
  });

  async function writeGithubFile(relativePath: string, content: string) {
    const fullPath = path.join(githubDir, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  async function setupMinimalValidOutput() {
    // Write all 6 agent files
    await writeGithubFile(
      'agents/orchestrator.agent.md',
      '# Orchestrator\nFull orchestrator content with backend-agent and frontend-agent and database-agent and auth-agent and qa-agent references.',
    );
    await writeGithubFile(
      'agents/database-agent.agent.md',
      '# Database Agent\nHandles database tasks.',
    );
    await writeGithubFile('agents/backend-agent.agent.md', '# Backend Agent\nHandles API routes.');
    await writeGithubFile('agents/frontend-agent.agent.md', '# Frontend Agent\nHandles UI.');
    await writeGithubFile('agents/auth-agent.agent.md', '# Auth Agent\nHandles auth.');
    await writeGithubFile('agents/qa-agent.agent.md', '# QA Agent\nHandles testing.');

    // Write skills with adequate content
    const skillContent =
      '# Skill\n\n## When to Use\nUse when doing things.\n\n## Procedure\n1. Do step one\n2. Do step two';
    for (const s of [
      'api-conventions',
      'error-handling',
      'testing-patterns',
      'prisma-db',
      'express-api',
      'react-ui',
      'auth',
    ]) {
      await writeGithubFile(`skills/${s}/SKILL.md`, skillContent);
      await writeGithubFile(
        `skills/${s}/references/pattern.md`,
        'Reference content here with enough length to pass validation check.',
      );
    }

    // Custom skills
    for (const s of ['task-numbering', 'sprint-capacity', 'task-workflow', 'time-logging']) {
      await writeGithubFile(`skills/${s}/SKILL.md`, skillContent);
    }
    await writeGithubFile(
      'skills/task-numbering/references/algorithm.md',
      'Algorithm content sufficient for validation.',
    );
    await writeGithubFile(
      'skills/sprint-capacity/references/formula.md',
      'Formula content sufficient for validation checks.',
    );
    await writeGithubFile(
      'skills/task-workflow/references/state-machine.md',
      'State machine content sufficient for validation.',
    );
    await writeGithubFile(
      'skills/time-logging/references/validation-rules.md',
      'Validation rules content sufficient.',
    );

    // Instructions
    await writeGithubFile('instructions/prisma.instructions.md', '# Prisma Instructions');
    await writeGithubFile('instructions/express-routes.instructions.md', '# Express Instructions');
    await writeGithubFile('instructions/react-components.instructions.md', '# React Instructions');
    await writeGithubFile('instructions/services.instructions.md', '# Services Instructions');

    // Hooks
    await writeGithubFile('hooks/prettier.json', '{ "semi": true }');

    // Prompts
    await writeGithubFile('prompts/start-phase.prompt.md', '# Start Phase');
    await writeGithubFile('prompts/verify-phase.prompt.md', '# Verify Phase');
    await writeGithubFile('prompts/add-feature.prompt.md', '# Add Feature');
    await writeGithubFile('prompts/review-code.prompt.md', '# Review Code');
  }

  it('should pass validation for a complete setup', async () => {
    await setupMinimalValidOutput();

    const result = await activate({
      configPath: FIXTURE_CONFIG,
      githubDir,
    });

    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.agents.valid).toBe(6);
    expect(result.summary.agents.total).toBe(6);
  });

  it('should fail when an agent file is missing', async () => {
    await setupMinimalValidOutput();
    // Remove backend agent
    await rm(path.join(githubDir, 'agents/backend-agent.agent.md'));

    const result = await activate({ configPath: FIXTURE_CONFIG, githubDir });

    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('backend-agent'))).toBe(true);
    expect(result.summary.agents.valid).toBe(5);
  });

  it('should fail when a custom skill reference is missing', async () => {
    await setupMinimalValidOutput();
    await rm(path.join(githubDir, 'skills/task-numbering/references/algorithm.md'));

    const result = await activate({ configPath: FIXTURE_CONFIG, githubDir });

    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('task-numbering'))).toBe(true);
  });

  it('should warn on enrichment markers', async () => {
    await setupMinimalValidOutput();
    await writeGithubFile(
      'skills/prisma-db/SKILL.md',
      '# Prisma DB\n\n<!-- ENRICHMENT WILL FILL THIS FROM PRD -->\n\nMore content here to be long enough.',
    );

    const result = await activate({ configPath: FIXTURE_CONFIG, githubDir, verbose: true });

    // Markers are warnings, not errors
    expect(result.passed).toBe(true);
    expect(result.summary.enrichmentMarkers).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.message.includes('enrichment marker'))).toBe(true);
  });

  it('should count skills correctly', async () => {
    await setupMinimalValidOutput();

    const result = await activate({ configPath: FIXTURE_CONFIG, githubDir });

    expect(result.summary.skills.total).toBe(11); // 7 preset + 4 custom
    expect(result.summary.skills.complete).toBe(11);
  });

  it('should count instructions, hooks, and prompts', async () => {
    await setupMinimalValidOutput();

    const result = await activate({ configPath: FIXTURE_CONFIG, githubDir });

    expect(result.summary.instructions.valid).toBe(4);
    expect(result.summary.hooks.valid).toBe(1);
    expect(result.summary.prompts.valid).toBe(4);
  });

  it('should detect empty agent files', async () => {
    await setupMinimalValidOutput();
    await writeGithubFile('agents/backend-agent.agent.md', '');

    const result = await activate({ configPath: FIXTURE_CONFIG, githubDir });

    expect(result.passed).toBe(false);
    expect(result.errors.some((e) => e.message.includes('empty'))).toBe(true);
  });
});
