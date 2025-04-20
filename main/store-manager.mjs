import Store from 'electron-store'
import { ipcMain } from 'electron'

export default async function setupStoreManager () {
  const UserConfig = (await import('../src/common/UserConfig.js')).default

  const store = new Store({
    name: 'user',
    defaults: UserConfig.getDefaultConfig(),
  })

  // Create a UserConfig instance with the store
  const userConfig = new UserConfig(store.store, { store })

  // Handle get requests
  ipcMain.handle('store:get', (event, key) => {
    return store.get(key)
  })

  // Handle set requests
  ipcMain.handle('store:set', (event, key, value) => {
    store.set(key, value)
    // Notify all windows of the change
    const windows = require('electron').BrowserWindow.getAllWindows()
    windows.forEach(win => {
      win.webContents.send('store:changed')
    })
    return true
  })

  // Handle delete requests
  ipcMain.handle('store:delete', (event, key) => {
    store.delete(key)
    // Notify all windows of the change
    const windows = require('electron').BrowserWindow.getAllWindows()
    windows.forEach(win => {
      win.webContents.send('store:changed')
    })
    return true
  })

  // Handle clear requests
  ipcMain.handle('store:clear', () => {
    store.clear()
    // Notify all windows of the change
    const windows = require('electron').BrowserWindow.getAllWindows()
    windows.forEach(win => {
      win.webContents.send('store:changed')
    })
    return true
  })

  // Handle getAll requests
  ipcMain.handle('store:getAll', () => {
    return store.store
  })

  return store
}
