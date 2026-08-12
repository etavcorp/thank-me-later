<template>
  <div>
    <!-- Hero Section -->
    <section class="relative h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606625736768-0fa2eebf0991?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
      
      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto" v-fade-scroll>
        <h1 class="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">Elevated Soul Food Experience</h1>
        <p class="text-xl md:text-2xl text-zinc-400 mb-10 font-light">Crafted by Chef Vince Mogul — elevated soul food, rich flavor, and unforgettable hospitality.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/pricing" class="inline-flex items-center justify-center px-8 py-4 rounded-full bg-brand-500 text-white font-semibold uppercase tracking-[0.2em] text-sm transition-all duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-zinc-950 w-full sm:w-[220px]">Menu</router-link>
          <router-link to="/booking" class="inline-flex items-center justify-center px-8 py-4 rounded-full border border-zinc-700 bg-zinc-900/50 text-white font-semibold uppercase tracking-[0.2em] text-sm transition-all duration-200 hover:border-brand-500 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-zinc-950 w-full sm:w-[220px]">Book Catering</router-link>
        </div>
      </div>
    </section>

    <!-- Signature Dishes -->
    <section class="py-24 bg-zinc-950">
      <div class="max-w-7xl mx-auto px-4" v-fade-scroll>
        <h2 class="text-4xl font-serif text-white text-center mb-16">Signature <span class="text-brand-500">Classics</span></h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="dish in featuredDishes" :key="dish.name" class="group cursor-pointer">
            <div class="overflow-hidden relative mb-4">
              <img :src="dish.image" :alt="dish.name" class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <h3 class="text-2xl font-serif text-white">{{ dish.name }}</h3>
            <p class="text-zinc-500 mt-2">{{ dish.desc }}</p>
          </div>
        </div>
      </div>
    </section>

   <!-- Live IG Feed -->
    <section class="py-24 bg-zinc-900 border-y border-zinc-800">
      <div class="max-w-7xl mx-auto px-4 text-center" v-fade-scroll>
        <h2 class="text-3xl font-serif text-white mb-4">Follow The Journey</h2>
        <a href="https://www.instagram.com/thankmelater_catering/" target="_blank" class="text-brand-500 hover:text-brand-400 transition-colors mb-12 inline-block tracking-wide">
          @thankmelater_catering
        </a>
        
        <!-- ACTUAL ELFSIGHT WIDGET DISPLAY -->
        <div class="elfsight-app-b2e69077-77b2-483b-85ab-a54e62b58e69" data-elfsight-app-lazy></div>
        
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const featuredDishes = ref([
  { name: 'Marinade Grilled Lamb Chops', desc: 'Marinated overnight and grilled to medium-rare with a light honey-balsamic finish.', image: 'https://www.tablefortwoblog.com/wp-content/uploads/2021/07/grilled-lamb-chops-recipe-photo-tablefortwoblog-4-scaled.jpg' },
  { name: 'Crispy Fried Chicken', desc: 'Golden, crackling crust with tender, juicy soul flavor inside.', image: 'https://grandbaby-cakes.com/wp-content/uploads/2025/08/buttermilk-fried-chicken-15.jpg' },
  { name: 'Signature Mac & Cheese', desc: 'Baked five-cheese blend with a perfectly crisp top layer.', image: 'https://pinkowlkitchen.com/wp-content/uploads/2025/05/Creamy-southern-baked-Mac-and-cheese-on-spoon.jpg' }
])
</script>