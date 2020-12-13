const get = require('lodash/get')
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
  constructor (profile) {
    this.profile = profile
  }

  getLogHeaders () {
    return this.profile.logHeaders
  }

  getFuelMapRows () {
    return this.profile.fuelMap.rows
  }

  getFuelMapColumns () {
    return this.profile.fuelMap.columns
  }

  get (key) {
    return get(this.profile, key)
  }
}

module.exports = ConfigProfile
