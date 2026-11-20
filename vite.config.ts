import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages has no SPA rewrites: emitting index.html again as 404.html lets
 * deep links like /rebuild-100/build load the app instead of a 404 page.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const page = bundle['index.html']
      if (page?.type === 'asset') {
        this.emitFile({ type: 'asset', fileName: '404.html', source: page.source })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://<user>.github.io/rebuild-100/ in production.
  base: command === 'build' ? '/rebuild-100/' : '/',
  plugins: [react(), spaFallback()],
}))
