import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // 🚀 Add this part for Render deployment
  preview: {
    host: true,       // required for Render
    port: 4173        // Render will detect this port
  }
})
