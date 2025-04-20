import CachedStore from './CachedStore'
import UserConfig from './UserConfig'

export default class UserConfigStore extends CachedStore {
  // Can pass any options from https://github.com/sindresorhus/electron-store#api
  // * watch - will watch the file for changes
  constructor (options) {
    super({
      name: 'user-config',
      defaults: {
        config: UserConfig.defaultConfig,
      },
      store: options.store,
    })
    this.onChange = options.onChange

    // Initialize cache with default values
    this.cache = {
      config: UserConfig.defaultConfig,
      ...this.store.getAll(),
    }
  }

  getUserConfig (config) {
    return new UserConfig(config || this.get('config'))
  }

  setUserConfig (config) {
    this.set('config', config)
  }

  handleStoreChange = (newStore, oldStore) => {
    if (this.onChange) {
      this.onChange(newStore.config, oldStore.config)
    }
  }
}
