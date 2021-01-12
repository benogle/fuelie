import path from 'path'

import { app, BrowserWindow, Menu } from 'electron'
import isDev from 'electron-is-dev'
import menuTemplate from './menu-template'
import AppStateConfigStore from '../src/common/AppStateConfigStore'
import { getFilesFromUser } from './helpers'

const appStateConfig = new AppStateConfigStore()

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS // NEW!
let mainWindow = null

if (isDev) {
  const devTools = require('electron-devtools-installer')
  installExtension = devTools.default
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS
}

if (require('electron-squirrel-startup')) {
  app.quit()
}

function createWindow (filename) {
  // Create the browser window.
  const win = new BrowserWindow({
    ...appStateConfig.get('windowSize'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    const { width, height } = win.getBounds()
    // Now that we have them, save them using the `set` method.
    appStateConfig.set('windowSize', { width, height })
  })

  const queryString = `?filename=${filename || ''}`
  win.loadURL(
    isDev
      ? `http://localhost:3000${queryString}`
      : `file://${path.join(__dirname, `../build/index.html${queryString}`)}`,
  )

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ })
  }

  // HACK: This is probably no bueno
  win.hasFilename = !!filename
  return win
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainWindow = createWindow()

  const menu = Menu.buildFromTemplate(menuTemplate({
    onClickOpenFile: openFile,
  }))
  Menu.setApplicationMenu(menu)

  if (isDev) {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(error => console.log(`An error occurred: , ${error}`))
  }
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

//
// Exports the renderer can use

const openFile = exports.openFile = async () => {
  const filenames = await getFilesFromUser()
  if (!filenames) return
  for (const newWindowFilename of filenames) {
    createWindow(newWindowFilename)
  }
  if (mainWindow && !mainWindow.hasFilename) {
    mainWindow.destroy()
    mainWindow = null
  }
}
