/// <reference types='vitest' />
import { defineConfig } from 'vite';
import swc from 'unplugin-swc';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api-gateway',

  plugins: [
    // Required for NestJS dependency injection to work with Vitest
    // SWC supports emitDecoratorMetadata which esbuild does not
    swc.vite({
      module: { type: 'es6' },
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,tsx}',
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,tsx}',
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/api-gateway',
      provider: 'v8',
    },
    setupFiles: ['test/setup.ts'],
    testTimeout: 30000,
  },
});
