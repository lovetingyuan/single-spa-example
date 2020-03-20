/* eslint-disable */
const SingleAppPlugin = require('../../singleapp-webpack-plugin')
const isSingleApp = process.env.SINGLE_APP === 'true'

const sap = new SingleAppPlugin({
  disable: !isSingleApp,
  package: require('./package.json')
})
module.exports = {
  lintOnSave: false,
  devServer: {
    port: sap.port,
    progress: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  configureWebpack: {
    plugins: [
      sap
    ]
  },
}
