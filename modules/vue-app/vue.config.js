/* eslint-disable */
const SingleAppPlugin = require('../../singleapp-webpack-plugin')

module.exports = {
  lintOnSave: false,
  devServer: {
    port: process.env.SINGLE_APP_PORT,
  },
  configureWebpack: {
    plugins: [
      new SingleAppPlugin({
        package: require('./package.json')
      })
    ]
  },
}
