import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
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
    'import.meta.env.VITE_PUSHER_APP_KEY': JSON.stringify(process.env.VITE_PUSHER_APP_KEY || 'local'),
    'import.meta.env.VITE_PUSHER_CLUSTER': JSON.stringify(process.env.VITE_PUSHER_CLUSTER || 'mt'),
    'import.meta.env.VITE_PUSHER_SCHEME': JSON.stringify(process.env.VITE_PUSHER_SCHEME || 'http'),
    'import.meta.env.VITE_PUSHER_HOST': JSON.stringify(process.env.VITE_PUSHER_HOST || 'localhost'),
    'import.meta.env.VITE_PUSHER_PORT': JSON.stringify(process.env.VITE_PUSHER_PORT || '6001'),
  },
})
