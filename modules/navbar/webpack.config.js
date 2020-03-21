// /* eslint-disable */
const path = require('path')
const webpack = require('webpack')
const SingleAppPlugin = require('../../singleapp-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.join(__dirname, 'main.js'),
  output: {
    filename: '[name].[hash].js'
  },
  devServer: {
    port: process.env.SINGLE_APP_PORT,
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new SingleAppPlugin({
      package: require('./package.json')
    })
    // new HtmlWebpackPlugin()
  ]
}
