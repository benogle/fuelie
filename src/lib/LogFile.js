import csv from 'csv-parser'
import req from 'common/req'

const fs = req('fs')

export default class LogFile {
  constructor (filename, configProfile) {
    this.filename = filename
    this.configProfile = configProfile
    this.readFile()
  }

  readLine (logLine) {
    const { time, row, column, mixture } = this.configProfile.getLogHeaders()
    return {
      t: parseFloat(logLine[time]),
      rowV: parseFloat(logLine[row]),
      colV: parseFloat(logLine[column]),
      m: parseFloat(logLine[mixture]),
    }
  }

  async readFile () {
    this.data = await new Promise((resolve, reject) => {
      const lines = []
      fs.createReadStream(this.filename)
        .pipe(csv())
        .on('data', (data) => {
          console.log(data)
          lines.push(this.readLine(data))
        })
        .on('error', (error) => reject(error))
        .on('end', () => resolve(lines))
    })
    console.log(this.data)
    return this.data
  }
}
