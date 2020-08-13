const got = require('got')

module.exports = {
  configureServer(context) {
    context.app.use((ctx, next) => {
      if ('request_index_html' in ctx.request.query) {
        ctx.status = 200
        ctx.type = 'text/plain; charset=utf-8'
        const realUrl = decodeURIComponent(ctx.request.query.request_index_html)
        return got(realUrl).then(res => {
          ctx.response.body = res.body
          return next()
        })
      }
      return next()
    })
  }
}
