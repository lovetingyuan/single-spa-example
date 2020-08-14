import { NormalizedConfigs } from './types'
export const rawHeadAppend = HTMLHeadElement.prototype.appendChild

// just for disable css, but not 100% effective.
export default function patchInject(normalizedConfig: NormalizedConfigs) {
  HTMLHeadElement.prototype.appendChild = function <T extends Node>(this: HTMLHeadElement, dom: T): T {
    if (!(dom instanceof HTMLElement)) {
      return rawHeadAppend.call(this, dom) as T
    }
    if (
      (dom instanceof HTMLStyleElement ||
      dom instanceof HTMLScriptElement ||
      (dom instanceof HTMLLinkElement && dom.rel === 'stylesheet')) &&
      (dom.dataset && !dom.dataset.appName)
    ) {
      const appName = document.currentScript && document.currentScript.dataset.appName
      if (appName) {
        dom.dataset.appName = appName
      } else if (dom instanceof HTMLScriptElement || dom instanceof HTMLLinkElement) {
        const url = dom instanceof HTMLScriptElement ? dom.src : dom.href
        if (url) {
          const pathname = url.startsWith('http') ? new URL(url).pathname : url
          let max = 0
          Object.entries(normalizedConfig).forEach(([name, config]) => {
            if (pathname.startsWith(config.publicPath) && config.publicPath.length > max) {
              max = config.publicPath.length
              dom.dataset.appName = name
            }
          })
        }
      } else { // for async script or module script, inject style can not obtain appName
        console.warn('Unknown style tag.')
      }
    }
    return rawHeadAppend.call(this, dom) as T
  }
}
