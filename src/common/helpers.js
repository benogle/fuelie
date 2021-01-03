const helpers = {
  round (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  },

  millisecondsToTimeCode (t, showHours) {
    const ms = t % 1000
    t = (t - ms) / 1000
    const secs = t % 60
    t = (t - secs) / 60
    const mins = t % 60
    const hrs = (t - mins) / 60
    const minSec = `${helpers.pad(mins)}:${helpers.pad(secs)}`

    // If not specified, detect
    if (showHours == null) showHours = hrs > 0

    return showHours
      ? `${helpers.pad(hrs)}:${minSec}`
      : minSec
  },

  pad (num, zeros = 2) {
    return ('00' + num).slice(-zeros)
  },
}

module.exports = helpers
