const fs = require('fs')
const concurrently = require('concurrently')
const { JSDOM } = require('jsdom')

const targetAppDirs = process.argv.slice(2)
const allAppDirs = fs.readdirSync('./modules')
const isBuild = process.env.NODE_ENV === 'production'
fs.existsSync('./manifest') || fs.mkdirSync('./manifest')

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

const targetApps = targetAppDirs.concat(
  allAppDirs.filter(dir => {
    if (!targetAppDirs.length) return true
    const { singleapp } = require('./modules/' + dir + '/package.json')
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

function serve () {
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
      return JSDOM.fromURL(startUrl, {
        // resources
      }).then(dom => {
        const doc = dom.window.document
        const scripts = [...doc.querySelectorAll('script[src]')].map(({ src }) => {
          if (src.startsWith('http')) return src
          return (src[0] === '/' ? origin : startUrl) + src
        })
        const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(({ href }) => {
          if (href.startsWith('http')) return href
          return (href[0] === '/' ? origin : startUrl) + href
        })
        return {
          assets: { js: scripts, css: styles },
          name: singleapp.name,
          mountPath: singleapp.mountPath
        }
      });
    })).then(list => {
      res.json(list)
    }).catch(next)
  })

  app.use(bundler.middleware())
  const server = app.listen(1234)
  Array('SIGINT', 'SIGTERM', 'SIGHUP').forEach(sig => {
    process.on(sig, () => {
      server.close(() => {
        process.exit(0)
      })
    })
  })
}

if (!isBuild) {
  const startCmds = targetApps.map(({ port, dir, singleapp: {name} }) => {
    return {
      command: `cd modules/${dir} && npx cross-env SINGLE_APP=development SINGLE_APP_DEV_PORT=${port} npm run serve`,
      name: 'start:' + name
    }
  })
  concurrently(startCmds, {
    killOthers: ['failure'],
  })
  serve()
} else {
  const buildCmds = targetApps.map(name => {
    return {
      command: `cd modules/${name} && npx cross-env SINGLE_APP=true npm run build`,
      name: 'build:' + name
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
    ]).then(() => concurrently([
      {
        command: `npx parcel build src/index.html --cache-dir ./node_modules/.cache`,
        name: 'build:root'
      }
    ]))
  }).then(() => {
    const copyDistCmds = targetApps.map(name => {
      const { singleapp } = require('./modules/' + name + '/package.json')
      return {
        command: `npx merge-dirs modules/${name}/${singleapp.output || 'dist'} dist`,
        name: 'copydist:' + name
      }
    })
    return concurrently(copyDistCmds)
  }).then(() => {
    console.log('Build Done!')
  }).catch(err => {
    console.error('Build Failed.' + err)
  })
}
