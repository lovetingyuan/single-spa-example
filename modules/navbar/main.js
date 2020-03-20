if (process.env.NODE_ENV === 'development' && typeof singleApp === 'object') {
  __webpack_public_path__ = process.env.SINGLE_APP_DEV_ORIGIN + '/' // eslint-disable-line
}

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
  navbarContainer = navbarContainer || document.createElement('div')
  navbarContainer.id = id
  navbarContainer.innerHTML = template
  return Promise.resolve()
}

function mount () {
  if (!document.getElementById(id)) {
    document.body.appendChild(navbarContainer)
  }
  return Promise.resolve()
}

function unmount () {
  navbarContainer.remove()
  navbarContainer = null
  return Promise.resolve()
}
if (typeof singleApp === 'object') {
  singleApp.loadApp(process.env.SINGLE_APP_NAME, {
    bootstrap, mount, unmount
  })
} else {
  bootstrap().then(() => {
    return mount()
  })
}
