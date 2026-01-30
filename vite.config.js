import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      fileName: 'fornac.esm',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: { d3: 'd3' },
        assetFileNames: 'fornac.[ext]',
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]-[local]',
    },
  },
  server: {
    port: 9000,
    open: '/examples/index.html',
  },
});
