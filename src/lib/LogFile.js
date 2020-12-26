import intersection from 'lodash/intersection'
import csv from 'csv-parser'
import req from 'common/req'
import { round } from 'common/helpers'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'
import detectCSV from 'detect-csv'

const fs = req('fs')

const RELOAD_KEYS = ['fuelMap', 'logHeaders', 'units']

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
    const { time, row, column, mixture } = this.configProfile.getLogHeaders()
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const rowV = parseFloat(logLine[row])
    const colV = parseFloat(logLine[column])

    return {
      t: parseFloat(logLine[time]),
      rowV,
      rowI: getInterpolatedIndex(rowV, fuelRows),
      colV,
      colI: getInterpolatedIndex(colV, fuelColumns),
      m: parseFloat(logLine[mixture]),
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

    // Build out second order things
    this.buildAvgFuelMixtureTable()
    this.buildTargetMixtureTable()

    return this.data
  }

  // Returns an array of rows. Access via result[row][column]
  getAvgFuelMixtureTable () {
    return this.avgFuelMixtureTable
  }

  buildAvgFuelMixtureTable () {
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const { minValue, maxValue, minWeight, minTotalWeight } = this.configProfile.get('avgFuelMixture')

    function getEmptyValue () {
      return { length: 0, value: null }
    }

    const table = new Array(fuelRows.length)
    for (let rowI = 0; rowI < table.length; rowI++) {
      table[rowI] = new Array(fuelColumns.length)
      table[rowI].fill(getEmptyValue())
    }

    function addSample (value, rowIndex, colIndex, weight) {
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
          vCount: { [round(value, 1)]: 1 },
        }
      }
      table[rowIndex][colIndex] = cell
    }

    for (const line of this.data) {
      const { rowI, colI, m: newLineValue } = line
      if (!rowI || !colI || !newLineValue) {
        console.log('problem with interpolate', rowI, colI, line, fuelRows, fuelColumns)
        continue
      }

      const { index: rowIndex, weight: rowWeight } = rowI
      const { index: colIndex, weight: colWeight } = colI
      addSample(newLineValue, rowIndex, colIndex, rowWeight * colWeight) // top reft
      addSample(newLineValue, rowIndex, colIndex + 1, rowWeight * (1 - colWeight)) // top right
      addSample(newLineValue, rowIndex + 1, colIndex, (1 - rowWeight) * colWeight) // bottom left
      addSample(newLineValue, rowIndex + 1, colIndex + 1, (1 - rowWeight) * (1 - colWeight)) // bottom right
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

    this.avgFuelMixtureTable = table
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
  }
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
