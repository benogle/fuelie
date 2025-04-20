// Modules to control application life and create native browser window
const { app } = require('electron')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// Initialize ESM
async function initialize() {
  try {
    const { default: sourceMapSupport } = await import('source-map-support')
    sourceMapSupport.install()
  } catch (e) {
    console.error('Failed to install source-map-support:', e)
  }

  try {
    // Dynamic import of the main app code
    const mainModule = await import('./main.mjs')
    // The default export should be the initialized app
    if (mainModule.default) {
      mainModule.default()
    }
  } catch (e) {
    console.error('Failed to load main module:', e)
    console.error(e.stack)
    app.quit()
  }
}

initialize().catch(err => {
  console.error('Initialization failed:', err)
  app.quit()
})
