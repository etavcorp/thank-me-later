<template>
  <div class="bg-zinc-950 text-zinc-300 font-sans antialiased min-h-screen flex flex-col">
    <!-- IDENTICAL GLOBAL NAVIGATION -->
    <nav class="fixed w-full z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-2xl font-serif text-white tracking-wider">
              Thank Me Later<span class="text-brand-500">.</span>
            </router-link>
          </div>
          <div class="hidden md:flex space-x-8">
            <router-link to="/" class="hover:text-brand-500 transition-colors" exact-active-class="text-white font-semibold">Home</router-link>
            <router-link to="/about" class="hover:text-brand-500 transition-colors" exact-active-class="text-white font-semibold">About</router-link>
            <router-link to="/pricing" class="hover:text-brand-500 transition-colors" exact-active-class="text-white font-semibold">Menu & Pricing</router-link>
            <router-link to="/booking" class="hover:text-brand-500 transition-colors" exact-active-class="text-white font-semibold">Book Event</router-link>
            <router-link to="/contact" class="hover:text-brand-500 transition-colors" exact-active-class="text-white font-semibold">Contact</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content Injected Here -->
    <main class="flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
/* Import your Google Fonts here or in index.html */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600&display=swap');
</style>