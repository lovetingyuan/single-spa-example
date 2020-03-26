import Vue, { ComponentOptions } from 'vue'
import App from './App.vue'
import router from './router'
import singleSpaVue from 'single-spa-vue'
import { singleapp, name } from '../package.json'

Vue.config.productionTip = false

const appOptions: ComponentOptions<Vue> = {
  render: (h) => h(App),
  router,
}

if (window.singleApp) {
  appOptions.el = document.getElementById('vue-app-container') as Element
  singleApp.startApp(singleapp.name || name, singleSpaVue({
    Vue,
    appOptions
  }))
} else {
  new Vue(appOptions).$mount('#app')
}
