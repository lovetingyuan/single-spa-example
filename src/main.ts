import 'normalize.css'
import * as singleSpa from 'single-spa'
import manifestMap from './single-app.json'
import { Manifest, AppNames, NormalizedManifestMap, NormalizedManifest } from './types'

function normalizeManifest(manifestMap: Record<AppNames, Manifest>) {
  const normalizedManifestMap: NormalizedManifestMap = {} as NormalizedManifestMap
  const publicPathes = new Set()
  Object.entries(manifestMap).forEach(([name, manifest]) => {
    if (name[0] === '_') return
    const _manifest = normalizedManifestMap[name as AppNames] = {
      publicPath: '', serve: '', build: '', output: '', entry: '', default: false,
      ...manifest
    }
    let publicPath = manifest.publicPath || manifest.mountPath
    if (publicPath === '/') { // publicPath can not be '/'
      publicPath = '/' + name + '/'
    } else if (!publicPath.endsWith('/')) {
      publicPath += '/'
    }
    if (!publicPathes.has(publicPath)) {
      publicPathes.add(publicPath)
    } else {
      throw new Error(`publicPath: ${publicPath} of ${name} has existed.`)
    }
    _manifest.publicPath = publicPath
    _manifest.entry = 'http://localhost:' + manifest.port + publicPath
    _manifest.default = !!manifest.default
    _manifest.output = manifest.output || 'dist'
  })
  return normalizedManifestMap
}

const normalizedManifests = normalizeManifest(manifestMap)

const walkManifests = (callback: (a: AppNames, b: NormalizedManifest) => any) => {
  Object.entries(normalizedManifests).forEach(([name, manifest]) => callback(name as AppNames, manifest))
}

window.singleApp = {
  startApp(appName, lifecycles) {
    document.dispatchEvent(new CustomEvent('MODULE_LOADED:' + appName, {
      detail: lifecycles
    }))
  },
  singleSpa,
  get appManifests() {
    return normalizedManifests
  }
}

const rawHeadAppend = HTMLHeadElement.prototype.appendChild
HTMLHeadElement.prototype.appendChild = function <T extends Node>(this: HTMLHeadElement, dom: T): T {
  if (
    dom instanceof HTMLStyleElement ||
    dom instanceof HTMLScriptElement ||
    (dom instanceof HTMLLinkElement && dom.rel === 'stylesheet') &&
    !dom.dataset.appName
  ) {
    const appName = document.currentScript && document.currentScript.dataset.appName
    if (appName) {
      dom.dataset.appName = appName
    } else if (dom instanceof HTMLScriptElement || dom instanceof HTMLLinkElement) {
      const url = dom instanceof HTMLScriptElement ? dom.src : dom.href
      if (url) {
        const pathname = url.startsWith('http') ? new URL(url).pathname : url
        walkManifests((name, meta) => {
          if (pathname.startsWith(meta.publicPath)) dom.dataset.appName = name
        })
      }
    }
  }
  return rawHeadAppend.call(this, dom) as T
}

const supportESM = 'noModule' in (document.createElement('script'))

const resolveUrl = (url: string, publicPath: string) => {
  if (url.startsWith('http') || url.startsWith('//')) return url
  if (url[0] === '.') {
    throw new Error(`Relative url is not supported: ${url}.`)
  }
  if (url[0] !== '/') {
    url = publicPath + url
  }
  return url
}

