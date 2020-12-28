import expressions from 'src/common/expressions'

describe('expressions', function () {
  let data, res, expressionObj

  describe('eval', function () {
    beforeEach(async function () {
      data = {
        'Fuel Map': 1000,
        'Fuel Trim (Accel)': 123,
      }
    })

    it('returns boolean only when booleanOnly: true', async function () {
      expressionObj = {
        accel: 'Fuel Trim (Accel)',
        condition: 'accel > 150',
      }
      res = await expressions.eval({ expressionObj, data, booleanOnly: true })
      expect(res).to.eql({ condition: false })

      expressionObj = {
        accel: 'Fuel Trim (Accel)',
        condition: 'accel + 1',
      }
      res = await expressions.eval({ expressionObj, data, booleanOnly: true })
      expect(res).to.eql({ condition: true })
    })

    it('returns boolean only when option set', async function () {
      expressionObj = {
        accel: 'Fuel Trim (Accel)',
        condition: 'accel + 1',
      }
      res = await expressions.eval({ expressionObj, data })
      expect(res).to.eql({ condition: 124 })
    })
  })
})
