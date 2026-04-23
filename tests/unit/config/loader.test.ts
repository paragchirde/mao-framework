import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { loadConfig, ConfigValidationError, detectNeedsReview } from '../../../src/config/loader.js';

const fixturesDir = path.resolve('tests/fixtures');

describe('loadConfig', () => {
  it('should load and validate a full config', async () => {
    const result = await loadConfig(path.join(fixturesDir, 'sample-config-fullstack.yaml'));
    expect(result.config.project.name).toBe('TaskForge');
    expect(result.config.stack.preset).toBe('react-express');
    expect(result.config.agents).toContain('orchestrator');
    expect(result.config.entities.length).toBeGreaterThan(0);
    expect(result.config.custom_skills.length).toBeGreaterThan(0);
    expect(result.hasNeedsReview).toBe(false);
  });

  it('should load a minimal config', async () => {
    const result = await loadConfig(path.join(fixturesDir, 'sample-config-minimal.yaml'));
    expect(result.config.project.name).toBe('QuickPOC');
    expect(result.config.agents).toContain('orchestrator');
    expect(result.hasNeedsReview).toBe(false);
  });

  it('should detect NEEDS_REVIEW flags (even when validation fails)', async () => {
    const raw = await readFile(path.join(fixturesDir, 'sample-config-needs-review.yaml'), 'utf-8');
    const locations = detectNeedsReview(raw);
    expect(locations.length).toBeGreaterThan(0);
    expect(locations.some((l) => l.includes('NEEDS_REVIEW'))).toBe(true);

    // The config itself fails validation because NEEDS_REVIEW strings aren't valid enums
    await expect(
      loadConfig(path.join(fixturesDir, 'sample-config-needs-review.yaml')),
    ).rejects.toThrow(ConfigValidationError);
  });

  it('should throw ConfigValidationError for invalid config', async () => {
    await expect(
      loadConfig(path.join(fixturesDir, 'sample-config-invalid.yaml')),
    ).rejects.toThrow(ConfigValidationError);
  });

  it('should throw for non-existent file', async () => {
    await expect(loadConfig('nonexistent.yaml')).rejects.toThrow();
  });

  it('should include raw YAML in result', async () => {
    const result = await loadConfig(path.join(fixturesDir, 'sample-config-fullstack.yaml'));
    expect(result.rawYaml).toContain('TaskForge');
  });
});
