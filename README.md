# Thank Me Later

Thank Me Later is a small Vue 3 + Vite website for showcasing services and allowing visitors to view pricing, make bookings, and contact the site owner.

Key features

- Simple multi-page site using Vue Router: Home, About, Booking, Contact, Pricing
- Styled with Tailwind CSS and custom PostCSS configuration
- Built with Vite for fast local dev and optimized production builds

Tech stack

- Vue 3
- Vite
- Vue Router
- Tailwind CSS
- PostCSS

Important files & components

- src/App.vue — Root application component
- src/main.js — App entry: mounts Vue, registers router, imports styles
- src/input.css, src/style.css — Tailwind base + custom styles
- src/components/HelloWorld.vue — Example component used in the app
- src/router/index.js — Router configuration and route definitions
- src/views/Home.vue — Landing page view
- src/views/About.vue — About page view
- src/views/Booking.vue — Booking page view
- src/views/Contact.vue — Contact page view
- src/views/Pricing.vue — Pricing page view

Getting started

1. Install dependencies:

```
npm install
```

2. Run the dev server:

```
npm run dev
```

3. Build for production:

```
npm run build
```

Deployment notes

- Production domain: `https://thankmelatercatering.com`
- UAT domain: `https://uat.thankmelatercatering.com`
- Production worker: `thank-me-later-worker-prd`
- UAT worker: `thank-me-later-worker-uat`
- Local dev worker: `thank-me-later-db-local` (D1 only)

For PRD/UAT bootstrap credentials, set these in Cloudflare as secrets before deploy:

```bash
wrangler secret put BOOTSTRAP_USERNAME --env prd
wrangler secret put BOOTSTRAP_PASSWORD --env prd
wrangler secret put BOOTSTRAP_USERNAME --env uat
wrangler secret put BOOTSTRAP_PASSWORD --env uat
```

Run these from the worker directory:

```bash
npm run deploy:uat
npm run deploy:prd
```

The main branch should deploy to the PRD worker and the UAT branch should deploy to the UAT worker. Do not leave duplicate worker names active in Cloudflare.

If you want me to expand any section (detailed file descriptions, component props, or add usage examples), tell me which part to expand.

#Test main comit