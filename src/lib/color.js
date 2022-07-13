// Optimized palette
// http://tsitsul.in/blog/coloropt/
export const CHART_COLOR_PALETTE = [
  '#b80058',
  '#008cf9',
  '#006e00',
  '#00bbad',
  '#d163e6',
  '#b24502',
  '#ff9287',
  '#5954d6',
  '#00c6f8',
  '#878500',
  '#00a76c',
  '#bdbdbd',
  '#ebac23',
]

// https://gist.github.com/danieliser/b4b24c9f772066bcf0a6
export function hexToRGBA (hexCode, opacity = 1) {
  let hex = hexCode.replace('#', '')

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  /* Backward compatibility for whole number based opacity values. */
  if (opacity > 1 && opacity <= 100) {
    opacity = opacity / 100
  }

  return `rgba(${r},${g},${b},${opacity})`
}
