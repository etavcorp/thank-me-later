export default {
  async fetch(request) {
    return new Response('Hello from thank-me-later worker', { status: 200 })
  }
}
