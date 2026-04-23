import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  saveSnapshot,
  loadSnapshot,
  hasSnapshot,
  loadAllSnapshots,
} from '../../../src/engine/snapshot.js';

describe('snapshot manager', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(path.join(tmpdir(), 'mao-snapshot-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('should save and load a snapshot file', async () => {
    const files = [{ path: 'agents/backend.md', content: 'backend content' }];
    await saveSnapshot(files, baseDir);

    const loaded = await loadSnapshot('agents/backend.md', baseDir);
    expect(loaded).toBe('backend content');
  });

  it('should save multiple files', async () => {
    const files = [
      { path: 'agents/backend.md', content: 'backend' },
      { path: 'skills/api/SKILL.md', content: 'api skill' },
      { path: 'prompts/start.md', content: 'start prompt' },
    ];
    await saveSnapshot(files, baseDir);

    expect(await loadSnapshot('agents/backend.md', baseDir)).toBe('backend');
    expect(await loadSnapshot('skills/api/SKILL.md', baseDir)).toBe('api skill');
    expect(await loadSnapshot('prompts/start.md', baseDir)).toBe('start prompt');
  });

  it('should return null for non-existent snapshot', async () => {
    const loaded = await loadSnapshot('nonexistent.md', baseDir);
    expect(loaded).toBeNull();
  });

  it('should detect when no snapshot exists', async () => {
    expect(await hasSnapshot(baseDir)).toBe(false);
  });

  it('should detect when snapshot exists', async () => {
    await saveSnapshot([{ path: 'test.md', content: 'content' }], baseDir);
    expect(await hasSnapshot(baseDir)).toBe(true);
  });

  it('should load all snapshots', async () => {
    const files = [
      { path: 'agents/a.md', content: 'a' },
      { path: 'agents/b.md', content: 'b' },
      { path: 'skills/c/SKILL.md', content: 'c' },
    ];
    await saveSnapshot(files, baseDir);

    const all = await loadAllSnapshots(baseDir);
    expect(all.length).toBe(3);

    const paths = all.map((f) => f.path).sort();
    expect(paths).toEqual(['agents/a.md', 'agents/b.md', 'skills/c/SKILL.md']);
  });

  it('should return empty array when no snapshots exist', async () => {
    const all = await loadAllSnapshots(baseDir);
    expect(all).toEqual([]);
  });

  it('should preserve file content exactly', async () => {
    const content = '# Title\n\n```ts\nconst x = 1;\n```\n\nEnd.\n';
    await saveSnapshot([{ path: 'test.md', content }], baseDir);
    const loaded = await loadSnapshot('test.md', baseDir);
    expect(loaded).toBe(content);
  });
});
