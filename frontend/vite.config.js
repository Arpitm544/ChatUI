import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  preview: {
    host: true,       // required
    port: 4173,       // render detects this
    allowedHosts: [
      "chatui-2.onrender.com"   // your frontend domain
    ]
  }
})
