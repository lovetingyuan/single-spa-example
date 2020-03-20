const path = require('path')
const crypto = require('crypto')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')

module.exports = class SingleAppPlugin {
  constructor (options) {
    this.options = options
    if (options.disable) return
    const { singleapp, name } = options.package
    const appName = (singleapp.name || name).replace(/ /g, '-')
    const appRoute = singleapp.route || '/'
    let port = +process.env.PORT || +singleapp.port || parseInt(
      crypto.createHash('md5').update(appName).digest('hex').substr(0, 10), 16
    ) % 10000
    port = port * (10 ** (4 - String(port).length))

    this.port = port
    this.appName = appName
    this.appRoute = appRoute
  }
  apply(compiler) {
    if (this.options.disable) return

    const port = this.port
    const appName = this.appName
    const appRoute = this.appRoute
    const devHost = 'http://localhost:' + port

    const manifestPlugin = new ManifestPlugin({
      writeToFileEmit: true,
      fileName: path.resolve(__dirname, 'manifest', appName + '.json'),
      generate(seed, files, entrypoints) {
        const assets = files.reduce((manifest, {name, path, isInitial}) => {
          return {...manifest, [name]: path}
        }, seed)
        return {
          assets,
          entrypoints,
          route: appRoute,
          devHost
        }
      }
    })
    const definePlugin = new webpack.DefinePlugin({
      'process.env': {
        SINGLE_APP: true,
        SINGLE_APP_NAME: JSON.stringify(appName),
        SINGLE_APP_ROUTE: JSON.stringify(appRoute),
        SINGLE_APP_DEV_ORIGIN: JSON.stringify(devHost),
      }
    })
    manifestPlugin.apply(compiler)
    definePlugin.apply(compiler)
  }
}