const createElement = (tag: string, attrs: Record<string, any> | string) => {
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

const toggleStyles = (appName: AppNames, disable?: boolean) => {
  document.querySelectorAll(`style[data-app-name="${appName}"]`).forEach(style => {
    style.setAttribute('type', disable ? '_text/css' : 'text/css')
  })
  document.querySelectorAll(`link[data-app-name="${appName}"]`).forEach(link => {
    link.setAttribute('rel', disable ? '_stylesheet' : 'stylesheet')
  })
}

async function loadApp(name: AppNames, mountPath: string, publicPath: string, entry: string) {
  const entrypoint = process.env.NODE_ENV === 'production' ? publicPath : (publicPath + '?request_index_html=' + encodeURIComponent(entry))
  const html = await fetch(entrypoint).then(res => res.text()).catch(err => {
    console.log(`Failed to load sub app ${name}: ` + err)
  })
  if (!html) return Promise.reject(new Error(`Failed to load sub app ${name} at ${entrypoint}.`))
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(html, 'text/html')
  const assetsFragment = document.createDocumentFragment()
  const loadAssetsTasks = Array(...doc.head.children, ...doc.body.children).map(tag => {
    let dom, task
    const tagName = tag.tagName.toLowerCase()
    if (tag instanceof HTMLLinkElement && tag.rel === 'stylesheet') {
      dom = createElement(tagName, {
        rel: 'stylesheet',
        href: resolveUrl(tag.getAttribute('href') || '', publicPath)
      })
    } else if (tag instanceof HTMLStyleElement) {
      const type = tag.getAttribute('type')
      if (type && type !== 'text/css') return
      const media = tag.getAttribute('media')
      dom = createElement(tagName, tag.textContent || '')
      if (typeof media === 'string') {
        dom.setAttribute('media', media)
      }
    } else if (tag instanceof HTMLScriptElement) {
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
          dom = createElement(tagName, {
            type,
            src: resolveUrl(src, publicPath),
            async: tag.getAttribute('async'),
            defer: tag.getAttribute('defer'),
            nomodule
          })
          dom.dataset.appName = name
          dom.onload = resolve
          dom.onerror = reject
        })
      } else {
        dom = createElement(tagName, tag.textContent || '')
      }
    }
    if (dom instanceof HTMLElement) {
      dom.dataset.appName = name
      assetsFragment.appendChild(dom)
    }
    return task
  })
  const lifecycles: Promise<singleSpa.LifeCycles> = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt: CustomEventInit) => {
      const lifecycles = typeof evt.detail === 'function' ? evt.detail({
        name, mountPath
      }) : evt.detail
      if (!lifecycles.bootstrap) {
        lifecycles.bootstrap = () => Promise.resolve()
      }
      const mount = lifecycles.mount
      if (!mount) throw new Error(`Child app "${name}" lifecycle "mount" is required but got undefined.`)
      lifecycles.mount = function (...args: any) {
        toggleStyles(name, false)
        return mount.call(this, ...args)
      }
      const unmount = lifecycles.unmount || (() => Promise.resolve())
      lifecycles.unmount = function (...args: any) {
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
  let defaultMountPath: string
  walkManifests((name, { entry, publicPath, default: defaultApp, mountPath }) => {
    const apps = singleSpa.getAppNames();
    if (!apps.includes(name)) {
      singleSpa.registerApplication(
        name,
        () => loadApp(name, mountPath, publicPath, entry),
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
    const noapp = document.getElementById('no-app-container')
    if (noapp) {
      noapp.style.display = mountedApps.length === 1 ? 'block' : 'none'
    }
  })
  window.addEventListener('single-spa:routing-event', (evt: any) => {
    console.log('single-spa finished mounting/unmounting applications!');
    console.log(evt.detail.originalEvent) // PopStateEvent
    console.log(evt.detail.newAppStatuses) // { app1: MOUNTED, app2: NOT_MOUNTED }
    console.log(evt.detail.appsByNewStatus) // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
    console.log(evt.detail.totalAppChanges) // 2
  });
  window.addEventListener('popstate', (evt: any) => {
    if (evt.singleSpa) {
      console.log('This event was fired by single-spa to forcibly trigger a re-render')
      console.log(evt.singleSpaTrigger); // pushState | replaceState
    } else {
      console.log('This event was fired by native browser behavior')
    }
  });
  singleSpa.start()
}

startSingleApp()
