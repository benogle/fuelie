import UserConfig from './UserConfig'
import CachedStore from './CachedStore'

export default class UserConfigStore extends CachedStore {
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
    return new UserConfig(this.getStore(), { store: this })
  }
}
