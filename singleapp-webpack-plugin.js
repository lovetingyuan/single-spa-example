const path = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const isSingleApp = process.env.SINGLE_APP === 'true'

if (isSingleApp) {
  const WebpackServer = require('webpack-dev-server/lib/Server')

  const originSetHeader = WebpackServer.prototype.setContentHeaders
  WebpackServer.prototype.setContentHeaders = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return originSetHeader.apply(this, arguments)
  }
}

module.exports = isSingleApp ? class SingleAppPlugin {
  constructor (options) {
    const { singleapp, name } = options.package
    this.appName = singleapp.name || name
    this.appRoute = singleapp.route || '/'
  }
  apply(compiler) {
    compiler.options.optimization.splitChunks = false
    const devHost = 'http://localhost:' + process.env.SINGLE_APP_PORT

    let { publicPath = '/' } = compiler.options.output
    if (!publicPath.startsWith('http')) {
      if (!publicPath.startsWith('/')) {
        publicPath = '/' + publicPath
      }
      if (!publicPath.endsWith('/')) {
        publicPath = publicPath + '/'
      }
      compiler.options.output.publicPath = devHost + publicPath
    }

    const manifestPlugin = new ManifestPlugin({
      writeToFileEmit: true,
      fileName: path.join(__dirname, 'manifest', this.appName + '.json'),
      generate: (seed, files, entrypoints) => {
        const assets = files.reduce((manifest, {name, path, isInitial}) => {
          return {...manifest, [name]: path}
        }, seed)
        return {
          name: this.appName,
          assets,
          entrypoints,
          route: this.appRoute,
          devHost
        }
      }
    })
    const definePlugin = new webpack.DefinePlugin({
      'process.env': {
        SINGLE_APP: true,
        // SINGLE_APP_NAME: JSON.stringify(this.appName),
        SINGLE_APP_ROUTE: JSON.stringify(this.appRoute),
        SINGLE_APP_DEV_ORIGIN: JSON.stringify(devHost),
      }
    })
    manifestPlugin.apply(compiler)
    definePlugin.apply(compiler)
  }
} : class DisabledSingleAppPlugin {
  apply () {
    /* SingleAppPlugin is disabled, set process.env.SINGLE_APP as true to enable it. */
  }
}
