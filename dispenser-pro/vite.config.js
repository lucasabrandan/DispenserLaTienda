import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// el catálogo se sirve en /catalog/
export default defineConfig({
  plugins: [react()],
  base: '/',   // ← clave para que reescriba rutas de assets
})
