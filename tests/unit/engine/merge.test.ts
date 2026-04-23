import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { computeMergeDecisions, summarizeMerge } from '../../../src/engine/merge.js';
import { saveSnapshot } from '../../../src/engine/snapshot.js';
import type { GeneratedFile } from '../../../src/engine/writer.js';
import type { MaoConfig } from '../../../src/config/types.js';

const minimalConfig = {
  project: { name: 'Test', description: 'Test', type: 'mvp' as const },
  stack: { preset: 'react-express' as const },
  agents: ['orchestrator', 'backend'] as MaoConfig['agents'],
  phases: [{ name: 'P1', description: 'D', agents: ['backend' as const], order: 1 }],
  entities: [],
  custom_skills: [
    {
      name: 'billing',
      description: 'Billing logic',
      agents: ['backend' as const],
      references: ['stripe.md'],
    },
  ],
  community_skills: [],
  merge_strategy: 'preserve-custom' as const,
} satisfies MaoConfig;

describe('merge engine', () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(path.join(tmpdir(), 'mao-merge-'));
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  async function writeDiskFile(relativePath: string, content: string) {
    const fullPath = path.join(outputDir, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  it('should create new files that do not exist on disk or in snapshot', async () => {
    const newFiles: GeneratedFile[] = [{ path: 'agents/new-agent.md', content: 'new content' }];

    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    expect(result.created).toBe(1);
    expect(decisions[0]?.action).toBe('create');
  });

  it('should skip files with no changes (A=A=A)', async () => {
    const content = 'unchanged content';
    const files: GeneratedFile[] = [{ path: 'agents/backend.md', content }];

    // Save snapshot and write disk file with same content
    await saveSnapshot(files, outputDir);
    await writeDiskFile('agents/backend.md', content);

    const decisions = await computeMergeDecisions(
      files,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    expect(result.skipped).toBe(1);
    expect(decisions[0]?.action).toBe('skip');
    expect(decisions[0]?.reason).toContain('No changes');
  });

  it('should overwrite when user unchanged but template updated (A=A, new=B)', async () => {
    const original = 'original content';
    const updated = 'updated content';

    await saveSnapshot([{ path: 'agents/backend.md', content: original }], outputDir);
    await writeDiskFile('agents/backend.md', original);

    const newFiles: GeneratedFile[] = [{ path: 'agents/backend.md', content: updated }];
    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    expect(result.overwritten).toBe(1);
    expect(decisions[0]?.action).toBe('overwrite');
    expect(decisions[0]?.newContent).toBe(updated);
  });

  it('should skip when user customized but template unchanged (A→B, new=A)', async () => {
    const original = 'original content';
    const userEdited = 'user edited this';

    await saveSnapshot([{ path: 'agents/backend.md', content: original }], outputDir);
    await writeDiskFile('agents/backend.md', userEdited);

    const newFiles: GeneratedFile[] = [{ path: 'agents/backend.md', content: original }];
    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    expect(result.skipped).toBe(1);
    expect(decisions[0]?.reason).toContain('User customized');
  });

  it('should preserve user version on conflict with preserve-custom strategy', async () => {
    const original = 'original';
    const userEdited = 'user version';
    const templateUpdated = 'template version';

    await saveSnapshot([{ path: 'agents/backend.md', content: original }], outputDir);
    await writeDiskFile('agents/backend.md', userEdited);

    const newFiles: GeneratedFile[] = [{ path: 'agents/backend.md', content: templateUpdated }];
    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    expect(result.skipped).toBe(1);
    expect(decisions[0]?.reason).toContain('preserving user version');
  });

  it('should overwrite on conflict with overwrite strategy', async () => {
    const original = 'original';
    const userEdited = 'user version';
    const templateUpdated = 'template version';

    await saveSnapshot([{ path: 'agents/backend.md', content: original }], outputDir);
    await writeDiskFile('agents/backend.md', userEdited);

    const newFiles: GeneratedFile[] = [{ path: 'agents/backend.md', content: templateUpdated }];
    const decisions = await computeMergeDecisions(newFiles, outputDir, 'overwrite', minimalConfig);
    const result = summarizeMerge(decisions);

    expect(result.overwritten).toBe(1);
    expect(decisions[0]?.action).toBe('overwrite');
  });

  it('should flag conflict with prompt strategy', async () => {
    const original = 'original';
    const userEdited = 'user version';
    const templateUpdated = 'template version';

    await saveSnapshot([{ path: 'agents/backend.md', content: original }], outputDir);
    await writeDiskFile('agents/backend.md', userEdited);

    const newFiles: GeneratedFile[] = [{ path: 'agents/backend.md', content: templateUpdated }];
    const decisions = await computeMergeDecisions(newFiles, outputDir, 'prompt', minimalConfig);
    const result = summarizeMerge(decisions);

    expect(result.conflicts).toBe(1);
    expect(decisions[0]?.action).toBe('conflict');
    expect(decisions[0]?.newContent).toBe(templateUpdated);
    expect(decisions[0]?.diskContent).toBe(userEdited);
  });

  it('should respect user deletion when template unchanged', async () => {
    const original = 'original content';

    await saveSnapshot([{ path: 'agents/old.md', content: original }], outputDir);
    // Don't write disk file — simulates user deletion

    const newFiles: GeneratedFile[] = [{ path: 'agents/old.md', content: original }];
    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );

    expect(decisions[0]?.action).toBe('skip');
    expect(decisions[0]?.reason).toContain('respecting deletion');
  });

  it('should warn when user deleted but template updated', async () => {
    const original = 'original content';
    const updated = 'updated content';

    await saveSnapshot([{ path: 'agents/old.md', content: original }], outputDir);

    const newFiles: GeneratedFile[] = [{ path: 'agents/old.md', content: updated }];
    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    expect(result.warnings).toBe(1);
    expect(decisions[0]?.action).toBe('warn');
  });

  it('should always preserve custom skill references', async () => {
    const original = '# Original stub';
    const userEnriched = '# Enriched with real billing logic from PRD';
    const templateRegenerated = '# Re-generated stub';

    // Set up: snapshot has stub, user enriched it
    await saveSnapshot(
      [{ path: 'skills/billing/references/stripe.md', content: original }],
      outputDir,
    );
    await writeDiskFile('skills/billing/references/stripe.md', userEnriched);

    // Even with overwrite strategy, custom skill references are preserved
    const newFiles: GeneratedFile[] = [
      { path: 'skills/billing/references/stripe.md', content: templateRegenerated },
    ];
    const decisions = await computeMergeDecisions(newFiles, outputDir, 'overwrite', minimalConfig);

    expect(decisions[0]?.action).toBe('skip');
    expect(decisions[0]?.reason).toContain('Custom skill reference');

    // Verify file wasn't touched
    const disk = await readFile(
      path.join(outputDir, 'skills/billing/references/stripe.md'),
      'utf-8',
    );
    expect(disk).toBe(userEnriched);
  });

  it('should handle mixed scenarios correctly', async () => {
    // Set up snapshot with 3 files
    const snapshot: GeneratedFile[] = [
      { path: 'agents/orchestrator.md', content: 'old orchestrator' },
      { path: 'agents/backend.md', content: 'backend content' },
      { path: 'skills/api/SKILL.md', content: 'api skill' },
    ];
    await saveSnapshot(snapshot, outputDir);

    // Disk: orchestrator modified, backend untouched, api skill deleted
    await writeDiskFile('agents/orchestrator.md', 'user customized orchestrator');
    await writeDiskFile('agents/backend.md', 'backend content');

    // New gen: orchestrator updated, backend same, api skill same, new frontend added
    const newFiles: GeneratedFile[] = [
      { path: 'agents/orchestrator.md', content: 'new orchestrator template' },
      { path: 'agents/backend.md', content: 'backend content' },
      { path: 'skills/api/SKILL.md', content: 'api skill' },
      { path: 'agents/frontend.md', content: 'new frontend agent' },
    ];

    const decisions = await computeMergeDecisions(
      newFiles,
      outputDir,
      'preserve-custom',
      minimalConfig,
    );
    const result = summarizeMerge(decisions);

    // orchestrator: A→B, new=C → skip (preserve-custom)
    const orch = decisions.find((d) => d.filePath === 'agents/orchestrator.md');
    expect(orch?.action).toBe('skip');

    // backend: A=A=A → skip
    const back = decisions.find((d) => d.filePath === 'agents/backend.md');
    expect(back?.action).toBe('skip');

    // api skill: A, deleted, A → skip (respect deletion)
    const api = decisions.find((d) => d.filePath === 'skills/api/SKILL.md');
    expect(api?.action).toBe('skip');

    // frontend: new → create
    const front = decisions.find((d) => d.filePath === 'agents/frontend.md');
    expect(front?.action).toBe('create');

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(3);
  });
});
