import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import ts from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.wrangler/**',
      '.tools/**',
      '.cache/**',
      'node_modules/**',
      'ascii-taco-loader-v6/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['**/*.tsx', '**/use*.ts'],
    plugins: { 'react-hooks': hooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
);
