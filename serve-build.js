const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const concurrently = require('concurrently')
const got = require('got')
// const { createProxyMiddleware } = require('http-proxy-middleware');

const targetAppDirs = process.argv.slice(2)
const allAppDirs = fs.readdirSync('./modules')
const isBuild = targetAppDirs[0] === '--build'
isBuild && targetAppDirs.shift()
fs.existsSync('./manifest') || fs.mkdirSync('./manifest')

targetAppDirs.push(...(targetAppDirs.length ? allAppDirs.filter(name => {
  const { singleapp } = require('./modules/' + name + '/package.json')
  return singleapp.required && !targetAppDirs.includes(name)
}) : allAppDirs))

const targetApps = targetAppDirs.reduce((ret, dir, index) => {
  const { singleapp, name } = require('./modules/' + dir + '/package.json')
  const appName = singleapp.name || name
  let port = +singleapp.port || parseInt(
    crypto.createHash('md5').update(appName).digest('hex').substr(0, 10), 16
  ) % 10000
  port = port * (10 ** (4 - String(port).length))
  ret[appName] = {
    port, dir
  }
  fs.writeFileSync('./manifest/' + appName + '.json', '{}')
  if (index === targetAppDirs.length - 1) {
    fs.writeFileSync('./manifest/index.js', `
    module.exports = {
      ${Object.keys(ret).map(name => {
      return `${JSON.stringify(name)}: require('./${name}.json')`
    }).join(', ')}
    }`)
  }
  return ret
}, {})

if (!isBuild) {
  const startCmds = Object.entries(targetApps).map(([appName, { dir, port }]) => {
    return {
      command: `cd modules/${dir} && npx cross-env SINGLE_APP=true SINGLE_APP_PORT=${port} npm run serve`,
      name: 'start:' + appName
    }
  }).concat({
    command: `npx parcel src/index.html --cache-dir ./node_modules/.cache --no-autoinstall`,
    name: 'start:root'
  })
  concurrently(startCmds)
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
