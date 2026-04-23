import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['bin/mao-scaffold.ts', 'bin/mao-activate.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist/bin',
  clean: true,
  dts: false,
  sourcemap: true,
  splitting: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
