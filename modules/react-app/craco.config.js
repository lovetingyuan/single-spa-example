const SingleAppPlugin = require('../../singleapp-webpack-plugin')
const isSingleApp = process.env.SINGLE_APP === 'true'

const sap = new SingleAppPlugin({
  disable: !isSingleApp,
  package: require('./package.json')
})

if (isSingleApp) {
  process.env.BROWSER = 'none' // do not open browser
}

module.exports = {
  devServer: {
    port: sap.port,
    progress: !isSingleApp,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  webpack: {
    plugins: [
      sap
    ]
  }
}
