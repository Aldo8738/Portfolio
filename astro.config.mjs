import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  trailingSlash: 'never',
  vite: { build: { assetsInlineLimit: 0 } },
});
