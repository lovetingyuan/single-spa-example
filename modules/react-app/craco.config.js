const publicPath = process.env.SINGLE_APP_PUBLIC_PATH || '/'
process.env.PUBLIC_URL = publicPath
module.exports = {
  webpack: {
    configure: {
      output: {
        publicPath
      }
    }
  }
}
