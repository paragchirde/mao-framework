import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { detectStack } from '../../../src/config/detect.js';

describe('stack auto-detection', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(path.join(tmpdir(), 'mao-detect-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeJson(relativePath: string, data: Record<string, unknown>) {
    const fullPath = path.join(projectDir, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async function writeText(relativePath: string, content: string) {
    const fullPath = path.join(projectDir, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  it('should detect react-express stack from package.json', async () => {
    await writeJson('package.json', {
      dependencies: {
        react: '^18.0.0',
        express: '^4.18.0',
        '@prisma/client': '^5.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
        vitest: '^1.0.0',
        tailwindcss: '^3.0.0',
      },
    });

    const { detected, evidence } = await detectStack(projectDir);

    expect(detected.stack?.frontend?.framework).toBe('react');
    expect(detected.stack?.frontend?.language).toBe('typescript');
    expect(detected.stack?.frontend?.styling).toBe('tailwindcss');
    expect(detected.stack?.backend?.framework).toBe('express');
    expect(detected.stack?.backend?.language).toBe('typescript');
    expect(detected.stack?.database?.orm).toBe('prisma');
    expect(detected.stack?.testing?.unit).toBe('vitest');
    expect(detected.stack?.preset).toBe('react-express');
    expect(detected.agents).toContain('orchestrator');
    expect(detected.agents).toContain('frontend');
    expect(detected.agents).toContain('backend');
    expect(detected.agents).toContain('database');
    expect(evidence.length).toBeGreaterThan(0);
  });

  it('should detect Next.js stack', async () => {
    await writeJson('package.json', {
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.frontend?.framework).toBe('nextjs');
    expect(detected.stack?.preset).toBe('nextjs');
  });

  it('should detect Prisma provider from schema.prisma', async () => {
    await writeJson('package.json', {
      dependencies: { '@prisma/client': '^5.0.0' },
    });
    await writeText(
      'prisma/schema.prisma',
      `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`,
    );

    const { detected, evidence } = await detectStack(projectDir);

    expect(detected.stack?.database?.orm).toBe('prisma');
    expect(detected.stack?.database?.provider).toBe('postgresql');
    expect(evidence).toContainEqual(expect.stringContaining('postgresql'));
  });

  it('should detect Python/FastAPI stack from requirements.txt', async () => {
    await writeText('requirements.txt', 'fastapi==0.104.0\nsqlalchemy==2.0.23\nuvicorn==0.24.0\n');

    const { detected, evidence } = await detectStack(projectDir);

    expect(detected.stack?.backend?.framework).toBe('fastapi');
    expect(detected.stack?.backend?.language).toBe('python');
    expect(detected.stack?.database?.orm).toBe('sqlalchemy');
    expect(evidence).toContainEqual(expect.stringContaining('FastAPI'));
  });

  it('should detect Django from pyproject.toml', async () => {
    await writeText(
      'pyproject.toml',
      `
[project]
dependencies = [
  "django>=4.2",
]
`,
    );

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.backend?.framework).toBe('django');
    expect(detected.stack?.backend?.language).toBe('python');
  });

  it('should detect auth providers', async () => {
    await writeJson('package.json', {
      dependencies: {
        react: '^18.0.0',
        '@clerk/nextjs': '^4.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.auth?.strategy).toBe('clerk');
  });

  it('should detect testing frameworks', async () => {
    await writeJson('package.json', {
      devDependencies: {
        jest: '^29.0.0',
        cypress: '^13.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.testing?.unit).toBe('jest');
    expect(detected.stack?.testing?.e2e).toBe('cypress');
    expect(detected.agents).toContain('qa');
  });

  it('should detect TypeScript from tsconfig.json', async () => {
    await writeJson('package.json', {
      dependencies: { react: '^18.0.0' },
    });
    await writeJson('tsconfig.json', { compilerOptions: { strict: true } });

    const { detected, evidence } = await detectStack(projectDir);

    expect(detected.stack?.frontend?.language).toBe('typescript');
    expect(evidence).toContainEqual(expect.stringContaining('tsconfig.json'));
  });

  it('should detect Dockerfile', async () => {
    await writeText('Dockerfile', 'FROM node:20-alpine\nWORKDIR /app\n');

    const { detected, evidence } = await detectStack(projectDir);

    expect(detected.stack?.deployment?.platform).toBe('docker');
    expect(evidence).toContainEqual(expect.stringContaining('Dockerfile'));
  });

  it('should detect GitHub Actions workflows', async () => {
    await writeText('.github/workflows/ci.yml', 'name: CI\non: push\n');

    const { evidence } = await detectStack(projectDir);

    expect(evidence).toContainEqual(expect.stringContaining('GitHub Actions'));
  });

  it('should return empty detection for bare directory', async () => {
    const { detected, evidence } = await detectStack(projectDir);

    expect(detected.stack).toBeUndefined();
    expect(detected.agents).toBeUndefined();
    expect(evidence).toHaveLength(0);
  });

  it('should detect state management libraries', async () => {
    await writeJson('package.json', {
      dependencies: {
        react: '^18.0.0',
        zustand: '^4.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.frontend?.state_management).toBe('zustand');
  });

  it('should detect component libraries', async () => {
    await writeJson('package.json', {
      dependencies: {
        react: '^18.0.0',
        '@mui/material': '^5.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.frontend?.component_library).toBe('mui');
  });

  it('should detect MongoDB/Mongoose', async () => {
    await writeJson('package.json', {
      dependencies: {
        mongoose: '^7.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.database?.provider).toBe('mongodb');
    expect(detected.stack?.database?.orm).toBe('mongoose');
  });

  it('should detect GraphQL API type', async () => {
    await writeJson('package.json', {
      dependencies: {
        express: '^4.18.0',
        '@apollo/server': '^4.0.0',
        graphql: '^16.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.stack?.backend?.framework).toBe('express');
    expect(detected.stack?.backend?.api_type).toBe('graphql');
  });

  it('should infer agents from detected stack components', async () => {
    await writeJson('package.json', {
      dependencies: {
        react: '^18.0.0',
        express: '^4.18.0',
        '@prisma/client': '^5.0.0',
        passport: '^0.7.0',
      },
      devDependencies: {
        vitest: '^1.0.0',
      },
    });

    const { detected } = await detectStack(projectDir);

    expect(detected.agents).toEqual(
      expect.arrayContaining(['orchestrator', 'database', 'backend', 'frontend', 'auth', 'qa']),
    );
  });
});
