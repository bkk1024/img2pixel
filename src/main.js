import { createApp } from 'vue'
import router from '@/router/index.js'
import './style.css'
import App from './App.vue'
import { ElUpload, ElIcon, ElDialog, ElRow, ElCol, ElButton, ElCard, ElInputNumber, ElSwitch, ElTable } from 'element-plus'
import 'element-plus/dist/index.css'
import { Plus, ZoomIn, Download, Delete } from '@element-plus/icons-vue'

const app = createApp(App)

const ElComponents = [ElUpload, ElIcon, ElDialog, ElRow, ElCol, ElButton, ElCard, ElInputNumber, ElSwitch, ElTable]
ElComponents.forEach(item => {
  app.use(item)
})

const ElSvgIcon = [Plus, ZoomIn, Download, Delete]
ElSvgIcon.forEach(item => {
  app.component(item.name, item)
})

app.use(router).mount('#app')

// createApp(App).mount('#app')
