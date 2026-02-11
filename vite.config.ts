import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL ?? 'http://localhost:4000'
  const proxyTarget = apiUrl.endsWith('/api') ? apiUrl.replace(/\/api$/, '') : apiUrl

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true
        }
      }
    },
    base: "/",
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
