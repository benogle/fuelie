// Webpack is annoying as usual: https://github.com/electron/electron/issues/7300

import req from './req'
import _ from 'lodash'

const fs = req('fs')
const Store = req('electron-store')

const SAVE_DEBOUNCE_MS = 2000
const FILE_WATCH_UPDATE_MS = 100

export default class CachedStore {
  constructor ({ onChange, ...options }) {
    this.onChange = onChange
    this.cachedStoreObject = null
    this.fileStore = new Store({
      ...options,
      watch: false, // we watch local
    })

    this.watchConfigFile()
  }

  destroy () {
    this.cleanUpWatcher()
  }

  getStore () {
    if (!this.cachedStoreObject) {
      this.cachedStoreObject = this.fileStore.store
    }
    return this.cachedStoreObject
  }

  setStore (newStoreObject, {
    writeToDisk = true,
    writeImmediately = false,
  } = {}) {
    this.cachedStoreObject = newStoreObject
    this.onChange(newStoreObject, this.getStore())
    if (writeToDisk) {
      if (writeImmediately) {
        this.writeStoreToDisk()
      } else {
        this.debouncedWriteStoreToDisk()
      }
    }
  }

  set (key, value, options) {
    const newStoreObject = _.cloneDeep(this.getStore())
    _.set(newStoreObject, key, value)
    this.setStore(newStoreObject, options)
  }

  writeStoreToDisk = () => {
    this.fileStore.store = this.cachedStoreObject
  }

  debouncedWriteStoreToDisk = _.debounce(() => {
    this.fileStore.store = this.cachedStoreObject
  }, SAVE_DEBOUNCE_MS)

  //
  // File watching
  //

  cleanUpWatcher = () => {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }

  watchConfigFile = () => {
    this.cleanUpWatcher()

    // https://nodejs.org/docs/latest/api/fs.html#fs_class_fs_fswatcher
    this.watcher = fs.watch(this.fileStore.path, { persistent: false }, this.updateConfig)
  }

  updateConfig = _.debounce(() => { // eslint-disable-line react/sort-comp
    // The .store getter reads from disk
    this.setStore(this.fileStore.store, { writeToDisk: false })

    // HACK: ideally calling watch only on mount would be all we need to do.
    // But I can't get the file watcher to work reliably more than once for
    // edits within the app. e.g. open the UserConfigPage window and edit a
    // thing 2x, the handler would only be called once. This will setup the
    // file watcher again after each change.
    this.watchConfigFile()
  }, FILE_WATCH_UPDATE_MS)
}
