import { describe, it, expect } from 'vitest';
import Handlebars from 'handlebars';
import { registerHelpers } from '../../../src/engine/helpers.js';

describe('Handlebars Helpers', () => {
  let hbs: typeof Handlebars;

  beforeAll(() => {
    hbs = Handlebars.create();
    registerHelpers(hbs);
  });

  describe('eq', () => {
    it('should return true for equal values', () => {
      const template = hbs.compile('{{#if (eq a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: 'x', b: 'x' })).toBe('yes');
    });

    it('should return false for unequal values', () => {
      const template = hbs.compile('{{#if (eq a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: 'x', b: 'y' })).toBe('no');
    });
  });

  describe('neq', () => {
    it('should return true for unequal values', () => {
      const template = hbs.compile('{{#if (neq a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: 'x', b: 'y' })).toBe('yes');
    });
  });

  describe('includes', () => {
    it('should return true when array includes value', () => {
      const template = hbs.compile('{{#if (includes arr val)}}yes{{else}}no{{/if}}');
      expect(template({ arr: ['a', 'b', 'c'], val: 'b' })).toBe('yes');
    });

    it('should return false when array does not include value', () => {
      const template = hbs.compile('{{#if (includes arr val)}}yes{{else}}no{{/if}}');
      expect(template({ arr: ['a', 'b', 'c'], val: 'z' })).toBe('no');
    });

    it('should handle null/undefined array', () => {
      const template = hbs.compile('{{#if (includes arr val)}}yes{{else}}no{{/if}}');
      expect(template({ arr: null, val: 'a' })).toBe('no');
    });
  });

  describe('or', () => {
    it('should return true if any arg is truthy', () => {
      const template = hbs.compile('{{#if (or a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: false, b: true })).toBe('yes');
    });

    it('should return false if all args are falsy', () => {
      const template = hbs.compile('{{#if (or a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: false, b: false })).toBe('no');
    });
  });

  describe('and', () => {
    it('should return true if all args are truthy', () => {
      const template = hbs.compile('{{#if (and a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: true, b: true })).toBe('yes');
    });

    it('should return false if any arg is falsy', () => {
      const template = hbs.compile('{{#if (and a b)}}yes{{else}}no{{/if}}');
      expect(template({ a: true, b: false })).toBe('no');
    });
  });

  describe('kebab', () => {
    it('should convert to kebab-case', () => {
      const template = hbs.compile('{{kebab str}}');
      expect(template({ str: 'Hello World' })).toBe('hello-world');
    });

    it('should handle non-string input', () => {
      const template = hbs.compile('{{kebab str}}');
      expect(template({ str: 42 })).toBe('');
    });
  });

  describe('pascal', () => {
    it('should convert kebab to PascalCase', () => {
      const template = hbs.compile('{{pascal str}}');
      expect(template({ str: 'hello-world' })).toBe('HelloWorld');
    });

    it('should convert space-separated to PascalCase', () => {
      const template = hbs.compile('{{pascal str}}');
      expect(template({ str: 'hello world' })).toBe('HelloWorld');
    });
  });

  describe('join', () => {
    it('should join array with separator', () => {
      const template = hbs.compile('{{join arr ", "}}');
      expect(template({ arr: ['a', 'b', 'c'] })).toBe('a, b, c');
    });

    it('should handle empty array', () => {
      const template = hbs.compile('{{join arr ", "}}');
      expect(template({ arr: [] })).toBe('');
    });

    it('should handle non-array input', () => {
      const template = hbs.compile('{{join arr ", "}}');
      expect(template({ arr: 'not-array' })).toBe('');
    });
  });

  describe('json', () => {
    it('should stringify object', () => {
      const template = hbs.compile('{{{json obj}}}');
      const result = template({ obj: { a: 1, b: 'two' } });
      expect(JSON.parse(result)).toEqual({ a: 1, b: 'two' });
    });
  });
});
