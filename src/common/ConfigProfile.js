import get from 'lodash/get'
import each from 'lodash/each'
import find from 'lodash/find'
import clone from 'lodash/clone'
import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'
import mapValues from 'lodash/mapValues'
import expressions from 'common/expressions'
import interpolate from 'lib/interpolate'

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
//   logFile: {
//     time: 'Time/s',
//     row: 'Engine Load',
//     column: 'Engine Speed',
//     mixture: 'O2 #2',
//   },
// }

export default class ConfigProfile {
  constructor (profile, { userConfig } = {}) {
    this.profile = profile
    this.userConfig = userConfig // reference to the main userConfig for sets
    if (!this.profile.fuelMixtureTarget) {
      this.profile.fuelMixtureTarget = this.getDefaultFuelMixtureTarget()
    }
    this.parseColumnsConfig()
  }

  parseColumnsConfig () {
    if (!this.profile.logFile.columns) {
      this.profile.logFile.columns = {}
    }
    this.profile.logFile.columns = mapValues(this.profile.logFile.columns, (columnConfig, columnKey) => (
      this.parseColumnConfig(columnConfig, columnKey)
    ))
  }

  parseColumnConfig (columnConfig, columnKey) {
    if (columnConfig.valueFormula) {
      columnConfig.convertValue = expressions.buildEval({
        expressionObj: columnConfig.valueFormula,
        dataKey: 'result',
        booleanOnly: false,
        injectArgs: ['value'],
      })
    } else if (columnConfig.valueTable) {
      columnConfig.convertValue = ({ value = 0 } = {}) => (
        // TODO: sort the table asc by item[0] outside of this func
        interpolate(value, columnConfig.valueTable)
      )
    }
    return columnConfig
  }

  getLogFileConfig () {
    return this.profile.logFile
  }

  getFuelMapRows () {
    return this.profile.fuelMap.rows
  }

  getFuelMapColumns () {
    return this.profile.fuelMap.columns
  }

  get (key, defaultVal) {
    return get(this.profile, key, defaultVal)
  }

  getLogFileColumnConfig (columnName) {
    const columns = this.get(['logFile', 'columns'])
    return columns?.[columnName] || find(columns, (columnConfig) => columnConfig.name === columnName)
  }

  getLogFileColumnDisplayOrder () {
    return this.get(['logFile', 'columnDisplayOrder'], [])
  }

  getLogFileColumnDecimals (columnName) {
    const config = this.getLogFileColumnConfig(columnName)
    if (config && config.type === 'integer') return 0
    if (config && isNumber(config.decimals)) return config.decimals
    return 2
  }

  getChangedKeys (otherConfigProfile) {
    const changedKeys = []
    each(this.profile, (v, k) => {
      if (!isEqual(v, otherConfigProfile.get(k))) {
        changedKeys.push(k)
      }
    })
    return changedKeys && changedKeys.length
      ? changedKeys
      : null
  }

  getMixtureColumns () {
    const { mixture } = this.getLogFileConfig()
    return isArray(mixture) ? mixture : [mixture]
  }

  getNumberMixtureColumns () {
    const { mixture } = this.getLogFileConfig()
    return isArray(mixture) ? mixture.length : 1
  }

  getFuelMixtureTarget () {
    return this.profile.fuelMixtureTarget
  }

  getDefaultFuelMixtureTarget () {
    const table = []
    // TODO: make something smart here that gives good defaults
    for (const row of this.profile.fuelMap.rows) { // eslint-disable-line
      const newRow = []
      for (const column of this.profile.fuelMap.columns) { // eslint-disable-line
        newRow.push(12.5)
      }
      table.push(newRow)
    }
    return { table }
  }

  getSuggestedMixtureChange () {
    return this.profile.suggestedMixtureChange || {}
  }

  getSuggestedMixtureChangeUnits () {
    return this.getSuggestedMixtureChange().units || ''
  }

  getMixtureDifference () {
    return this.profile.mixtureDifference || {}
  }

  getMixtureDifferenceUnits () {
    return this.getMixtureDifference().units || ''
  }

  // setters

  set (key, value) {
    if (!this.userConfig) return
    return this.userConfig.setConfigProfileKey(this.profile.name, key, value)
  }

  // changes - Array of objects: [{x, y, value}, ...]
  updateFuelMixtureTarget (changes) {
    const newTarget = {
      ...this.profile.fuelMixtureTarget,
      table: clone(this.profile.fuelMixtureTarget.table),
    }
    for (const { x, y, value } of changes) {
      newTarget.table[y][x] = value
    }
    return this.set('fuelMixtureTarget', newTarget)
  }
}
