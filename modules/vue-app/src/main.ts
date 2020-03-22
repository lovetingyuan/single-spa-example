import Vue, { ComponentOptions } from 'vue'
import App from './App.vue'
import router from './router'
import singleSpaVue from 'single-spa-vue'

Vue.config.productionTip = false

const appOptions: ComponentOptions<Vue> = {
  render: (h) => h(App),
  router,
}

if (typeof singleApp === 'object') {
  appOptions.el = document.getElementById('vue-app-container') as Element
  singleApp.loadApp(singleSpaVue({
    Vue,
    appOptions
  }))
} else {
  new Vue(appOptions).$mount('#app')
  if (location.search.startsWith('?singleapp=')) {
    window.parent.postMessage({
      type: 'singleapp',
      origin: location.origin,
      js: [...document.scripts].map(v => v.src).filter(Boolean),
      css: [...document.querySelectorAll('link[rel="stylesheet"]')].map((v: any) => v.href).filter(Boolean)
    }, 'http://localhost:1234')
  }
}
