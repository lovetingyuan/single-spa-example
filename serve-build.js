const manifest = require('./src/single-app.json')
const fs = require('fs')
const rimraf = require('rimraf')
const concurrently = require('concurrently')
const isBuild = process.env.NODE_ENV === 'production'

if (isBuild) {
  rimraf.sync('./dist')
  setTimeout(() => {
    fs.mkdirSync('./dist')
  })
}

const cmds = [
  ...Object.entries(manifest).map(([name, { build, serve, mountPath }]) => {
    const cmd = isBuild ? (build || 'npm run build') : (serve || 'npm run serve')
    return {
      command: `cd modules/${name} && npx cross-env SINGLE_APP=${process.env.NODE_ENV} ` +
        `SINGLE_APP_NAME=${JSON.stringify(name)} SINGLE_APP_MOUNT_PATH=${JSON.stringify(mountPath)} ${cmd}`,
      name: (isBuild ? 'build' : 'start') + ':' + name
    }
  }),
  {
    command: `npx vite ${isBuild ? 'build' : 'serve'} src`,
    name: (isBuild ? 'build' : 'start') + ':root'
  }
]

concurrently(cmds, {
  killOthers: ['failure'],
}).then(() => {
  const cmds = Object.keys(manifest).map(name => {
    const dist = manifest[name].output || 'dist'
    fs.copyFileSync(`./modules/${name}/${dist}/index.html`, `./modules/${name}/${dist}/${name}.html`)
    return {
      command: `npx merge-dirs modules/${name}/${dist} dist`,
      name: 'copydist:' + name
    }
  })
  return concurrently(cmds)
}).catch(err => {
  console.error(err)
})

