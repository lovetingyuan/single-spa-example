import { singleapp, name } from './package.json'

const id = 'navbar-container'

const template = `
<nav style="text-align: center; text-transform: capitalize;">
<a href="/vue-singleapp" onclick="singleSpaNavigate(event)">vue-app</a> | 
<a href="/react-singleapp/" onclick="singleSpaNavigate(event)">react-app</a> |
<a href="/ng-singleapp/" onclick="singleSpaNavigate(event)">angular-app</a>
</nav>
<style>
nav {
  background-color: #efefef;
  padding: 10px 0;
}
</style>
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
  singleApp.startApp(singleapp.name || name, {
    bootstrap, mount, unmount
  })
} else {
  bootstrap()
}
