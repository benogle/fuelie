import get from 'lodash/get'
import each from 'lodash/each'
import find from 'lodash/find'
import clone from 'lodash/clone'
import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import mapValues from 'lodash/mapValues'
import expressions from 'common/expressions'
import interpolate from 'lib/interpolate'
import { CHART_COLOR_PALETTE, hexToRGBA } from 'lib/color'

import {
  UNITS_MIXTURE_LAMBDA,
  UNITS_MIXTURE_AFR,
  UNITS_TEMP_C,
  UNITS_TEMP_F,
  UNITS_SPEED_KPH,
  UNITS_SPEED_MPH,
  UNITS_PRESSURE_KPA,
  UNITS_PRESSURE_PSI,
  PRESSURE_KPA_PER_PSI,
  SPEED_KPH_PER_MPH,
  MIXTURE_AFR_PER_LAMBDA_GAS,
  UNIT_TYPE_MIXTURE,
  UNIT_TYPE_TEMPERATURE,
  UNIT_TYPE_PRESSURE,
  UNIT_TYPE_SPEED,
} from 'common/constants'

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
    this.convertValueByColumnName = {}
    if (!this.profile.logFile.columns) {
      this.profile.logFile.columns = {}
    }
    this.profile.logFile.columns = mapValues(this.profile.logFile.columns, (columnConfig, columnKey) => (
      this.parseColumnConfig(columnConfig, columnKey)
    ))
  }

  parseColumnConfig (columnConfig, columnKey) {
    if (columnConfig.valueFormula) {
      this.convertValueByColumnName[columnKey] = expressions.buildEval({
        expressionObj: columnConfig.valueFormula,
        dataKey: 'result',
        booleanOnly: false,
        injectArgs: ['value'],
      })
    } else if (columnConfig.valueTable) {
      this.convertValueByColumnName[columnKey] = ({ value = 0 } = {}) => (
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

  shouldShowColumn (columnName) {
    if (!this.profile.logFile.showSpecifiedColumnsOnly) return true
    if (!this.allowedColumns) {
      this.allowedColumns = new Set(this.getLogFileColumnDisplayOrder())
    }
    return this.allowedColumns.has(columnName)
  }

  shouldProcessColumn (columnName) {
    return !!this.shouldShowColumn(columnName) || !!this.profile.logFile.columns?.[columnName]
  }

  get (key, defaultVal) {
    return get(this.profile, key, defaultVal)
  }

  getLogFileColumnConfig (columnName) {
    const columns = this.get(['logFile', 'columns'])
    return columns?.[columnName] || find(columns, (columnConfig) => columnConfig.name === columnName)
  }

  getConvertValueForColumn (columnName) {
    return this.convertValueByColumnName[columnName]
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

  getMixtureCorrectionColumns () {
    const { mixtureCorrection } = this.getLogFileConfig()
    return mixtureCorrection
      ? (isArray(mixtureCorrection) ? mixtureCorrection : [mixtureCorrection])
      : []
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

  getUnits () {
    return this.profile.units || {}
  }

  getTemperatureUnits () {
    return this.getUnits().temperature || UNITS_TEMP_F
  }

  getPressureUnits () {
    return this.getUnits().pressure || UNITS_PRESSURE_PSI
  }

  getSpeedUnits () {
    return this.getUnits().speed || UNITS_SPEED_MPH
  }

  getMitureUnits () {
    return this.getUnits().mixture || UNITS_MIXTURE_AFR
  }

  convertValueToUnits (unitType, value, currentUnits) {
    const funcs = {
      [UNIT_TYPE_MIXTURE]: this.convertMixtureToUnits,
      [UNIT_TYPE_TEMPERATURE]: this.convertTemperatureToUnits,
      [UNIT_TYPE_PRESSURE]: this.convertPressureToUnits,
      [UNIT_TYPE_SPEED]: this.convertSpeedToUnits,
    }
    return funcs[unitType]
      ? funcs[unitType].call(this, value, currentUnits)
      : value
  }

  // currentUnits can be one of UNITS_TEMP_*
  convertTemperatureToUnits (value, currentUnits = UNITS_TEMP_C) {
    const desiredUnits = this.getTemperatureUnits()
    currentUnits = currentUnits.toLowerCase()
    if (currentUnits === UNITS_TEMP_C && desiredUnits === UNITS_TEMP_F) {
      return (value * 9 / 5) + 32
    } else if (currentUnits === UNITS_TEMP_F && desiredUnits === UNITS_TEMP_C) {
      return (value - 32) * 5 / 9
    }
    return value
  }

  // currentUnits can be one of UNITS_PRESSURE_*
  convertPressureToUnits (value, currentUnits = UNITS_PRESSURE_KPA) {
    const desiredUnits = this.getPressureUnits()
    currentUnits = currentUnits.toLowerCase()
    if (currentUnits === UNITS_PRESSURE_KPA && desiredUnits === UNITS_PRESSURE_PSI) {
      return value / PRESSURE_KPA_PER_PSI
    } else if (currentUnits === UNITS_PRESSURE_PSI && desiredUnits === UNITS_PRESSURE_KPA) {
      return value * PRESSURE_KPA_PER_PSI
    }
    return value
  }

  // currentUnits can be one of UNITS_SPEED_*
  convertSpeedToUnits (value, currentUnits = UNITS_SPEED_KPH) {
    const desiredUnits = this.getSpeedUnits()
    currentUnits = currentUnits.toLowerCase()
    if (currentUnits === UNITS_SPEED_KPH && desiredUnits === UNITS_SPEED_MPH) {
      return value / SPEED_KPH_PER_MPH
    } else if (currentUnits === UNITS_SPEED_MPH && desiredUnits === UNITS_SPEED_KPH) {
      return value * SPEED_KPH_PER_MPH
    }
    return value
  }

  // currentUnits can be one of UNITS_MIXTURE_*
  convertMixtureToUnits (value, currentUnits = UNITS_MIXTURE_AFR) {
    const desiredUnits = this.getMitureUnits()
    currentUnits = currentUnits.toLowerCase()
    if (currentUnits === UNITS_MIXTURE_LAMBDA && desiredUnits === UNITS_MIXTURE_AFR) {
      return value * MIXTURE_AFR_PER_LAMBDA_GAS
    } else if (currentUnits === UNITS_MIXTURE_AFR && desiredUnits === UNITS_MIXTURE_LAMBDA) {
      return value / MIXTURE_AFR_PER_LAMBDA_GAS
    }
    return value
  }

  getChartZoom () {
    return this.get(['charting', 'zoom'])
  }

  getChartingConfig () {
    const chartingConfig = this.get(['charting'])
    const newConfig = { ...chartingConfig }

    let colorIndex = 0
    function getNextColor () {
      const nextColor = hexToRGBA(CHART_COLOR_PALETTE[colorIndex], 0.8)
      colorIndex = (colorIndex + 1) % CHART_COLOR_PALETTE.length
      return nextColor
    }

    newConfig.pages = map(newConfig.pages, (page) => ({
      ...page,
      charts: map(page.charts, (chart) => ({
        ...chart,
        lines: map(chart.lines, (line) => ({
          ...line,
          color: line.color ? line.color : getNextColor(),
        })),
      })),
    }))
    return newConfig
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

  setChartZoomPointsInView (pointsInView) {
    return this.set('charting.zoom.pointsInView', pointsInView)
  }

  setChartLineVisibility ({ pageIndex, chartIndex, lineIndex, visible }) {
    return this.set(`charting.pages.${pageIndex}.charts.${chartIndex}.lines.${lineIndex}.show`, !!visible)
  }
}
