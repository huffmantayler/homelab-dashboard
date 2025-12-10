/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), '');
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
        // Proxy all API requests to the backend server
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // Proxy Socket.IO to the backend server
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
          changeOrigin: true,
          secure: false,
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
