test('simple test', () => {
  expect(1 + 1).toBe(2)
})

test('environment is working', () => {
  expect(typeof window).toBe('object')
  expect(typeof document).toBe('object')
})
