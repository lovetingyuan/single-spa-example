import 'normalize.css'
import * as singleSpa from 'single-spa'
import singleAppConfig from './single-app.json'
import normalizeConfig from './normalizeConfig'
import getLifecycles from './getLifecycles'
import injectAsssets from './injectAssets'
import patchInject from './patchInject'

const normalizedConfig = normalizeConfig(singleAppConfig)
patchInject(normalizedConfig)

window.singleApp = {
  singleSpa,
  startApp(appName, lifecycles) {
    document.dispatchEvent(new CustomEvent('MODULE_LOADED:' + appName, {
      detail: lifecycles
    }))
  },
  get singleAppConfig() {
    return normalizedConfig
  }
}

function loadApp(name: string, mountPath: string, publicPath: string, entry: string) {
  let entrypoint = publicPath
  if (process.env.NODE_ENV !== 'production') {
    entrypoint = publicPath + '?request_index_html=' + encodeURIComponent(entry)
  }
  return fetch(entrypoint).then(res => res.text()).then(html => {
    const lifecycles = getLifecycles(name, mountPath)
    return injectAsssets(name, html, publicPath).then(() => lifecycles)
  }).catch(err => {
    console.error(err)
    throw new Error(`Failed to load sub app ${name} at ${entrypoint}. `)
  })
}

function startSingleApp() {
  let defaultMountPath: string
  Object.entries(normalizedConfig).forEach(([name, config]) => {
    const { entry, publicPath, default: defaultApp, mountPath } = config
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
