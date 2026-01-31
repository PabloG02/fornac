import { defineConfig, UserConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Get all HTML files from examples directory for examples build
function getExampleEntries() {
  const examplesDir = resolve(__dirname, 'examples');
  const entries = {};

  readdirSync(examplesDir).forEach((file) => {
    if (file.endsWith('.html')) {
      const name = file.replace('.html', '');
      entries[name] = resolve(examplesDir, file);
    }
  });

  return entries;
}

const libConfig: UserConfig = {
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
};

const examplesConfig: UserConfig = {
  root: 'examples',
  base: '',
  publicDir: false,
  build: {
    outDir: '../dist-examples',
    emptyOutDir: true,
    rollupOptions: {
      input: getExampleEntries(),
      external: [],
    },
  },
};

export default defineConfig(({ mode }) => {
  if (mode === 'examples') {
    return examplesConfig;
  }
  return libConfig;
});
