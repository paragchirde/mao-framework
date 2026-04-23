import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileExists, ensureDir, readFileOrNull, writeFileWithDir } from '../../../src/utils/fs.js';

describe('fs utilities', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'mao-fs-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const f = path.join(tmpDir, 'exists.txt');
      await writeFile(f, 'hello', 'utf-8');
      expect(await fileExists(f)).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      expect(await fileExists(path.join(tmpDir, 'nope.txt'))).toBe(false);
    });

    it('should return true for existing directory', async () => {
      const d = path.join(tmpDir, 'subdir');
      await mkdir(d);
      expect(await fileExists(d)).toBe(true);
    });
  });

  describe('ensureDir', () => {
    it('should create nested directories', async () => {
      const nested = path.join(tmpDir, 'a', 'b', 'c');
      await ensureDir(nested);
      expect(await fileExists(nested)).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      await ensureDir(tmpDir);
      expect(await fileExists(tmpDir)).toBe(true);
    });
  });

  describe('readFileOrNull', () => {
    it('should read existing file', async () => {
      const f = path.join(tmpDir, 'data.txt');
      await writeFile(f, 'content', 'utf-8');
      expect(await readFileOrNull(f)).toBe('content');
    });

    it('should return null for missing file', async () => {
      expect(await readFileOrNull(path.join(tmpDir, 'missing.txt'))).toBeNull();
    });
  });

  describe('writeFileWithDir', () => {
    it('should write file and create parent dirs', async () => {
      const f = path.join(tmpDir, 'x', 'y', 'file.md');
      await writeFileWithDir(f, '# Hello');
      expect(await readFileOrNull(f)).toBe('# Hello');
    });
  });
});
