import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { loadConfig } from '../../../src/config/loader.js';
import { buildContext } from '../../../src/engine/context.js';
import { render } from '../../../src/engine/renderer.js';

const CATALOG_DIR = path.resolve('catalog');
const FIXTURE_CONFIG = path.resolve('tests/fixtures/sample-config-fullstack.yaml');

let context: Record<string, unknown>;

beforeAll(async () => {
  const { config } = await loadConfig(FIXTURE_CONFIG);
  context = buildContext(config) as unknown as Record<string, unknown>;
});

describe('template rendering stability', () => {
  it('should render all catalog templates without errors', async () => {
    const templates = await fg(path.join(CATALOG_DIR, '**/*.hbs'), { absolute: true });
    expect(templates.length).toBeGreaterThan(0);

    const errors: string[] = [];
    for (const templatePath of templates) {
      const source = await readFile(templatePath, 'utf-8');
      try {
        const output = render(source, context);
        // Verify no raw Handlebars artifacts remain
        if (output.includes('{{') && !output.includes('{{!')) {
          errors.push(
            `${path.relative(CATALOG_DIR, templatePath)}: Contains unrendered Handlebars "{{"`,
          );
        }
      } catch (err) {
        errors.push(`${path.relative(CATALOG_DIR, templatePath)}: ${err}`);
      }
    }

    expect(errors).toEqual([]);
  });

  it('should render all agent templates to non-empty output', async () => {
    const agentTemplates = await fg(path.join(CATALOG_DIR, 'agents', '*.hbs'), { absolute: true });
    expect(agentTemplates.length).toBe(6);

    for (const templatePath of agentTemplates) {
      const source = await readFile(templatePath, 'utf-8');
      const output = render(source, context);
      expect(
        output.trim().length,
        `${path.basename(templatePath)} should not be empty`,
      ).toBeGreaterThan(100);
    }
  });

  it('should render orchestrator with all configured agents', async () => {
    const orchPath = path.join(CATALOG_DIR, 'agents', '_orchestrator.agent.md.hbs');
    const source = await readFile(orchPath, 'utf-8');
    const output = render(source, context);

    // All non-orchestrator agents should be referenced
    expect(output).toContain('database');
    expect(output).toContain('backend');
    expect(output).toContain('frontend');
    expect(output).toContain('auth');
    expect(output).toContain('qa');
  });

  it('should render skill templates with non-empty references sections', async () => {
    const skillTemplates = await fg(path.join(CATALOG_DIR, 'skills', '**', 'SKILL.md.hbs'), {
      absolute: true,
    });
    expect(skillTemplates.length).toBeGreaterThan(0);

    for (const templatePath of skillTemplates) {
      const source = await readFile(templatePath, 'utf-8');
      const output = render(source, context);
      expect(
        output.length,
        `${path.relative(CATALOG_DIR, templatePath)} too short`,
      ).toBeGreaterThan(50);
    }
  });

  it('should render instruction templates with applyTo patterns', async () => {
    const instrTemplates = await fg(path.join(CATALOG_DIR, 'instructions', '**', '*.hbs'), {
      absolute: true,
    });
    expect(instrTemplates.length).toBeGreaterThan(0);

    for (const templatePath of instrTemplates) {
      const source = await readFile(templatePath, 'utf-8');
      const output = render(source, context);
      expect(output.trim().length).toBeGreaterThan(0);
    }
  });

  it('should render prompt templates with agent references', async () => {
    const promptTemplates = await fg(path.join(CATALOG_DIR, 'prompts', '*.hbs'), {
      absolute: true,
    });
    expect(promptTemplates.length).toBe(4);

    for (const templatePath of promptTemplates) {
      const source = await readFile(templatePath, 'utf-8');
      const output = render(source, context);
      expect(output.trim().length).toBeGreaterThan(0);
    }
  });

  it('should render copilot-instructions.md with project name', async () => {
    const rootTemplate = path.join(CATALOG_DIR, 'copilot-instructions.md.hbs');
    const source = await readFile(rootTemplate, 'utf-8');
    const output = render(source, context);

    expect(output).toContain('TaskForge');
    expect(output.length).toBeGreaterThan(200);
  });

  it('should render hook templates as valid JSON', async () => {
    const hookTemplates = await fg(path.join(CATALOG_DIR, 'hooks', '*.hbs'), { absolute: true });

    for (const templatePath of hookTemplates) {
      const source = await readFile(templatePath, 'utf-8');
      const output = render(source, context);
      expect(
        () => JSON.parse(output),
        `${path.basename(templatePath)} should be valid JSON`,
      ).not.toThrow();
    }
  });

  it('should render reference templates to substantial content', async () => {
    const refTemplates = await fg(path.join(CATALOG_DIR, 'skills', '**', 'references', '*.hbs'), {
      absolute: true,
    });
    expect(refTemplates.length).toBeGreaterThan(0);

    for (const templatePath of refTemplates) {
      const source = await readFile(templatePath, 'utf-8');
      const output = render(source, context);
      expect(
        output.trim().length,
        `${path.relative(CATALOG_DIR, templatePath)} should have substantial content`,
      ).toBeGreaterThan(50);
    }
  });
});
