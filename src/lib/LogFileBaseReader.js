import each from 'lodash/each'
import without from 'lodash/without'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'

export default class LogFileBaseReader {
  constructor (filename, configProfile) {
    this.filename = filename
    this.configProfile = configProfile
  }

  async readFile () {
    throw new Error('Implement readFile!')
    // return {
    //   data: [],
    //   headers: [],
    //   length: 0,
    // }
  }

  // Returns headers / param names in the order specified in user config
  // Also will filter out hidden parameters / headers
  buildDisplayableParameterNameArray (allParameterNames) {
    let headers = [...allParameterNames]
    const { columns } = this.configProfile.getLogFileConfig()
    each(columns, (columnConfig, columnKey) => {
      if (columnConfig.name) {
        headers.push(columnConfig.name)
      }
      if (columnConfig.name || columnConfig.visible === false) {
        headers = without(headers, columnKey)
      }
    })
    headers = headers.filter((header) => this.configProfile.shouldShowColumn(header))
    return headers
  }

  // Transforms values based on user config settings / expressions. Will also
  // rename parameters, coerce to types, etc.
  //
  // convertValueFromConfig ({ key: 'MGP', value: '12.13456' })
  // => { 'MGP': 12.1, 'MAP': 12.1 }
  //
  // Returns an object with potentially multiple keys
  convertValueFromConfig ({ value, key } = {}) {
    const { columns, defaultType } = this.configProfile.getLogFileConfig()

    const columnConfig = columns?.[key] || {}
    const type = columnConfig.type || defaultType
    const rawType = columnConfig.rawType || defaultType
    const convertValue = this.configProfile.getConvertValueForColumn(key)
    let convertedValue = value

    // `columnConfig.convertValue` is built in ConfigProfile when there is a
    // valueFormula or valueTable on columnConfig
    if (convertValue) {
      convertedValue = parseValue(value, rawType)
      convertedValue = convertValue({ value: convertedValue })
    } else {
      convertedValue = parseValue(value, type)
    }

    const valueKV = { }
    if (this.configProfile.shouldShowColumn(key)) {
      valueKV[key] = convertedValue
    }
    if (columnConfig.name && this.configProfile.shouldShowColumn(columnConfig.name)) {
      valueKV[columnConfig.name] = convertedValue
    }
    return valueKV
  }

  getTableLocations (valuesObject) {
    const { row, column } = this.configProfile.getLogFileConfig()
    const mixtureColumns = this.configProfile.getMixtureColumns()
    const mixtureCorrectionColumns = this.configProfile.getMixtureCorrectionColumns()
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const rowValue = parseFloat(valuesObject[row])
    const columnValue = parseFloat(valuesObject[column])

    const mixtureValues = mixtureColumns.map((mixCol) => parseFloat(valuesObject[mixCol]))
    const correctionValues = mixtureCorrectionColumns.map((mixCorrCol) => parseFloat(valuesObject[mixCorrCol]) || 0)
    return {
      rowV: rowValue,
      rowI: getInterpolatedIndex(rowValue, fuelRows),
      colV: columnValue,
      colI: getInterpolatedIndex(columnValue, fuelColumns),
      m: mixtureValues,
      corr: correctionValues,
      // Corrected afr based on correction applied at ecu and current afr
      mCorr: mixtureValues.map((mixtureValue, index) => (
        mixtureValue * (1 + (correctionValues[index]) / 100)
      )),
    }
  }
}

function notNaNOrValue (convertedValue, originalValue) {
  return isNaN(convertedValue)
    ? originalValue
    : convertedValue
}

function parseValue (value, type) {
  if (type === 'float') {
    return notNaNOrValue(parseFloat(value) || 0, value)
  } else if (type === 'integer') {
    return notNaNOrValue(parseInt(value) || 0, value)
  }
  return value
}
