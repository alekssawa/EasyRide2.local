import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: './',  // Указываем папку, в которой находится index.html
  plugins: [react()],
})