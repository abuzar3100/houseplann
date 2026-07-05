import { defineConfig } from 'vite';

// Relative base so the built site also works when opened from a static host / file server.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
