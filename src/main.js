import * as singleSpa from 'single-spa'
import 'normalize.css'

window.singleApp = window.singleApp || {
  startApp (appName, lifecycles) {
    document.dispatchEvent(new CustomEvent('MODULE_LOADED:' + appName, {
      detail: lifecycles
    }))
  },
}

const supportESM = 'noModule' in (document.createElement('script'))

function loadApp (assets, name, mountPath) {
  const lifecycles = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt) => {
      const lifecycles = typeof evt.detail === 'function' ? evt.detail({
        name, mountPath
      }) : evt.detail
      resolve(lifecycles)
    })
  })

  const assetsFragment = document.createDocumentFragment()
  const loadJsTasks = []
  assets.forEach(asset => {
    const dom = document.createElement(asset.tag)
    dom.dataset.singleappName = name
    switch (asset.tag) {
      case 'link': {
        dom.setAttribute('rel', 'stylesheet')
        dom.setAttribute('href', asset.url)
        break
      }
      case 'style': {
        dom.textContent = asset.source
        break
      }
      case 'script': {
        if (typeof asset.type === 'string' && asset.type !== 'inline') {
          if (![
            'text/javascript',
            'text/ecmascript',
            'application/javascript',
            'application/ecmascript',
            'module'
          ].includes(asset.type)) break
        }
        if (asset.type !== 'inline') {
          typeof asset.type === 'string' && dom.setAttribute('type', asset.type)
          typeof asset.async === 'string' && dom.setAttribute('async', asset.async)
          typeof asset.defer === 'string' && dom.setAttribute('defer', asset.defer)
          typeof asset.nomodule === 'string' && dom.setAttribute('nomodule', '')
          dom.setAttribute('src', asset.url)
          
          const task = (
            (asset.type === 'module' && !supportESM) ||
            (typeof asset.nomodule === 'string' && supportESM)
          ) || new Promise((resolve, reject) => {
            dom.onload = resolve
            dom.onerror = reject
          })
          loadJsTasks.push(task)
        } else {
          dom.textContent = asset.source
        }
        break
      }
      default: {
        throw new Error(`not support asset type: ${asset.tag}.`)
      }
    }
    assetsFragment.appendChild(dom)
  })
  const assetsContaineId = 'assets:' + name
  let container = document.getElementById(assetsContaineId)
  if (!container) {
    container = document.createElement('div')
    container.id = assetsContaineId
    container.style = 'display:none!important;'
    document.body.appendChild(container)
  }
  container.innerHTML = ''
  container.appendChild(assetsFragment)

  return Promise.all(loadJsTasks).then(() => lifecycles)
}

function startSingleApp (manifestList) {
  manifestList.forEach(({ name, assets, mountPath }) => {
    const apps = singleSpa.getAppNames();
    if (!apps.includes(name)) {
      singleSpa.registerApplication(
        name,
        () => loadApp(assets, name, mountPath),
        location => location.pathname.startsWith(mountPath)
      )
    }
  })
  singleSpa.start()
}

if (process.env.NODE_ENV === 'development') {
  fetch('/__singleapp-manifest').then(res => res.json()).then(startSingleApp)
} else {
  const manifestList = require('../manifest')
  startSingleApp(manifestList)
}

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept(() => {
    const pathname = location.pathname
    singleSpa.navigateToUrl('/')
    setTimeout(() => {
      singleSpa.navigateToUrl(pathname)
    })
  })
}
