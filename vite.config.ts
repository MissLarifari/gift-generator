import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // production is served under sophey.vodka/gift-generator/ — assets must resolve
  // under that path; dev stays at '/' so the local preview keeps working.
  base: command === 'build' ? '/gift-generator/' : '/',
  plugins: [react()],
  server: {
    // Festgenagelt, weil die Vorschau des Editors aus .claude/launch.json
    // eine feste Portnummer aufruft. Ohne das sucht sich Vite bei belegtem
    // Port still den naechsten - und die Vorschau zeigt "nicht erreichbar",
    // obwohl der Server laeuft. strictPort laesst ihn lieber laut scheitern.
    port: 5173,
    strictPort: true,
    // The guestbook API only answers to https://sophey.vodka (ALLOWED_ORIGIN).
    // Live that is the same origin as Gifty, so there is no CORS at all; from a
    // dev server on localhost the browser would be turned away. This hands the
    // request to the dev server instead, which has no such rule.
    // See .env.development — in dev the guestbook talks to /gb-api.
    proxy: {
      '/gb-api': {
        target: 'https://sophey.vodka/The-Cloud/api',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/gb-api/, ''),
      },
    },
  },
}))
