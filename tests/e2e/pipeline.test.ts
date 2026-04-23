import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { scaffold } from '../../src/engine/scaffold.js';
import { activate } from '../../src/engine/validator.js';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../fixtures');
const catalogDir = path.resolve(__dirname, '../../catalog');

describe('E2E: Full Pipeline — scaffold + validate', () => {
  let outputDir: string;
  const configPath = path.join(fixturesDir, 'sample-config-fullstack.yaml');

  beforeAll(async () => {
    outputDir = await mkdtemp(path.join(tmpdir(), 'mao-e2e-'));
  });

  afterAll(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it('should scaffold all files from real catalog + config', async () => {
    const result = await scaffold({
      configPath,
      outputDir,
      catalogDir,
      verbose: true,
    });

    // Should render catalog templates + custom skill stubs
    expect(result.totalGenerated).toBeGreaterThan(10);
    expect(result.skipped).toHaveLength(0);
  });

  it('should generate all 6 agent files', async () => {
    const agentsDir = path.join(outputDir, 'agents');
    const agents = await readdir(agentsDir);
    expect(agents).toContain('orchestrator.agent.md');
    expect(agents).toContain('database-agent.agent.md');
    expect(agents).toContain('backend-agent.agent.md');
    expect(agents).toContain('frontend-agent.agent.md');
    expect(agents).toContain('auth-agent.agent.md');
    expect(agents).toContain('qa-agent.agent.md');
  });

  it('should render orchestrator with project name and agent list', async () => {
    const content = await readFile(path.join(outputDir, 'agents/orchestrator.agent.md'), 'utf-8');
    expect(content).toContain('TaskForge');
    expect(content).toContain('backend-agent');
    expect(content).toContain('frontend-agent');
    expect(content).toContain('Delegation Protocol');
  });

  it('should render backend agent with correct stack', async () => {
    const content = await readFile(path.join(outputDir, 'agents/backend-agent.agent.md'), 'utf-8');
    expect(content).toContain('express');
    expect(content).toContain('typescript');
  });

  it('should generate skill directories with SKILL.md files', async () => {
    const skillsDir = path.join(outputDir, 'skills');
    const skills = await readdir(skillsDir);
    // Base skills + preset skills + custom skills
    expect(skills.length).toBeGreaterThan(5);
  });

  it('should generate custom skill stubs with enrichment markers', async () => {
    const taskNumbering = await readFile(
      path.join(outputDir, 'skills/task-numbering/SKILL.md'),
      'utf-8',
    );
    expect(taskNumbering).toContain('ENRICHMENT WILL FILL THIS');
    expect(taskNumbering).toContain('task-numbering');
  });

  it('should generate instruction files', async () => {
    const instrDir = path.join(outputDir, 'instructions');
    const files = await readdir(instrDir);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should generate prompt files', async () => {
    const promptsDir = path.join(outputDir, 'prompts');
    const files = await readdir(promptsDir);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should generate copilot-instructions.md with project context', async () => {
    const content = await readFile(path.join(outputDir, 'copilot-instructions.md'), 'utf-8');
    expect(content).toContain('TaskForge');
    expect(content).toContain('react-express');
  });

  it('should save a snapshot for future merge', async () => {
    const snapshotDir = path.join(outputDir, '.mao/generated');
    const snapshot = await readdir(snapshotDir);
    expect(snapshot.length).toBeGreaterThan(0);
  });

  it('should pass activation validation (with warnings for enrichment markers)', async () => {
    const result = await activate({
      configPath,
      githubDir: outputDir,
      verbose: true,
    });

    // Should pass (no structural errors)
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary.agents.valid).toBe(6);
    expect(result.summary.agents.total).toBe(6);
    // Enrichment markers are warnings, not errors
    expect(result.summary.enrichmentMarkers).toBeGreaterThan(0);
  });
});
