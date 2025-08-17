import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Extend vitest's expect with jest-dom matchers
expect.extend({})

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock window.ipcRenderer for Electron apps
Object.defineProperty(window, 'ipcRenderer', {
  value: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  writable: true,
})
