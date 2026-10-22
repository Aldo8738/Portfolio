import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  trailingSlash: 'never',
  vite: {
    build: { assetsInlineLimit: 0 },
    plugins: [
      {
        name: 'separate-runtime-caches',
        // A production build must not overwrite the running dev server's React runtime.
        config: (_, { mode }) => ({ cacheDir: `node_modules/.vite/${mode}` }),
      },
    ],
  },
});
