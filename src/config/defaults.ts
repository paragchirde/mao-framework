/**
 * Default config values per preset.
 *
 * Milestone 1A: Populate defaults for react-express
 */

import type { MaoConfig } from './types.js';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const presetDefaults: Record<string, DeepPartial<MaoConfig>> = {
  'react-express': {
    project: {
      type: 'mvp',
    },
    stack: {
      preset: 'react-express',
    },
  },
};
