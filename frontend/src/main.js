import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // Make sure Tailwind directives (@tailwind base; etc) are in this file

const app = createApp(App)

// Global custom directive for scroll animations
app.directive('fade-scroll', {
  mounted(el) {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-1000', 'ease-out')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.remove('opacity-0', 'translate-y-8')
          observer.unobserve(el)
        }
      })
    }, { threshold: 0.1 })
    observer.observe(el)
  }
})

app.use(router)
app.mount('#app')