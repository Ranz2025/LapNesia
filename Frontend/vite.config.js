import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      hmr: {
        host: 'localhost',
        port: 5173,
      },
    },
    define: {
      'import.meta.env.VITE_PUSHER_APP_KEY': JSON.stringify(env.VITE_PUSHER_APP_KEY || 'local'),
      'import.meta.env.VITE_PUSHER_CLUSTER': JSON.stringify(env.VITE_PUSHER_CLUSTER || 'mt'),
      'import.meta.env.VITE_PUSHER_SCHEME': JSON.stringify(env.VITE_PUSHER_SCHEME || 'http'),
      'import.meta.env.VITE_PUSHER_HOST': JSON.stringify(env.VITE_PUSHER_HOST || 'localhost'),
      'import.meta.env.VITE_PUSHER_PORT': JSON.stringify(env.VITE_PUSHER_PORT || '6001'),
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              return 'vendor';
            }
          },
        },
      },
    },
  }
})
