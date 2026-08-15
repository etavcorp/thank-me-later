<template>
  <section class="pt-32 pb-24 max-w-5xl mx-auto px-4 min-h-screen">
    <div class="text-center mb-12" v-fade-scroll>
      <p class="text-xs uppercase tracking-[0.35em] text-brand-400 mb-4">Book an event</p>
      <h1 class="text-4xl md:text-5xl font-serif text-white mb-4">Secure Your Date</h1>
      <p class="max-w-2xl mx-auto text-zinc-400 text-base md:text-lg">
        As a dedicated one-man operation, dates fill up quickly. Share your details below and we’ll follow up with availability, menu ideas, and a custom catering quote.
      </p>
    </div>

    <div class="bg-zinc-900/80 rounded-[28px] border border-zinc-800 shadow-2xl shadow-black/30 overflow-hidden backdrop-blur-sm" v-fade-scroll>
      <div v-if="thankYouOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-4 backdrop-blur-sm">
        <div class="w-full max-w-lg rounded-[30px] border border-brand-500/40 bg-zinc-900/95 p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-3xl">✨</div>
          <p class="text-center text-[10px] uppercase tracking-[0.35em] text-brand-400">Thank You</p>
          <h2 class="mt-4 text-center text-3xl font-serif text-white">Your request has been received</h2>
          <p class="mt-4 text-center text-zinc-300">We’ll be in touch shortly with availability, menu ideas, and a custom quote for your event.</p>
          <div class="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-center">
            <p class="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Reference number</p>
            <p class="mt-2 text-3xl font-semibold tracking-[0.16em] text-brand-300">{{ confirmationReference }}</p>
          </div>
          <button @click="thankYouOpen = false" type="button" class="mt-6 w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600">
            Close
          </button>
        </div>
      </div>

      <div class="grid lg:grid-cols-[0.9fr_1.1fr]">
        <aside class="bg-zinc-950/60 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-zinc-800">
          <p class="text-xs uppercase tracking-[0.3em] text-brand-400 mb-5">Event inquiry</p>
          <h2 class="text-3xl font-serif text-white mb-4">Tell us about your celebration</h2>
          <p class="text-zinc-400 mb-8">
            From corporate lunches to private dinners, I curate custom menus and a seamless guest experience tailored to your event.
          </p>

          <div class="space-y-4">
            <div class="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-400 text-sm">01</span>
              <div>
                <p class="text-sm font-medium text-white">Custom menus</p>
                <p class="text-xs text-zinc-400">Built around your guest list and vibe</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-400 text-sm">02</span>
              <div>
                <p class="text-sm font-medium text-white">Flexible scheduling</p>
                <p class="text-xs text-zinc-400">Available for lunch, dinner, and special events</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-400 text-sm">03</span>
              <div>
                <p class="text-sm font-medium text-white">Fast response</p>
                <p class="text-xs text-zinc-400">Quick availability check and quote follow-up</p>
              </div>
            </div>
          </div>
        </aside>

        <form @submit.prevent="submitBooking" class="p-8 lg:p-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-zinc-300 mb-2">Name</label>
              <input v-model="form.name" type="text" required placeholder="Your full name" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors">
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Number</label>
              <input v-model="form.phone" type="tel" required placeholder="(555) 123-4567" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors">
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input v-model="form.email" type="email" required placeholder="you@example.com" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors">
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Event Type</label>
              <select v-model="form.type" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 focus:border-brand-500 focus:outline-none transition-colors">
                <option>Corporate Lunch</option>
                <option>Wedding</option>
                <option>Private Party</option>
                <option>Birthday</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-2">Guest Count</label>
              <input v-model="form.guests" type="number" min="1" required placeholder="50" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-zinc-300 mb-2">Requested Date</label>
              <input v-model="form.date" type="date" required class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 focus:border-brand-500 focus:outline-none transition-colors">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-zinc-300 mb-2">Menu Interests</label>
              <textarea v-model="form.notes" rows="4" placeholder="Tell us what you’d love to serve, such as lamb chops, mac & cheese, signature cocktails, or a grazing table..." class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors resize-none"></textarea>
            </div>
          </div>

          <button type="submit" class="mt-8 w-full rounded-full bg-brand-500 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-zinc-950">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  phone: '',
  email: '',
  type: 'Corporate Lunch',
  guests: '',
  date: '',
  notes: ''
})

const submitting = ref(false)
const submissionMessage = ref('')
const submissionError = ref('')
const thankYouOpen = ref(false)
const confirmationReference = ref('')

const rawApiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin)).trim()
const API_BASE = rawApiUrl.replace(/\/$/, '').replace(/\/api\/$/, '').replace(/\/api$/, '')

const submitBooking = async () => {
  submissionMessage.value = ''
  submissionError.value = ''

  submitting.value = true

  try {
    const response = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        type: form.type,
        guests: Number(form.guests),
        date: form.date,
        notes: form.notes.trim(),
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || 'Unable to submit your booking request.')
    }

    confirmationReference.value = data.reference_number || data.referenceNumber || 'REQ-0001'
    form.name = ''
    form.phone = ''
    form.email = ''
    form.type = 'Corporate Lunch'
    form.guests = ''
    form.date = ''
    form.notes = ''
    thankYouOpen.value = true
  } catch (error) {
    submissionError.value = error.message || 'Unable to submit your booking request.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>