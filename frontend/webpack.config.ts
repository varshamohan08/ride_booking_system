const webpack = require('webpack');
const webpackNodeExternals = require('webpack-node-externals');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      url: require.resolve('url/'),
      querystring: require.resolve('querystring-es3'),
      http: require.resolve('stream-http')
    }
  },
  externals: [
    webpackNodeExternals()
  ]
};
