// Reading logfiles in the LinkECU LLGX format

import { round } from 'common/helpers'
import interpolate from 'lib/interpolate'

import LogFileBaseReader from './LogFileBaseReader'

import {
  UNITS_MIXTURE_LAMBDA,
  UNITS_TEMP_C,
  UNITS_SPEED_KPH,
  UNITS_PRESSURE_KPA,
  UNIT_TYPE_MIXTURE,
  UNIT_TYPE_TEMPERATURE,
  UNIT_TYPE_PRESSURE,
  UNIT_TYPE_SPEED,
} from 'common/constants'

const UNIT_TYPE_MAP = {
  lambda: UNIT_TYPE_MIXTURE,
}

const DEFAULT_UNIT_MAP = {
  [UNIT_TYPE_MIXTURE]: UNITS_MIXTURE_LAMBDA,
  [UNIT_TYPE_TEMPERATURE]: UNITS_TEMP_C,
  [UNIT_TYPE_PRESSURE]: UNITS_PRESSURE_KPA,
  [UNIT_TYPE_SPEED]: UNITS_SPEED_KPH,
}

const BLOCK_LENGTH_LENGTH = 4
const BLOCK_NAME_LENGTH = 3
const BLOCK_META_LENGTH = BLOCK_LENGTH_LENGTH + BLOCK_NAME_LENGTH

export default class LogFileLLGXReader extends LogFileBaseReader {
  async readFile () {
    const rawData = await window.electron.fs.readFile(this.filename, { encoding: null })
    const fileBuffer = Buffer.from(rawData)

    let description = null
    const headers = []
    let parameterTimeData = []
    const parameters = []

    let currentIndex = 0
    const fileLength = fileBuffer.length

    // The LinkECU logfile format is broken into a bunch of blocks. Roughly:
    //
    // [UINT32: block size][Three ascii chars for block type][block data]
    //
    // * Block size is byte count including the block size bytes, 3 ascii chars, and block data
    // * Block types can be lf3, ld2, lm1, ds3, and probably more
    //
    // The only section that does not follow this format is the actual log data,
    // which is appended onto the end of the 'ds3' block. The 'ds3' block has
    // counts, though, to allow reading the values
    //
    // LLGX files are in little endian

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

        console.debug({ blockLength, blockName, blockIndex: currentIndex })

        if (parameter) {
          if (parameter.data.length > parameterTimeData) {
            parameterTimeData = parameter.data
          }
          headers.push(parameter.name)
          parameters.push(parameter)
        }
      } else {
        console.warning('No block handler for', blockName, { blockLength, blockName })
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
      headers: this.buildDisplayableParameterNameArray(headers),
      length: data.length,
    }
  }

  // lf3: Root block
  // * Format: [UINT32 - RootBlockSize][RootBlockData]
  // * Not sure what's actually in this block
  parseLF3 () {
    return {}
  }

  // ld2: File Description
  //
  // Has things like firmware version and all that
  //
  // e.g.
  //
  // G4X Xtreme
  // 6.25.5
  // 7.2.3411
  // 516111
  // ECU Internal Datalog - some date...
  parseLD2 ({ blockBuffer }) {
    // All text here is in 'utf16le' encoding

    // There probably is a smarter way to detect where strings start and end,
    // but don't know which bytes specify that...
    const descriptionStrings = parseUTF16Strings(blockBuffer)

    console.log('File description:')
    console.log(descriptionStrings.join('\n'))
    return {
      description: descriptionStrings,
    }
  }

  // lm1: Not sure. Has record start / resume info
  parseLM1 () {
    return {}
  }

  // ds3: The actual values for a single parameter. That is, this will hold all
  // time + value pairs for, say, 'Engine Speed'
  //
  // Format:
  //
  // [UINT32: blockLength]["ds3": blockName][UINT32: timeValuePairsCount][paramName][paramUnits]
  //
  // The blockLength only counts the metadata bits: name, units, counts, not the
  // actual values. The values are specified in 8 byte time/value pairs directly
  // after the ds3 block count.
  //
  // [4 byte float: time of value][4 byte float: value] * timeValuePairsCount
  //
  // Other notes
  //
  // * paramName and paramUnits are in the 'utf16le' text encoding
  // * I am unsure what a couple fields around the paramName and paramUnits do...
  //
  parseDS3 ({ blockLength, blockBuffer, fileBuffer, blockIndex }) {
    // The block length on the ds3 only includes the name, units, and counts,
    // but NOT the values
    const timeValuePairsCount = blockBuffer.readInt32LE(0)
    const nameAndUnits = parseUTF16Strings(blockBuffer, 4)

    // There are probably counts on either side of the descriptions, but I dont
    // know what they are, so I'm just ignoring them...
    nameAndUnits.shift()
    nameAndUnits.pop()

    const paramName = nameAndUnits[0]
    const paramUnits = (nameAndUnits[1] || '').toLowerCase()
    console.debug(timeValuePairsCount, paramName, paramUnits)

    const unitType = UNIT_TYPE_MAP[paramUnits] || paramUnits
    const defaultUnit = DEFAULT_UNIT_MAP[unitType]

    // So we read extra here beyond the ds3 block to get the actual data
    // Data in pairs of 8 bytes.
    // [4 byte float - time of value][4 byte float - value] * timeValuePairsCount

    const extraReadCount = timeValuePairsCount * 8
    const valuesStartIndex = blockIndex + blockLength

    // This cuts load time in half for large log files
    if (!this.configProfile.shouldProcessColumn(paramName)) {
      console.log('Ignoring', paramName)
      return { extraReadCount }
    }

    const data = []
    const dataByTime = {}
    for (let valueIndex = 0; valueIndex < timeValuePairsCount; valueIndex++) {
      const fileIndex = valuesStartIndex + (valueIndex * 8)
      const timeInSeconds = round(fileBuffer.readFloatLE(fileIndex), 4)
      const value = this.configProfile.convertValueToUnits(
        unitType,
        fileBuffer.readFloatLE(fileIndex + 4),
        defaultUnit,
      )
      data.push([timeInSeconds, value])
      dataByTime[timeInSeconds] = value
    }

    const parameter = {
      name: paramName,
      units: paramUnits,
      count: timeValuePairsCount,
      data,
      dataByTime,
    }
    console.debug(blockLength, { blockLength, valueCount: timeValuePairsCount }, parameter)

    return {
      extraReadCount,
      parameter,
    }
  }

  composeRow (timeInSeconds, parameters) {
    const parameterValues = {}
    for (const param of parameters) {
      const { name, data, dataByTime } = param
      const value = dataByTime[timeInSeconds] ?? interpolate(timeInSeconds, data)
      Object.assign(parameterValues, this.convertValueFromConfig({
        key: name,
        value,
      }))
    }

    return {
      ...parameterValues,
      ...this.getTableLocations(parameterValues),
      t: timeInSeconds,
    }
  }
}

function parseUTF16Strings (buffer, start, end) {
  const stringBlock = buffer.toString('utf16le', start, end)
  return stringBlock.split('\0').filter((str) => str.length > 0).map((str) => str.trim())
}
