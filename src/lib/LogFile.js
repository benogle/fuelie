import some from 'lodash/some'
import last from 'lodash/last'
import times from 'lodash/times'
import flatten from 'lodash/flatten'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import mapValues from 'lodash/mapValues'
import intersection from 'lodash/intersection'
import csv from 'csv-parser'

import req from 'common/req'
import { round } from 'common/helpers'
import expressions from 'common/expressions'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'
import detectCSV from 'detect-csv'

const fs = req('fs')

const RELOAD_KEYS = ['fuelMap', 'logFile', 'units']
const MAX_LINE_RANGE_GAP = 5

export default class LogFile {
  constructor (filename, configProfile, { onChange } = {}) {
    this.filename = filename
    this.configProfile = configProfile
  }

  async setConfigProfile (newConfigProfile, prevConfigProfile) {
    if (!prevConfigProfile) prevConfigProfile = this.configProfile
    this.configProfile = newConfigProfile
    const changedKeys = this.configProfile.getChangedKeys(prevConfigProfile)
    if (!changedKeys) {
      console.log('No changed keys, not updating LogFile state')
      return
    }

    const changedReloadKeys = intersection(RELOAD_KEYS, changedKeys)
    if (changedReloadKeys.length) {
      console.log('Reloading file', changedReloadKeys)
      return this.readFile()
    }

    const changeHandlers = {
      avgFuelMixture: () => this.buildAvgFuelMixtureTable(),
      fuelMixtureTarget: () => this.buildTargetMixtureTable(),
      // suggestCalc: () => {},
    }

    // A simpler change happend, can use the data we already have
    for (const key of changedKeys) {
      if (changeHandlers[key]) {
        console.log('Trigger logfile update', key)
        await changeHandlers[key]()
      } else {
        console.log('Key didnt trigger any changes', key)
      }
    }
  }

