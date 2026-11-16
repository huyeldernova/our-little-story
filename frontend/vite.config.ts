/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// In development the browser talks only to Vite (http://localhost:5173).
// /api and /ws are proxied to Spring Boot, so the session cookie is first-party
// and no CORS is needed. In production set VITE_API_BASE_URL (see .env.example).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_DEV_BACKEND_URL || 'http://localhost:8080'
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: backend, changeOrigin: false },
        '/ws': { target: backend, ws: true, changeOrigin: false },
      },
    },
    test: {
      environment: 'node',
    },
  }
})
