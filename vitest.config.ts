import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
          },
        },
        test: {
          name: 'node',
          globals: true,
          environment: 'jsdom',
          setupFiles: './src/tests/setup.ts',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['src/**/*.worker.test.ts', '**/node_modules/**'],
        },
      },
      './vitest.worker.config.ts',
    ],
  },
});
