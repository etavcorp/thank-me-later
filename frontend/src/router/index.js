import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Pricing from '../views/Pricing.vue'
import Booking from '../views/Booking.vue'
import Contact from '../views/Contact.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/about', name: 'about', component: About },
    { path: '/pricing', name: 'pricing', component: Pricing },
    { path: '/booking', name: 'booking', component: Booking },
    { path: '/contact', name: 'contact', component: Contact }
  ],
  scrollBehavior() {
    return { top: 0 } // Scroll to top on route change
  }
})

export default router