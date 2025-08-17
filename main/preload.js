// Preload script to make Node.js modules available to the renderer process
// This is needed for the current architecture where renderer code expects window.require
// Note: Preload scripts still use CommonJS even when main process uses ESM

const { ipcRenderer } = require('electron')

// Make require available on window for compatibility with existing code
window.require = require

// Make ipcRenderer available globally for any direct IPC communication
window.ipcRenderer = ipcRenderer

// Log that preload script has loaded successfully
console.log('Preload script loaded - window.require and ipcRenderer are available')
