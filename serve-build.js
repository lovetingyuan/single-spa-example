const concurrently = require('concurrently')
const waitOn = require('wait-on');
const fs = require('fs-extra')
const path = require('path')

const isBuild = process.env.NODE_ENV === 'production'

const resolve = (...args) => path.resolve(__dirname, ...args)

function normalizeManifest (manifestMap) {
  const normalizedManifestMap = {}
  Object.entries(manifestMap).forEach(([name, manifest]) => {
    if (name[0] === '_') return
    const _manifest = normalizedManifestMap[name] = {
      publicPath: '', serve: '', build: '', output: '', entry: '', default: false,
      ...manifest
    }
    let publicPath = manifest.publicPath || manifest.mountPath
    if (!publicPath.endsWith('/')) publicPath += '/'
    _manifest.publicPath = publicPath
    _manifest.entry = 'http://localhost:' + manifest.port + publicPath
    _manifest.default = !!manifest.default
    _manifest.output = manifest.output || 'dist'
    const appPkg = require(resolve('modules', name, 'package.json'))
    const serve = appPkg.scripts['singlespa:serve'] || 'npm run serve'
    const build = appPkg.scripts['singlespa:build'] || 'npm run build'
    _manifest.serve = new Function('with(this){return `' + serve + '`}').call(_manifest)
    _manifest.build = new Function('with(this){return `' + build + '`}').call(_manifest)
  })
  return normalizedManifestMap
}

const normalizedManifests = normalizeManifest(require('./src/single-app.json'))
const walkManifests = (callback) => {
  Object.entries(normalizedManifests).forEach(([name, manifest]) => callback(name, manifest))
}

function serve (rootEntry = 'http://localhost:3000/') {
  const modulesCmds = []
  const resources = [rootEntry]
  walkManifests((name, meta) => {
    const { serve, mountPath, entry } = meta
    const serveCmd = new Function('with(this){return `' + serve + '`}').call(meta)
    const envars = Object.entries({
      NODE_ENV: 'development',
      PORT: meta.port,
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
