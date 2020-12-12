import path from 'path'
import ConfigProfile from 'common/ConfigProfile'
import LogFile from 'src/lib/LogFile'

const logfilePath = path.join(__dirname, '..', '..', 'fixtures', 'logfile.tsv')

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

  it('description', async function () {
    const file = new LogFile(logfilePath, configProfile)
    console.log('OK', file)
  })
})
