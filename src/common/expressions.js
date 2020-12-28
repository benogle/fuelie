const omit = require('lodash/omit')
const fromPairs = require('lodash/fromPairs')
const mapValues = require('lodash/mapValues')

// HACK: this is basically eval. Don't use anyone's sketchy config file.
// This is setup to slot into using jailed in the future...

const pluginCode = `
  'use strict'

  var notAllowed = '"use strict";var global = undefined;var process = undefined;var window = undefined;var console = undefined;var document = undefined;'

  var api = {
    evalExpression: function (expression, keys, values, booleanOnly, evaluate) {
      var conditionStr = booleanOnly
        ? notAllowed + ' return (' + expression + ') ? true : false;'
        : notAllowed + ' return (' + expression + ')'
      var fnArgs = keys.concat(conditionStr)
      try {
        var fn = Function.apply(null, fnArgs)
        if (evaluate) {
          return fn.apply(fn, values)
        } else {
          return true
        }
      } catch(error) {
        throw error
      }
    },
  }

  // exports the api to the application environment
  application.setInterface(api)
`

const plugin = {
  api: null,
}
const application = {
  setInterface: (api) => { plugin.api = api },
}
new Function('application', pluginCode)(application) // eslint-disable-line

const expressions = {
  eval ({ expressionObj, data, dataKeys = ['condition'], booleanOnly }) {
    const args = expressions.resolveArgs({ expressionObj, data, dataKeys })
    return fromPairs(dataKeys.map((key) => (
      [
        key,
        expressions.evalExpression({
          args,
          booleanOnly,
          expression: expressionObj[key],
        }),
      ]
    )))
  },

  resolveArgs ({ expressionObj, data, resultKeys }) {
    return mapValues(omit(expressionObj, resultKeys), (dataKey) => data[dataKey])
  },

  evalExpression ({ expression, args, booleanOnly = false }) {
    const keys = Object.keys(args)
    const values = keys.map((k) => args[k])
    return plugin.api.evalExpression(expression, keys, values, booleanOnly, true)
  },
}

module.exports = expressions
