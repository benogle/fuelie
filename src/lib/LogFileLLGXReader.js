// Reading logfiles in the LinkECU LLGX format
//
//
// TODO
// * Make sure all samples have correct values
// * Parse values to standard
// * Move column conversion / filtering out from CSV

import req from 'common/req'
import { round } from 'common/helpers'
import getInterpolatedIndex from 'lib/getInterpolatedIndex'
import interpolate from 'lib/interpolate'

const fs = req('fs')

const BLOCK_LENGTH_LENGTH = 4
const BLOCK_NAME_LENGTH = 3
const BLOCK_META_LENGTH = BLOCK_LENGTH_LENGTH + BLOCK_NAME_LENGTH

export default class LogFileCSVReader {
  constructor (filename, configProfile) {
    this.filename = filename
    this.configProfile = configProfile
  }

  async readFile () {
    const fileBuffer = fs.readFileSync(this.filename, { encoding: null })

    let description = null
    const headers = []
    let parameterTimeData = []
    const parameters = []

    let currentIndex = 0
    const fileLength = fileBuffer.length

    while (currentIndex < fileLength) {
      const blockLength = fileBuffer.readInt32LE(currentIndex)
      if (blockLength === 0) {
        break
      }

      const blockName = fileBuffer.toString('ascii', currentIndex + BLOCK_LENGTH_LENGTH, currentIndex + BLOCK_META_LENGTH)
      const blockBuffer = fileBuffer.subarray(currentIndex + BLOCK_META_LENGTH, currentIndex + blockLength)

      let extraBlockReadCount = 0
      const funcName = `parse${blockName.toUpperCase()}`
      if (this[funcName]) {
        const {
          extraReadCount,
          description: newDescription,
          parameter,
        } = this[funcName]({
          blockIndex: currentIndex,
          blockName,
          blockLength,
          blockBuffer,
          fileBuffer,
        })
        if (extraReadCount > 0) {
          extraBlockReadCount = extraReadCount
        }

        if (newDescription) {
          description = newDescription
        }

        if (parameter) {
          if (parameter.data.length > parameterTimeData) {
            parameterTimeData = parameter.data
          }
          headers.push(parameter.name)
          parameters.push(parameter)
        }
        console.log({ blockLength, blockName, description, parameter })
      } else {
        console.log('No block handler for', blockName, { blockLength, blockName })
      }

      currentIndex += (blockLength + extraBlockReadCount)
    }

    // All parameters are individually stored with individual (and potentially
    // different) timestamps. Now we compose it all into one array with a single
    // timestamp for all params.

    const data = parameterTimeData.map(([timeInSeconds]) => (
      this.composeRow(timeInSeconds, parameters)
    ))

    return {
      description,
      data,
      headers,
      length: data.length,
    }
  }

  // lf3: Root block
  parseLF3 () {
    return {}
  }

  // ld2 block: File Description
  parseLD2 ({ blockBuffer }) {
    // Text in 'utf16le'
    const descriptionStrings = parseUTF16Strings(blockBuffer)
    return {
      description: descriptionStrings,
    }
  }

  // lm1: Not sure. Has record start / resume info
  parseLM1 () {
    return {}
  }

  parseDS3 ({ blockLength, blockBuffer, fileBuffer, blockIndex }) {
    // The block length on the ds3 only includes the name, units, and counts,
    // but NOT the values
    const timeValuePairsCount = blockBuffer.readInt32LE(0)
    const nameAndUnits = parseUTF16Strings(blockBuffer, 4)
    nameAndUnits.shift()
    nameAndUnits.pop()
    const paramName = nameAndUnits[0]
    const paramUnits = nameAndUnits[1] || ''
    console.log(timeValuePairsCount, paramName, paramUnits)

    // So we read extra here beyond the ds3 block to get the actual data
    // Data in pairs of 8 bytes.
    // [4 byte float - time of value][4 byte float - value] * timeValuePairsCount

    const extraReadCount = timeValuePairsCount * 8
    const valuesStartIndex = blockIndex + blockLength

    const data = []
    const dataByTime = {}
    for (let valueIndex = 0; valueIndex < timeValuePairsCount; valueIndex++) {
      const fileIndex = valuesStartIndex + (valueIndex * 8)
      const timeS = round(fileBuffer.readFloatLE(fileIndex), 4)
      const value = fileBuffer.readFloatLE(fileIndex + 4) // value
      data.push([timeS, value])
      dataByTime[timeS] = value
    }

    return {
      extraReadCount,
      parameter: {
        name: paramName,
        units: paramUnits,
        count: timeValuePairsCount,
        data,
        dataByTime,
      },
    }
  }

  composeRow (timeInSeconds, parameters) {
    const { row, column } = this.configProfile.getLogFileConfig()
    const mixtureColumns = this.configProfile.getMixtureColumns()
    const fuelRows = this.configProfile.getFuelMapRows()
    const fuelColumns = this.configProfile.getFuelMapColumns()

    const parameterValues = {}
    for (const param of parameters) {
      const { name, data, dataByTime } = param
      const value = dataByTime[timeInSeconds] ?? interpolate(timeInSeconds, data)
      parameterValues[name] = value
    }

    const rowV = parameterValues[row]
    const colV = parameterValues[column]

    return {
      ...parameterValues,
      t: timeInSeconds,
      rowV,
      rowI: getInterpolatedIndex(rowV, fuelRows),
      colV,
      colI: getInterpolatedIndex(colV, fuelColumns),
      m: mixtureColumns.map((mixCol) => parameterValues[mixCol]),
    }
  }
}

function parseUTF16Strings (buffer, start, end) {
  const stringBlock = buffer.toString('utf16le', start, end)
  return stringBlock.split('\0').filter((str) => str.length > 0)
}
