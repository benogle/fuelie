const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const menuTemplate = require('./menu-template')
const AppStateConfigStore = require('../src/common/AppStateConfigStore')

const { getFilesFromUser } = require('./helpers')
const { USER_CONFIG_FILENAME } = require('../src/common/helpers')

const appStateConfig = new AppStateConfigStore()

// Conditionally include the dev tools installer to load React Dev Tools
let installExtension, REACT_DEVELOPER_TOOLS // NEW!
let mainWindow = null
let globalMenu = null

if (isDev) {
  const devTools = require('electron-devtools-installer')
  installExtension = devTools.default
  REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS
}

if (require('electron-squirrel-startup')) {
  app.quit()
}

function createWindow ({
  filename,
  sizePrefName = 'windowSize',
  onClosed,
  onFocus,
  onBlur,
} = {}) {
  // Create the browser window.
  const win = new BrowserWindow({
    ...appStateConfig.get(sizePrefName),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    const { width, height } = win.getBounds()
    // Now that we have them, save them using the `set` method.
    appStateConfig.set(sizePrefName, { width, height })
  })

  win.on('closed', () => {
    if (onClosed) onClosed()
  })

  win.on('focus', () => {
    if (onFocus) onFocus()
  })

  win.on('blur', () => {
    if (onBlur) onBlur()
  })

  const queryString = `?filename=${filename || ''}`
  win.loadURL(
    isDev
      ? `http://localhost:3000${queryString}`
      : `file://${path.join(__dirname, `../build/index.html${queryString}`)}`,
  )

  // Open the DevTools.
  // if (isDev) {
  //   win.webContents.openDevTools({ })
  // }

  return win
}

function setSaveItemVisibility (isVisible) {
  const saveMenuItem = globalMenu.getMenuItemById('save')
  saveMenuItem.visible = isVisible
  saveMenuItem.enabled = isVisible
}

// Function declarations
async function openFile () {
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
async function openUserConfig () {
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

// IPC handlers
ipcMain.handle('open-file', openFile)
ipcMain.handle('open-user-config', openUserConfig)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainWindow = createWindow()

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

module.exports.openFile = openFile
module.exports.openUserConfig = openUserConfig
