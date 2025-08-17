import fs from 'fs'
import csv from 'csv-parser'
import detectCSV from 'detect-csv'

class FileService {
  /**
   * Read and parse a CSV file
   * @param {string} filename - Path to the CSV file
   * @returns {Promise<{data: Array, headers: Array, length: number}>}
   */
  async readCSVFile (filename) {
    try {
      const separator = await this.detectSeparator(filename)
      if (!separator) {
        throw new Error('Cannot detect CSV separator')
      }

      let headers = null
      const data = await new Promise((resolve, reject) => {
        const lines = []
        fs.createReadStream(filename, { encoding: 'utf8' })
          .pipe(csv({
            separator,
            mapHeaders: ({ header }) => header.trim(),
          }))
          .on('data', (rowData) => {
            if (!headers) {
              headers = Object.keys(rowData)
            }
            lines.push(rowData)
          })
          .on('error', (error) => {
            console.error('CSV read error:', error)
            reject(error)
          })
          .on('end', () => resolve(lines))
      })

      return {
        data,
        headers,
        length: data.length,
      }
    } catch (error) {
      console.error('Error reading CSV file:', error)
      throw error
    }
  }

  /**
   * Read a binary file (for LLGX format)
   * @param {string} filename - Path to the file
   * @returns {Promise<Buffer>}
   */
  async readBinaryFile (filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * Check if a file exists
   * @param {string} filename - Path to check
   * @returns {Promise<boolean>}
   */
  async fileExists (filename) {
    try {
      await fs.promises.access(filename, fs.constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get file stats
   * @param {string} filename - Path to the file
   * @returns {Promise<fs.Stats>}
   */
  async getFileStats (filename) {
    return fs.promises.stat(filename)
  }

  /**
   * Detect CSV separator by reading first line
   * @param {string} filename - Path to CSV file
   * @returns {Promise<string|null>}
   */
  async detectSeparator (filename) {
    try {
      const firstLine = await this.readFirstLine(filename)
      const csvInfo = detectCSV(firstLine)
      return csvInfo && csvInfo.delimiter ? csvInfo.delimiter : null
    } catch (error) {
      console.error('Error detecting separator:', error)
      return null
    }
  }

  /**
   * Read just the first line of a file
   * @param {string} filename - Path to the file
   * @returns {Promise<string>}
   */
  async readFirstLine (filename) {
    return new Promise((resolve, reject) => {
      const rs = fs.createReadStream(filename, { encoding: 'utf8' })
      let acc = ''
      let pos = 0
      let index

      rs.on('data', function (chunk) {
        index = chunk.indexOf('\n')
        acc += chunk
        if (index !== -1) {
          rs.close()
        } else {
          pos += chunk.length
        }
      })
        .on('close', function () {
          resolve(acc.slice(0, pos + index))
        })
        .on('error', function (err) {
          reject(err)
        })
    })
  }
}

export default new FileService()
