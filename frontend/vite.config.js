import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'resto.salmansaas.com',
      'admin.salmansaas.com',
      'menu1.salmansaas.com',
      'localhost'
    ],
  },
  preview: {
    allowedHosts: [
      'resto.salmansaas.com',
      'admin.salmansaas.com',
      'menu1.salmansaas.com',
      'localhost'
    ],
    port: process.env.PORT || 4173,
    host: true,
  }
})