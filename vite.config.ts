import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // production is served under sophey.vodka/gift-generator/ — assets must resolve
  // under that path; dev stays at '/' so the local preview keeps working.
  base: command === 'build' ? '/gift-generator/' : '/',
  plugins: [react()],
}))
