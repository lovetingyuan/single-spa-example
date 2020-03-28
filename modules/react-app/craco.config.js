module.exports = {
  webpack: {
    configure: {
      output: {
        publicPath: process.env.SINGLE_APP === 'development' ? process.env.PUBLIC_URL : '/'
      }
    }
  }
}
