/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: [
        // Only mock icons in test mode
        ...(mode === 'test' ? [
          {
            find: /^@mui\/icons-material\/(.*)/,
            replacement: path.resolve(__dirname, './src/mocks/mui-icons.tsx'),
          },
          {
            find: '@mui/icons-material',
            replacement: path.resolve(__dirname, './src/mocks/mui-icons.tsx'),
          },
        ] : []),
      ],
    },
    server: {
      host: true, // Listen on all addresses
      proxy: {
        '/api/pihole': {
          target: env.VITE_PIHOLE_URL || 'http://pi.hole',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/pihole/, '/api'),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err);
            });
          },
        },
        '/api/hass': {
          target: env.VITE_HA_URL || 'http://homeassistant.local:8123',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hass/, '/api'),
        },
        '/socket.io': {
          target: env.VITE_UPTIME_KUMA_URL || 'http://localhost:3001',
          ws: true,
          changeOrigin: true,
        },
        '/uptime-kuma/socket.io': {
          target: env.VITE_UPTIME_KUMA_URL || 'http://localhost:3001',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/uptime-kuma\/socket.io/, '/socket.io'),
        }
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/setupTests.ts',
      fileParallelism: false,
      poolOptions: {
        threads: {
          singleThread: true
        },
        forks: {
          singleFork: true
        }
      }
    },
  };
})
