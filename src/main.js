import { createApp } from 'vue'
import { ElButton } from 'element-plus/es/components/button/index.mjs'
import { ElDialog } from 'element-plus/es/components/dialog/index.mjs'
import { ElDrawer } from 'element-plus/es/components/drawer/index.mjs'
import { ElForm, ElFormItem } from 'element-plus/es/components/form/index.mjs'
import { ElInput } from 'element-plus/es/components/input/index.mjs'
import { ElOption, ElSelect } from 'element-plus/es/components/select/index.mjs'
import { ElPopconfirm } from 'element-plus/es/components/popconfirm/index.mjs'
import { ElProgress } from 'element-plus/es/components/progress/index.mjs'
import { ElRadioButton, ElRadioGroup } from 'element-plus/es/components/radio/index.mjs'
import 'element-plus/dist/index.css'
import './styles.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app
  .use(router)
  .component('ElButton', ElButton)
  .component('ElDialog', ElDialog)
  .component('ElDrawer', ElDrawer)
  .component('ElForm', ElForm)
  .component('ElFormItem', ElFormItem)
  .component('ElInput', ElInput)
  .component('ElOption', ElOption)
  .component('ElSelect', ElSelect)
  .component('ElPopconfirm', ElPopconfirm)
  .component('ElProgress', ElProgress)
  .component('ElRadioButton', ElRadioButton)
  .component('ElRadioGroup', ElRadioGroup)
  .mount('#app')
