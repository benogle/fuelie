const voltageColumns = [0, 0.16, 0.31, 0.47, 0.62, 0.78, 0.94, 1.09, 1.25, 1.40, 1.56, 1.72, 1.87, 2.03, 2.18, 2.34, 2.50, 2.65, 2.81, 2.96, 3.12, 3.28, 3.43, 3.59, 3.74, 3.90, 4.06, 4.21, 4.37, 4.52, 4.68, 4.84, 4.99]

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

function getValue (volts) {
  return round(2.375 * volts + 7.3125, 3)
}

const afrColumns = voltageColumns.map((volts) => (
  [volts, getValue(volts)]
))

console.log(afrColumns)
// console.log(voltageColumns)
console.log(afrColumns.length)
