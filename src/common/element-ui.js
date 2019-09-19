import Vue from 'vue'

import {
  Button,
  Container,
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Divider,
  Form,
  FormItem,
  Footer,
  Header,
  Loading,
  Input,
  Image,
  Message,
  MessageBox,
  Main,
  Option,
  Pagination,
  Switch,
  Select,
  Scrollbar
} from 'element-ui'

Vue.use(Button)
Vue.use(Container)
Vue.use(Dialog)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Divider)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Footer)
Vue.use(Header)
Vue.use(Loading)
Vue.use(Input)
Vue.use(Image)
Vue.use(Main)
Vue.use(Option)
Vue.use(Pagination)
Vue.use(Switch)
Vue.use(Select)
Vue.use(Scrollbar)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
