import { defineConfig } from '@playwright/test';
import productionConfig from './playwright.config';

export default defineConfig({
  ...productionConfig,
  testDir: './tests/dev',
  use: { ...productionConfig.use, baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
});
