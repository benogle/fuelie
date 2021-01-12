import Store from 'electron-store'

export default class AppStateConfigStore extends Store {
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
