import Vue from 'vue'
import App from './App.vue'
import router from './router'
import singleSpaVue from 'single-spa-vue';
import { CreateElement } from 'vue/types/umd';

Vue.config.productionTip = false

declare global {
  interface Window {
    singleApp: any
  }
}

if (window.singleApp) {
  const appName = process.env.VUE_APP_SINGLE_APP_NAME
  window.singleApp.startApp(appName, singleSpaVue({
    Vue,
    appOptions: {
      render(h: CreateElement) {
        return h(App);
      },
      router,
      el: '#' + appName
    },
  }))
} else {
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
}
