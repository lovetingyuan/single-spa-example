module.exports = {
  lintOnSave: false,
  publicPath: process.env.SINGLE_APP_PUBLIC_PATH || '/',
  configureWebpack: {
    output: {
      jsonpFunction: `webpackJsonp_vueapp`
    }
  }
}
