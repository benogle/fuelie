import expressions from 'src/common/expressions'

describe('expressions', function () {
  let fn, data, res, expressionObj

  describe('buildEval', function () {
    it('returns boolean only when booleanOnly: true', async function () {
      data = {
        'Fuel Map': 1000,
        'Fuel Trim (Accel)': 123,
      }
      expressionObj = {
        accel: 'Fuel Trim (Accel)',
        condition: 'accel > 150',
      }
      fn = await expressions.buildEval({ expressionObj, booleanOnly: true })
      res = fn(data)
      expect(res).to.eql(false)

      expressionObj = {
        accel: 'Fuel Trim (Accel)',
        condition: 'accel + 1',
      }
      fn = await expressions.buildEval({ expressionObj, booleanOnly: true })
      res = fn(data)
      expect(res).to.eql(true)
    })

    it('returns non-bool values', async function () {
      expressionObj = {
        accel: 'Fuel Accel',
        condition: 'accel + 1',
      }
      fn = await expressions.buildEval({ expressionObj })
      expect(fn({ 'Fuel Accel': 10 })).to.eql(11)
      expect(fn({ 'Fuel Accel': 200 })).to.eql(201)
    })

    it('allows magic args as well as reference', async function () {
      expressionObj = {
        accel: 'Fuel Accel',
        condition: 'accel + 1 + magic',
      }
      fn = await expressions.buildEval({ expressionObj, injectArgs: ['magic'] })
      expect(fn({ 'Fuel Accel': 10, magic: 20 })).to.eql(31)
      expect(fn({ 'Fuel Accel': 10, magic: 200 })).to.eql(211)
    })
  })
})
