import { NormalizedConfigs } from './types'

export default function patchInject(normalizedConfig: NormalizedConfigs) {
  const rawHeadAppend = HTMLHeadElement.prototype.appendChild
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
          Object.entries(normalizedConfig).forEach(([name, config]) => {
            if (pathname.startsWith(config.publicPath)) dom.dataset.appName = name
          })
        }
      } else {
        console.warn('Unknown style tag.')
      }
    }
    return rawHeadAppend.call(this, dom) as T
  }
  return rawHeadAppend
}
