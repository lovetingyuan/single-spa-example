const supportESM = 'noModule' in (document.createElement('script'))

const scriptTypes = [
  'text/javascript',
  'text/ecmascript',
  'application/javascript',
  'application/ecmascript',
  'module'
]

function createElement (tagName: 'script' | 'link' | 'style', attrs: Attr[], textContent?: string | null) {
  const dom = document.createElement(tagName)
  attrs.forEach(attr => {
    dom.setAttribute(attr.name, attr.value)
  })
  if (textContent) {
    dom.textContent = textContent
  }
  return dom
}

function parseHTML (htmlstr: string) {
  const domparser = new DOMParser()
  const doc = domparser.parseFromString(htmlstr, 'text/html')
  const assetsNodes: (HTMLLinkElement | HTMLStyleElement | HTMLScriptElement)[] = []
  Array(...doc.head.children, ...doc.body.children).forEach(tag => {
    if (tag instanceof HTMLLinkElement && tag.rel === 'stylesheet') {
      assetsNodes.push(createElement('link', [...tag.attributes]))
    } else if (tag instanceof HTMLStyleElement) {
      const type = tag.getAttribute('type')
      if (type && type !== 'text/css') return
      assetsNodes.push(createElement('style', [...tag.attributes], tag.textContent))
    } else if (tag instanceof HTMLScriptElement) {
      const type = tag.getAttribute('type')
      const src = tag.getAttribute('src')
      if ((type && !scriptTypes.includes(type)) || (src && src.endsWith('.hot-update.js'))) return
      const nomodule = tag.getAttribute('nomodule')
      if (supportESM && typeof nomodule === 'string') return
      if (!supportESM && type === 'module') return
      assetsNodes.push(createElement('script', [...tag.attributes], tag.textContent))
    }
  })
  return assetsNodes
}

function resolveUrl (url: string, publicPath: string) {
  if (url.startsWith('http') || url.startsWith('//')) return url
  if (url[0] === '/') return url
  if (url.startsWith('./')) url = url.slice(2)
  if (url.startsWith('..')) {
    throw new Error(`Relative url is not supported: ${url}.`)
  }
  if (url[0] !== '/') {
    url = publicPath + url
  }
  return url
}

export default function injectAssets (name: string, htmlstr: string, publicPath: string) {
  const fragment = document.createDocumentFragment()
  const assets = parseHTML(htmlstr)
  const scriptTasks: any[] = []
  assets.forEach(dom => {
    if (dom instanceof HTMLScriptElement && dom.src) {
      dom.src = resolveUrl(dom.src, publicPath)
      scriptTasks.push(new Promise((resolve, reject) => {
        dom.onload = resolve, dom.onerror = reject
      }))
    }
    if (dom instanceof HTMLLinkElement) {
      dom.href = resolveUrl(dom.href, publicPath)
    }
    dom.dataset.appName = name
    fragment.appendChild(dom)
  })
  document.head.appendChild(fragment)
  return Promise.all(scriptTasks)
}
