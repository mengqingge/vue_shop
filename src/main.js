import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import 'element-ui/lib/theme-chalk/index.css';
// 引入全局样式
import './assets/css/global.css'
// 引入icon图标
import './assets/fonts/iconfont.css'

import treeTable from 'vue-table-with-tree-grid'

import axios from 'axios'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 配饰请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
// 配饰请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config);
  // 必须是Authorization这个单词
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须return
  return config
})
// 将axios挂载到vue 原型上
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', treeTable)

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor, /* { default global options } */)

// 时间过滤器
Vue.filter('dateFarmat', (originVal) => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
