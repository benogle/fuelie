
const blacks = {
  5: '#f8f8f8',
  20: '#ebebeb',
  30: '#ccc',
  100: 'black',
}
const black = blacks[100]

const blues = {
  50: '#aaf1ff',
  70: '#00ccf5',
  80: '#00a7ca',
}
const blue = blues[50]

const red = '#ffaeae'
const green = '#99ff99'
const yellow = '#fbff18'

export default {
  colors: {
    blacks,
    black,
    red,
    green,
    blues,
    blue,
    yellow,
  },
  boxShadows: {
    50: '0 1px 12px 0 rgba(0,0,0,0.06)',
  },
  fontFamilies: {
    mono: 'monospace',
  },
}