  readLine (logLine) {
    const { time, row, column, columns, defaultType } = this.configProfile.getLogFileConfig()
    const mixtureColumns = this.configProfile.getMixtureColumns()
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const rowV = parseFloat(logLine[row])
    const colV = parseFloat(logLine[column])

    const parsedLine = mapValues(logLine, (v, k) => (
      parseValue(v, k, columns, defaultType)
    ))
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

  async readFile () {
    const separator = await detectSeparator(this.filename)
    if (!separator) {
      throw new Error('Cannot detect separator')
    }
    this.data = await new Promise((resolve, reject) => {
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
    this.length = this.data.length

    // Build out second order things
    this.buildAvgFuelMixtureTable()
    this.buildTargetMixtureTable()

    return this.data
  }

  getLineAtindex (index) {
    return this.data[index] || null
  }

  getLastIndex () {
    return this.length - 1
  }

  // speedFactor - 2 for 2x (faster), .5 for half speed
  getMSTilNextLine (index, speedFactor = 1) {
    const currentLine = this.data[index]
    const nextLine = this.data[index + 1]

    if (!nextLine) return null

    // TODO: Make this time thing configurable
    return Math.round((nextLine.t - currentLine.t) * 1000 * (1 / speedFactor))
  }

  getTimeMS (index) {
    const firstLine = this.data[0]
    const lastLine = this.data[index]

    // TODO: Make this time thing configurable
    return Math.round((lastLine.t - firstLine.t) * 1000)
  }

  getTotalTimeMS () {
    return this.getTimeMS(this.getLastIndex())
  }

  getLineRanges ({ minX, maxX, minY, maxY }) {
    const mixTable = this.getAvgFuelMixtureTable(0) // should be the same on all mixture tables
    const ranges = []
    for (let y = minY; y <= maxY; y++) {
      const row = mixTable[y]
      for (let x = minX; x <= maxX; x++) {
        const cell = row[x]
        if (cell.lineRanges) ranges.push(cell.lineRanges)
      }
    }

    // Probably the most common case...
    if (ranges.length === 1) return ranges[0]

    // Could merge the ranges with an interval tree. This is fine and probably faster
    const seen = new Set()
    return flatten(ranges).filter(({ start, end }) => {
      const str = `${start},${end}`
      if (seen.has(str)) return false
      seen.add(str)
      return true
    })
  }

  // Returns an array of rows. Access via result[row][column]
  getAvgFuelMixtureTable (index) {
    if (index == null) return this.avgFuelMixtureTable
    return this.avgFuelMixtureTable[index]
  }

  buildAvgFuelMixtureTable () {
    const numberMixtureColumns = this.configProfile.getNumberMixtureColumns()
    this.avgFuelMixtureTable = times(numberMixtureColumns, (i) => (
      this.buildSingleAvgFuelMixtureTable(i)
    ))
  }

  buildSingleAvgFuelMixtureTable (mixtureIndex) {
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const { minValue, maxValue, minWeight, minTotalWeight, ignore } = this.configProfile.get('avgFuelMixture')

    let ignoreFunctions = null
    if (ignore && ignore.length) {
      ignoreFunctions = ignore.map((expressionObj) => (
        expressions.buildEval({ expressionObj, booleanOnly: true })
      ))
    }

    function getEmptyValue () {
      return { length: 0, value: null }
    }

    const table = new Array(fuelRows.length)
    for (let rowI = 0; rowI < table.length; rowI++) {
      table[rowI] = new Array(fuelColumns.length)
      table[rowI].fill(getEmptyValue())
    }

    function addSample (value, lineIndex, rowIndex, colIndex, weight) {
      if (!(weight > (minWeight || 0))) return
      if (value < minValue || value > maxValue) return

      let cell = table[rowIndex][colIndex]
      if (cell && cell.value) {
        const newCellLength = cell.length + 1
        const newCellWeight = cell.weight + weight
        cell.rawValue = (cell.rawValue * cell.weight + value * weight) / newCellWeight
        cell.value = round(cell.rawValue, 2)
        cell.length = newCellLength
        cell.weight = newCellWeight
        cell.min = Math.min(cell.min, value)
        cell.max = Math.max(cell.max, value)

        const lastRange = last(cell.lineRanges)
        if (lineIndex - lastRange.end <= MAX_LINE_RANGE_GAP) {
          lastRange.end = lineIndex
        } else {
          cell.lineRanges.push({ start: lineIndex, end: lineIndex })
        }

        const vCountValue = round(value, 1)
        if (cell.vCount[vCountValue]) {
          cell.vCount[vCountValue]++
        } else {
          cell.vCount[vCountValue] = 1
        }
      } else {
        cell = {
          weight,
          length: 1,
          rawValue: value,
          value: round(value, 2),
          min: value,
          max: value,
          lineRanges: [{ start: lineIndex, end: lineIndex }],
          vCount: { [round(value, 1)]: 1 },
        }
      }
      table[rowIndex][colIndex] = cell
    }

    for (let lineIndex = 0; lineIndex < this.data.length; lineIndex++) {
      const line = this.data[lineIndex]
      const { rowI, colI, m } = line
      const newLineValue = m[mixtureIndex]
      if (!rowI || !colI || !newLineValue) {
        console.log('problem with interpolate', rowI, colI, line, fuelRows, fuelColumns)
        continue
      }

      if (ignoreFunctions) {
        const conditionResults = ignoreFunctions.map((ignoreFn) => ignoreFn(line))
        // some() will basically OR the expressions. If any returns true, ignore this line
        const shouldIgnore = some(conditionResults)
        if (shouldIgnore) {
          // console.log('Ignore', line)
          continue
        }
      }

      const { index: rowIndex, weight: rowWeight } = rowI
      const { index: colIndex, weight: colWeight } = colI
      addSample(newLineValue, lineIndex, rowIndex, colIndex, rowWeight * colWeight) // top reft
      addSample(newLineValue, lineIndex, rowIndex, colIndex + 1, rowWeight * (1 - colWeight)) // top right
      addSample(newLineValue, lineIndex, rowIndex + 1, colIndex, (1 - rowWeight) * colWeight) // bottom left
      addSample(newLineValue, lineIndex, rowIndex + 1, colIndex + 1, (1 - rowWeight) * (1 - colWeight)) // bottom right
    }

    for (let rowIndex = 0; rowIndex < table.length; rowIndex++) {
      const row = table[rowIndex]
      for (var colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex]
        if (cell.weight < minTotalWeight) {
          row[colIndex] = getEmptyValue()
        }
      }
    }

    return table
  }

  getTargetMixtureTable () {
    return this.targetMixtureTable
  }

  buildTargetMixtureTable () {
    const { table } = this.configProfile.getFuelMixtureTarget()
    this.targetMixtureTable = table.map((row) => (
      row.map((value) => ({
        value,
      }))
    ))
    this.buildSuggestedMixtureChangeTable()
  }

  getSuggestedMixtureChangeTable (index) {
    if (index == null) return this.suggestedMixtureChangeTable
    return this.suggestedMixtureChangeTable[index]
  }

  buildSuggestedMixtureChangeTable () {
    // 12.3 / targetFuel = 14.7 / 1
    // targetFuel = 12.3 / 14.7 = 0.8367 (scaling factor on fuel cell)
    // actualAir / actualFuel = targetAir / targetFuel
    // targetFuel = actualAir / targetAir
    const buildSuggestionsForMixtureIndex = (mixtureIndex) => (
      this.targetMixtureTable.map((row, rowIndex) => (
        row.map(({ value: targetValue }, colIndex) => {
          const { value: loggedValue } = this.avgFuelMixtureTable[mixtureIndex][rowIndex][colIndex]
          let suggestedValue = null
          if (loggedValue != null) {
            suggestedValue = round((loggedValue / targetValue - 1) * 100, 2)
          }
          return { value: suggestedValue, targetValue, loggedValue }
        })
      ))
    )

    const numberMixtureColumns = this.configProfile.getNumberMixtureColumns()
    this.suggestedMixtureChangeTable = times(numberMixtureColumns, buildSuggestionsForMixtureIndex)
  }
}

function notNaNOrValue (parsedValue, originalValue) {
  return isNaN(parsedValue)
    ? originalValue
    : parsedValue
}

function parseValue (value, key, columns = {}, defaultType = 'float') {
  const type = (columns && columns[key] && columns[key].type) || defaultType
  if (type === 'float') {
    return notNaNOrValue(parseFloat(value) || 0, value)
  } else if (type === 'integer') {
    return notNaNOrValue(parseInt(value) || 0, value)
  }
  return value
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
