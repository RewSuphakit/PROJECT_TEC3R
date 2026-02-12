import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/RMUTI/",
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4000,
    allowedHosts: true
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Heavy UI libraries - loaded on demand
          'vendor-swal': ['sweetalert2'],
          // Animation libraries
          'vendor-animation': ['aos', 'typed.js', 'countup.js'],
          // PDF generation - only used on report page
          'vendor-pdf': ['jspdf'],
        }
      }
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.error for debugging, set true for production
        drop_debugger: true,
      }
    }
  }
})
