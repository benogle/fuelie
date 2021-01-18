import path from 'path'
import ConfigProfile from 'common/ConfigProfile'
import LogFile, { sortColumnHeaders } from 'src/lib/LogFile'

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
      logFile: {
        time: 'Time/s',
        row: 'Engine Load',
        column: 'Engine Speed',
        mixture: 'O2 #2',
      },
      avgFuelMixture: {
        minValue: 1,
        maxValue: 20,
        minWeight: 0,
        minTotalWeight: 0,
      },
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
        rowI: { index: 13, weight: 0.21304 },
        colV: 911.32813,
        colI: { index: 0, weight: 0.17734 },
        m: [1.2],

        'Engine Load': -10.78696,
        'Engine Speed': 911.32813,
        'Fuel Inj #01 Pulse': 1570,
        'Fuel Inj #02 Pulse': 1570,
        'Fuel Inj #03 Pulse': 1570,
        'Fuel Inj #04 Pulse': 1570,
        'Fuel Inj #05 Pulse': 1570,
        'Fuel Inj #06 Pulse': 1570,
        'Fuel Inj #07 Pulse': 0,
        'Fuel Inj #08 Pulse': 0,
        'Fuel Inj #09 Pulse': 0,
        'Fuel Inj #10 Pulse': 0,
        'Fuel Map': 5040,
        'Injector Duty': 0,
        'O2 #1': 2.3,
        'O2 #2': 1.2,
        Throttle: 0,
        'Time/s': 0,
      })
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
        rowI: { index: 13, weight: 0.21304 },
        colV: 911.32813,
        colI: { index: 0, weight: 0.17734 },
        m: [1.2],

        'Engine Load': -10.78696,
        'Engine Speed': 911.32813,
        'Fuel Inj #01 Pulse': 1570,
        'Fuel Inj #02 Pulse': 1570,
        'Fuel Inj #03 Pulse': 1570,
        'Fuel Inj #04 Pulse': 1570,
        'Fuel Inj #05 Pulse': 1570,
        'Fuel Inj #06 Pulse': 1570,
        'Fuel Inj #07 Pulse': 0,
        'Fuel Inj #08 Pulse': 0,
        'Fuel Inj #09 Pulse': 0,
        'Fuel Inj #10 Pulse': 0,
        'Fuel Map': 5040,
        'Injector Duty': 0,
        'O2 #1': 2.3,
        'O2 #2': 1.2,
        Throttle: 0,
        'Time/s': 0,
      })
    })

    describe('buildAvgFuelMixtureTable', function () {
      it('has only one fule mixture table', async function () {
        await logFile.readFile()
        expect(logFile.getAvgFuelMixtureTable()).to.have.length(1)
      })

      it('builds the avgFuelMixtureTable', async function () {
        await logFile.readFile()
        const avgFuelMixtureTable = logFile.getAvgFuelMixtureTable(0)
        expect(avgFuelMixtureTable.length).to.equal(17)
        expect(avgFuelMixtureTable[0].length).to.equal(17)

        expect(avgFuelMixtureTable[13][0].value).equal(6.04)
        expect(avgFuelMixtureTable[13][0].min).equal(1.2)
        expect(avgFuelMixtureTable[13][0].max).equal(11.12)

        expect(avgFuelMixtureTable[13][1].value).equal(6.04)
        expect(avgFuelMixtureTable[13][1].min).equal(1.2)
        expect(avgFuelMixtureTable[13][1].max).equal(11.12)

        expect(avgFuelMixtureTable[14][0].value).equal(6.45)
        expect(avgFuelMixtureTable[14][0].min).equal(1.2)
        expect(avgFuelMixtureTable[14][0].max).equal(11.12)

        expect(avgFuelMixtureTable[14][1].value).equal(6.45)
        expect(avgFuelMixtureTable[14][1].min).equal(1.2)
        expect(avgFuelMixtureTable[14][1].max).equal(11.12)
      })

      it('omits cells less than a minTotalWeight', async function () {
        configProfile.profile.avgFuelMixture.minTotalWeight = 1
        await logFile.readFile()
        const avgFuelMixtureTable = logFile.getAvgFuelMixtureTable(0)
        expect(avgFuelMixtureTable[13][0].value).equal(null)
        expect(avgFuelMixtureTable[13][1].value).equal(null)
        expect(avgFuelMixtureTable[14][0].value).equal(null)
        expect(avgFuelMixtureTable[14][1].value).equal(6.45)
        expect(avgFuelMixtureTable[14][1].min).equal(1.2)
        expect(avgFuelMixtureTable[14][1].max).equal(11.12)
      })

      it('ignores specified loglines based on the ignore expressions', async function () {
        configProfile.profile.avgFuelMixture.ignore = [{
          throttle: 'Throttle',
          condition: 'throttle > 0',
        }]
        await logFile.readFile()

        const avgFuelMixtureTable = logFile.getAvgFuelMixtureTable(0)
        expect(avgFuelMixtureTable[13][0].value).equal(5.03)
        expect(avgFuelMixtureTable[13][0].min).equal(1.2)
        expect(avgFuelMixtureTable[13][0].max).equal(11.12)

        expect(avgFuelMixtureTable[13][1].value).equal(5.03)
        expect(avgFuelMixtureTable[13][1].min).equal(1.2)
        expect(avgFuelMixtureTable[13][1].max).equal(11.12)

        expect(avgFuelMixtureTable[14][0].value).equal(5.41)
        expect(avgFuelMixtureTable[14][0].min).equal(1.2)
        expect(avgFuelMixtureTable[14][0].max).equal(11.12)

        expect(avgFuelMixtureTable[14][1].value).equal(5.41)
        expect(avgFuelMixtureTable[14][1].min).equal(1.2)
        expect(avgFuelMixtureTable[14][1].max).equal(11.12)
      })

      describe('when there is more than one mixture column', function () {
        beforeEach(async function () {
          configProfile.profile.logFile.mixture = ['O2 #1', 'O2 #2']
        })

        it('builds all avgFuelMixtureTables', async function () {
          await logFile.readFile()
          expect(logFile.getAvgFuelMixtureTable()).to.have.length(2)

          let avgFuelMixtureTable = logFile.getAvgFuelMixtureTable(0)
          expect(avgFuelMixtureTable.length).to.equal(17)
          expect(avgFuelMixtureTable[0].length).to.equal(17)

          expect(avgFuelMixtureTable[13][0].value).equal(7.12)
          expect(avgFuelMixtureTable[13][0].min).equal(2.3)
          expect(avgFuelMixtureTable[13][0].max).equal(12.13)

          avgFuelMixtureTable = logFile.getAvgFuelMixtureTable(1)
          expect(avgFuelMixtureTable.length).to.equal(17)
          expect(avgFuelMixtureTable[0].length).to.equal(17)

          expect(avgFuelMixtureTable[13][0].value).equal(6.04)
          expect(avgFuelMixtureTable[13][0].min).equal(1.2)
          expect(avgFuelMixtureTable[13][0].max).equal(11.12)
        })
      })
    })
  })

  describe('sortColumnHeaders', function () {
    let headers
    beforeEach(async function () {
      headers = ['two', 'one', 'three', 'four']
    })

    it('doesnt change when no order specified', async function () {
      expect(sortColumnHeaders(headers, null)).to.eql(headers)
      expect(sortColumnHeaders(headers, [])).to.eql(headers)
    })

    it('sorts specified columns, keeps the others in sorted order', async function () {
      expect(sortColumnHeaders(headers, ['three'])).to.eql(['three', 'two', 'one', 'four'])
      expect(sortColumnHeaders(headers, ['three', 'one'])).to.eql(['three', 'one', 'two', 'four'])
    })
  })
})
