import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'fornac',
      fileName: (format) => (format === 'umd' ? 'fornac.js' : 'fornac.esm.js'),
      formats: ['umd', 'es'],
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
  plugins: [
    {
      name: 'serve-built-library',
      configureServer(server) {
        // Serve built files from dist during development
        server.middlewares.use((req, res, next) => {
          // Redirect requests for fornac.js/css to dist folder
          if (req.url === '/examples/fornac.js' || req.url === '/fornac.js') {
            req.url = '/dist/fornac.js';
          } else if (req.url === '/examples/fornac.css' || req.url === '/fornac.css') {
            req.url = '/dist/fornac.css';
          }
          next();
        });
      },
    },
  ],
});
