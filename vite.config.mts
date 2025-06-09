import { URL, fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';

import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { execSync } from 'child_process';

const { getAbsoluteFSPath } = await import('swagger-ui-dist');
const swaggerUiPath = getAbsoluteFSPath();

function getGitVersion() {
  try {
    // Vérifier d'abord s'il y a un tag pointant directement sur HEAD
    const tag = execSync('git tag --points-at HEAD').toString().trim();
    if (tag) {
      // Si un tag est trouvé, retourner le premier
      return tag.split('\n')[0];
    }
    // Si aucun tag n'est associé à HEAD, essayer de trouver le dernier tag dans l'historique
    try {
      return execSync('git describe --tags --abbrev=0').toString().trim();
    } catch {
      // Si git describe échoue, lister tous les tags et prendre le dernier
      const allTags = execSync('git tag').toString().trim();
      if (allTags) {
        // Trier les tags par ordre lexicographique ou version
        const tags = allTags.split('\n').filter(tag => tag);
        return tags.sort().reverse()[0] || 'unknown';
      }
      return 'unknown';
    }
  } catch {
    // Fallback en cas d'erreur générale
    return 'unknown';
  }
}

// eslint-disable-next-line prefer-const
const config = defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: [
            `${normalizePath(swaggerUiPath)}/*.{js,css,html,png}`,
            `!${normalizePath(swaggerUiPath)}/**/index.html`,
            normalizePath(fileURLToPath(new URL('./dist/axios.min.js', import.meta.resolve('axios/package.json')))),
            normalizePath(fileURLToPath(new URL('./src/main/webapp/swagger-ui/index.html', import.meta.url))),
          ],
          dest: 'swagger-ui',
        },
      ],
    }),
  ],
  root: fileURLToPath(new URL('./src/main/webapp/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./target/classes/static/public', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./target/.vite-cache', import.meta.url)),
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('./target/classes/static/', import.meta.url)),
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./src/main/webapp/index.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      vue: '@vue/compat/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src/main/webapp/app/', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/main/webapp/content/', import.meta.url)),
    },
  },
  define: {
    I18N_HASH: '"generated_hash"',
    SERVER_API_URL: '"/"',
    APP_VERSION: `"${process.env.APP_VERSION ? process.env.APP_VERSION : 'DEV'}"`,
    VERSION_P: JSON.stringify(getGitVersion()),
  },
  server: {
    host: true,
    port: 9000,
    proxy: Object.fromEntries(
      ['/api', '/management', '/v3/api-docs'].map(res => [
        res,
        {
          target: 'http://localhost:8080',
        },
      ]),
    ),
  },
});

// jhipster-needle-add-vite-config - JHipster will add custom config

export default config;
