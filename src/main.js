import Vue from 'vue'
import PortalVue from 'portal-vue'
import VueDialog from 'vuejs-dialog'
import vSelect from 'vue-select'
import SaveConfirmationDialog from '@/components/SaveConfirmationDialog.vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'vue-select/dist/vue-select.css'
import '@/assets/dialog.scss'

Vue.config.productionTip = false
Vue.use(PortalVue)
Vue.use(VueDialog, { cancelText: 'Cancel' })
Vue.component('v-select', vSelect)
Vue.dialog.registerComponent('save', SaveConfirmationDialog)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
