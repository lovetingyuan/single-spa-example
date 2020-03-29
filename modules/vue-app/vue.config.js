const port = 8084
module.exports = {
  lintOnSave: false,
  publicPath:
    process.env.SINGLE_APP === 'development'
      ? 'http://localhost:' + port + '/'
      : '/',
  devServer: {
    port
  },
  configureWebpack: {
    output: {
      jsonpFunction: `webpackJsonp_vueapp`
    }
  }
}
