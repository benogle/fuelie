
// {
//   name: 'Default',
//   suggestCalc: 'afr',
//   fuelMap: {
//     rows: [...],
//     columns: [...],
//   },
//   units: {
//     mixture: 'afr',
//   },
//   logHeaders: {
//     time: 'Time/s',
//     row: 'Engine Load',
//     column: 'Engine Speed',
//     mixture: 'O2 #2',
//   },
// }

class ConfigProfile {
  constructor (config) {
    this.config = config
  }

  getConfigProfile () {
    console.log('ok')
  }
}

module.exports = ConfigProfile
