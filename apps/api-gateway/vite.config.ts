/// <reference types='vitest' />
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api-gateway',

  plugins: [],

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
