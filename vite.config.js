import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: '**/*.{jsx,tsx,js,ts}',
  })],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
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
  define: {
    // Replace Node.js globals for browser compatibility
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    // Pre-bundle these dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'lodash',
      'styled-components',
      'uplot',
      'uplot-react',
      'chroma-js',
    ],
  },
  build: {
    // Output directory for built files
    outDir: 'build',
    // Generate sourcemaps for production debugging
    sourcemap: true,
    rollupOptions: {
      // Ensure proper chunking for better caching
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lodash: ['lodash'],
          charts: ['uplot', 'uplot-react'],
        },
      },
    },
  },
  server: {
    // Match CRA's default port
    port: 3000,
    // Automatically open browser
    open: true,
  },
})
