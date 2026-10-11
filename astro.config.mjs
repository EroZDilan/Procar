import { defineConfig } from 'astro/config';
import serviceWorker from './integrations/service-worker.mjs';
import { SITE_URL } from './src/config.js';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  build: {
    // CSS pequeño va inline (evita una petición que bloquea el render); el grande, a archivo con hash.
    inlineStylesheets: 'auto',
    assets: '_astro',
  },
  compressHTML: true,
  prefetch: false,
  image: {
    responsiveStyles: false,
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
      // three.js va en su propio chunk: se cachea una vez y no se invalida al cambiar el sitio.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
          },
        },
      },
    },
  },
  integrations: [serviceWorker()],
});
