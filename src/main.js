import Vue from 'vue'

import ElementUI from 'element-ui'
import './element-variables.scss'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import _ from 'lodash'
import './plugins/register'
import axios from './plugins/axios'

Vue.use(ElementUI)

window._ = _
Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
