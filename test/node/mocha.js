export default {
  diff: true,
  delay: false,
  extension: ['js'],
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 2000,
  spec: './test/node/**/*.test.js',
  require: [
    // https://mochajs.org/#-require-module-r-module
    './test/node/environment.js',
  ],
  'watch-files': [
    './src/**/*.js',
  ],
  'watch-ignore': [],
  exit: true,
}
