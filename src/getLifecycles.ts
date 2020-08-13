import * as singleSpa from 'single-spa'

const toggleStyles = (appName: string, disable?: boolean) => {
  document.querySelectorAll(`style[data-app-name="${appName}"]`).forEach(style => {
    style.setAttribute('type', disable ? '_text/css' : 'text/css')
  })
  document.querySelectorAll(`link[data-app-name="${appName}"]`).forEach(link => {
    link.setAttribute('rel', disable ? '_stylesheet' : 'stylesheet')
  })
}

export default function getLifecycles(name: string, mountPath: string): Promise<singleSpa.LifeCycles> {
  return new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt: CustomEventInit) => {
      const lifecycles = typeof evt.detail === 'function' ? evt.detail({
        appName: name, mountPath
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
}
