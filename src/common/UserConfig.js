// The thing that reads and makes sense of the user's config

const defaultsDeep = require('lodash/defaultsDeep')
const ConfigProfile = require('./ConfigProfile')

class UserConfig {
  static getDefaultConfig () {
    return defaultConfig
  }

  constructor (config) {
    this.config = defaultsDeep(config, defaultConfig)
  }

  getConfigProfile () {
    const { profiles, currentProfile } = this.config
    const found = profiles.filter((p) => p.name === currentProfile)
    if (!found && found.length) {
      console.log(`Profile ${currentProfile} not found!`)
    }
    const profile = found && found.length
      ? found[0]
      : profiles[0]
    return new ConfigProfile(profile)
  }
}

const defaultConfig = {
  currentProfile: 'Default',
  profiles: [{
    name: 'Default',
    suggestCalc: 'afr',
    fuelMap: {
      rows: [
        9.96717357635498,
        6.95952606201172,
        3.9518780708313,
        1.52635419368744,
        -0.0259800497442484,
        -1.1902312040329,
        -2.35448241233826,
        -3.51873373985291,
        -4.68298482894897,
        -5.84723567962646,
        -6.91446542739868,
        -8.07871723175049,
        -9.24296760559082,
        -10.4072189331055,
        -11.5714702606201,
        -12.7357206344604,
        -13.8999719619751,
      ],
      columns: [
        500,
        1000,
        1500,
        2000,
        2500,
        3000,
        3500,
        4000,
        4500,
        5000,
        5500,
        6000,
        6550,
        7000,
        7500,
        8000,
        8500,
        9000,
        9500,
        10000,
        10500,
      ],
    },
    // fuelMixtureTarget: {
    //   table: [
    //     [col, col, col],
    //     // ...other rows
    //   ],
    // },
    units: {
      mixture: 'afr',
    },
    logHeaders: {
      time: 'Time/s',
      row: 'Engine Load',
      column: 'Engine Speed',
      mixture: 'O2 #2',
    },
    avgFuelMixture: {
      minValue: 8,
      maxValue: 20,
      minWeight: 0.3,
      minTotalWeight: 1,
    },
  }],
}

module.exports = UserConfig
