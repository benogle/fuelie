import each from 'lodash/each.js'
import fileService from './fileService.js'
import LogFileBaseReader from './LogFileBaseReader.js'

export default class LogFileCSVReader extends LogFileBaseReader {
  async readFile () {
    try {
      // Use the file service to read CSV data via IPC
      const csvResult = await fileService.readCSVFile(this.filename)
      const { data: rawData } = csvResult

      // Process each line through the existing readLine logic
      this.headers = null
      const processedData = rawData.map(rowData => this.readLine(rowData))

      return {
        data: processedData,
        headers: this.headers,
        length: processedData.length,
      }
    } catch (error) {
      console.error('Error reading CSV file:', error)
      throw error
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

// Helper functions removed - now handled by fileService in main process
