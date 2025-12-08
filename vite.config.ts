import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/pihole': {
          target: env.VITE_PIHOLE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/pihole/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/api/hass': {
          target: env.VITE_HA_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hass/, '/api'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/uptime-kuma/socket.io': {
          target: env.VITE_UPTIME_KUMA_URL,
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/uptime-kuma\/socket.io/, '/socket.io'),
        },
      },
    },
  };
})
