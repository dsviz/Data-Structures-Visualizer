import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL ?? 'http://localhost:4000'
  const proxyTarget = apiUrl.endsWith('/api') ? apiUrl.replace(/\/api$/, '') : apiUrl

  const dynamicRoutes = [
    '/',
    '/arrays',
    '/graphs',
    '/linked-list',
    '/queue',
    '/sorting',
    '/stack',
    '/trees',
    '/recursion',
    '/about',
    '/team',
    '/terms',
    '/privacy',
    '/login',
    '/signup'
  ]

  return {
    plugins: [
      react(),
      sitemap({
        hostname: 'https://dsviz.app',
        dynamicRoutes,
      }),
      {
        name: 'generate-static-subpages',
        writeBundle: () => {
          const distDir = path.resolve(__dirname, 'dist');
          
          // 1. Create 404.html for SPA fallback (handled by index.html script)
          if (fs.existsSync(path.join(distDir, 'index.html'))) {
            fs.copyFileSync(
              path.join(distDir, 'index.html'),
              path.join(distDir, '404.html')
            )
          }

          // 2. Create physical directories for each route to give Crawler 200 OK
          dynamicRoutes.forEach(route => {
            if (route === '/') return; // Skip home page
            const dirPath = path.join(distDir, route.replace(/^\//, ''));
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            // Copy index.html into the directory
            fs.copyFileSync(
              path.join(distDir, 'index.html'),
              path.join(dirPath, 'index.html')
            );
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true
        }
      },
      watch: {
        ignored: ['**/public/data/leetcode/**']
      }
    },
    base: "/",
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'state-vendor': ['zustand'],
            'markdown-vendor': ['react-markdown', 'remark-gfm', 'remark-math', 'rehype-katex', 'rehype-raw']
          }
        }
      }
    }
  }
})
