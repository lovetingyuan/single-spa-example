if (process.env.NODE_ENV === 'development' && typeof singleApp === 'object') {
  __webpack_public_path__ = process.env.SINGLE_APP_DEV_ORIGIN + '/' // eslint-disable-line
}
