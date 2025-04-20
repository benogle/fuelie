// Webpack is annoying as usual: https://github.com/electron/electron/issues/7300

import _ from 'lodash'

const SAVE_DEBOUNCE_MS = 2000
const FILE_WATCH_UPDATE_MS = 100

export default class CachedStore {
  constructor (options) {
    this.options = options
    this.store = options.store
    this.cache = {}
    this.setupListeners()
  }

  setupListeners () {
    window.electron.on('store:changed', (data) => {
      this.cache = data
      if (this.handleStoreChange) {
        this.handleStoreChange(data, this.cache)
      }
    })
  }

  get (key) {
    return this.cache[key]
  }

  set (key, value) {
    this.cache[key] = value
    window.electron.store.set(key, value)
  }

  destroy () {
    window.electron.removeAllListeners('store:changed')
  }

  getStore () {
    if (!this.cache) {
      this.cache = window.electron.store.getAll()
    }
    return this.cache
  }

  setStore (newStoreObject, {
    writeToDisk = true,
    writeImmediately = false,
  } = {}) {
    this.cache = newStoreObject
    if (this.handleStoreChange) {
      this.handleStoreChange(newStoreObject, this.cache)
    }
    if (writeToDisk) {
      if (writeImmediately) {
        this.writeStoreToDisk()
      } else {
        this.debouncedWriteStoreToDisk()
      }
    }
  }

  writeStoreToDisk = () => {
    window.electron.store.set('', this.cache)
  }

  debouncedWriteStoreToDisk = _.debounce(() => {
    window.electron.store.set('', this.cache)
  }, SAVE_DEBOUNCE_MS)

  handleStoreChange = _.debounce(() => {
    this.setStore(window.electron.store.getAll(), { writeToDisk: false })
  }, FILE_WATCH_UPDATE_MS)
}
