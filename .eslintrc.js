module.exports = {
  extends: ['nicenice'],
  settings: {
    'import/resolver': {
      'babel-plugin-root-import': {
        rootPathSuffix: 'src',
      },
      node: {
        moduleDirectory: [
          'node_modules',
          'src',
          '.',
        ],
      },
    },
  },
}
