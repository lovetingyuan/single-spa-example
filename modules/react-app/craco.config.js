module.exports = {
  webpack: {
    configure: {
      output: {
        publicPath: process.env.PUBLIC_URL || '/'
      }
    }
  }
}
