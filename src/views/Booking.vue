<template>
  <section class="pt-32 pb-24 max-w-3xl mx-auto px-4 min-h-screen">
    <div class="text-center mb-12" v-fade-scroll>
      <h1 class="text-5xl font-serif text-white mb-4">Secure Your Date</h1>
      <p class="text-zinc-400">As a dedicated one-man operation, dates fill up quickly. Please submit your event details below to check availability and receive a custom catering quote.</p>
    </div>

    <form @submit.prevent="submitBooking" class="bg-zinc-900 p-8 border border-zinc-800" v-fade-scroll>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm text-zinc-400 mb-2">Event Type</label>
          <select v-model="form.type" class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500">
            <option>Corporate Lunch</option>
            <option>Wedding</option>
            <option>Private Party</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-zinc-400 mb-2">Guest Count</label>
          <input type="number" v-model="form.guests" class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500">
        </div>
      </div>
      <div class="mb-6">
        <label class="block text-sm text-zinc-400 mb-2">Requested Date</label>
        <input type="date" v-model="form.date" class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500">
      </div>
      <div class="mb-8">
        <label class="block text-sm text-zinc-400 mb-2">Menu Interests (e.g. Lamb Chops, Mac & Cheese)</label>
        <textarea v-model="form.notes" rows="4" class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500"></textarea>
      </div>
      <button type="submit" class="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold uppercase tracking-widest transition-colors">Submit Request</button>
    </form>
  </section>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  type: 'Corporate Lunch',
  guests: '',
  date: '',
  notes: ''
})

const submitBooking = () => {
  alert(`Booking request initiated for ${form.guests} guests on ${form.date}. Vince will review and contact you shortly!`)
}
</script>