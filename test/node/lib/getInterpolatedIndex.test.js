import getInterpolatedIndex from 'lib/getInterpolatedIndex'

describe('getInterpolatedIndex', function () {
  describe('when ascending order', function () {
    let scaleArr
    beforeEach(async function () {
      scaleArr = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6550, 7000, 7500, 8000, 8500]
    })

    it('finds the right index and factor', async function () {
      expect(getInterpolatedIndex(100, scaleArr)).to.eql({ index: 0, factor: 1 })
      expect(getInterpolatedIndex(500, scaleArr)).to.eql({ index: 0, factor: 1 })
      expect(getInterpolatedIndex(600, scaleArr)).to.eql({ index: 0, factor: 0.8 })
      expect(getInterpolatedIndex(750, scaleArr)).to.eql({ index: 0, factor: 0.5 })
      expect(getInterpolatedIndex(800, scaleArr)).to.eql({ index: 0, factor: 0.4 })
      expect(getInterpolatedIndex(1000, scaleArr)).to.eql({ index: 1, factor: 1 })
      expect(getInterpolatedIndex(3700, scaleArr)).to.eql({ index: 6, factor: 0.6 })
      expect(getInterpolatedIndex(10000, scaleArr)).to.eql({ index: scaleArr.length - 1, factor: 1 })
    })
  })

  describe('when descending order', function () {
    let scaleArr
    beforeEach(async function () {
      scaleArr = [9, 6, 3, 1, -0, -1, -2, -3, -4, -5, -6, -8, -9, -10, -11, -12, -13]
    })

    it('finds the right index and factor', async function () {
      expect(getInterpolatedIndex(10, scaleArr)).to.eql({ index: 0, factor: 1 })
      expect(getInterpolatedIndex(9, scaleArr)).to.eql({ index: 0, factor: 1 })
      expect(getInterpolatedIndex(8, scaleArr)).to.eql({ index: 0, factor: 0.66667 })
      expect(getInterpolatedIndex(7, scaleArr)).to.eql({ index: 0, factor: 0.33333 })
      expect(getInterpolatedIndex(6, scaleArr)).to.eql({ index: 1, factor: 1 })
      expect(getInterpolatedIndex(4.5, scaleArr)).to.eql({ index: 1, factor: 0.5 })
      expect(getInterpolatedIndex(6, scaleArr)).to.eql({ index: 1, factor: 1 })
      expect(getInterpolatedIndex(-0.5, scaleArr)).to.eql({ index: 4, factor: 0.5 })
      expect(getInterpolatedIndex(-13, scaleArr)).to.eql({ index: scaleArr.length - 1, factor: 1 })
      expect(getInterpolatedIndex(-20, scaleArr)).to.eql({ index: scaleArr.length - 1, factor: 1 })
    })
  })
})
