import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/RMUTI/",
  plugins: [react()], server: {
    allowedHosts: [
      'd384c84ab32a.ngrok-free.app'
    ]
  }
})