import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ListView from '@/views/ListView.vue'
import GroupView from '@/views/GroupView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/list/:id',
      name: "list",
      component: ListView
    },
    {
      path: '/group/:id',
      name: "group",
      component: GroupView
    },
  ]
})

export default router
