import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { hashContent, readDiskFile, collectDiskFiles } from '../../../src/utils/git.js';

describe('git utilities', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'mao-git-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('hashContent', () => {
    it('should return a 16-char hex string', () => {
      const hash = hashContent('hello world');
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should return same hash for same content', () => {
      expect(hashContent('test')).toBe(hashContent('test'));
    });

    it('should return different hash for different content', () => {
      expect(hashContent('a')).not.toBe(hashContent('b'));
    });
  });

  describe('readDiskFile', () => {
    it('should read existing file', async () => {
      const f = path.join(tmpDir, 'file.md');
      await writeFile(f, 'content', 'utf-8');
      expect(await readDiskFile(f)).toBe('content');
    });

    it('should return null for missing file', async () => {
      expect(await readDiskFile(path.join(tmpDir, 'nope.md'))).toBeNull();
    });
  });

  describe('collectDiskFiles', () => {
    it('should collect all files recursively', async () => {
      await mkdir(path.join(tmpDir, 'sub'), { recursive: true });
      await writeFile(path.join(tmpDir, 'a.txt'), 'A', 'utf-8');
      await writeFile(path.join(tmpDir, 'sub', 'b.txt'), 'B', 'utf-8');

      const files = await collectDiskFiles(tmpDir);
      expect(files.get('a.txt')).toBe('A');
      expect(files.get('sub/b.txt')).toBe('B');
    });

    it('should skip .mao directories', async () => {
      await mkdir(path.join(tmpDir, '.mao'), { recursive: true });
      await writeFile(path.join(tmpDir, '.mao', 'snap.json'), '{}', 'utf-8');
      await writeFile(path.join(tmpDir, 'normal.txt'), 'ok', 'utf-8');

      const files = await collectDiskFiles(tmpDir);
      expect(files.has('.mao/snap.json')).toBe(false);
      expect(files.get('normal.txt')).toBe('ok');
    });

    it('should return empty map for non-existing directory', async () => {
      const files = await collectDiskFiles(path.join(tmpDir, 'nope'));
      expect(files.size).toBe(0);
    });
  });
});
