import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { discoverCommunitySkills } from '../../../src/engine/catalog.js';

describe('community skills', () => {
  let communityDir: string;

  beforeEach(async () => {
    communityDir = await mkdtemp(path.join(tmpdir(), 'mao-community-'));
  });

  afterEach(async () => {
    await rm(communityDir, { recursive: true, force: true });
  });

  async function createSkill(name: string, files: Record<string, string>) {
    for (const [relativePath, content] of Object.entries(files)) {
      const fullPath = path.join(communityDir, name, relativePath);
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, 'utf-8');
    }
  }

  it('should discover and load community skill files', async () => {
    await createSkill('payment-processing', {
      'SKILL.md': '# Payment Processing\n\n## When to Use\nWhen handling payments.',
      'references/stripe.md': '# Stripe Integration\nUse stripe.checkout.sessions.create()',
      'manifest.yaml': 'name: payment-processing\nversion: "1.0.0"',
      'README.md': '# Payment Processing Skill',
    });

    const files = await discoverCommunitySkills(communityDir, ['payment-processing']);

    // Should include SKILL.md and references, but NOT manifest.yaml or README.md
    expect(files.length).toBe(2);
    expect(files.find((f) => f.path === 'skills/payment-processing/SKILL.md')).toBeDefined();
    expect(
      files.find((f) => f.path === 'skills/payment-processing/references/stripe.md'),
    ).toBeDefined();
    expect(files.find((f) => f.path.includes('manifest.yaml'))).toBeUndefined();
    expect(files.find((f) => f.path.includes('README.md'))).toBeUndefined();
  });

  it('should handle multiple community skills', async () => {
    await createSkill('payment', {
      'SKILL.md': '# Payment\n\nContent here.',
    });
    await createSkill('file-upload', {
      'SKILL.md': '# File Upload\n\nContent here.',
      'references/s3.md': '# S3 Upload Pattern',
    });

    const files = await discoverCommunitySkills(communityDir, ['payment', 'file-upload']);

    expect(files.length).toBe(3);
    expect(files.find((f) => f.path === 'skills/payment/SKILL.md')).toBeDefined();
    expect(files.find((f) => f.path === 'skills/file-upload/SKILL.md')).toBeDefined();
    expect(files.find((f) => f.path === 'skills/file-upload/references/s3.md')).toBeDefined();
  });

  it('should strip version suffix from skill names', async () => {
    await createSkill('file-upload', {
      'SKILL.md': '# File Upload v2\n\nUpdated content.',
    });

    const files = await discoverCommunitySkills(communityDir, ['file-upload@v2']);

    expect(files.length).toBe(1);
    expect(files[0]?.path).toBe('skills/file-upload/SKILL.md');
  });

  it('should return empty array for missing community skill', async () => {
    const files = await discoverCommunitySkills(communityDir, ['nonexistent-skill']);
    expect(files).toHaveLength(0);
  });

  it('should preserve file content exactly', async () => {
    const content = '# Detailed Pattern\n\n```typescript\nconst x = 42;\n```\n';
    await createSkill('my-skill', {
      'SKILL.md': content,
    });

    const files = await discoverCommunitySkills(communityDir, ['my-skill']);

    expect(files[0]?.content).toBe(content);
  });
});
