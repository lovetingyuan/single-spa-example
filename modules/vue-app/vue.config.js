module.exports = {
  lintOnSave: false,
  publicPath:
    process.env.SINGLE_APP === 'development'
      ? '//localhost:' + process.env.SINGLE_APP_DEV_PORT + '/'
      : '/',
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
