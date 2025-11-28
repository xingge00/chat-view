import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home/index.vue'),
  },
  {
    path: '/preview',
    component: () => import('@/views/Preview/index.vue'),
  },
  {
    path: '/:path(.*)',
    component: () => import('@/views/404.vue'),
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes,
})
export default router
