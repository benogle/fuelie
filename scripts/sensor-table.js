const { round } = require('../src/common/helpers')

//

const ecuVoltageColumns = [0, 0.16, 0.31, 0.47, 0.62, 0.78, 0.94, 1.09, 1.25, 1.40, 1.56, 1.72, 1.87, 2.03, 2.18, 2.34, 2.50, 2.65, 2.81, 2.96, 3.12, 3.28, 3.43, 3.59, 3.74, 3.90, 4.06, 4.21, 4.37, 4.52, 4.68, 4.84, 4.99]
const refVoltage = 5
const pullupResistorValue = 2.2 * 1000

// ohms -> temp F
const sensorOhmsToTemp = [
  [12000, -4], // -4
  [6205, 32], // 0
  [3920, 50], // 10
  [2454, 68], // 20
  [1604, 86], // 30
  [1072, 104], // 40
  [738, 122], // 50
  [535, 140], // 60
  [387, 158], // 70
  [284, 176], // 80
  [210, 194], // 90
  [159, 212], // 100
  [121, 230], // 110
  [95, 248], // 120
  [75, 266], // 130
  [60, 284], // 140
]

// Will find min & max columns based on `value` at table row index 0 to linear
// interpolate values at table row index 1.
//
// Table must be sorted by index 0.
// e.g.
// value = 0.62
// table = [
//   [ 0.13, 284 ],
//   [ 0.16, 266 ],
//   [ 0.21, 248 ],
//   [ 0.26, 230 ],
//   [ 0.34, 212 ],
//   [ 0.44, 194 ],
//   [ 0.57, 176 ],
//   [ 0.75, 158 ],
//   [ 0.98, 140 ],
//   [ 1.26, 122 ],
//   [ 1.64, 104 ],
//   [ 2.11, 86 ],
//   [ 2.64, 68 ],
//   [ 3.2, 50 ],
//   [ 3.69, 32 ],
//   [ 4.23, -4 ]
// ]
// Returns 171.06
function interpolate (value, table) {
  const tableLen = table.length
  if (value <= table[0][0]) return table[0][1]
  else if (value > table[tableLen - 1][0]) return table[tableLen - 1][1]

  let minItem = null
  let maxItem = null
  for (let i = 0; i < tableLen; i++) {
    const item = table[i]
    const [refValue] = item
    if (refValue >= value) {
      maxItem = item
      minItem = table[i - 1]
      break
    }
  }

  const [minValue, minResult] = minItem
  const [maxValue, maxResult] = maxItem

  const percentOfRange = (value - minValue) / (maxValue - minValue)
  return percentOfRange * (maxResult - minResult) + minResult
}

function getSensorVoltage (ohms) {
  return refVoltage * ohms / (ohms + pullupResistorValue)
}

const sensorTable = sensorOhmsToTemp.map(([ohms, temp]) => (
  [getSensorVoltage(ohms), temp, ohms]
))
sensorTable.sort((a, b) => a[0] - b[0])

const ecuTable = ecuVoltageColumns.map((volts) => (
  [volts, round(interpolate(volts, sensorTable), 2)]
))

console.log(sensorTable)
console.log(ecuTable)
console.log(ecuTable.length)

// [
//   [0, 284],
//   [0.16, 268.71],
//   [0.31, 218.37],
//   [0.47, 189.46],
//   [0.62, 171.06],
//   [0.78, 155.49],
//   [0.94, 142.98],
//   [1.09, 132.75],
//   [1.25, 122.39],
//   [1.4, 115.22],
//   [1.56, 107.68],
//   [1.72, 100.87],
//   [1.87, 95.12],
//   [2.03, 89],
//   [2.18, 83.56],
//   [2.34, 78.1],
//   [2.5, 72.65],
//   [2.65, 67.57],
//   [2.81, 62.48],
//   [2.96, 57.71],
//   [3.12, 52.63],
//   [3.28, 47.15],
//   [3.43, 41.62],
//   [3.59, 35.73],
//   [3.74, 28.71],
//   [3.9, 17.93],
//   [4.06, 7.15],
//   [4.21, -2.97],
//   [4.37, -4],
//   [4.52, -4],
//   [4.68, -4],
//   [4.84, -4],
//   [4.99, -4]
// ]
