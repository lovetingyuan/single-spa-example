import * as singleSpa from 'single-spa'
import manifestList from '../manifest'
import 'normalize.css'

window.singleApp = window.singleApp || {
  loadApp (appName, lifecycles) {
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

function getFullUrl (path, origin, name) {
  if (path.startsWith('http')) return path
  if (path[0] === '/') {
    path = path.substr(1)
  }
  if (!origin.endsWith('/')) {
    origin = origin + '/'
  }
  return origin + path + (name ? '?singleapp=' + name : '')
}

function loadModule (startUrl, name) {
  const lifecycles = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt) => {
      resolve(typeof evt.detail === 'function' ? evt.detail(name) : evt.detail)
    })
  })
  if (process.env.NODE_ENV === 'development') {
    return fetch(startUrl).then(res => res.text()).then(html => {
      const domparser = new DOMParser()
      const doc = domparser.parseFromString(html, 'text/html')
      const scripts = [...doc.querySelectorAll('script[src]')].map(v => v.getAttribute('src'))
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(v => {
        const link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.href = getFullUrl(v.getAttribute('href'), startUrl, name)
        link.dataset.singleapp = name
        document.head.appendChild(link)
      })
      return scripts.reduce(
        (p, url) => p.then(() => {
          const script = document.createElement('script')
          script.src = getFullUrl(url, startUrl, name)
          script.dataset.singleapp = name
          document.body.appendChild(script)
          return new Promise((resolve, reject) => {
            script.onerror = reject
            script.onload = resolve
          })
        }),
        Promise.resolve()
      ).then(() => lifecycles)
    })
  }
}

manifestList.forEach(({ name, startUrl, mountPath }) => {
  const apps = singleSpa.getAppNames();
  if (!apps.includes(name)) {
    singleSpa.registerApplication(
      name,
      () => loadModule(startUrl, name),
      location => location.pathname.startsWith(mountPath)
    )
  }
})

singleSpa.start()

if (module.hot) {
  module.hot.accept()
}
