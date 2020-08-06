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

const originHeadAppend = document.head.appendChild
document.head.appendChild = function (dom) {
  if (dom instanceof HTMLElement && !dom.dataset.appName && document.currentScript) {
    if (dom.tagName === 'STYLE' || dom.tagName === 'SCRIPT' || (dom.tagName === 'LINK' && dom.rel === 'stylesheet')) {
      dom.dataset.appName = document.currentScript.dataset.appName
      return originHeadAppend.call(this, dom)
    }
  }
  return originHeadAppend.call(this, dom)
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

const toggleStyles = (appName, disable) => {
  document.querySelectorAll(`style[data-app-name="${appName}"]`).forEach(style => {
    style.setAttribute('type', disable ? '_text/css' : 'text/css')
  })
  document.querySelectorAll(`link[data-app-name="${appName}"]`).forEach(link => {
    link.setAttribute('rel', disable ? '_stylesheet' : 'stylesheet')
  })
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
        task = (
          (type === 'module' && !supportESM) ||
          (typeof nomodule === 'string' && supportESM)
        ) || new Promise((resolve, reject) => {
          const scriptSrc = resolveUrl(src, entrypoint)
          dom = createElement(tagName, {
            type,
            src: scriptSrc,
            async: tag.getAttribute('async'),
            defer: tag.getAttribute('defer'),
            nomodule
          })
          dom.dataset.appName = name
          document.head.appendChild(dom)
          dom.onload = resolve
          dom.onerror = reject
          // fetch(scriptSrc).then(res => res.text()).then(code => {
          //   const blob = new Blob([`with({
          //     get document () { window.__appName__ = ${JSON.stringify(name)}; return document; }
          //   }){\n${code};\n}`], { type: 'application/javascript' });
          //   dom = createElement(tagName, {
          //     type,
          //     src: URL.createObjectURL(blob),
          //     async: tag.getAttribute('async'),
          //     defer: tag.getAttribute('defer'),
          //     nomodule
          //   })
          //   dom.dataset.src = scriptSrc
          //   dom.dataset.appName = name
          //   originHeadAppend(dom)
          //   dom.onload = resolve
          //   dom.onerror = reject
          // }).catch(reject)
        })
      } else {
        dom = createElement(tagName, tag.textContent)
      }
    }
    if (dom instanceof HTMLElement) {
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
      const mount = lifecycles.mount
      if (!mount) throw new Error(`Child app "${name}" lifecycle "mount" is required but got undefined.`)
      lifecycles.mount = function (...args) {
        toggleStyles(name, false)
        return mount.call(this, ...args)
      }
      const unmount = lifecycles.unmount || (() => Promise.resolve())
      lifecycles.unmount = function (...args) {
        toggleStyles(name, true)
        return unmount.call(this, ...args)
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
    if (name[0] === '_') return
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
