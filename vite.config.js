import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 👈 allows external access
    allowedHosts: [
      'c5f7-2401-4900-8899-cbc-f9eb-6a5e-ad07-f1c0.ngrok-free.app', 
    ]
  }
})
