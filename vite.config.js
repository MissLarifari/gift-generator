import { defineConfig } from 'vite';

export default defineConfig({
  base: '/gift-generator/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    open: true,
  },
});
