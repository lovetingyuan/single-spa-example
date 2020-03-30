module.exports = {
  lintOnSave: false,
  publicPath: process.env.PUBLIC_URL || '/',
  configureWebpack: {
    output: {
      jsonpFunction: `webpackJsonp_vueapp`
    }
  }
}
