import path from 'path'
import { fileURLToPath } from 'url'
import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import menuTemplate from './menu-template.mjs'
import AppStateConfigStore from '../src/common/AppStateConfigStore.mjs'
import setupStoreManager from './store-manager.mjs'

import { getFilesFromUser } from './helpers.mjs'
import { USER_CONFIG_FILENAME } from '../src/common/helpers.mjs'
import squirrelStartup from 'electron-squirrel-startup'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('Starting main process...')
console.log('isDev:', isDev)
console.log('process.platform:', process.platform)

// Initialize the store manager
const store = setupStoreManager()
const appStateConfig = new AppStateConfigStore()
console.log('AppStateConfig initialized')

// Conditionally include the dev tools installer to load React Dev Tools
let mainWindow = null
let globalMenu = null

async function setupDevTools () {
  if (isDev) {
    console.log('Setting up dev tools...')
    try {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer')
      console.log('Dev tools setup complete')
      return { installExtension, REACT_DEVELOPER_TOOLS }
    } catch (error) {
      console.error('Failed to load dev tools:', error)
      return { installExtension: null, REACT_DEVELOPER_TOOLS: null }
    }
  }
  return { installExtension: null, REACT_DEVELOPER_TOOLS: null }
}

if (squirrelStartup) {
  console.log('Squirrel startup detected, quitting...')
  app.quit()
}

function createWindow ({
  filename,
  sizePrefName = 'windowSize',
  onClosed,
  onFocus,
  onBlur,
} = {}) {
  console.log('Creating window with options:', { filename, sizePrefName })
  try {
    const windowConfig = {
      ...appStateConfig.get(sizePrefName),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    }
    console.log('Window config:', windowConfig)

    // Create the browser window.
    const win = new BrowserWindow(windowConfig)
    console.log('BrowserWindow created')

    win.on('resize', () => {
      const { width, height } = win.getBounds()
      appStateConfig.set(sizePrefName, { width, height })
    })

    win.on('closed', () => {
      console.log('Window closed')
      if (onClosed) onClosed()
    })

    win.on('focus', () => {
      console.log('Window focused')
      if (onFocus) onFocus()
    })

    win.on('blur', () => {
      console.log('Window blurred')
      if (onBlur) onBlur()
    })

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load URL:', errorCode, errorDescription)
    })

    win.webContents.on('did-finish-load', () => {
      console.log('Window finished loading')
    })

    const queryString = `?filename=${filename || ''}`
    const url = isDev
      ? `http://localhost:3000${queryString}`
      : `file://${path.join(__dirname, `../build/index.html${queryString}`)}`

    console.log('Loading URL:', url)
    win.loadURL(url)
    console.log('URL loaded')

    // Open the DevTools in development
    if (isDev) {
      console.log('Opening DevTools...')
      win.webContents.openDevTools()
    }

    return win
  } catch (error) {
    console.error('Failed to create window:', error)
    throw error
  }
}

function setSaveItemVisibility (isVisible) {
  const saveMenuItem = globalMenu.getMenuItemById('save')
  saveMenuItem.visible = isVisible
  saveMenuItem.enabled = isVisible
}

export default async function initializeApp () {
  const { installExtension, REACT_DEVELOPER_TOOLS } = await setupDevTools()

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  console.log('Setting up app.whenReady()...')
  app.whenReady().then(async () => {
    console.log('App is ready, creating main window...')
    mainWindow = createWindow()
    console.log('Main window created')

    console.log('Building menu...')
    globalMenu = Menu.buildFromTemplate(menuTemplate({
      onClickOpenFile: openFile,
      onClickOpenUserConfig: openUserConfig,
      onClickSave: () => {
        const focusedWin = BrowserWindow.getFocusedWindow()
        if (focusedWin) {
          focusedWin.webContents.send('save')
        }
      },
    }))
    Menu.setApplicationMenu(globalMenu)
    console.log('Menu built and set')

    // Set up IPC handlers
    ipcMain.on('open-file', openFile)
    ipcMain.on('open-user-config', openUserConfig)

    if (isDev && installExtension && REACT_DEVELOPER_TOOLS) {
      console.log('Installing React DevTools...')
      try {
        const name = await installExtension(REACT_DEVELOPER_TOOLS)
        console.log(`Added Extension: ${name}`)
      } catch (error) {
        console.log(`An error occurred: ${error}`)
      }
    }
  }).catch(error => {
    console.error('Error in app.whenReady():', error)
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    // if (process.platform !== "darwin") {
    app.quit()
    // }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}

//
// Exports the renderer can use

const openFile = async () => {
  const filenames = await getFilesFromUser()
  if (!filenames) return
  for (const newWindowFilename of filenames) {
    createWindow({ filename: newWindowFilename })
  }
  if (mainWindow) {
    mainWindow.destroy()
    mainWindow = null
  }
}

let userConfigWindow
const openUserConfig = async () => {
  if (userConfigWindow) {
    userConfigWindow.focus()
  } else {
    userConfigWindow = createWindow({
      filename: USER_CONFIG_FILENAME,
      sizePrefName: 'userConfigWindowSize',
      onClosed: () => {
        userConfigWindow = null
        setSaveItemVisibility(false)
      },
      onFocus: () => {
        setSaveItemVisibility(true)
      },
      onBlur: () => {
        setSaveItemVisibility(false)
      },
    })
  }
}
