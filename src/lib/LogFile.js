import fs from 'fs'
import csv from 'csv-parser'

export default class LogFile {
  constructor (filename, configProfile) {
    this.filename = filename
    this.configProfile = configProfile
  }

  readLine (logLine) {
    const { time, row, column, mixture } = this.configProfile.logHeaders
    return {
      t: parseFloat(logLine[time]),
      rowV: parseFloat(logLine[row]),
      colV: parseFloat(logLine[column]),
      m: parseFloat(logLine[mixture]),
    }
  }

  async readFile (filename) {
    this.data = await new Promise((resolve, reject) => {
      const data = []
      fs.createReadStream(this.filename)
        .pipe(csv())
        .on('data', (data) => this.data.push(this.readLine(data)))
        .on('error', (error) => reject(error))
        .on('end', () => resolve(data))
    })
    return this.data
  }
}
