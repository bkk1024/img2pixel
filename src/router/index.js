import { createRouter, createWebHashHistory } from 'vue-router'
const views = import.meta.glob('../views/**/*.vue')
const routes = [
  {
    path: '/',
    name: 'main',
    component: views['../views/Main.vue'],
    children: [
      {
        path: '',
        name: 'home',
        component: views['../views/Home.vue'],
        meta: {
          title: '图片像素化'
        }
      },
    ]
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router