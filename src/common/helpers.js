
export const USER_CONFIG_FILENAME = '__userconfig'

export function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

export function millisecondsToTimeCode (t, showHours) {
  const ms = t % 1000
  t = (t - ms) / 1000
  const secs = t % 60
  t = (t - secs) / 60
  const mins = t % 60
  const hrs = (t - mins) / 60
  const minSec = `${pad(mins)}:${pad(secs)}`

  // If not specified, detect
  if (showHours == null) showHours = hrs > 0

  return showHours
    ? `${pad(hrs)}:${minSec}`
    : minSec
}

export function pad (num, zeros = 2) {
  return ('00' + num).slice(-zeros)
}

// From:
// https://stackoverflow.com/questions/29359177/is-it-a-good-idea-to-use-requestanimationframe-within-a-debounce-function
export function debounceRequestAnimationFrame (func) {
  let timeout

  return function debounced () {
    const obj = this
    const args = arguments
    function delayed () {
      func.apply(obj, args)
      timeout = null
    }

    if (timeout) {
      cancelAnimationFrame(timeout)
    }

    timeout = requestAnimationFrame(delayed)
  }
}
