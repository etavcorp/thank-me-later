<template>
  <section class="pt-32 pb-24 max-w-6xl mx-auto px-4 min-h-screen">
    <div class="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16" v-fade-scroll>
      <div class="flex flex-col justify-center">
        <p class="text-xs uppercase tracking-[0.35em] text-brand-400 mb-4">Contact</p>
        <h1 class="text-4xl md:text-5xl font-serif text-white mb-6">Get in Touch</h1>
        <p class="text-zinc-400 mb-12 text-lg leading-relaxed">
          Have a question about the menu or an upcoming event? Reach out directly and Vince will get back to you soon.
        </p>

        <div class="space-y-5">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <h4 class="text-brand-500 uppercase tracking-[0.25em] text-xs mb-2">Phone</h4>
            <p class="text-xl text-white">(305) 992-9828</p>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <h4 class="text-brand-500 uppercase tracking-[0.25em] text-xs mb-2">Email</h4>
            <p class="text-xl text-white break-all">Thankmelater0410@gmail.com</p>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <h4 class="text-brand-500 uppercase tracking-[0.25em] text-xs mb-2">Chef & Owner</h4>
            <p class="text-xl text-white">Vince Mogul</p>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900/80 rounded-[28px] border border-zinc-800 shadow-2xl shadow-black/30 p-6 md:p-8">
        <form action="https://api.web3forms.com/submit" method="POST" class="space-y-5">
          <input type="hidden" name="access_key" value="58a27465-15a2-454e-aab0-5efb51847d15">
          <input type="checkbox" name="botcheck" class="hidden" style="display: none;">
          <input type="hidden" name="subject" value="New Contact Inquiry">

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
            <input type="text" name="name" required placeholder="Your full name" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors">
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
            <input type="email" name="email" required placeholder="you@example.com" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors">
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-300 mb-2">Message</label>
            <textarea name="message" rows="6" required placeholder="Tell us a little about your event or question..." class="w-full rounded-xl border border-zinc-700 bg-zinc-950 text-white px-4 py-3.5 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-colors resize-none"></textarea>
          </div>

          <button type="submit" class="w-full rounded-full bg-brand-500 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-zinc-950">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </section>
</template>