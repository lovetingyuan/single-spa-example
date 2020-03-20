const fs = require('fs')
const targetApps = process.argv.slice(2)
const isBuild = targetApps[0] === '--build'
const concurrently = require('concurrently')

if (isBuild) {
  targetApps.shift()
}

const allApps = fs.readdirSync('./modules')

if (!targetApps.length) {
  targetApps.push(...allApps)
} else {
  allApps.forEach(name => {
    const { singleapp } = require('./modules/' + name + '/package.json')
    if (singleapp.required && !targetApps.includes(name)) {
      targetApps.push(name)
    }
  })
}

const appNames = targetApps.map(name => {
  const { singleapp, name: pkgName } = require('./modules/' + name + '/package.json')
  const appName = (singleapp.name || pkgName).replace(/ /g, '-')
  if (!fs.existsSync('./manifest')) {
    fs.mkdirSync('./manifest')
  }
  fs.writeFileSync('./manifest/' + appName + '.json', '{}')
  return appName
})

fs.writeFileSync('./manifest/index.js', `
module.exports = {
  ${appNames.map(name => `${JSON.stringify(name)}: require('./${name}.json')`).join(', ')}
}
`)

if (!isBuild) {
  concurrently(targetApps.map(name => {
    return {
      command: `cd modules/${name} && npx cross-env SINGLE_APP=true npm run serve`,
      name: 'start:' + name
    }
  }).concat({
    command: `npx parcel src/index.html --cache-dir ./node_modules/.cache --no-autoinstall`,
    name: 'start:root'
  }))
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
