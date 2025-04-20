import Store from 'electron-store'

export default class AppStateConfigStore extends Store {
  constructor () {
    super({
      name: 'app-state',
      defaults: {
        windowSize: {
          width: 1250,
          height: 700,
        },
        userConfigWindowSize: {
          width: 700,
          height: 800,
        },
      },
    })
  }
}
