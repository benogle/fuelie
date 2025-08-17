import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    include: ['test/web/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: {
      // Support for absolute imports from src directory
      common: path.resolve(__dirname, './src/common'),
      lib: path.resolve(__dirname, './src/lib'),
      components: path.resolve(__dirname, './src/components'),
      style: path.resolve(__dirname, './src/style'),
      hoc: path.resolve(__dirname, './src/hoc'),
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
  },
})
