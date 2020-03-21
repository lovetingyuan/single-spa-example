const SingleAppPlugin = require('../../singleapp-webpack-plugin')
const isSingleApp = process.env.SINGLE_APP === 'true'

if (isSingleApp) {
  process.env.BROWSER = 'none' // do not open browser
  process.env.WDS_SOCKET_PORT = process.env.SINGLE_APP_PORT
}

module.exports = {
  devServer: {
    port: process.env.SINGLE_APP_PORT
  },
  webpack: {
    plugins: [
      new SingleAppPlugin({
        package: require('./package.json')
      })
    ]
  }
}
