// Webpack is annoying as usual: https://github.com/electron/electron/issues/7300
const Store = typeof window === 'object'
  ? window.require('electron-store')
  : require('electron-store')

const defaultConfig = {
  currentProfile: 'Default',
  profiles: [{
    name: 'Default',
    fuelMap: {
      columns: [1000, 2000, 3000, 4000, 5000],
      rows: [1, 2, 3, 4, 5, 6, 7],
    },
    suggestCalc: 'afr',
  }],
}

class UserConfig extends Store {
  // Can pass any options from https://github.com/sindresorhus/electron-store#api
  // * watch - will watch the file for changes
  constructor (options) {
    super({
      name: 'user',
      defaults: defaultConfig,
      ...options,
    })
  }
}

module.exports = UserConfig
