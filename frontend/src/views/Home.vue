<template>
  <div class="home-page">
    <section class="hero-panel">
      <div class="hero-backdrop" aria-hidden="true"></div>
      <div class="hero-glow hero-glow-left" aria-hidden="true"></div>
      <div class="hero-glow hero-glow-right" aria-hidden="true"></div>

      <div class="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" v-fade-scroll>
        <div class="hero-copy">
          <span class="eyebrow">Chef Vince Mogul • Catering & events</span>
          <h1>Elevated soul food for memorable gatherings.</h1>
          <p>
            From intimate gatherings to grand celebrations, we bring rich flavor,
            polished presentation, and heartfelt hospitality to every table.
          </p>

          <div class="cta-row">
            <router-link to="/menu" class="primary-btn">View menu</router-link>
            <router-link to="/booking" class="secondary-btn">Book catering</router-link>
          </div>

          <div class="hero-meta">
            <div>
              <strong>120+</strong>
              <span>events hosted</span>
            </div>
            <div>
              <strong>5-star</strong>
              <span>guest experience</span>
            </div>
            <div>
              <strong>Custom</strong>
              <span>menu styling</span>
            </div>
          </div>
        </div>

        <div class="hero-card" aria-label="Featured catering highlight">
          <div class="card-badge">Chef’s favorite</div>
          <h2>Signature Feast</h2>
          <ul>
            <li>Marinated grilled lamb chops</li>
            <li>Crispy fried chicken</li>
            <li>Five-cheese baked mac & cheese</li>
          </ul>
          <div class="card-footer">
            <span>Curated for intimate, elevated dining</span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-zinc-950">
      <div class="max-w-7xl mx-auto px-4" v-fade-scroll>
        <h2 class="text-4xl font-serif text-white text-center mb-16">Signature <span class="text-brand-500">Classics</span></h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="dish in featuredDishes" :key="dish.name" class="group cursor-pointer dish-card">
            <div class="overflow-hidden relative mb-4 rounded-[28px]">
              <img :src="dish.image" :alt="dish.name" class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700">
              <div class="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <h3 class="text-2xl font-serif text-white">{{ dish.name }}</h3>
            <p class="text-zinc-500 mt-2">{{ dish.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="instagram-section" v-fade-scroll>
      <div class="max-w-7xl mx-auto px-4">
        <div class="instagram-header">
          <div>
            <span class="instagram-badge">Instagram</span>
            <h2>Follow The Journey</h2>
          </div>

          <a
            href="https://www.instagram.com/thankmelater_catering/"
            target="_blank"
            rel="noreferrer"
            class="instagram-link"
          >
            @thankmelater_catering
          </a>
        </div>

        <div class="instagram-shell">
          <div class="elfsight-app-b2e69077-77b2-483b-85ab-a54e62b58e69" data-elfsight-app-lazy></div>
        </div>
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

<style scoped>
.home-page {
  background: #09090b;
}

.hero-panel {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    linear-gradient(120deg, rgba(9, 9, 11, 0.84) 0%, rgba(9, 9, 11, 0.7) 34%, rgba(9, 9, 11, 0.2) 100%),
    url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=80') center/cover no-repeat;
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(245, 158, 11, 0.2), transparent 28%),
    radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.14), transparent 25%);
}

.hero-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  opacity: 0.6;
  pointer-events: none;
}

.hero-glow-left {
  width: 320px;
  height: 320px;
  left: 8%;
  top: 18%;
  background: rgba(245, 158, 11, 0.2);
}

.hero-glow-right {
  width: 420px;
  height: 420px;
  right: 10%;
  bottom: 12%;
  background: rgba(251, 191, 36, 0.12);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  align-items: center;
  gap: 2rem;
  padding-top: 7rem;
  padding-bottom: 4rem;
}

.hero-copy {
  max-width: 720px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 0.52rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9999px;
  background: rgba(24, 24, 27, 0.45);
  backdrop-filter: blur(10px);
  color: #fbbf24;
  font-size: 0.72rem;
  letter-spacing: 0.17em;
  text-transform: uppercase;
  font-weight: 600;
}

