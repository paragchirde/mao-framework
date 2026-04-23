import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { scaffold } from '../../../src/engine/scaffold.js';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('scaffold pipeline', () => {
  let outputDir: string;
  const fixturesDir = path.resolve(__dirname, '../../fixtures');
  const configPath = path.join(fixturesDir, 'sample-config-fullstack.yaml');

  // Use an empty catalog so we only test the pipeline flow + custom stubs
  let emptyCatalogDir: string;

  beforeAll(async () => {
    outputDir = await mkdtemp(path.join(tmpdir(), 'mao-scaffold-'));
    emptyCatalogDir = await mkdtemp(path.join(tmpdir(), 'mao-catalog-'));
  });

  afterAll(async () => {
    await rm(outputDir, { recursive: true, force: true });
    await rm(emptyCatalogDir, { recursive: true, force: true });
  });

  it('should scaffold custom skill stubs from config', async () => {
    const result = await scaffold({
      configPath,
      outputDir,
      catalogDir: emptyCatalogDir,
      verbose: true,
    });

    // Custom stubs should be generated (the fullstack config has custom_skills)
    expect(result.totalGenerated).toBeGreaterThan(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('should write files to the output directory', async () => {
    // At least one custom skill stub should exist
    const files = await import('node:fs/promises').then((fs) =>
      fs.readdir(path.join(outputDir, 'skills'), { recursive: true }),
    );
    expect(files.length).toBeGreaterThan(0);
  });

  it('should save a snapshot', async () => {
    await access(path.join(outputDir, '.mao/generated'));
    // If no error, snapshot directory exists
    expect(true).toBe(true);
  });

  it('should support dry-run mode', async () => {
    const dryDir = path.join(outputDir, 'dry-run-test');
    const result = await scaffold({
      configPath,
      outputDir: dryDir,
      catalogDir: emptyCatalogDir,
      dryRun: true,
    });

    expect(result.totalGenerated).toBeGreaterThan(0);

    // Should NOT have written files
    await expect(access(dryDir)).rejects.toThrow();
  });

  it('should throw on NEEDS_REVIEW config', async () => {
    const needsReviewConfig = path.join(fixturesDir, 'sample-config-needs-review.yaml');
    await expect(
      scaffold({
        configPath: needsReviewConfig,
        outputDir,
        catalogDir: emptyCatalogDir,
      }),
    ).rejects.toThrow('NEEDS_REVIEW');
  });
});
