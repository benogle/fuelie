import path from 'path'
import ConfigProfile from 'common/ConfigProfile'
import LogFile from 'src/lib/LogFile'

const logfilePathCSV = path.join(__dirname, '..', '..', 'fixtures', 'logfile.csv')
const logfilePathTSV = path.join(__dirname, '..', '..', 'fixtures', 'logfile.tsv')

describe('LogFile', function () {
  let configProfile
  beforeEach(async function () {
    configProfile = new ConfigProfile({
      name: 'Default',
      suggestCalc: 'afr',
      fuelMap: {
        rows: [9, 6, 3, 1, -0, -1, -2, -3, -4, -5, -6, -8, -9, -10, -11, -12, -13],
        columns: [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6550, 7000, 7500, 8000, 8500],
      },
      units: {
        mixture: 'afr',
      },
      logHeaders: {
        time: 'Time/s',
        row: 'Engine Load',
        column: 'Engine Speed',
        mixture: 'O2 #2',
      },
    })
  })

  describe('parsing comma separated log files', function () {
    let logFile
    beforeEach(async function () {
      logFile = new LogFile(logfilePathCSV, configProfile)
    })

    it('properly parses', async function () {
      const data = await logFile.readFile()
      expect(data.length).to.be.greaterThan(0)
      expect(data[0]).to.eql({
        t: 0,
        rowV: -10.78696,
        rowI: { index: 13, factor: 0.21304 },
        colV: 911.32813,
        colI: { index: 0, factor: 0.17734 },
        m: 3.7152,
      })
    })
  })

  describe('parsing tab separated log files', function () {
    let logFile
    beforeEach(async function () {
      logFile = new LogFile(logfilePathTSV, configProfile)
    })

    it('properly parses', async function () {
      const data = await logFile.readFile()
      expect(data.length).to.be.greaterThan(0)
      expect(data[0]).to.eql({
        t: 0,
        rowV: -10.78696,
        rowI: { index: 13, factor: 0.21304 },
        colV: 911.32813,
        colI: { index: 0, factor: 0.17734 },
        m: 3.7152,
      })
    })
  })
})
