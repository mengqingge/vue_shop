import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/users/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const Users = () => import(/* webpackChunkName: "users_rights_poles" */ '../components/users/Users.vue')
const Rights = () => import(/* webpackChunkName: "users_rights_poles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "users_rights_poles" */ '../components/power/Roles.vue')


// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
const Cate = () => import(/* webpackChunkName: "goods" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "goods" */ '../components/goods/Params.vue')

// import GoodsList from '../components/goods/GoodsList.vue'
// import Add from '../components/goods/Add.vue'
const GoodsList = () => import(/* webpackChunkName: "goods" */ '../components/goods/GoodsList.vue')
const Add = () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue')


// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Order = () => import(/* webpackChunkName: "goods" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "goods" */ '../components/report/Report.vue')




Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 这样不行，另外一个项目可以
      // { path: '/', redirect: '/home/welcome' },
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      // 在App组件中显示Add组件
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },
    ]
  },
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
  // if (to.path === "/login") {
  //   next()
  // } else {
  //   const tokenStr = window.sessionStorage.getItem('token')
  //   if (!tokenStr) {
  //     next('/login')
  //   } else {
  //     next()
  //   }
  // }
})

export default router
