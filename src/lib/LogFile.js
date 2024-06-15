import some from 'lodash/some'
import last from 'lodash/last'
import times from 'lodash/times'
import flatten from 'lodash/flatten'
import fromPairs from 'lodash/fromPairs'
import intersection from 'lodash/intersection'

import req from 'common/req'
import { round } from 'common/helpers'
import expressions from 'common/expressions'
import LogFileCSVReader from './LogFileCSVReader'
import LogFileLLGXReader from './LogFileLLGXReader'

const path = req('path')

const RELOAD_KEYS = ['fuelMap', 'logFile', 'units']
const MAX_LINE_RANGE_GAP = 5
const LINK_LOG_EXTENSION = '.llgx'

export default class LogFile {
  constructor (filename, configProfile, { onChange } = {}) {
    this.filename = filename
    this.configProfile = configProfile

    const filenameExtension = path.extname(filename.toLowerCase())

    this.fileReader = filenameExtension === LINK_LOG_EXTENSION
      ? new LogFileLLGXReader(filename, configProfile)
      : new LogFileCSVReader(filename, configProfile)
  }

  async setConfigProfile (newConfigProfile, prevConfigProfile) {
    if (!prevConfigProfile) prevConfigProfile = this.configProfile
    this.configProfile = newConfigProfile
    const changedKeys = this.configProfile.getChangedKeys(prevConfigProfile)
    if (!changedKeys) {
      // console.log('No changed keys, not updating LogFile state')
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
      suggestedMixtureChange: () => this.buildSuggestedMixtureChangeTable(),
      mixtureDifference: () => this.buildMixtureDifferenceTable(),
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

  async readFile () {
    this.headers = null
    this.sortedHeaders = null

    const startTime = new Date().getTime()
    const {
      headers,
      data,
      length,
    } = await this.fileReader.readFile()
    console.log('File loaded in', round((new Date().getTime() - startTime) / 1000, 2), 'seconds')

    this.headers = headers
    this.length = length
    this.data = data

    // Build out second order things
    this.buildAvgFuelMixtureTable()
    this.buildTargetMixtureTable()
    this.buildSortedColumnHeaders()

    return data
  }

  getData () {
    return this.data
  }

  getDataByColumnNames (columnNames) {
    const logFileData = this.getData()
    const dataObj = {
      timeMS: [],
      ...fromPairs(columnNames.map((columnName) => [columnName, []])),
    }
    for (let i = 0; i < logFileData.length; i++) {
      const lineData = logFileData[i]
      dataObj.timeMS.push(this.getTimeMSAtIndex(i))
      columnNames.forEach((columnName) => {
        dataObj[columnName].push(lineData[columnName])
      })
    }
    return dataObj
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

  // Total time in ms from the beginning
  getTimeMS (index) {
    const firstLine = this.data[0]
    const lastLine = this.data[Math.min(this.getLastIndex(), index)]

    // TODO: Make this time thing configurable
    return Math.round((lastLine.t - firstLine.t) * 1000)
  }

  getTotalTimeMS () {
    return this.getTimeMS(this.getLastIndex())
  }

  getTimeMSAtIndex (index) {
    return this.data[index].t * 1000
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

  getSortedColumnHeaders () {
    return this.sortedHeaders
  }

  buildSortedColumnHeaders () {
    const headers = this.headers || []
    const displayOrder = this.configProfile.getLogFileColumnDisplayOrder()
    this.sortedHeaders = sortColumnHeaders(headers, displayOrder)
    return this.sortedHeaders
  }

  //
  /// Mixture related activities
  //

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
    this.buildMixtureDifferenceTable()
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

    function addSample ({ mixtureValue, mixtureCorrectionValue, correctedMixtureValue }, lineIndex, rowIndex, colIndex, weight) {
      if (!(weight > (minWeight || 0))) return
      if (mixtureValue < minValue || mixtureValue > maxValue) return

      let cell = table[rowIndex][colIndex]
      if (cell && cell.value) {
        const newCellLength = cell.length + 1
        const newCellWeight = cell.weight + weight

        function runningAvg (currentValue, newValue) {
          return (currentValue * cell.weight + newValue * weight) / newCellWeight
        }

        cell.rawValue = runningAvg(cell.rawValue, mixtureValue)
        cell.value = round(cell.rawValue, 2)
        cell.correctionRawValue = runningAvg(cell.correctionRawValue, mixtureCorrectionValue)
        cell.correctionRawValue = round(cell.correctionRawValue, 2)
        cell.correctedRawValue = runningAvg(cell.correctedRawValue, correctedMixtureValue)
        cell.correctedRawValue = round(cell.correctedRawValue, 2)

        cell.length = newCellLength
        cell.weight = newCellWeight
        cell.min = Math.min(cell.min, mixtureValue)
        cell.max = Math.max(cell.max, mixtureValue)

        const lastRange = last(cell.lineRanges)
        if (lineIndex - lastRange.end <= MAX_LINE_RANGE_GAP) {
          lastRange.end = lineIndex
        } else {
          cell.lineRanges.push({ start: lineIndex, end: lineIndex })
        }

        const vCountValue = round(mixtureValue, 1)
        if (cell.vCount[vCountValue]) {
          cell.vCount[vCountValue]++
        } else {
          cell.vCount[vCountValue] = 1
        }
      } else {
        cell = {
          weight,
          length: 1,
          rawValue: mixtureValue,
          value: round(mixtureValue, 2),
          min: mixtureValue,
          max: mixtureValue,
          lineRanges: [{ start: lineIndex, end: lineIndex }],
          vCount: { [round(mixtureValue, 1)]: 1 },

          correctionRawValue: mixtureCorrectionValue,
          correctionValue: round(mixtureCorrectionValue, 2),

          correctedRawValue: correctedMixtureValue,
          correctedValue: round(correctedMixtureValue, 2),
        }
      }
      table[rowIndex][colIndex] = cell
    }

    for (let lineIndex = 0; lineIndex < this.data.length; lineIndex++) {
      const line = this.data[lineIndex]
      const { rowI, colI, m, corr, mCorr } = line
      const mixtureValue = m[mixtureIndex]
      const mixtureCorrectionValue = corr[mixtureIndex] || 0
      const correctedMixtureValue = mCorr[mixtureIndex] || mixtureValue
      if (!rowI || !colI || !mixtureValue) {
        console.debug('problem with interpolate', rowI, colI, line, fuelRows, fuelColumns)
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
      const newLineValue = { mixtureValue, mixtureCorrectionValue, correctedMixtureValue }
      addSample(newLineValue, lineIndex, rowIndex, colIndex, rowWeight * colWeight) // top reft
      addSample(newLineValue, lineIndex, rowIndex, colIndex + 1, rowWeight * (1 - colWeight)) // top right
      addSample(newLineValue, lineIndex, rowIndex + 1, colIndex, (1 - rowWeight) * colWeight) // bottom left
      addSample(newLineValue, lineIndex, rowIndex + 1, colIndex + 1, (1 - rowWeight) * (1 - colWeight)) // bottom right
    }

    for (let rowIndex = 0; rowIndex < table.length; rowIndex++) {
      const row = table[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
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
    const defaultExpression = {
      result: '(loggedCorrectedValue / targetValue - 1) * 100',
    }

    const suggestedValueExpression = this.configProfile.getSuggestedMixtureChange().suggestedValue ||
      defaultExpression

    const suggestedValueFn = expressions.buildEval({
      expressionObj: suggestedValueExpression,
      dataKey: 'result',
      booleanOnly: false,
      injectArgs: [
        'loggedValue',
        'loggedCorrectedValue',
        'targetValue',
        'rowIndex',
        'colIndex',
        'avgFuelMixtureTable',
      ],
    })

    const buildSuggestionsForMixtureIndex = (mixtureIndex) => (
      this.targetMixtureTable.map((row, rowIndex) => (
        row.map(({ value: targetValue }, colIndex) => {
          const { value: loggedValue, correctedValue: loggedCorrectedValue } = this.avgFuelMixtureTable[mixtureIndex][rowIndex][colIndex]
          let suggestedValue = null
          if (loggedValue != null) {
            const res = suggestedValueFn({
              loggedValue,
              loggedCorrectedValue,
              targetValue,
              rowIndex,
              colIndex,
              avgFuelMixtureTable: this.avgFuelMixtureTable[mixtureIndex],
            })
            suggestedValue = round(res, 2)
          }
          return { value: suggestedValue, targetValue, loggedValue }
        })
      ))
    )

    const numberMixtureColumns = this.configProfile.getNumberMixtureColumns()
    this.suggestedMixtureChangeTable = times(numberMixtureColumns, buildSuggestionsForMixtureIndex)
  }

  getMixtureDifferenceTable () {
    return this.mixtureDifferenceTable
  }

  buildMixtureDifferenceTable () {
    const numberMixtureColumns = this.configProfile.getNumberMixtureColumns()
    let table = null
    if (numberMixtureColumns > 1) {
      const defaultExpression = {
        result: 'mixture1 - mixture0',
      }

      const differenceExpression = this.configProfile.getMixtureDifference().difference ||
        defaultExpression

      const differenceFn = expressions.buildEval({
        expressionObj: differenceExpression,
        dataKey: 'result',
        booleanOnly: false,
        injectArgs: [
          'mixture0',
          'mixture1',
          'rowIndex',
          'colIndex',
          'avgFuelMixtureTable0',
          'avgFuelMixtureTable1',
        ],
      })

      table = this.avgFuelMixtureTable[0].map((row, rowIndex) => (
        row.map(({ value: targetValue }, colIndex) => {
          const { value: mixture0 } = this.avgFuelMixtureTable[0][rowIndex][colIndex]
          const { value: mixture1 } = this.avgFuelMixtureTable[1][rowIndex][colIndex]
          let difference = null
          if (mixture0 != null && mixture1 != null) {
            difference = round(differenceFn({
              mixture1,
              mixture0,
              rowIndex,
              colIndex,
              avgFuelMixtureTable0: this.avgFuelMixtureTable[0],
              avgFuelMixtureTable1: this.avgFuelMixtureTable[1],
            }), 2)
          }
          return { value: difference }
        })
      ))
    }

    this.mixtureDifferenceTable = table
  }
}

export function sortColumnHeaders (headers, displayOrder) {
  if (!displayOrder || !displayOrder.length) return headers

  const headersToIndex = invertArray(headers)
  const displayOrderToIndex = invertArray(displayOrder)

  const sortedHeaders = [...headers]
  sortedHeaders.sort((a, b) => {
    const aHasSort = displayOrderToIndex[a] != null
    const bHasSort = displayOrderToIndex[b] != null
    if (aHasSort && bHasSort) {
      return displayOrderToIndex[a] - displayOrderToIndex[b]
    } else if (aHasSort) {
      return -1
    } else if (bHasSort) {
      return 1
    }
    return headersToIndex[a] - headersToIndex[b]
  })
  return sortedHeaders
}

function invertArray (arr) {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    res[arr[i]] = i
  }
  return res
}
