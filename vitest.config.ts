/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup-tests.ts'],
    globals: true,
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/docs/standards/bulletproof-react/**',
      '**/docs/standards/naming-cheatsheet/**',
      '**/.next/**',
      '**/dist/**'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})