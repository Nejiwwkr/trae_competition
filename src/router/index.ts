import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/char/:char',
      name: 'char',
      component: () => import('@/views/CharView.vue'),
      props: true,
    },
    { path: '/batch', name: 'batch', component: () => import('@/views/BatchView.vue') },
    { path: '/family', name: 'family', component: () => import('@/views/FamilyView.vue') },
    { path: '/puzzle', name: 'puzzle', component: () => import('@/views/PuzzleView.vue') },
    { path: '/validate', name: 'validate', component: () => import('@/views/ValidateView.vue') },
    { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 96, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
