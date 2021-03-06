import { render, html as h } from 'uhtml';

function mount (apps) {
  render(document.getElementById('navbar') || document.body, h`
<nav style="text-align: center; text-transform: capitalize;">
${
  Object.entries(apps).map(([name, { mountPath }]) => {
    if (name === 'navbar') {
      name = 'home'
    }
    if (!mountPath.endsWith('/')) {
      mountPath = mountPath + '/'
    }
    return h`<a href="${mountPath}" onclick="singleSpaNavigate(event)">${name}</a>`
  })
}
</nav>
<style>
nav {
  background-color: #efefef;
  padding: 10px 0;
}
nav a {
  display: inline-block;
  margin: 0 20px;
}
</style>
`);
  return Promise.resolve()
}

if (typeof singleApp === 'object') {
  singleApp.startApp('navbar', {
    mount() {
      return mount(singleApp.singleAppConfig)
    }
  })
}
