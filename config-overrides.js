const { addBabelPlugin, override } = require('customize-cra')
const webpack = require('webpack')

module.exports = override(
  addBabelPlugin([
    'babel-plugin-root-import',
    {
      rootPathSuffix: 'src',
    },
  ]),
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      os: require.resolve('os-browserify/browser'),
      vm: require.resolve('vm-browserify'),
      fs: false,
    }
    
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ]

    // Add worker rule
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback'
        }
      }
    })
    
    return config
  }
)
