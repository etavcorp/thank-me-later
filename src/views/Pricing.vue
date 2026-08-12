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
import { ref } from 'vue'

const menuItems = ref([
  { name: 'Marinade Grilled Lamb Chops', price: '35', desc: 'Marinated overnight and grilled to medium-rare, finished with a light honey-balsamic glaze.' },
  { name: 'Crispy Fried Chicken', price: '22', desc: 'Buttermilk-brined and double-dredged, deep-fried until extra-crisp and juicy.' },
  { name: 'Pan-Seared Salmon', price: '28', desc: 'Skin-on fillet, pan-seared and finished with lemon-butter and fresh herbs.' },
  { name: 'Smothered Turkey Wings', price: '24', desc: 'Braised low-and-slow in a savory gravy until tender and falling from the bone.' },
  { name: 'Baked Mac & Cheese', price: '12', desc: 'Creamy five-cheese sauce baked with a golden, crisp breadcrumb topping.' },
  { name: 'Collard Greens', price: '10', desc: 'Slow-simmered with smoked turkey and aromatics until silky and flavorful.' }
])
</script>