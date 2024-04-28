import each from 'lodash/each'
import without from 'lodash/without'
import csv from 'csv-parser'

import req from 'common/req'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'
import detectCSV from 'detect-csv'

const fs = req('fs')

export default class LogFileCSVReader {
  constructor (filename, configProfile) {
    this.filename = filename
    this.configProfile = configProfile
  }

  async readFile () {
    const separator = await detectSeparator(this.filename)
    if (!separator) {
      throw new Error('Cannot detect separator')
    }
    this.headers = null
    const data = await new Promise((resolve, reject) => {
      const lines = []
      fs.createReadStream(this.filename, { encoding: 'utf8' })
        .pipe(csv({
          separator,
          mapHeaders: ({ header }) => header.trim(),
        }))
        .on('data', (data) => {
          // console.log(data)
          lines.push(this.readLine(data))
        })
        .on('error', (error) => {
          console.log('readerror', error)
          reject(error)
        })
        .on('end', () => resolve(lines))
    })

    return {
      data,
      headers: this.headers,
      length: data.length,
    }
  }

  readLine (logLine) {
    const { time, row, column, columns, defaultType } = this.configProfile.getLogFileConfig()
    const mixtureColumns = this.configProfile.getMixtureColumns()
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const rowV = parseFloat(logLine[row])
    const colV = parseFloat(logLine[column])

    if (!this.headers) {
      this.headers = Object.keys(logLine)
      each(columns, (columnConfig, columnKey) => {
        if (columnConfig.name) {
          this.headers.push(columnConfig.name)
        }
        if (columnConfig.name || columnConfig.visible === false) {
          this.headers = without(this.headers, columnKey)
        }
      })
      this.headers = this.headers.filter((header) => this.configProfile.shouldAllowColumn(header))
    }

    const parsedLine = {}
    each(logLine, (value, key) => {
      const newValueKV = parseLineValue({ key, value, columns, configProfile: this.configProfile, defaultType })
      Object.assign(parsedLine, newValueKV)
    })

    return {
      ...parsedLine,
      t: parseFloat(logLine[time]),
      rowV,
      rowI: getInterpolatedIndex(rowV, fuelRows),
      colV,
      colI: getInterpolatedIndex(colV, fuelColumns),
      m: mixtureColumns.map((mixCol) => parseFloat(logLine[mixCol])),
    }
  }
}

function notNaNOrValue (parsedValue, originalValue) {
  return isNaN(parsedValue)
    ? originalValue
    : parsedValue
}

function parseValue (value, type) {
  if (type === 'float') {
    return notNaNOrValue(parseFloat(value) || 0, value)
  } else if (type === 'integer') {
    return notNaNOrValue(parseInt(value) || 0, value)
  }
  return value
}

function parseLineValue ({ value, key, columns = {}, configProfile, defaultType = 'float' } = {}) {
  const columnConfig = columns?.[key] || {}
  const type = columnConfig.type || defaultType
  const rawType = columnConfig.rawType || defaultType
  const convertValue = configProfile.getConvertValueForColumn(key)
  let parsedValue = value

  // `columnConfig.convertValue` is built in ConfigProfile when there is a
  // valueFormula or valueTable on columnConfig
  if (convertValue) {
    parsedValue = parseValue(value, rawType)
    parsedValue = convertValue({ value: parsedValue })
  } else {
    parsedValue = parseValue(value, type)
  }

  const valueKV = { }
  if (configProfile.shouldAllowColumn(key)) {
    valueKV[key] = parsedValue
  }
  if (columnConfig.name && configProfile.shouldAllowColumn(columnConfig.name)) {
    valueKV[columnConfig.name] = parsedValue
  }
  return valueKV
}

async function detectSeparator (filename) {
  const firstLine = await readFirstLine(filename)
  const csvInfo = detectCSV(firstLine)
  return csvInfo && csvInfo.delimiter
    ? csvInfo.delimiter
    : null
}

function readFirstLine (path) {
  return new Promise(function (resolve, reject) {
    const rs = fs.createReadStream(path, { encoding: 'utf8' })
    let acc = ''
    let pos = 0
    let index
    rs.on('data', function (chunk) {
      index = chunk.indexOf('\n')
      acc += chunk
      index !== -1 ? rs.close() : pos += chunk.length
    }).on('close', function () {
      resolve(acc.slice(0, pos + index))
    }).on('error', function (err) {
      reject(err)
    })
  })
}
