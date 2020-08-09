// /* eslint-disable */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: path.join(__dirname, 'main.js'),
  output: {
    publicPath: process.env.SINGLE_APP_PUBLIC_PATH || '/',
    filename: '[name].[hash].js'
  },
  devServer: {
    port: process.env.PORT || 8081,
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
 