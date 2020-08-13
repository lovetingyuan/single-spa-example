process.env.VUE_APP_SINGLE_APP_MOUNT_PATH = process.env.SINGLE_APP_MOUNT_PATH
process.env.VUE_APP_SINGLE_APP_NAME = process.env.SINGLE_APP_NAME

module.exports = {
  lintOnSave: false,
  publicPath: process.env.SINGLE_APP_PUBLIC_PATH || '/'
}
