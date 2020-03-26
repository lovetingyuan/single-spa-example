const fs = require('fs')
const path = require('path')
const Url = require('url')
const concurrently = require('concurrently')
const { JSDOM } = require('jsdom')

const targetAppDirs = process.argv.slice(2)
const allAppDirs = fs.readdirSync('./modules')
const isBuild = process.env.NODE_ENV === 'production'
const isURL = url => /^http(s)?:\/\/.+/.test(url)

const getPort = str => {
  let num = 1
  for (let c of str) {
    num = num * c.codePointAt(0)
  }
  num = num % 10000
  if (num < 1000) {
    num = num * (10 ** (4 - String(num).length))
  }
  return num
}

const generateManifest = function (urlOrFile, singleApp) {
  const isurl = isURL(urlOrFile)
  const resolveUrl = url => {
    if (!isurl || isURL(url)) return url
    return Url.resolve(urlOrFile, url)
  }
  return JSDOM[isurl ? 'fromURL' : 'fromFile'](urlOrFile, {
    // resources
  }).then(dom => {
    const doc = dom.window.document
    const initAssets = [
      ...doc.head.children,
      ...doc.body.children
    ].map(tag => {
      if (tag.tagName === 'LINK' && tag.rel === 'stylesheet') {
        return {
          tag: 'link',
          url: resolveUrl(tag.getAttribute('href'))
        }
      }
      if (tag.tagName === 'STYLE') {
        const content = tag.innerHTML.trim()
        if (content) {
          return {
            tag: 'style',
            source: content
          }
        }
      }
      if (tag.tagName === 'SCRIPT') {
        const type = tag.getAttribute('type')
        if (type && !['text/javascript', 'text/ecmascript', 'application/javascript', 'application/ecmascript', 'module'].includes(type)) return
        const async = tag.getAttribute('async')
        const defer = tag.getAttribute('defer')
        const nomodule = tag.getAttribute('nomodule')
        const src = tag.getAttribute('src')
        if (src) {
          if (src.endsWith('.hot-update.js')) return
          return {
            tag: 'script',
            type,
            url: resolveUrl(src),
            async, defer, nomodule
          }
        } else {
          const content = tag.innerHTML.trim()
          if (content) {
            return {
              tag: 'script',
              type: 'inline',
              source: content
            }
          }
        }
      }
    }).filter(Boolean)
    try { dom.window.close() } catch (err) {}
    if (singleApp) {
      return {
        assets: initAssets,
        name: singleApp.name,
        mountPath: singleApp.mountPath
      }
    }
    return initAssets
  })
}

const targetApps = targetAppDirs.concat(
  allAppDirs.filter(dir => {
    const { singleapp } = require('./modules/' + dir + '/package.json')
    if (!singleapp || singleapp.disabled) return false
    if (!targetAppDirs.length) return true
    return (singleapp.mountPath === '/') && !targetAppDirs.includes(dir)
  })
).map(dir => {
  const { singleapp, name } = require('./modules/' + dir + '/package.json')
  singleapp.name = singleapp.name || name
  singleapp.publicPath = singleapp.publicPath || '/'
  if (singleapp.publicPath[0] !== '/') {
    singleapp.publicPath = '/' + singleapp.publicPath
  }
  if (!singleapp.publicPath.endsWith('/')) {
    singleapp.publicPath = singleapp.publicPath + '/'
  }
  if (!singleapp.mountPath) {
    throw new Error(`Error in "${singleapp.name}": You must set "singleapp.mountPath" in package.json.`)
  }
  return {
    port: getPort(singleapp.name), dir, singleapp
  }
})

if (require.main === module) {
  if (!isBuild) {
    serve()
  } else {
    build()
  }
}

function serve () {
  const startCmds = targetApps.map(({ port, dir, singleapp: {name} }) => {
    return {
      command: `cd modules/${dir} && npx cross-env SINGLE_APP=development SINGLE_APP_DEV_PORT=${port} npm run serve`,
      name: 'start:' + name
    }
  })
  concurrently(startCmds, {
    killOthers: ['failure'],
  })
  const Bundler = require('parcel-bundler');
  const app = require('express')();

  const file = 'src/index.html'; // Pass an absolute path to the entrypoint here
  const options = {
    cacheDir: './node_modules/.cache/parcel',
    autoInstall: false
  }; // See options section of api docs, for the possibilities
  const bundler = new Bundler(file, options);
  app.get('/__singleapp-manifest', (req, res, next) => {
    Promise.all(targetApps.map(({ port, singleapp }) => {
      const origin = 'http://localhost:' + port
      const startUrl = origin + singleapp.publicPath
      return generateManifest(startUrl, singleapp)
    })).then(list => {
      res.json(list)
    }).catch(next)
  })

  app.use(bundler.middleware())
  app.use('*', (req, res, next) => {
    console.log(req.url)
    res.sendStatus(404)
  })
  const server = app.listen(1234)
  Array('SIGINT', 'SIGTERM', 'SIGHUP').forEach(sig => {
    process.on(sig, () => {
      server.close(() => {
        process.exit(0)
      })
    })
  })
}

function build () {
  fs.existsSync('./manifest') || fs.mkdirSync('./manifest')
  const buildCmds = targetApps.map(({ dir }) => {
    return {
      command: `cd modules/${dir} && npx cross-env SINGLE_APP=production npm run build`,
      name: 'build:' + dir
    }
  })
  concurrently(buildCmds, {
    killOthers: ['failure'],
  }).then(() => {
    return concurrently([
      {
        command: 'npx rimraf ./dist',
        name: 'clean:dist'
      },
    ]).then(() => {
      return Promise.all(targetApps.map(({ dir, singleapp }) => {
        const indexHtml = path.join('./modules', dir, singleapp.output || 'dist', 'index.html')
        return generateManifest(indexHtml, singleapp)
      })).then(list => {
        fs.writeFileSync('./manifest/index.js', `module.exports = ${JSON.stringify(list, null, 2)};`)
      })
    }).then(() => concurrently([
      {
        command: `npx parcel build src/index.html --cache-dir ./node_modules/.cache`,
        name: 'build:root'
      }
    ]))
  }).then(() => {
    const copyDistCmds = targetApps.map(({ dir, singleapp }) => {
      return {
        command: `npx merge-dirs modules/${dir}/${singleapp.output || 'dist'} dist`,
        name: 'copydist:' + dir
      }
    })
    return concurrently(copyDistCmds)
  }).then(() => {
    console.log('Build Done!')
  }).catch(err => {
    console.error('Build Failed.', err)
  })
}
