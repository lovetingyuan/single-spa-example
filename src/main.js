import 'normalize.css'
import * as singleSpa from 'single-spa'
import manifestMap from './single-app.json'

window.singleApp = {
  startApp(appName, lifecycles) {
    document.dispatchEvent(new CustomEvent('MODULE_LOADED:' + appName, {
      detail: lifecycles
    }))
  },
  singleSpa,
  get appManifests() {
    return manifestMap
  }
}

const supportESM = 'noModule' in (document.createElement('script'))
const resolveUrl = (url, entry) => {
  if (url.startsWith('http') || url.startsWith('//')) return url
  if (url[0] === '.') {
    throw new Error(`Relative asset path is not supported: ${url} of ${urlOrFile}.`)
  }
  if (url[0] !== '/') {
    url = '/' + url
  }
  if (entry.startsWith('http') || entry.startsWith('//')) {
    return entry.slice(0, -1) + (entry.slice(-1) + url).replace(/\/\//g, '/')
  }
  return url
}

const createElement = (tag, attrs) => {
  const dom = document.createElement(tag)
  if (typeof attrs === 'string') {
    dom.textContent = attrs
  } else {
    Object.entries(attrs).forEach(([key, val]) => {
      if (typeof val === 'string') {
        dom.setAttribute(key, val)
      }
    })
  }
  return dom
}

async function loadApp(name, mountPath, entrypoint) {
  const html = await fetch(entrypoint).then(res => res.text())
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(html, 'text/html')
  const assetsFragment = document.createDocumentFragment()
  const loadAssetsTasks = Array(...doc.head.children, ...doc.body.children).map(tag => {
    let dom
    let task
    const tagName = tag.tagName.toLowerCase()
    if (tagName === 'link' && tag.rel === 'stylesheet') {
      dom = createElement(tagName, {
        rel: 'stylesheet',
        href: resolveUrl(tag.getAttribute('href'), entrypoint)
      })
    } else if (tagName === 'style') {
      const type = tag.getAttribute('type')
      if (type && type !== 'text/css') return
      const media = tag.getAttribute('media')
      dom = createElement(tagName, tag.textContent)
      if (typeof media === 'string') {
        dom.setAttribute('media', media)
      }
    } else if (tagName === 'script') {
      const type = tag.getAttribute('type')
      const src = tag.getAttribute('src')
      if (
        (
          type && ![
            'text/javascript',
            'text/ecmascript',
            'application/javascript',
            'application/ecmascript',
            'module'
          ].includes(type)
        ) ||
        (src && src.endsWith('.hot-update.js'))
      ) return
      if (src) {
        const nomodule = tag.getAttribute('nomodule')
        dom = createElement(tagName, {
          type,
          src: resolveUrl(src, entrypoint),
          async: tag.getAttribute('async'),
          defer: tag.getAttribute('defer'),
          nomodule
        })
        task = (
          (type === 'module' && !supportESM) ||
          (typeof nomodule === 'string' && supportESM)
        ) || new Promise((resolve, reject) => {
          dom.onload = resolve
          dom.onerror = reject
        })
      } else {
        dom = createElement(tagName, tag.textContent)
      }
    }
    if (dom) {
      dom.dataset.appName = name
      assetsFragment.appendChild(dom)
    }
    return task
  })
  const lifecycles = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt) => {
      const lifecycles = typeof evt.detail === 'function' ? evt.detail({
        name, mountPath
      }) : evt.detail
      if (!lifecycles.bootstrap) {
        lifecycles.bootstrap = () => Promise.resolve()
      }
      if (!lifecycles.unmount) {
        lifecycles.unmount = () => Promise.resolve()
      }
      resolve(lifecycles)
    })
  })
  document.head.appendChild(assetsFragment)
  return Promise.all(loadAssetsTasks).then(() => lifecycles)
}

function startSingleApp() {
  let defaultMountPath
 
  Object.entries(manifestMap).forEach(([name, { entrypoint, mountPath, default: defaultApp }]) => {
    if (process.env.NODE_ENV === 'production') {
      entrypoint = '/' + name + '.html'
    }
    if (typeof entrypoint === 'number' || /^\d+$/.test(entrypoint)) {
      entrypoint = 'http://localhost:' + entrypoint
    }
    const apps = singleSpa.getAppNames();
    if (!apps.includes(name)) {
      singleSpa.registerApplication(
        name,
        () => loadApp(name, mountPath, entrypoint),
        location => location.pathname.startsWith(mountPath)
      )
    }
    if (defaultApp) {
      defaultMountPath = mountPath
    }
  })
  window.addEventListener('single-spa:first-mount', () => {
    if (defaultMountPath && location.pathname === '/') {
      singleSpa.navigateToUrl(defaultMountPath)
    }
  })
  window.addEventListener('single-spa:app-change', () => {
    const mountedApps = singleSpa.getMountedApps()
    document.getElementById('no-app-container').style.display = mountedApps.length === 1 ? 'block' : 'none'
  })
  singleSpa.start()
}

startSingleApp()
