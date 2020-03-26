import * as singleSpa from 'single-spa'
import 'normalize.css'

window.singleApp = window.singleApp || {
  startApp (appName, lifecycles) {
    if (!lifecycles) {
      lifecycles = appName
      appName = this.appName
    }
    document.dispatchEvent(new CustomEvent('MODULE_LOADED:' + appName, {
      detail: lifecycles
    }))
  },
  get appName () {
    return document.currentScript.dataset.singleappName
  },
  get appMountPath () {
    return document.currentScript.dataset.singleappPath
  }
}

function loadApp (assets, name, mountPath) {
  const lifecycles = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt) => {
      resolve(typeof evt.detail === 'function' ? evt.detail(name) : evt.detail)
    })
  })
  return assets.reduce(
    (p, asset) => p.then(() => {
      const dom = document.createElement(asset.tag)
      dom.dataset.singleappName = name
      dom.dataset.singleappPath = mountPath
      let promise
      switch (asset.tag) {
        case 'link': {
          dom.setAttribute('rel', 'stylesheet')
          dom.setAttribute('href', asset.url)
          document.head.appendChild(dom)
          break
        }
        case 'style': {
          dom.innerText = asset.source
          document.head.appendChild(dom)
          break
        }
        case 'script': {
          if (asset.type !== 'inline') {
            typeof asset.type === 'string' && dom.setAttribute('type', asset.type)
            typeof asset.async === 'string' && dom.setAttribute('async', asset.async)
            typeof asset.defer === 'string' && dom.setAttribute('defer', asset.defer)
            dom.setAttribute('src', asset.url)
            promise = new Promise((resolve, reject) => {
              dom.onerror = reject
              dom.onload = resolve
            })
          } else {
            dom.innerText = asset.source
          }
          document.body.appendChild(dom)
          break
        }
        default: {
          throw new Error(`not support asset type: ${asset.tag}`)
        }
      }
      return promise
    }),
    Promise.resolve()
  ).then(() => lifecycles)
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

if (module.hot) {
  module.hot.accept()
}
