// Preload script to make Node.js modules available to the renderer process
// This is needed for the current architecture where renderer code expects window.require

// Make require available on window for compatibility with existing code
window.require = require

// Also expose specific electron modules that might be needed
const { ipcRenderer } = require('electron')

// Make ipcRenderer available globally for any direct IPC communication
window.ipcRenderer = ipcRenderer

// Log that preload script has loaded successfully
console.log('Preload script loaded - window.require is available')
