// Webpack is annoying as usual: https://github.com/electron/electron/issues/7300
import req from './req'
import UserConfig from './UserConfig'

const Store = req('electron-store')

export default class UserConfigStore extends Store {
  // Can pass any options from https://github.com/sindresorhus/electron-store#api
  // * watch - will watch the file for changes
  constructor (options) {
    super({
      name: 'user',
      defaults: UserConfig.getDefaultConfig(),
      clearInvalidConfig: false,
      ...options,
    })
  }

  getUserConfig (configStoreData) {
    if (configStoreData) {
      return new UserConfig(configStoreData) // no setting/updating on this one
    }
    return new UserConfig(this.store, { store: this })
  }
}
