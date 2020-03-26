let publicPath = '/'

if (process.env.SINGLE_APP === 'development') {
  publicPath = 'http://localhost:' + process.env.SINGLE_APP_DEV_PORT + '/'
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
    output: {
      jsonpFunction: `webpackJsonp_vueapp`
    }
  }
}
