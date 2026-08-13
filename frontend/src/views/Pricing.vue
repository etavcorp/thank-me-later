<template>
  <section class="pt-32 pb-24 max-w-5xl mx-auto px-4 min-h-screen">
    <div class="text-center mb-16" v-fade-scroll>
      <h1 class="text-5xl font-serif text-white mb-4">A La Carte & Platters</h1>
      <p class="text-zinc-400">Order individual plates or view our catering bases.</p>
    </div>

    <div v-if="loading" class="text-zinc-400 text-center">Loading menu...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16" v-fade-scroll>
      <div v-for="item in menuItems" :key="item.id" class="border-b border-zinc-800 pb-8">
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="text-2xl font-serif text-white">{{ item.title }}</h3>
          <span class="text-brand-500 font-semibold text-lg">{{ item.price }}</span>
        </div>
        <p class="text-zinc-500 font-light mb-4">{{ item.description }}</p>
      </div>
    </div>
    
    <div class="mt-20 rounded-[28px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/30 p-8 md:p-12 text-center" v-fade-scroll>
      <p class="text-xs uppercase tracking-[0.35em] text-brand-400 mb-4">Custom quoting</p>
      <h2 class="text-3xl md:text-4xl font-serif text-white mb-4">Planning a large event?</h2>
      <p class="max-w-2xl mx-auto text-zinc-400 mb-8 leading-relaxed">For weddings, corporate lunches, and large gatherings, we require a customized quote to match your guest count, menu, and event details.</p>
      <router-link to="/booking" class="inline-block rounded-full bg-brand-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-zinc-950">Request Catering Quote</router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE_URLS = {
  development: 'http://localhost:8787',
  uat: import.meta.env.VITE_UAT_API_URL || 'https://thank-me-later-uat.etavcorp.workers.dev',
  production: import.meta.env.VITE_PROD_API_URL || 'https://thank-me-later.etavcorp.workers.dev',
}

const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URLS[import.meta.env.MODE] || API_BASE_URLS.production}/api/menu`

const menuItems = ref([])
const loading = ref(true)

async function loadMenuItems() {
  try {
    loading.value = true
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error('Failed to fetch menu items')
    }

    const data = await response.json()
    menuItems.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load menu items:', error)
    menuItems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMenuItems()
})
</script>