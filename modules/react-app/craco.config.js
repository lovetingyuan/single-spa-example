if (process.env.SINGLE_APP === 'development') {
  process.env.BROWSER = 'none' // do not open browser
  const port = process.env.SINGLE_APP_DEV_PORT
  process.env.PORT = port
  process.env.WDS_SOCKET_PORT = port
  process.env.PUBLIC_URL = 'http://localhost:' + port + '/'
}

module.exports = {
}
