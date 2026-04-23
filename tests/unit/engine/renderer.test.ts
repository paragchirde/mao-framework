import { describe, it, expect } from 'vitest';
import { render } from '../../../src/engine/renderer.js';

describe('Renderer', () => {
  it('should render a simple template', () => {
    const result = render('Hello, {{name}}!', { name: 'MAO' });
    expect(result).toBe('Hello, MAO!');
  });

  it('should handle conditionals', () => {
    const template = '{{#if show}}visible{{else}}hidden{{/if}}';
    expect(render(template, { show: true })).toBe('visible');
    expect(render(template, { show: false })).toBe('hidden');
  });

  it('should handle each loops', () => {
    const template = '{{#each items}}{{this}},{{/each}}';
    expect(render(template, { items: ['a', 'b', 'c'] })).toBe('a,b,c,');
  });

  it('should use custom eq helper', () => {
    const template = '{{#if (eq type "production")}}prod{{else}}dev{{/if}}';
    expect(render(template, { type: 'production' })).toBe('prod');
    expect(render(template, { type: 'mvp' })).toBe('dev');
  });

  it('should use custom includes helper', () => {
    const template = '{{#if (includes agents "qa")}}has-qa{{else}}no-qa{{/if}}';
    expect(render(template, { agents: ['backend', 'qa'] })).toBe('has-qa');
    expect(render(template, { agents: ['backend'] })).toBe('no-qa');
  });

  it('should use custom kebab helper', () => {
    const result = render('{{kebab name}}', { name: 'Hello World' });
    expect(result).toBe('hello-world');
  });

  it('should use custom join helper', () => {
    const result = render('{{join items " | "}}', { items: ['a', 'b', 'c'] });
    expect(result).toBe('a | b | c');
  });

  it('should handle missing variables gracefully', () => {
    const result = render('Hello, {{name}}!', {});
    expect(result).toBe('Hello, !');
  });
});
