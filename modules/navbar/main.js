const apps = {
  'vue-app': '/vue-singleapp',
  'react-app': '/react-singleapp',
}

const id = 'navbar-container'

const template = `
<nav style="text-align: center; text-transform: capitalize;">
<a href="/vue-singleapp" onclick="singleSpaNavigate(event)">vue-app</a> | 
<a href="/react-singleapp/" onclick="singleSpaNavigate(event)">react-app</a>
</nav>
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
  singleApp.startApp({
    bootstrap, mount, unmount
  })
} else {
  bootstrap()
}
