import csv from 'csv-parser'
import req from 'common/req'
import { round } from 'common/helpers'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'
import detectCSV from 'detect-csv'

const fs = req('fs')

export default class LogFile {
  constructor (filename, configProfile) {
    this.filename = filename
    this.configProfile = configProfile
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

    return this.data
  }

  // Returns an array of rows. Access via result[row][column]
  getAvgFuelMixtureTable () {
    return this.avgFuelMixtureTable
  }

  buildAvgFuelMixtureTable () {
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()
    const table = new Array(fuelRows.length)
    for (let rowI = 0; rowI < table.length; rowI++) {
      table[rowI] = new Array(fuelColumns.length)
      table[rowI].fill({ length: 0, value: null })
    }

    for (const line of this.data) {
      const { rowI, colI, m: newLineValue } = line
      if (!rowI || !colI || !newLineValue) {
        console.log('problem with interpolate', rowI, colI, line, fuelRows, fuelColumns)
        continue
      }

      let cell = table[rowI.index][colI.index]
      if (cell && cell.value) {
        const newCellLength = cell.length + 1
        cell.length = newCellLength
        cell.rawValue = (cell.rawValue * cell.length + newLineValue) / (cell.length + 1)
        cell.value = round(cell.rawValue, 2)
      } else {
        cell = {
          length: 1,
          rawValue: newLineValue,
          value: round(newLineValue, 2),
        }
      }
      table[rowI.index][colI.index] = cell
    }

    this.avgFuelMixtureTable = table
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
