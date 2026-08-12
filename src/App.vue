<template>
  <div class="bg-zinc-950 text-zinc-300 font-sans antialiased min-h-screen flex flex-col">
    <!-- IDENTICAL GLOBAL NAVIGATION -->
    <nav class="fixed w-full z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
          <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center z-50 md:static md:transform-none md:left-0 md:top-0 md:translate-x-0 md:translate-y-0">
            <router-link to="/" class="brand-link" aria-label="Catering home">
              <img src="/tmlclogo.png" alt="Catering" class="brand-image" />
            </router-link>
          </div>
          <!-- Hamburger pinned to the far right on mobile -->
          <div class="absolute right-4 top-1/2 transform -translate-y-1/2 md:hidden z-50">
            <button ref="menuButton" @click="toggle" :aria-expanded="mobileOpen" aria-label="Toggle menu" class="p-2 rounded-md hover:bg-zinc-800/60 focus:outline-none">
              <svg v-if="!mobileOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
                  <div class="hidden md:flex space-x-8">
                      <router-link to="/" class="hover:text-brand-500 transition-colors" exact-active-class="font-semibold gold-glow">Home</router-link>
                      <router-link to="/about" class="hover:text-brand-500 transition-colors" exact-active-class="font-semibold gold-glow">About</router-link>
                      <router-link to="/pricing" class="hover:text-brand-500 transition-colors" exact-active-class="font-semibold gold-glow">Menu</router-link>
                      <router-link to="/booking" class="hover:text-brand-500 transition-colors" exact-active-class="font-semibold gold-glow">Book Event</router-link>
                      <router-link to="/contact" class="hover:text-brand-500 transition-colors" exact-active-class="font-semibold gold-glow">Contact</router-link>
                  </div>
        </div>
      </div>
    </nav>

            <!-- Mobile slide-over (backdrop + right panel) - polished UI -->
            <transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150">
              <div v-show="mobileOpen" @click="mobileOpen = false" class="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[9980]"></div>
            </transition>

            <aside role="dialog" aria-modal="true" aria-label="Mobile menu" :aria-hidden="!mobileOpen" class="md:hidden fixed top-0 right-0 h-full w-72 bg-zinc-950/95 border-l border-zinc-800 z-[9999] shadow-2xl rounded-l-2xl ring-1 ring-white/5 transition-transform duration-300 ease-out transform" :class="mobileOpen ? 'translate-x-0' : 'translate-x-full'">
                <header class="flex items-center justify-between px-4 pt-6 pb-3">
                  <div class="w-full relative">
                    <router-link @click="mobileOpen = false" to="/" class="absolute left-1/2 top-3 transform -translate-x-1/2">
                      <img src="/tmlclogo.png" alt="logo" class="h-10 w-auto filter brightness-0 invert" />
                    </router-link>
                    <button @click="toggle" aria-label="Close menu" class="absolute right-4 top-3 p-2 rounded-md hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                      <svg class="h-6 w-6 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </header>

                <nav class="mt-10 px-4 space-y-1">
                  <router-link ref="firstLink" tabindex="0" @click="mobileOpen = false" to="/" class="block py-3 px-3 rounded-lg text-lg font-medium text-zinc-100 hover:bg-white/5 transform hover:translate-x-2 transition" exact-active-class="gold-glow">Home</router-link>
                  <router-link @click="mobileOpen = false" to="/about" class="block py-3 px-3 rounded-lg text-lg font-medium text-zinc-100 hover:bg-white/5 transform hover:translate-x-2 transition" exact-active-class="gold-glow">About</router-link>
                  <router-link @click="mobileOpen = false" to="/pricing" class="block py-3 px-3 rounded-lg text-lg font-medium text-zinc-100 hover:bg-white/5 transform hover:translate-x-2 transition" exact-active-class="gold-glow">Menu</router-link>
                  <router-link @click="mobileOpen = false" to="/booking" class="block py-3 px-3 rounded-lg text-lg font-medium text-zinc-100 hover:bg-white/5 transform hover:translate-x-2 transition" exact-active-class="gold-glow">Book Event</router-link>
                  <router-link @click="mobileOpen = false" to="/contact" class="block py-3 px-3 rounded-lg text-lg font-medium text-zinc-100 hover:bg-white/5 transform hover:translate-x-2 transition" exact-active-class="gold-glow">Contact</router-link>
                </nav>

                <div class="mt-6 px-4 pt-4 border-t border-zinc-800">
                  <p class="text-sm text-zinc-400">Need help? <a href="/contact" @click="mobileOpen = false" class="text-brand-400 hover:underline">Contact us</a></p>
                </div>
              </aside>

    <!-- Page Content Injected Here -->
    <main class="flex-grow">
      <router-view></router-view>
    </main>
    </div>

</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  setup() {
    const mobileOpen = ref(false)
    const firstLink = ref(null)
    const menuButton = ref(null)

    function toggle() { mobileOpen.value = !mobileOpen.value }

    function onKey(e) {
      if (e.key === 'Escape' && mobileOpen.value) {
        mobileOpen.value = false
      }
    }

    watch(mobileOpen, async (open) => {
      if (open) {
        document.body.style.overflow = 'hidden'
        await nextTick()
        const el = firstLink.value?.$el ?? firstLink.value
        if (el && typeof el.focus === 'function') el.focus()
      } else {
        document.body.style.overflow = ''
        await nextTick()
        if (menuButton.value && typeof menuButton.value.focus === 'function') menuButton.value.focus()
      }
    })

    onMounted(() => window.addEventListener('keydown', onKey))
    onUnmounted(() => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    })

    return { mobileOpen, toggle, firstLink, menuButton }
  }
}
</script>

<style>
/* Import your Google Fonts here or in index.html */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600&display=swap');

.brand-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.brand-image {
  display: block;
  height: 48px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

@media (min-width: 768px) {
  .brand-image { height: 64px; }
}

/* subtle gold text glow for active nav items */
.gold-glow {
  text-shadow: 0 0 14px rgba(245,158,11,0.16), 0 0 6px rgba(245,158,11,0.08);
}

/* ensure router-link active classes also show the gold glow (covers mobile menu) */
nav a.router-link-exact-active,
nav a.router-link-active,
aside a.router-link-exact-active,
aside a.router-link-active {
  color: rgb(245 158 11) !important; /* amber-400 */
  text-shadow: 0 0 14px rgba(245,158,11,0.22), 0 0 6px rgba(245,158,11,0.12);
}
</style>