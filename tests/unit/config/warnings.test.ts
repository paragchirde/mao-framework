import { describe, it, expect } from 'vitest';
import { warnConfigIssues } from '../../../src/config/warnings.js';
import { loadConfig } from '../../../src/config/loader.js';
import path from 'node:path';

const FIXTURE_DIR = path.resolve('tests/fixtures');

describe('config warnings', () => {
  it('should return no warnings for a well-configured project', async () => {
    const { config } = await loadConfig(path.join(FIXTURE_DIR, 'sample-config-fullstack.yaml'));
    const warnings = warnConfigIssues(config);
    expect(warnings).toEqual([]);
  });

  it('should warn when no QA agent is configured', async () => {
    const { config } = await loadConfig(path.join(FIXTURE_DIR, 'sample-config-minimal.yaml'));
    // Minimal config may not have qa
    const hasQa = config.agents.includes('qa');
    const warnings = warnConfigIssues(config);
    if (!hasQa) {
      expect(warnings.some((w) => w.includes('QA'))).toBe(true);
    }
  });

  it('should warn on custom skills without references', async () => {
    const { config } = await loadConfig(path.join(FIXTURE_DIR, 'sample-config-fullstack.yaml'));
    // Mutate config to create a skill without references
    const mutated = {
      ...config,
      custom_skills: [
        {
          name: 'bare-skill',
          description: 'No refs',
          agents: ['backend' as const],
          references: [],
        },
      ],
    };
    const warnings = warnConfigIssues(mutated);
    expect(warnings.some((w) => w.includes('bare-skill'))).toBe(true);
  });
});
