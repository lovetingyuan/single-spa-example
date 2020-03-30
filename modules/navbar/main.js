import { render, html } from 'uhtml';

function mount () {
  render(document.getElementById('navbar-container') || document.body, html`
<nav style="text-align: center; text-transform: capitalize;">
<a href="/vue-singleapp" onclick="singleSpaNavigate(event)">vue-app</a> | 
<a href="/react-singleapp/" onclick="singleSpaNavigate(event)">react-app</a> |
<a href="/angular-singleapp/" onclick="singleSpaNavigate(event)">angular-app</a>
</nav>
<style>
nav {
  background-color: #efefef;
  padding: 10px 0;
}
</style>
`);
  return Promise.resolve()
}

if (typeof singleApp === 'object') {
  singleApp.startApp('navbar', {
    mount
  })
} else {
  mount()
}
