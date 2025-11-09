import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const repoBase = "/invoice-combination-finder/";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? repoBase : "/",
})
