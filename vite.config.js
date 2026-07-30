import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

const preserveLegacyScript = {
  name: 'preserve-legacy-script',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(
        /<script src="((?:\.\.\/)?js\/main\.js)"><\/script>/g,
        '<script type="module" src="$1"></script>',
      );
    },
  },
};

export default defineConfig({
  plugins: [preserveLegacyScript, react()],
  publicDir: 'static',
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('privacy/index.html', import.meta.url)),
      },
    },
  },
  server: {
    fs: {
      strict: true,
      allow: [projectRoot],
    },
  },
});
