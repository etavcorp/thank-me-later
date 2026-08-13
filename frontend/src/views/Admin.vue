<template>
  <section class="pt-32 pb-24 max-w-6xl mx-auto px-4 min-h-screen">
    <div v-if="!accessGranted" class="max-w-md mx-auto rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30">
      <p class="text-xs uppercase tracking-[0.35em] text-brand-400 mb-4">Admin access</p>
      <h1 class="text-3xl font-serif text-white mb-6">Menu management</h1>
      <label for="admin-pass" class="block text-sm text-zinc-400 mb-2">Enter admin code</label>
      <input
        id="admin-pass"
        v-model="adminPass"
        type="password"
        placeholder="Enter code"
        class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
        @keyup.enter="unlockAdmin"
      />
      <button
        @click="unlockAdmin"
        class="mt-6 w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-600 transition-colors"
      >
        Unlock admin
      </button>
      <p v-if="errorMessage" class="mt-4 text-sm text-red-400">{{ errorMessage }}</p>
    </div>

    <div v-else class="space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-brand-400 mb-3">Admin</p>
          <h1 class="text-4xl font-serif text-white">Manage menu</h1>
        </div>
        <button
          @click="logoutAdmin"
          class="rounded-full border border-zinc-700 px-5 py-2 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-brand-500 hover:text-brand-400 transition-colors"
        >
          Log out
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <div class="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-serif text-white">Current items</h2>
            <span class="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
              {{ menuItems.length }} items
            </span>
          </div>

          <div v-if="loading" class="text-zinc-400">Loading menu...</div>
          <div v-else-if="menuItems.length === 0" class="text-zinc-400">No menu items yet.</div>
          <div v-else class="space-y-4">
            <div
              v-for="item in menuItems"
              :key="item.id"
              class="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-serif text-white">{{ item.title }}</h3>
                    <span class="rounded-full bg-brand-500/15 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">
                      ${{ item.price }}
                    </span>
                  </div>
                  <p class="text-zinc-400">{{ item.description }}</p>
                </div>
                <div class="flex gap-2 mt-2 md:mt-0">
                  <button
                    @click="startEdit(item)"
                    class="rounded-full border border-zinc-700 px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 hover:border-brand-500 hover:text-brand-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="rounded-full border border-red-700/70 px-3 py-2 text-xs uppercase tracking-[0.18em] text-red-300 hover:border-red-500 hover:text-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
          <h2 class="text-2xl font-serif text-white mb-6">
            {{ editingId ? 'Edit menu item' : 'Add new menu item' }}
          </h2>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm text-zinc-400 mb-2">Title</label>
              <input v-model="form.title" type="text" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" placeholder="Menu item title" />
            </div>

            <div>
              <label class="block text-sm text-zinc-400 mb-2">Price</label>
              <input v-model="form.price" type="text" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" placeholder="$22" />
            </div>

            <div>
              <label class="block text-sm text-zinc-400 mb-2">Description</label>
              <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" placeholder="Menu item description"></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="submit"
                class="flex-1 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-600 transition-colors"
              >
                {{ editingId ? 'Save changes' : 'Add item' }}
              </button>
              <button
                v-if="editingId"
                type="button"
                @click="resetForm"
                class="rounded-full border border-zinc-700 px-4 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-brand-500 hover:text-brand-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <p v-if="formMessage" class="mt-4 text-sm text-brand-400">{{ formMessage }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE_URLS = {
  development: 'http://localhost:8787',
  uat: import.meta.env.VITE_UAT_API_URL || 'https://thank-me-later-uat.etavcorp.workers.dev',
  production: import.meta.env.VITE_PROD_API_URL || 'https://thank-me-later.etavcorp.workers.dev',
}

const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URLS[import.meta.env.MODE] || API_BASE_URLS.production}/api/menu`
const ADMIN_CODE = 'thank-me-later-admin'

const menuItems = ref([])
const loading = ref(false)
const accessGranted = ref(false)
const adminPass = ref('')
const errorMessage = ref('')
const formMessage = ref('')
const editingId = ref(null)
const form = ref({ title: '', price: '', description: '' })

function loadMenuItems() {
  loading.value = true

  fetch(API_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load menu items')
      }

      const data = await response.json()
      menuItems.value = Array.isArray(data) ? data : []
    })
    .catch(() => {
      formMessage.value = 'Unable to load menu items right now.'
    })
    .finally(() => {
      loading.value = false
    })
}

function unlockAdmin() {
  if (adminPass.value === ADMIN_CODE) {
    accessGranted.value = true
    localStorage.setItem('menu-admin-access', 'true')
    errorMessage.value = ''
    resetForm()
    loadMenuItems()
    return
  }

  errorMessage.value = 'Invalid admin code.'
}

function logoutAdmin() {
  accessGranted.value = false
  localStorage.removeItem('menu-admin-access')
  adminPass.value = ''
  resetForm()
}

function resetForm() {
  editingId.value = null
  form.value = { title: '', price: '', description: '' }
}

function startEdit(item) {
  editingId.value = item.id
  form.value = {
    title: item.title,
    price: item.price,
    description: item.description,
  }
}

async function submitForm() {
  if (!form.value.title || !form.value.price || !form.value.description) {
    formMessage.value = 'All fields are required.'
    return
  }

  const payload = {
    title: form.value.title.trim(),
    price: form.value.price.trim(),
    description: form.value.description.trim(),
  }

  try {
    const url = editingId.value ? `${API_URL}/${editingId.value}` : API_URL
    const method = editingId.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to save menu item.')
    }

    formMessage.value = editingId.value ? 'Menu item updated.' : 'Menu item added.'
    resetForm()
    loadMenuItems()
  } catch (error) {
    formMessage.value = error.message
  }
}

async function deleteItem(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Unable to delete item.')
    }

    formMessage.value = 'Menu item deleted.'
    loadMenuItems()
  } catch (error) {
    formMessage.value = error.message
  }
}

onMounted(() => {
  if (localStorage.getItem('menu-admin-access') === 'true') {
    accessGranted.value = true
    loadMenuItems()
  }
})
</script>
