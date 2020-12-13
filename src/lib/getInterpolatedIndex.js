import { round } from 'common/helpers'

// Will work out what index in the scaleArr the value is at, and how far between
// the index and the next index it is.
//
// scaleArr = [100, 200, 300, 400]
// value = 0 // => { index: 0, weight: 1 }
// value = 100 // => { index: 0, weight: 1 }
// value = 150 // => { index: 0, weight: .5 }
// value = 180 // => { index: 0, weight: .2 }
// value = 400 // => { index: 3, weight: 1 }
// value = 500 // => { index: 3, weight: 1 }
export default function getInterpolatedIndex (value, scaleArr) {
  const tableLen = scaleArr.length
  const lastIndex = tableLen - 1
  const isReverse = scaleArr[0] > scaleArr[lastIndex]

  const smallIndex = isReverse ? lastIndex : 0
  const bigIndex = isReverse ? 0 : lastIndex

  if (value <= scaleArr[smallIndex]) return { index: smallIndex, weight: 1 }
  else if (value >= scaleArr[bigIndex]) return { index: bigIndex, weight: 1 }

  for (let i = 0; i < lastIndex; i++) {
    const left = scaleArr[i]
    const right = scaleArr[i + 1]
    let weight = null
    if (isReverse && value <= left && value > right) {
      weight = 1 - getFactor(value, right, left)
    } else if (!isReverse && value >= left && value < right) {
      weight = getFactor(value, left, right)
    }
    if (weight != null) {
      return { index: i, weight }
    }
  }
  return null
}

function getFactor (value, min, max) {
  return round(1 - (value - min) / (max - min), 5)
}
