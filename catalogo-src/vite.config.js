import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// importante el base para servir en /catalog/
export default defineConfig({
  plugins: [react()],
  base: '/catalog/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
  