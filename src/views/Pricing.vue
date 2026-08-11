<template>
  <section class="pt-32 pb-24 max-w-5xl mx-auto px-4 min-h-screen">
    <div class="text-center mb-16" v-fade-scroll>
      <h1 class="text-5xl font-serif text-white mb-4">A La Carte & Platters</h1>
      <p class="text-zinc-400">Order individual plates or view our catering bases.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16" v-fade-scroll>
      <div v-for="item in menuItems" :key="item.name" class="border-b border-zinc-800 pb-8">
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="text-2xl font-serif text-white">{{ item.name }}</h3>
          <span class="text-brand-500 font-semibold text-lg">${{ item.price }}</span>
        </div>
        <p class="text-zinc-500 font-light mb-4">{{ item.desc }}</p>
        <button class="text-sm uppercase tracking-wider text-white border border-zinc-700 px-4 py-2 hover:bg-brand-500 hover:border-brand-500 transition-colors">Add to Order</button>
      </div>
    </div>
    
    <div class="mt-20 text-center bg-zinc-900 p-12 border border-zinc-800" v-fade-scroll>
      <h2 class="text-3xl font-serif text-white mb-4">Planning a large event?</h2>
      <p class="text-zinc-400 mb-8">For weddings, corporate lunches, and large gatherings, we require customized quoting.</p>
      <router-link to="/booking" class="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-sm transition-all uppercase tracking-widest text-sm">Request Catering Quote</router-link>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const menuItems = ref([
  { name: 'Honey Glazed Lamb Chops', price: '35', desc: 'Four tender chops with signature glaze.' },
  { name: 'Crispy Fried Chicken', price: '22', desc: 'Half-chicken portion, seasoned to perfection.' },
  { name: 'Pan-Seared Salmon', price: '28', desc: 'Fresh catch with a butter-herb drizzle.' },
  { name: 'Smothered Turkey Wings', price: '24', desc: 'Slow-cooked until fall-off-the-bone tender.' },
  { name: 'Baked Mac & Cheese', price: '12', desc: 'Five-cheese blend baked golden brown.' },
  { name: 'Collard Greens', price: '10', desc: 'Slow-simmered with smoked turkey.' }
])
</script>