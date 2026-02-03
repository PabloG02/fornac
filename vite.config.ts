import { defineConfig, UserConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

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

// Helper to get the current commit hash
function getCommitHash() {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    console.warn('[prepare-readme] Could not get commit hash, falling back to master');
    return 'master';
  }
}

const libConfig: UserConfig = {
  root: '.',
  plugins: [
    {
      name: 'copy-types',
      closeBundle() {
        // This hook runs after the build is complete.
        // Copies the manual type definitions to the dist folder.
        const srcPath = resolve(__dirname, 'src/index.d.ts');
        const destPath = resolve(__dirname, 'dist/fornac.esm.d.ts');

        console.log(`[copy-types] Copying ${srcPath} to ${destPath}`);
        copyFileSync(srcPath, destPath);
      }
    },
    {
      name: 'prepare-readme',
      closeBundle() {
        const readmePath = resolve(__dirname, 'README.md');
        const commitHash = getCommitHash();
        const repoPath = "pablog02/fornac";
        const rawBaseUrl = `https://raw.githubusercontent.com/${repoPath}/${commitHash}/`;

        let content = readFileSync(readmePath, 'utf-8');

        // This regex looks for relative paths starting with 'doc/img/'
        // and replaces them with the full Raw GitHub URL using the commit hash
        const updatedContent = content.replace(/doc\/img\//g, `${rawBaseUrl}doc/img/`);

        // Write the modified README back to disk
        const destPath = resolve(__dirname, 'README.md');
        writeFileSync(destPath, updatedContent);
      }
    }
  ],
  resolve: {
    alias: {
      '@pablog02/fornac': resolve(__dirname, 'src/index.js'),
    },
  },
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
  resolve: {
    alias: {
      '@pablog02/fornac': resolve(__dirname, 'src/index.js'),
    },
  },
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
