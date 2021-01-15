import omit from 'lodash/omit'
import mapValues from 'lodash/mapValues'
import fromPairs from 'lodash/fromPairs'

// HACK: this is basically eval. Don't use anyone's sketchy config file.
// This is setup to slot into using jailed in the future...

const pluginCode = `
  'use strict'

  var notAllowed = '"use strict";var global = undefined;var process = undefined;var window = undefined;var console = undefined;var document = undefined;'

  var api = {
    buildExpressionFunction: function (expression, keys, booleanOnly) {
      var conditionStr = booleanOnly
        ? notAllowed + ' return (' + expression + ') ? true : false;'
        : notAllowed + ' return (' + expression + ')'
      var fnArgs = keys.concat(conditionStr)
      return Function.apply(null, fnArgs)
    },
  }

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
  buildEval ({ expressionObj, dataKey = 'condition', injectArgs, booleanOnly }) {
    if (injectArgs) {
      expressionObj = {
        ...fromPairs(injectArgs.map((a) => [a, a])),
        ...expressionObj,
      }
    }
    const args = expressions.resolveArgs({ expressionObj, data: {}, resultKeys: [dataKey] })
    const fnArgs = Object.keys(args)
    const fn = plugin.api.buildExpressionFunction(expressionObj[dataKey], fnArgs, booleanOnly)
    return (data) => {
      return fn.apply(null, fnArgs.map((arg) => data[expressionObj[arg]]))
    }
  },

  resolveArgs ({ expressionObj, data, resultKeys }) {
    return mapValues(omit(expressionObj, resultKeys), (dataKey) => data[dataKey])
  },
}

export default expressions
