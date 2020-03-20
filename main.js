import * as singleSpa from 'single-spa';
import manifestMap from './manifest'

window.singleApp = {
  loadApp(appName, lifecycles) {
    document.dispatchEvent(new CustomEvent('MODULE_LOADED:' + appName, {
      detail: lifecycles
    }));
  },
};

function loadScript(url, name) {
  const script = document.createElement('script');
  script.src = url + '?singleapp=' + name;
  script.dataset.singleapp = name;
  document.body.appendChild(script);
  return new Promise((resolve, reject) => {
    script.onerror = reject;
    script.onload = resolve;
  });
}

function loadModule(manifest, name) {
  const assets = Object.values(manifest.assets).map(v => v[0]);
  const initialScripts = [];
  Object.values(manifest.entrypoints).forEach(entries => {
    entries.forEach(ep => {
      let url = assets.find(v => v.endsWith(ep));
      if (process.env.NODE_ENV !== 'production' && url && !url.startsWith('http')) {
        url = manifest.devHost + (url[0] !== '/' ? '/' + url : url);
      }
      if (ep.endsWith('.css')) { // if asset is css, just load it directly
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.href = url + '?singleapp=' + name;
        link.dataset.singleapp = name;
        document.head.appendChild(link);
      } else if (ep.endsWith('.js') && !ep.endsWith('.hot-update.js')) {
        if (!url) {
          throw new Error(`script: ${url} is missing at app: ${name}.`)
        } else {
          initialScripts.push(url);
        }
      }
    });
  });

  if (!initialScripts.filter(Boolean).length) {
    throw new Error(`Not found initial module script of ${name}.`);
  }
  const lifecycles = new Promise(resolve => {
    document.addEventListener('MODULE_LOADED:' + name, (evt) => {
      resolve(typeof evt.detail === 'function' ? evt.detail() : evt.detail);
    });
  })
  return initialScripts.reduce(
    (p, url) => p.then(() => loadScript(url, name)),
    Promise.resolve()
  ).then(() => lifecycles);
}

Object.entries(manifestMap).forEach(([name, manifest]) => {
  const path = manifest.route;
  const apps = singleSpa.getAppNames();
  if (!apps.includes(name)) {
    singleSpa.registerApplication(
      name,
      () => loadModule(manifest, name),
      location => typeof path === 'string' ? location.pathname.startsWith(path) : (path === false ? false : true)
    );
  }
});

singleSpa.start();
