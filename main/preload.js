const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // IPC communication
    send: (channel, data) => {
      ipcRenderer.send(channel, data)
    },
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func)
    },

    // Store operations
    store: {
      get: (key) => ipcRenderer.invoke('store:get', key),
      set: (key, value) => ipcRenderer.invoke('store:set', key, value),
      delete: (key) => ipcRenderer.invoke('store:delete', key),
      clear: () => ipcRenderer.invoke('store:clear'),
      getAll: () => ipcRenderer.invoke('store:getAll'),
    },

    // File system operations
    fs: {
      readFile: (path, options) => {
        return new Promise((resolve, reject) => {
          fs.readFile(path, options, (err, data) => {
            if (err) reject(err)
            else {
              // If encoding is null, return a Buffer
              if (options && options.encoding === null) {
                resolve(Buffer.from(data))
              } else {
                resolve(data)
              }
            }
          })
        })
      },
      writeFile: (path, data, options) => {
        return new Promise((resolve, reject) => {
          fs.writeFile(path, data, options, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      },
      exists: (path) => {
        return new Promise((resolve) => {
          fs.exists(path, (exists) => resolve(exists))
        })
      },
      existsSync: (path) => fs.existsSync(path),
      watch: (path, callback) => {
        return fs.watch(path, callback)
      },
      mkdir: (path, options) => {
        return new Promise((resolve, reject) => {
          fs.mkdir(path, options, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      },
      mkdirSync: (path, options) => fs.mkdirSync(path, options),
      readdir: (path) => {
        return new Promise((resolve, reject) => {
          fs.readdir(path, (err, files) => {
            if (err) reject(err)
            else resolve(files)
          })
        })
      },
      readdirSync: (path) => fs.readdirSync(path),
      stat: (path) => {
        return new Promise((resolve, reject) => {
          fs.stat(path, (err, stats) => {
            if (err) reject(err)
            else resolve(stats)
          })
        })
      },
      statSync: (path) => fs.statSync(path),
    },

    // Path operations
    path: path,
  },
)
