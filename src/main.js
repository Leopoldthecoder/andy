import Vue from 'vue'
import ImgInput from 'vue-img-inputer'
import {
  Button,
  ActionSheet,
  Switch,
  Range,
  List,
  ListItem
} from 'element-mobile'
import App from './App.vue'
import './style/element-mobile-override.css'

Vue.config.productionTip = false
Vue.component('ImgInput', ImgInput)
Vue.use(Button)
Vue.use(ActionSheet)
Vue.use(Switch)
Vue.use(Range)
Vue.use(List)
Vue.use(ListItem)

new Vue({
  render: h => h(App)
}).$mount('#app')
