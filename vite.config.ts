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
        name: 'copy-index-to-404',
        writeBundle: () => {
          const distDir = path.resolve(__dirname, 'dist');
          if (fs.existsSync(path.join(distDir, 'index.html'))) {
            // Create 404 fallback for GitHub pages
            fs.copyFileSync(
              path.join(distDir, 'index.html'),
              path.join(distDir, '404.html')
            );
            
            // Create static HTML fallbacks for all dynamic routes to return 200 OK status
            dynamicRoutes.forEach(route => {
              if (route === '/') return;
              
              // Remove leading slash to create relative paths
              const routePath = route.startsWith('/') ? route.slice(1) : route;
              const routeDir = path.join(distDir, routePath);
              
              if (!fs.existsSync(routeDir)) {
                fs.mkdirSync(routeDir, { recursive: true });
              }
              
              fs.copyFileSync(
                path.join(distDir, 'index.html'),
                path.join(routeDir, 'index.html')
              );
            });
          }
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
      }
    },
    base: "/",
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
