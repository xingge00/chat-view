import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn.mjs'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'

import 'element-plus/dist/index.css'
import '@/scss/global.scss'

const app = createApp(App)
const pinia = createPinia()

app
  .use(router)
  .use(pinia)
  .use(ElementPlus, { locale })
  .mount('#app')
