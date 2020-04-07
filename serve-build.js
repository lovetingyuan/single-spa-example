const { singleapp: manifest } = require('./package.json')
const fs = require('fs')
const rimraf = require('rimraf')
const concurrently = require('concurrently')
const isBuild = process.env.NODE_ENV === 'production'

rimraf.sync('./dist')
setTimeout(() => {
  fs.mkdirSync('./dist')
})

const cmds = [
  ...Object.keys(manifest).map(name => {
    const cmd = isBuild ? (manifest[name].build || 'npm run build') : (manifest[name].serve || 'npm run serve')
    const { mountPath } = manifest[name]
    return {
      command: `cd modules/${name} && npx cross-env SINGLE_APP=${process.env.NODE_ENV} ` +
        `SINGLE_APP_NAME=${JSON.stringify(name)} SINGLE_APP_MOUNT_PATH=${JSON.stringify(mountPath)} ${cmd}`,
      name: (isBuild ? 'build' : 'start') + ':' + name
    }
  }),
  {
    command: `npx parcel ${isBuild ? 'build' : ''} src/index.html --cache-dir ./node_modules/.cache/parcel`,
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

