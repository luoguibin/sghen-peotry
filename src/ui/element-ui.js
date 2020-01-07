import Vue from 'vue'

import {
  Button,
  Card,
  Carousel,
  CarouselItem,
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
  Scrollbar,
  Table,
  TableColumn,
  Timeline,
  TimelineItem
} from 'element-ui'

Vue.use(Button)
Vue.use(Card)
Vue.use(Carousel)
Vue.use(CarouselItem)
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
Vue.use(Input)
Vue.use(Image)
Vue.use(Loading)
Vue.use(Main)
Vue.use(Option)
Vue.use(Pagination)
Vue.use(Switch)
Vue.use(Select)
Vue.use(Scrollbar)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Timeline)
Vue.use(TimelineItem)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
