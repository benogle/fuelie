import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './test/node/environment.js',
    include: ['./test/node/**/*.test.js'],
  },
  resolve: {
    alias: {
      // Support for absolute imports from src directory
      common: path.resolve(process.cwd(), './src/common'),
      lib: path.resolve(process.cwd(), './src/lib'),
      components: path.resolve(process.cwd(), './src/components'),
      style: path.resolve(process.cwd(), './src/style'),
      hoc: path.resolve(process.cwd(), './src/hoc'),
    },
  },
})
