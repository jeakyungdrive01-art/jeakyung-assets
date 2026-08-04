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

function useGroupwareFallback(middlewares) {
  middlewares.use((request, _response, next) => {
    const [pathname, query = ''] = (request.url || '').split('?');
    const isGroupwareRoute = pathname === '/groupware'
      || pathname === '/groupware/'
      || (pathname.startsWith('/groupware/') && !pathname.split('/').at(-1).includes('.'));

    if (isGroupwareRoute) {
      request.url = `/groupware/index.html${query ? `?${query}` : ''}`;
    }

    next();
  });
}

const groupwareSpaFallback = {
  name: 'groupware-spa-fallback',
  configureServer(server) {
    useGroupwareFallback(server.middlewares);
  },
  configurePreviewServer(server) {
    useGroupwareFallback(server.middlewares);
  },
};

export default defineConfig({
  plugins: [groupwareSpaFallback, preserveLegacyScript, react()],
  publicDir: 'static',
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('privacy/index.html', import.meta.url)),
        groupware: fileURLToPath(new URL('groupware/index.html', import.meta.url)),
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
