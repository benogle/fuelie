import each from 'lodash/each'
import csv from 'csv-parser'
import detectCSV from 'detect-csv'
import req from 'common/req'

import LogFileBaseReader from './LogFileBaseReader'

const fs = req('fs')

export default class LogFileCSVReader extends LogFileBaseReader {
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
    const { time } = this.configProfile.getLogFileConfig()

    if (!this.headers) {
      this.headers = this.buildDisplayableParameterNameArray(Object.keys(logLine))
    }

    const parsedLine = {}
    each(logLine, (value, key) => {
      const newValueKV = this.convertValueFromConfig({ key, value })
      Object.assign(parsedLine, newValueKV)
    })

    return {
      ...parsedLine,
      ...this.getTableLocations(parsedLine),
      t: parseFloat(logLine[time]),
    }
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
