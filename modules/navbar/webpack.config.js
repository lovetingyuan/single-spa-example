// /* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const SingleAppPlugin = require('../../singleapp-webpack-plugin')
const isSingleApp = process.env.SINGLE_APP === 'true'

const sap = new SingleAppPlugin({
  disable: !isSingleApp,
  package: require('./package.json')
})

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.join(__dirname, 'main.js'),
  output: {
    filename: '[name].[hash].js'
  },
  devServer: {
    port: sap.port,
    progress: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ["@babel/preset-env"]
        }
      }
    ]
  },
  plugins: [
    sap,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    // new HtmlWebpackPlugin()
  ]
}
