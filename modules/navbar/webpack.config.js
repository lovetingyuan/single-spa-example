// /* eslint-disable */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let publicPath = '/'

if (process.env.SINGLE_APP === 'development') {
  publicPath = 'http://localhost:8081/'
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.join(__dirname, 'main.js'),
  output: {
    publicPath,
    filename: '[name].[hash].js'
  },
  devServer: {
    port: 8081,
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
    new HtmlWebpackPlugin()
  ]
}
 