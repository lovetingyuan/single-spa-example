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
  singleApp.startApp(singleSpaVue({
    Vue,
    appOptions
  }))
} else {
  new Vue(appOptions).$mount('#app')
}
