/**
 * Stack auto-detection — infer stack configuration from project files.
 *
 * Milestone 2D: Reads package.json, requirements.txt, pyproject.toml,
 * prisma/schema.prisma, tsconfig.json, Dockerfile, etc. to produce
 * a partial config that the Analyzer can merge with PRD-extracted data.
 */

import { readFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Standalone interface for detected stack info.
 * Intentionally decoupled from MaoConfigInput since detection
 * produces partial results where every field is optional.
 */
export interface DetectedStack {
  stack?: {
    preset?: string;
    frontend?: {
      framework?: string;
      language?: string;
      styling?: string;
      state_management?: string;
      component_library?: string;
    };
    backend?: {
      framework?: string;
      language?: string;
      api_type?: string;
    };
    database?: {
      provider?: string;
      orm?: string;
    };
    auth?: {
      strategy?: string;
      providers?: string[];
      session?: string;
    };
    testing?: {
      unit?: string;
      e2e?: string;
    };
    deployment?: {
      platform?: string;
    };
  };
  agents?: string[];
}

export interface DetectionResult {
  /** Partial config inferred from project files */
  detected: DetectedStack;
  /** Human-readable list of what was detected and why */
  evidence: string[];
}

// ─── Helpers ───

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function hasDep(pkg: Record<string, unknown>, name: string): boolean {
  const deps = pkg.dependencies as Record<string, string> | undefined;
  const devDeps = pkg.devDependencies as Record<string, string> | undefined;
  return !!(deps?.[name] || devDeps?.[name]);
}

function hasAnyDep(pkg: Record<string, unknown>, names: string[]): string | null {
  for (const name of names) {
    if (hasDep(pkg, name)) return name;
  }
  return null;
}

// ─── Detectors ───

function detectFrontend(
  pkg: Record<string, unknown>,
  evidence: string[],
): NonNullable<DetectedStack['stack']> {
  const result: NonNullable<DetectedStack['stack']> = {};

  // Framework
  if (hasDep(pkg, 'next')) {
    result.frontend = { ...result.frontend, framework: 'nextjs' as const };
    evidence.push('Detected Next.js from package.json dependency "next"');
  } else if (hasDep(pkg, 'react')) {
    result.frontend = { ...result.frontend, framework: 'react' as const };
    evidence.push('Detected React from package.json dependency "react"');
  } else if (hasDep(pkg, 'vue')) {
    result.frontend = { ...result.frontend, framework: 'vue' as const };
    evidence.push('Detected Vue from package.json dependency "vue"');
  } else if (hasDep(pkg, '@angular/core')) {
    result.frontend = { ...result.frontend, framework: 'angular' as const };
    evidence.push('Detected Angular from package.json dependency "@angular/core"');
  } else if (hasDep(pkg, 'svelte')) {
    result.frontend = { ...result.frontend, framework: 'svelte' as const };
    evidence.push('Detected Svelte from package.json dependency "svelte"');
  }

  // Language (if TypeScript detected, we know the language)
  if (hasDep(pkg, 'typescript')) {
    if (result.frontend) {
      result.frontend.language = 'typescript' as const;
    }
    evidence.push('Detected TypeScript from package.json dependency "typescript"');
  }

  // Styling
  if (hasDep(pkg, 'tailwindcss')) {
    if (result.frontend) result.frontend.styling = 'tailwindcss' as const;
    evidence.push('Detected Tailwind CSS from package.json dependency "tailwindcss"');
  } else if (hasDep(pkg, 'styled-components')) {
    if (result.frontend) result.frontend.styling = 'styled-components' as const;
    evidence.push('Detected styled-components from package.json');
  } else if (hasDep(pkg, 'sass')) {
    if (result.frontend) result.frontend.styling = 'sass' as const;
    evidence.push('Detected Sass from package.json dependency "sass"');
  }

  // State management
  if (hasDep(pkg, '@tanstack/react-query')) {
    if (result.frontend) result.frontend.state_management = 'tanstack-query' as const;
    evidence.push('Detected TanStack Query from package.json');
  } else if (hasDep(pkg, '@reduxjs/toolkit') || hasDep(pkg, 'redux')) {
    if (result.frontend) result.frontend.state_management = 'redux' as const;
    evidence.push('Detected Redux from package.json');
  } else if (hasDep(pkg, 'zustand')) {
    if (result.frontend) result.frontend.state_management = 'zustand' as const;
    evidence.push('Detected Zustand from package.json');
  } else if (hasDep(pkg, 'pinia')) {
    if (result.frontend) result.frontend.state_management = 'pinia' as const;
    evidence.push('Detected Pinia from package.json');
  }

  // Component library
  if (hasDep(pkg, '@mui/material')) {
    if (result.frontend) result.frontend.component_library = 'mui' as const;
    evidence.push('Detected MUI from package.json');
  } else if (hasDep(pkg, 'antd')) {
    if (result.frontend) result.frontend.component_library = 'ant-design' as const;
    evidence.push('Detected Ant Design from package.json');
  }

  return result;
}

function detectBackend(
  pkg: Record<string, unknown>,
  evidence: string[],
): NonNullable<DetectedStack['stack']> {
  const result: NonNullable<DetectedStack['stack']> = {};

  if (hasDep(pkg, 'express')) {
    result.backend = {
      framework: 'express' as const,
      language: hasDep(pkg, 'typescript') ? ('typescript' as const) : ('javascript' as const),
    };
    evidence.push('Detected Express from package.json dependency "express"');
  } else if (hasDep(pkg, '@nestjs/core')) {
    result.backend = {
      framework: 'nestjs' as const,
      language: 'typescript' as const,
    };
    evidence.push('Detected NestJS from package.json dependency "@nestjs/core"');
  }

  // API type
  const graphql = hasAnyDep(pkg, ['graphql', 'apollo-server', '@apollo/server', 'type-graphql']);
  if (graphql && result.backend) {
    result.backend.api_type = 'graphql' as const;
    evidence.push(`Detected GraphQL API from package.json dependency "${graphql}"`);
  }

  return result;
}

function detectDatabase(
  pkg: Record<string, unknown>,
  evidence: string[],
): NonNullable<DetectedStack['stack']> {
  const result: NonNullable<DetectedStack['stack']> = {};

  // ORM detection
  if (hasDep(pkg, '@prisma/client') || hasDep(pkg, 'prisma')) {
    result.database = { orm: 'prisma' as const };
    evidence.push('Detected Prisma ORM from package.json');
  } else if (hasDep(pkg, 'typeorm')) {
    result.database = { orm: 'typeorm' as const };
    evidence.push('Detected TypeORM from package.json');
  } else if (hasDep(pkg, 'drizzle-orm')) {
    result.database = { orm: 'drizzle' as const };
    evidence.push('Detected Drizzle ORM from package.json');
  } else if (hasDep(pkg, 'mongoose')) {
    result.database = { provider: 'mongodb' as const, orm: 'mongoose' as const };
    evidence.push('Detected Mongoose (MongoDB) from package.json');
  }

  return result;
}

function detectAuth(
  pkg: Record<string, unknown>,
  evidence: string[],
): NonNullable<DetectedStack['stack']> {
  const result: NonNullable<DetectedStack['stack']> = {};

  if (hasDep(pkg, '@clerk/nextjs') || hasDep(pkg, '@clerk/clerk-react')) {
    result.auth = { strategy: 'clerk' as const };
    evidence.push('Detected Clerk auth from package.json');
  } else if (hasDep(pkg, 'auth0') || hasDep(pkg, '@auth0/nextjs-auth0')) {
    result.auth = { strategy: 'auth0' as const };
    evidence.push('Detected Auth0 from package.json');
  } else if (hasDep(pkg, 'passport') || hasDep(pkg, 'passport-google-oauth20')) {
    result.auth = { strategy: 'google-oauth' as const };
    evidence.push('Detected Passport (Google OAuth) from package.json');
  }

  return result;
}

function detectTesting(
  pkg: Record<string, unknown>,
  evidence: string[],
): NonNullable<DetectedStack['stack']> {
  const result: NonNullable<DetectedStack['stack']> = {};
  const testing: { unit?: string; e2e?: string } = {};

  if (hasDep(pkg, 'vitest')) {
    testing.unit = 'vitest';
    evidence.push('Detected Vitest from package.json');
  } else if (hasDep(pkg, 'jest')) {
    testing.unit = 'jest';
    evidence.push('Detected Jest from package.json');
  }

  if (hasDep(pkg, 'playwright') || hasDep(pkg, '@playwright/test')) {
    testing.e2e = 'playwright';
    evidence.push('Detected Playwright from package.json');
  } else if (hasDep(pkg, 'cypress')) {
    testing.e2e = 'cypress';
    evidence.push('Detected Cypress from package.json');
  }

  if (testing.unit || testing.e2e) {
    result.testing = testing;
  }

  return result;
}

async function detectPrismaProvider(
  projectDir: string,
  evidence: string[],
): Promise<string | null> {
  const schemaPath = path.join(projectDir, 'prisma', 'schema.prisma');
  const content = await readTextFile(schemaPath);
  if (!content) return null;

  evidence.push('Found prisma/schema.prisma');

  const providerMatch = content.match(
    /provider\s*=\s*"(postgresql|mysql|sqlite|mongodb|sqlserver)"/,
  );
  if (providerMatch?.[1]) {
    const raw = providerMatch[1];
    // Map to our enum values
    const mapping: Record<string, string> = {
      postgresql: 'postgresql',
      mysql: 'mysql',
      sqlite: 'sqlite',
      mongodb: 'mongodb',
    };
    const mapped = mapping[raw];
    if (mapped) {
      evidence.push(`Detected database provider "${mapped}" from prisma/schema.prisma`);
      return mapped;
    }
  }

  return null;
}

async function detectPythonStack(
  projectDir: string,
  evidence: string[],
): Promise<NonNullable<DetectedStack['stack']>> {
  const result: NonNullable<DetectedStack['stack']> = {};

  // Check requirements.txt
  let deps = '';
  const reqPath = path.join(projectDir, 'requirements.txt');
  const reqContent = await readTextFile(reqPath);
  if (reqContent) {
    deps = reqContent;
    evidence.push('Found requirements.txt');
  }

  // Check pyproject.toml
  const pyprojectPath = path.join(projectDir, 'pyproject.toml');
  const pyprojectContent = await readTextFile(pyprojectPath);
  if (pyprojectContent) {
    deps += '\n' + pyprojectContent;
    evidence.push('Found pyproject.toml');
  }

  if (!deps) return result;

  // Backend framework
  if (/\bfastapi\b/i.test(deps)) {
    result.backend = { framework: 'fastapi' as const, language: 'python' as const };
    evidence.push('Detected FastAPI from Python dependencies');
  } else if (/\bdjango\b/i.test(deps)) {
    result.backend = { framework: 'django' as const, language: 'python' as const };
    evidence.push('Detected Django from Python dependencies');
  }

  // ORM
  if (/\bsqlalchemy\b/i.test(deps)) {
    result.database = { orm: 'sqlalchemy' as const };
    evidence.push('Detected SQLAlchemy from Python dependencies');
  }

  return result;
}

function inferPreset(detected: DetectedStack): string | null {
  const frontend = detected.stack?.frontend?.framework;
  const backend = detected.stack?.backend?.framework;

  if (frontend === 'react' && backend === 'express') return 'react-express';
  if (frontend === 'nextjs') return 'nextjs';
  if (frontend === 'vue' && (backend === 'express' || backend === 'nestjs')) return 'vue-node';
  if (frontend === 'react' && (backend === 'fastapi' || backend === 'django'))
    return 'react-python';

  return null;
}

function inferAgents(detected: DetectedStack): string[] {
  const agents: string[] = ['orchestrator'];

  if (detected.stack?.database) agents.push('database');
  if (detected.stack?.backend) agents.push('backend');
  if (detected.stack?.frontend) agents.push('frontend');
  if (detected.stack?.auth) agents.push('auth');

  // Always include QA if we detected a testing framework
  if (detected.stack?.testing) agents.push('qa');

  return agents;
}

// ─── Main Detection ───

/**
 * Detect stack configuration from existing project files.
 *
 * Scans `projectDir` for package.json, requirements.txt, pyproject.toml,
 * prisma/schema.prisma, tsconfig.json, Dockerfile, and CI workflows
 * to produce a partial MaoConfigInput.
 *
 * @param projectDir - Root directory of the project to analyze
 * @returns Detection result with partial config and evidence trail
 */
export async function detectStack(projectDir: string): Promise<DetectionResult> {
  const evidence: string[] = [];
  let detected: DetectedStack = {};

  // ── Node.js / package.json ──
  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = await readJsonFile(pkgPath);

  if (pkg) {
    evidence.push('Found package.json');

    const frontendStack = detectFrontend(pkg, evidence);
    const backendStack = detectBackend(pkg, evidence);
    const databaseStack = detectDatabase(pkg, evidence);
    const authStack = detectAuth(pkg, evidence);
    const testingStack = detectTesting(pkg, evidence);

    // Merge all stack detections
    detected.stack = {
      ...frontendStack,
      ...backendStack,
      ...databaseStack,
      ...authStack,
      ...testingStack,
    };

    // Merge nested objects (spread doesn't deep-merge)
    if (frontendStack.frontend) {
      detected.stack.frontend = { ...detected.stack.frontend, ...frontendStack.frontend };
    }
    if (backendStack.backend) {
      detected.stack.backend = { ...detected.stack.backend, ...backendStack.backend };
    }
    if (databaseStack.database) {
      detected.stack.database = { ...detected.stack.database, ...databaseStack.database };
    }
    if (authStack.auth) {
      detected.stack.auth = { ...detected.stack.auth, ...authStack.auth };
    }
    if (testingStack.testing) {
      detected.stack.testing = { ...detected.stack.testing, ...testingStack.testing };
    }
  }

  // ── Python stack ──
  const pythonStack = await detectPythonStack(projectDir, evidence);
  if (pythonStack.backend || pythonStack.database) {
    detected.stack = {
      ...detected.stack,
      ...pythonStack,
    };
  }

  // ── Prisma schema (database provider) ──
  const prismaProvider = await detectPrismaProvider(projectDir, evidence);
  if (prismaProvider && detected.stack?.database) {
    detected.stack.database = {
      ...detected.stack.database,
      provider: prismaProvider,
    };
  }

  // ── tsconfig.json (TypeScript presence) ──
  const hasTsConfig = await fileExists(path.join(projectDir, 'tsconfig.json'));
  if (hasTsConfig) {
    evidence.push('Found tsconfig.json — TypeScript project');
    if (detected.stack?.frontend && !detected.stack.frontend.language) {
      detected.stack.frontend.language = 'typescript' as const;
    }
    if (detected.stack?.backend && !detected.stack.backend.language) {
      detected.stack.backend.language = 'typescript' as const;
    }
  }

  // ── Dockerfile ──
  const hasDockerfile = await fileExists(path.join(projectDir, 'Dockerfile'));
  if (hasDockerfile) {
    evidence.push('Found Dockerfile — containerized deployment');
    if (!detected.stack) detected.stack = {};
    detected.stack.deployment = { platform: 'docker' };
  }

  // ── CI/CD workflows ──
  const ghWorkflowsDir = path.join(projectDir, '.github', 'workflows');
  try {
    const entries = await readdir(ghWorkflowsDir);
    if (entries.length > 0) {
      evidence.push(`Found ${entries.length} GitHub Actions workflow(s) in .github/workflows/`);
    }
  } catch {
    // No workflows directory — that's fine
  }

  // ── Infer preset from detected stack ──
  const preset = inferPreset(detected);
  if (preset) {
    detected.stack = { ...detected.stack, preset };
    evidence.push(`Inferred preset "${preset}" from detected frontend + backend combination`);
  }

  // ── Infer agents from detected stack ──
  const agents = inferAgents(detected);
  if (agents.length > 1) {
    detected.agents = agents;
    evidence.push(`Inferred ${agents.length} agent(s): ${agents.join(', ')}`);
  }

  return { detected, evidence };
}
