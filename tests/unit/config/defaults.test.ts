import { describe, it, expect } from 'vitest';
import { presetDefaults } from '../../../src/config/defaults.js';

describe('preset defaults', () => {
  it('should have react-express defaults', () => {
    const defaults = presetDefaults['react-express'];
    expect(defaults).toBeDefined();
    expect(defaults?.stack?.preset).toBe('react-express');
    expect(defaults?.stack?.frontend?.framework).toBe('react');
    expect(defaults?.stack?.backend?.framework).toBe('express');
    expect(defaults?.stack?.database?.orm).toBe('prisma');
  });

  it('should have correct agent list', () => {
    const defaults = presetDefaults['react-express'];
    expect(defaults?.agents).toEqual([
      'orchestrator',
      'database',
      'backend',
      'frontend',
      'auth',
      'qa',
    ]);
  });

  it('should default merge strategy to preserve-custom', () => {
    const defaults = presetDefaults['react-express'];
    expect(defaults?.merge_strategy).toBe('preserve-custom');
  });

  it('should have structure paths defined', () => {
    const defaults = presetDefaults['react-express'];
    expect(defaults?.structure?.frontend).toBe('client/src');
    expect(defaults?.structure?.backend).toBe('server/src');
    expect(defaults?.structure?.database).toBe('server/prisma');
  });
});
