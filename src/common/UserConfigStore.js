// Webpack is annoying as usual: https://github.com/electron/electron/issues/7300
const req = require('./req')
const UserConfig = require('./UserConfig')

const Store = req('electron-store')

class UserConfigStore extends Store {
  // Can pass any options from https://github.com/sindresorhus/electron-store#api
  // * watch - will watch the file for changes
  constructor (options) {
    super({
      name: 'user',
      defaults: UserConfig.getDefaultConfig(),
      ...options,
    })
  }

  getUserConfig () {
    return new UserConfig(this.store)
  }
}

module.exports = UserConfigStore
