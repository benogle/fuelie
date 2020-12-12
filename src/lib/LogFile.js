import csv from 'csv-parser'
import req from 'common/req'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'

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
      fs.createReadStream(this.filename)
        .pipe(csv({
          separator,
          mapHeaders: ({ header }) => header.trim(),
        }))
        .on('data', (data) => {
          // console.log(data)
          lines.push(this.readLine(data))
        })
        .on('error', (error) => reject(error))
        .on('end', () => resolve(lines))
    })
    return this.data
  }
}

const separators = [',', '\t']
async function detectSeparator (filename) {
  for (const separator of separators) {
    if (await isSeparator(filename, separator)) return separator
  }
  return null
}

function isSeparator (filename, separator) {
  return new Promise((resolve, reject) => {
    let isit = false
    const stream = fs.createReadStream(filename)
      .pipe(csv({ separator }))
      .on('data', (data) => {
        isit = data && Object.keys(data).length > 2
        stream.destroy()
        resolve(isit)
      })
  })
}
