const Store = require('electron-store')

const defaultConfig = {
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
  constructor () {
    super({
      name: 'user',
      defaults: defaultConfig,
    })
  }
}

module.exports = UserConfig
