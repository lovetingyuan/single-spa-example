const apps = {
  'vue-app': '/vue-singleapp',
  'react-app': '/react-singleapp',
}

const id = 'navbar-container'

const template = `
<h2 style="text-align: center"> Single App Example </h2>
<nav style="text-align: center; text-transform: capitalize;">
${Object.keys(apps).map(name => {
  return `<a href="${apps[name]}" onclick="singleSpaNavigate(event)">${name}</a>`
}).join(' | ')}
</nav>
<main>
${Object.keys(apps).map(name => {
  return `<div id="${name}"></div>`
}).join('')}
</main>
`

let navbarContainer = null

function bootstrap () {
  navbarContainer = document.getElementById(id)
  navbarContainer.innerHTML = template
  return Promise.resolve()
}

function mount () {
  return Promise.resolve()
}

function unmount () {
  return Promise.resolve()
}

if (typeof singleApp === 'object') {
  singleApp.loadApp({
    bootstrap, mount, unmount
  })
} else {
  bootstrap().then(() => {
    return mount()
  })
  window.parent.postMessage({
    type: 'singleapp',
    origin: window.location.origin,
    js: [...window.document.querySelectorAll('script[src]')].map((v) => v.src),
    css: [...window.document.querySelectorAll('link[rel="stylesheet"]')].map((v) => v.href).filter(Boolean)
  }, 'http://localhost:1234')
}
