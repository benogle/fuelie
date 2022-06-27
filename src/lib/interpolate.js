// interpolate(1.39, [
//   [ 0.47, 290 ],
//   [ 0.86, 240 ],
//   [ 1.39, 200 ],
//   [ 2.42, 150 ],
//   [ 3.64, 100 ],
//   [ 4.52, 50 ],
//   [ 4.88, 0 ]
// ])
// => 200
export default function interpolate (value, table) {
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
