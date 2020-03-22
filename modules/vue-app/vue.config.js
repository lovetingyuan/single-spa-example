/* eslint-disable */
const { singleapp } = require('./package.json')
let publicPath = singleapp.publicPath

if (process.env.SINGLE_APP === 'development') {
  publicPath = 'http://localhost:' + process.env.SINGLE_APP_DEV_PORT + publicPath
}

if (process.env.SINGLE_APP) {
  process.env.VUE_APP_SINGLE_APP_MOUNT_PATH = singleapp.mountPath
}

module.exports = {
  lintOnSave: false,
  publicPath,
  devServer: {
    port: process.env.SINGLE_APP_DEV_PORT || 8080,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
  },
}
