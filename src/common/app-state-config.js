const Store = require('electron-store')

class AppStateConfig extends Store {
  constructor () {
    super({
      name: 'app-state',
      defaults: {
        windowSize: {
          width: 800,
          height: 600,
        },
      },
    })
  }
}

module.exports = AppStateConfig
