import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: [
      "3002-ikz8mt7hfwnqwl7h8dcbb-507e9b65.manusvm.computer",
      'all'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // backend
        changeOrigin: true
      }
    }
  }
})
