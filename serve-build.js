const concurrently = require('concurrently')
const waitOn = require('wait-on');
const fs = require('fs-extra')
const path = require('path')

const isBuild = process.env.NODE_ENV === 'production'

const resolve = (...args) => path.resolve(__dirname, ...args)

function normalizeManifest (manifestMap) {
  const normalizedManifestMap = {}
  Object.entries(manifestMap).forEach(([name, manifest]) => {
    const _manifest = normalizedManifestMap[name] = {
      publicPath: '', serve: '', build: '', output: '', entry: '', default: false,
      ...manifest
    }
    let publicPath = manifest.publicPath || manifest.mountPath
    if (!publicPath.endsWith('/')) publicPath += '/'
    _manifest.publicPath = publicPath
    _manifest.entry = 'http://localhost:' + manifest.port + publicPath
    _manifest.serve = manifest.serve || 'npm run serve'
    _manifest.build = manifest.build || 'npm run build'
    _manifest.default = !!manifest.default
    _manifest.output = manifest.output || 'dist'
  })
  return normalizedManifestMap
}

const normalizedManifests = normalizeManifest(require('./src/single-app.json'))
const walkManifests = (callback) => {
  Object.entries(normalizedManifests).forEach(([name, manifest]) => {
    if (name[0] !== '_') {
      callback(name, manifest)
    }
  })
}

function serve (rootEntry = 'http://localhost:3000/') {
  const modulesCmds = []
  const resources = [rootEntry]
  walkManifests((name, meta) => {
    const { serve, mountPath, entry } = meta
    const serveCmd = new Function('with(this){return `' + serve + '`}').call(meta)
    const envars = Object.entries({
      NODE_ENV: 'development',
      SINGLE_APP_PUBLIC_PATH: entry, // development requires full url
      SINGLE_APP_NAME: name,
      SINGLE_APP_MOUNT_PATH: mountPath
    }).map(([env, val]) => `${env}=${val}`)
    modulesCmds.push({
      name: `serve:${name}`,
      command: `cd modules/${name} && npx cross-env ${envars.join(' ')} ${serveCmd}`
    })
    resources.push(entry)
  })
  const rootCmd = {
    command: 'vite serve src', name: 'serve:root'
  }
  const serveCmds = modulesCmds.concat(rootCmd)
  concurrently(serveCmds, {
    killOthers: ['failure'],
  }).catch(err => {
    console.error(`Error, serve commands below failed(${err}):`)
    const failedCmds = serveCmds.filter((cmd, i) => err[i]).map(({ name, command }) => {
      return `${name} -> ${command}`
    })
    console.log(JSON.stringify(failedCmds, null, 2))
  })
  waitOn({ resources, delay: serveCmds.length * 1000 }).then(() => {
    setTimeout(() => {
      console.log()
      console.log('Done, serve starts at ' + rootEntry)
      console.log()
    });
  }).catch(err => {
    console.error(err)
  })
}

function build () {
  const modulesCmds = []
  const rootCmd = {
    command: 'vite build src --outDir dist --minify false', name: 'build:root'
  }
  walkManifests((name, meta) => {
    const { build, mountPath, publicPath } = meta
    const buildCmd = new Function('with(this){return `' + build + '`}').call(meta)
    const envars = Object.entries({
      NODE_ENV: 'production',
      SINGLE_APP_PUBLIC_PATH: publicPath,
      SINGLE_APP_NAME: name,
      SINGLE_APP_MOUNT_PATH: mountPath
    }).map(([env, val]) => `${env}=${val}`)
    modulesCmds.push({
      name: `build:${name}`,
      command: `cd modules/${name} && npx cross-env ${envars.join(' ')} ${buildCmd}`
    })
  })
  const buildCmds = modulesCmds.concat(rootCmd)
  fs.emptyDirSync(resolve('dist'))
  concurrently(buildCmds, {
    killOthers: ['failure'],
  }).then(() => {
    walkManifests((name, meta) => {
      fs.copySync(resolve('modules', name, meta.output), resolve('dist', '.' + meta.publicPath))
    })
    console.log()
    console.log('Build done!')
  }).catch(err => {
    console.error(`Error, build commands below failed(${err}):`)
    const failedCmds = buildCmds.filter((cmd, i) => err[i]).map(({ name, command }) => {
      return `${name} -> ${command}`
    })
    console.log(JSON.stringify(failedCmds, null, 2))
  })
}

if (!isBuild) {
  serve()
} else {
  build()
}
