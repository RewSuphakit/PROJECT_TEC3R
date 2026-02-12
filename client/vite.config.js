import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/RMUTI/', // สำคัญมากสำหรับ deploy ใน subpath
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 4000,
    allowedHosts: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 500,
    // Enable minification (default is 'esbuild', which is faster and doesn't require extra config)
    minify: 'esbuild',

    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-swal': ['sweetalert2'],
          'vendor-animation': ['aos', 'typed.js', 'countup.js'],
          'vendor-pdf': ['jspdf'],
        }
      }
    }
  }
})