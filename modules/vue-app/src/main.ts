import Vue, { ComponentOptions } from 'vue'
import App from './App.vue'
import router from './router'
import singleSpaVue from 'single-spa-vue'

Vue.config.productionTip = false

if (window.singleApp) {
  singleApp.startApp('vue-app', ({
    mountPath
  }: { mountPath: string }) => {
    return singleSpaVue({
      Vue,
      appOptions: {
        render: h => h(App),
        el: document.getElementById('vue-app-container') as Element,
        router: router(mountPath)
      } as ComponentOptions<Vue>
    })
  })
} else {
  new Vue({
    render: (h) => h(App),
    router: router(process.env.BASE_URL),
  }).$mount('#app')
}
