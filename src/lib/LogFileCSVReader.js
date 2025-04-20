import each from 'lodash/each'
import csv from 'csv-parser'
import detectCSV from 'detect-csv'
import LogFileBaseReader from './LogFileBaseReader'

export default class LogFileCSVReader extends LogFileBaseReader {
  async readFile () {
    const separator = await detectSeparator(this.filename)
    if (!separator) {
      throw new Error('Cannot detect separator')
    }
    this.headers = null

    const fileContent = await window.electron.fs.readFile(this.filename, 'utf8')

    // Convert the file content to lines
    const lines = []
    const parser = csv({
      separator,
      mapHeaders: ({ header }) => header.trim(),
    })

    // Process each line
    for (const line of fileContent.split('\n')) {
      if (line.trim()) {
        const parsedData = await new Promise((resolve, reject) => {
          const chunks = []
          parser.write(line + '\n')
          parser.on('data', data => chunks.push(data))
          parser.on('end', () => resolve(chunks[0]))
          parser.on('error', reject)
        })
        lines.push(this.readLine(parsedData))
      }
    }

    return {
      data: lines,
      headers: this.headers,
      length: lines.length,
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
  const fileContent = await window.electron.fs.readFile(filename, 'utf8')
  const firstLine = fileContent.split('\n')[0]
  const csvInfo = detectCSV(firstLine)
  return csvInfo && csvInfo.delimiter
    ? csvInfo.delimiter
    : null
}
