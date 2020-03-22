const fs = require('fs')
const concurrently = require('concurrently')

const targetAppDirs = process.argv.slice(2)
const allAppDirs = fs.readdirSync('./modules')
const isBuild = targetAppDirs[0] === '--build'
isBuild && targetAppDirs.shift()
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
  if (!singleapp.mountPath) {
    throw new Error(`Error in "${singleapp.name}": You must set "singleapp.mountPath" in package.json.`)
  }
  return {
    port: getPort(singleapp.name), dir, singleapp
  }
})

fs.writeFileSync('./manifest/index.js', `module.exports = ${JSON.stringify(targetApps.map(({ port, singleapp }) => {
  return {
    name: singleapp.name,
    mountPath: singleapp.mountPath,
    startUrl: 'http://localhost:' + port + (singleapp.publicPath || '/'),
  }
}), null, 2)}`)

if (!isBuild) {
  const startCmds = targetApps.map(({ port, dir, singleapp: {name} }) => {
    return {
      command: `cd modules/${dir} && npx cross-env SINGLE_APP=development SINGLE_APP_DEV_PORT=${port} npm run serve`,
      name: 'start:' + name
    }
  }).concat({
    command: `npx parcel src/index.html --cache-dir ./node_modules/.cache --no-autoinstall`,
    name: 'start:root'
  })
  concurrently(startCmds, {
    killOthers: ['failure'],
  })
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