.hero-copy h1 {
  margin: 1.2rem 0 1rem;
  font-family: 'Playfair Display', serif;
  font-size: clamp(3.3rem, 5vw, 6rem);
  line-height: 0.94;
  letter-spacing: -0.06em;
  color: #fff;
  max-width: 660px;
}

.hero-copy p {
  margin: 0;
  max-width: 620px;
  color: rgba(244, 244, 245, 0.76);
  font-size: clamp(1.08rem, 1.8vw, 1.5rem);
  line-height: 1.7;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 210px;
  padding: 1rem 1.6rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.74rem;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.primary-btn {
  color: #101010;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 18px 40px rgba(245, 158, 11, 0.32);
}

.secondary-btn {
  color: #fff;
  background: rgba(17, 17, 20, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-2px);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 2.4rem;
}

.hero-meta div {
  min-width: 120px;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.hero-meta strong {
  display: block;
  color: white;
  font-size: 1.15rem;
  font-weight: 700;
}

.hero-meta span {
  display: block;
  color: rgba(244, 244, 245, 0.65);
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 0.4rem;
}

.hero-card {
  justify-self: end;
  width: min(100%, 420px);
  padding: 1.5rem 1.5rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 30px;
  background: rgba(24, 24, 27, 0.52);
  backdrop-filter: blur(18px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.26);
}

.card-badge {
  display: inline-block;
  padding: 0.45rem 0.8rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-radius: 9999px;
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.hero-card h2 {
  margin: 1rem 0 1.1rem;
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3vw, 3rem);
  color: white;
}

.hero-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.9rem;
}

.hero-card li {
  position: relative;
  padding-left: 1.4rem;
  color: rgba(244, 244, 245, 0.82);
  font-size: 1rem;
  line-height: 1.6;
}

.hero-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.65rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.7);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(244, 244, 245, 0.7);
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.7);
}

.dish-card {
  border-radius: 28px;
  padding: 0.75rem;
  background: rgba(17, 17, 17, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.instagram-section {
  position: relative;
  padding: 6rem 0 7rem;
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(24, 24, 27, 0.95) 0%, rgba(9, 9, 11, 1) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.instagram-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.instagram-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: 9999px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.instagram-header h2 {
  margin: 1rem 0 0;
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.3rem, 3vw, 3.2rem);
  color: white;
}

.instagram-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.3rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(17, 17, 20, 0.55);
  color: #fbbf24;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: lowercase;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.instagram-link:hover {
  transform: translateY(-2px);
  border-color: rgba(251, 191, 36, 0.35);
  box-shadow: 0 14px 30px rgba(251, 191, 36, 0.12);
}

.instagram-shell {
  position: relative;
  padding: 1rem;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 17, 20, 0.72);
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.26);
  overflow: hidden;
}

.instagram-shell::before {
  content: '';
  position: absolute;
  inset: -25% auto auto -12%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.11);
  filter: blur(20px);
  pointer-events: none;
}

.elfsight-app-b2e69077-77b2-483b-85ab-a54e62b58e69 {
  position: relative;
  z-index: 1;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(9, 9, 11, 0.4);
}

@media (max-width: 900px) {
  .hero-content {
    grid-template-columns: 1fr;
    padding-top: 7.5rem;
  }

  .instagram-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-card {
    justify-self: stretch;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-panel {
    min-height: 92vh;
  }

  .hero-copy {
    max-width: 100%;
  }

  .eyebrow {
    letter-spacing: 0.12em;
    font-size: 0.62rem;
  }

  .hero-copy h1 {
    font-size: clamp(2.5rem, 12vw, 4rem);
    line-height: 1.04;
    letter-spacing: -0.05em;
    text-shadow: 0 2px 28px rgba(0, 0, 0, 0.38);
  }

  .hero-copy p {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.82);
  }

  .hero-meta {
    gap: 0.8rem;
  }

  .hero-meta div {
    min-width: 100px;
  }

  .hero-meta strong {
    font-size: 1rem;
  }

  .hero-card {
    padding: 1.15rem 1.1rem 0.95rem;
    border-radius: 22px;
  }

  .hero-card h2 {
    font-size: 2rem;
  }

  .cta-row {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>