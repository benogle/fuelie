// The thing that reads and makes sense of the user's config

import findIndex from 'lodash/findIndex'
import defaultsDeep from 'lodash/defaultsDeep'
import size from 'lodash/size'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import ConfigProfile from './ConfigProfile'

export default class UserConfig {
  static getDefaultConfig () {
    return defaultConfig
  }

  constructor (config, { store } = {}) {
    this.store = store
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

    return new ConfigProfile(profile, { userConfig: this })
  }

  setConfigProfileKey (profileName, key, value) {
    if (!this.store) return
    const index = findIndex(this.config.profiles, (p) => p.name === profileName)
    return this.store.set(`profiles.${index}.${key}`, value)
  }

  getConfig () {
    return this.store.getStore()
  }

  replaceConfig (newConfig) {
    if (this.store && size(newConfig) > 0 && !isArray(newConfig) && isObject(newConfig)) {
      this.store.setStore(newConfig, { writeImmediately: true })
    }
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
    units: {
      mixture: 'afr',
    },
    logFile: {
      time: 'Time/s',
      row: 'Engine Load',
      column: 'Engine Speed',
      mixture: ['O2 #1'],
      defaultType: 'float',
    },
    avgFuelMixture: {
      minValue: 8,
      maxValue: 20,
      minWeight: 0.3,
      minTotalWeight: 1,
    },
    suggestedMixtureChange: {
      units: '%',
      suggestedValue: {
        result: '(loggedValue / targetValue - 1) * 100',
      },
    },
    mixtureDifference: {
      units: '',
      difference: {
        result: 'mixture1 - mixture0',
      },
    },
    charting: {
      zoom: {
        pointsInView: 6000,
        maxPointsInView: 6000,
      },
    },
  }],
}
