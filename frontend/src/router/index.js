import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Pricing from '../views/Pricing.vue'
import Booking from '../views/Booking.vue'
import Contact from '../views/Contact.vue'
import Admin from '../views/Admin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/about', name: 'about', component: About },
    { path: '/menu', name: 'menu', component: Pricing },
    { path: '/pricing', name: 'pricing-legacy', component: Pricing },
    { path: '/booking', name: 'booking', component: Booking },
    { path: '/contact', name: 'contact', component: Contact },
    { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true } }
  ],
  scrollBehavior() {
    return { top: 0 } // Scroll to top on route change
  }
})

router.beforeEach((to, _from, next) => {
  const token = sessionStorage.getItem('menu-admin-token')
  const needsAuth = to.matched.some((record) => record.meta?.requiresAuth)

  if (needsAuth && !token) {
    if (to.name === 'admin') {
      return next()
    }

    const returnUrl = to.fullPath || '/admin'
    sessionStorage.setItem('auth-return-url', returnUrl)
    return next({ name: 'admin', query: { returnUrl } })
  }

  next()
})

export default router