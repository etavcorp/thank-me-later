<template>
  <section class="pt-32 pb-24 max-w-6xl mx-auto px-4 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-16" v-fade-scroll>
      
      <!-- Contact Info -->
      <div>
        <h1 class="text-5xl font-serif text-white mb-6">Get in Touch</h1>
        <p class="text-zinc-400 mb-12 text-lg">Have a question about the menu or an upcoming event? Reach out to Vince directly.</p>
        
        <div class="space-y-8">
          <div>
            <h4 class="text-brand-500 uppercase tracking-widest text-sm mb-1">Phone</h4>
            <p class="text-xl text-white">(305) 992-9828</p>
          </div>
          <div>
            <h4 class="text-brand-500 uppercase tracking-widest text-sm mb-1">Email</h4>
            <p class="text-xl text-white">Thankmelater0410@gmail.com</p>
          </div>
          <div>
            <h4 class="text-brand-500 uppercase tracking-widest text-sm mb-1">Chef & Owner</h4>
            <p class="text-xl text-white">Vince Mogul</p>
          </div>
        </div>
      </div>

      <!-- Web3Forms Integration -->
      <div class="bg-zinc-900 p-8 border border-zinc-800">
        <!-- Kept exactly as requested with standard action/method to support Web3Forms redirect -->
        <form action="https://api.web3forms.com/submit" method="POST" class="space-y-6">
          
          <!-- REQUIRED WEB3FORMS HIDDEN INPUTS -->
          <input type="hidden" name="access_key" value="58a27465-15a2-454e-aab0-5efb51847d15">
          <input type="checkbox" name="botcheck" class="hidden" style="display: none;">
          <input type="hidden" name="subject" value="New Contact Inquiry from Thank Me Later Catering">

          <div>
            <label class="block text-sm text-zinc-400 mb-2">Full Name</label>
            <input type="text" name="name" required class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500">
          </div>
          
          <div>
            <label class="block text-sm text-zinc-400 mb-2">Email Address</label>
            <input type="email" name="email" required class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500">
          </div>

          <div>
            <label class="block text-sm text-zinc-400 mb-2">Message</label>
            <textarea name="message" rows="5" required class="w-full bg-zinc-950 border border-zinc-700 text-white p-3 focus:outline-none focus:border-brand-500"></textarea>
          </div>

          <button type="submit" class="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold uppercase tracking-widest transition-colors">Send Message</button>
        </form>
      </div>
      
    </div>
  </section>
</template>