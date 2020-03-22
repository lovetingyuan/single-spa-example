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
    return document.currentScript.dataset.singleapp
  }
}

function loadApp ({ js, css }, name) {
  const lifecycles = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt) => {
      resolve(typeof evt.detail === 'function' ? evt.detail(name) : evt.detail)
    })
  })
  css.forEach(href => {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.href = href + '?singleapp=' + name
    link.dataset.singleapp = name
    document.head.appendChild(link)
  })
  return js.reduce(
    (p, src) => p.then(() => {
      const script = document.createElement('script')
      script.src = src + '?singleapp' + name
      script.dataset.singleapp = name
      document.body.appendChild(script)
      return new Promise((resolve, reject) => {
        script.onerror = reject
        script.onload = resolve
      })
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
        () => loadApp(assets, name),
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
