/**
 * Config barrel export
 */

export { MaoConfigSchema, AgentRole, Preset, ProjectType, MergeStrategy } from './schema.js';
export type { MaoConfig, MaoConfigInput } from './types.js';
export { loadConfig, detectNeedsReview, ConfigValidationError } from './loader.js';
export type { LoadConfigResult } from './loader.js';
export { presets } from './presets.js';
export type { PresetDefinition } from './presets.js';
export { presetDefaults } from './defaults.js';
