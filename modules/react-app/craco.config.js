const port = process.env.PORT = 8083
let publicPath = '/'

if (process.env.SINGLE_APP === 'development') {
  process.env.BROWSER = 'none'
  process.env.WDS_SOCKET_PORT = port
  publicPath = 'http://localhost:' + port + '/'
}

module.exports = {
  webpack: {
    configure: {
      output: {
        publicPath
      }
    }
  }
}
