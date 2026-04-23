/**
 * Custom Handlebars helpers for catalog templates.
 *
 * Milestone 1B: Full implementation
 */

import type Handlebars from 'handlebars';

export function registerHelpers(hbs: typeof Handlebars): void {
  /** Equality check: {{#if (eq a b)}} */
  hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);

  /** Not-equal check: {{#if (neq a b)}} */
  hbs.registerHelper('neq', (a: unknown, b: unknown) => a !== b);

  /** Array includes: {{#if (includes arr val)}} */
  hbs.registerHelper('includes', (arr: unknown, val: unknown) => {
    if (!Array.isArray(arr)) return false;
    return arr.includes(val);
  });

  /** Logical OR: {{#if (or condA condB)}} */
  hbs.registerHelper('or', (...args: unknown[]) => {
    // Last arg is the Handlebars options object
    const values = args.slice(0, -1);
    return values.some(Boolean);
  });

  /** Logical AND: {{#if (and condA condB)}} */
  hbs.registerHelper('and', (...args: unknown[]) => {
    const values = args.slice(0, -1);
    return values.every(Boolean);
  });

  /** kebab-case: {{kebab "Hello World"}} → "hello-world" */
  hbs.registerHelper('kebab', (str: unknown) => {
    if (typeof str !== 'string') return '';
    return str.replace(/\s+/g, '-').toLowerCase();
  });

  /** PascalCase: {{pascal "hello-world"}} → "HelloWorld" */
  hbs.registerHelper('pascal', (str: unknown) => {
    if (typeof str !== 'string') return '';
    return str.replace(/(^|[-_\s])(\w)/g, (_match, _sep, char: string) => char.toUpperCase());
  });

  /** Join array: {{join arr ", "}} */
  hbs.registerHelper('join', (arr: unknown, sep: unknown) => {
    if (!Array.isArray(arr)) return '';
    const separator = typeof sep === 'string' ? sep : ', ';
    return arr.join(separator);
  });

  /** JSON stringify: {{json obj}} */
  hbs.registerHelper('json', (obj: unknown) => {
    return JSON.stringify(obj, null, 2);
  });
}
