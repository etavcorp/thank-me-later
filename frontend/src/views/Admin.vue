<template>
  <section class="pt-32 pb-24 max-w-6xl mx-auto px-4 min-h-screen">
    <div v-if="!accessGranted" class="max-w-md mx-auto rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30">
      <p class="text-xs uppercase tracking-[0.35em] text-brand-400 mb-4">Admin access</p>
      <h1 class="text-3xl font-serif text-white mb-6">Menu management</h1>

      <div v-if="!setupMode">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="admin-username" class="block text-sm text-zinc-400 mb-2">Username</label>
            <input
              id="admin-username"
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="Enter username"
              class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label for="admin-password" class="block text-sm text-zinc-400 mb-2">Password</label>
            <input
              id="admin-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter password"
              class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <div v-if="requiresTotp">
            <label for="admin-totp" class="block text-sm text-zinc-400 mb-2">Authenticator code</label>
            <input
              id="admin-totp"
              v-model="totpCode"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="123456"
              class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            class="mt-2 w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-600 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="submitting"
          >
            {{ submitting ? 'Signing in...' : requiresTotp ? 'Verify code' : 'Sign in' }}
          </button>
        </form>

        <button
          type="button"
          @click="beginSetupFlow"
          class="mt-4 w-full rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300 hover:border-brand-500 hover:text-brand-400 transition-colors"
        >
          Create first admin
        </button>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-serif text-white">Create first admin</h2>
          <button
            type="button"
            @click="cancelSetupFlow"
            class="text-sm uppercase tracking-[0.2em] text-zinc-400 hover:text-brand-400"
          >
            Back
          </button>
        </div>

        <div>
          <label for="setup-username" class="block text-sm text-zinc-400 mb-2">Username</label>
          <input
            id="setup-username"
            v-model="setupForm.username"
            type="text"
            autocomplete="username"
            placeholder="Enter admin username"
            class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <label for="setup-password" class="block text-sm text-zinc-400 mb-2">Password</label>
          <input
            id="setup-password"
            v-model="setupForm.password"
            type="password"
            autocomplete="new-password"
            placeholder="Create a strong password"
            class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <label for="setup-confirm-password" class="block text-sm text-zinc-400 mb-2">Confirm password</label>
          <input
            id="setup-confirm-password"
            v-model="setupForm.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Repeat password"
            class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <label class="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-300">
          <input v-model="setupForm.totpEnabled" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500" />
          Enable authenticator app
        </label>

        <div v-if="setupForm.totpEnabled && !showSetupTotpQr" class="space-y-3">
          <button
            type="button"
            @click="showSetupTotpQr = true"
            class="w-full rounded-full border border-brand-500/60 bg-brand-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-300 hover:bg-brand-500/20 transition-colors"
          >
            I’m ready to see the QR code
          </button>
        </div>

        <div v-else-if="setupForm.totpEnabled" class="space-y-4">
          <div>
            <label for="setup-totp-secret" class="block text-sm text-zinc-400 mb-2">Authenticator secret</label>
            <div class="flex gap-2">
              <input
                id="setup-totp-secret"
                v-model="setupForm.totpSecret"
                type="text"
                placeholder="JBSWY3DPEHPK3PXP"
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                @click="generateSetupTotpSecret"
                class="shrink-0 rounded-xl border border-zinc-700 px-3 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-brand-500 hover:text-brand-400 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>

          <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <p class="text-sm text-zinc-300">Verify your authenticator is synced correctly by entering both recent codes.</p>

            <div>
              <label for="setup-totp-previous" class="block text-sm text-zinc-400 mb-2">Previous code</label>
              <input
                id="setup-totp-previous"
                v-model="setupForm.totpVerifyPrevious"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="123456"
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label for="setup-totp-current" class="block text-sm text-zinc-400 mb-2">Current code</label>
              <input
                id="setup-totp-current"
                v-model="setupForm.totpVerifyCurrent"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="654321"
                class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div v-if="setupTotpUri" class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div class="mb-3 flex items-center justify-between gap-3">
              <p class="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Scan with your authenticator app</p>
              <button
                type="button"
                @click="showSetupTotpQr = false"
                class="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-brand-400"
              >
                Hide
              </button>
            </div>

            <div class="rounded-xl border border-zinc-700 bg-zinc-950/80 p-3">
              <img
                v-if="setupQrDataUrl"
                :src="setupQrDataUrl"
                alt="Authenticator QR code"
                class="mx-auto block h-52 w-52 object-contain"
              />
              <p v-else class="text-center text-sm text-zinc-400">QR code generation is unavailable right now.</p>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                @click="copySetupSecret"
                class="rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-200 hover:border-brand-500 hover:text-brand-400 transition-colors"
              >
                {{ copiedSecret ? 'Secret copied' : 'Copy secret' }}
              </button>
              <button
                type="button"
                @click="copySetupUri"
                class="rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-200 hover:border-brand-500 hover:text-brand-400 transition-colors"
              >
                {{ copiedUri ? 'Link copied' : 'Copy setup link' }}
              </button>
            </div>

            <p class="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Secret</p>
            <p class="mt-1 break-all text-sm text-zinc-200">{{ setupForm.totpSecret }}</p>

            <a :href="setupTotpUri" target="_blank" rel="noopener noreferrer" class="mt-3 block break-all text-sm text-brand-400 underline decoration-brand-500/60 underline-offset-4">
              {{ setupTotpUri }}
            </a>
          </div>
        </div>

        <button
          type="button"
          @click="submitSetup"
          class="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-brand-600 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="setupSubmitting"
        >
          {{ setupSubmitting ? 'Creating admin...' : 'Create admin' }}
        </button>
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-400">{{ errorMessage }}</p>
      <p v-else-if="setupMessage" class="mt-4 text-sm text-brand-400">{{ setupMessage }}</p>
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
import { ref, onMounted, computed, watch } from 'vue'
import QRCode from 'qrcode'

const rawApiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin)).trim()
const API_BASE = rawApiUrl.replace(/\/$/, '').replace(/\/api\/menu$/, '').replace(/\/api$/, '')
const API_URL = `${API_BASE}/api/menu`

const menuItems = ref([])
const loading = ref(false)
const accessGranted = ref(false)
const username = ref('')
const password = ref('')
const totpCode = ref('')
const requiresTotp = ref(false)
const setupMode = ref(false)
const setupSubmitting = ref(false)
const setupMessage = ref('')
const errorMessage = ref('')
const formMessage = ref('')
const submitting = ref(false)
const editingId = ref(null)
const form = ref({ title: '', price: '', description: '' })
const setupForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  totpEnabled: false,
  totpSecret: '',
  totpVerifyPrevious: '',
  totpVerifyCurrent: '',
})
const showSetupTotpQr = ref(false)
const setupQrDataUrl = ref('')
const copiedSecret = ref(false)
const copiedUri = ref(false)

const setupTotpUri = computed(() => {
  const secret = setupForm.value.totpSecret.trim()
  if (!setupForm.value.totpEnabled || !secret || !showSetupTotpQr.value) {
    return ''
  }

  const label = encodeURIComponent(`Thank Me Later (${setupForm.value.username.trim() || 'Admin'})`)
  const issuer = encodeURIComponent('Thank Me Later')
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
})

watch(
  setupTotpUri,
  async (uri) => {
    if (!uri) {
      setupQrDataUrl.value = ''
      return
    }

    try {
      setupQrDataUrl.value = await QRCode.toDataURL(uri, {
        width: 220,
        margin: 1,
        color: {
          dark: '#f8fafc',
          light: '#0a0f1d',
        },
      })
    } catch (error) {
      console.error('Failed to generate TOTP QR code:', error)
      setupQrDataUrl.value = ''
    }
  },
  { immediate: true },
)

function generateTotpCode(secret, timestampSeconds = Math.floor(Date.now() / 1000)) {
  const normalizedSecret = secret.replace(/\s+/g, '').toUpperCase()
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bytes = []
  let bits = 0
  let bitCount = 0

  for (const char of normalizedSecret) {
    const value = alphabet.indexOf(char)
    if (value < 0) continue
    bits = (bits << 5) | value
    bitCount += 5
    while (bitCount >= 8) {
      bitCount -= 8
      bytes.push((bits >> bitCount) & 0xff)
    }
  }

  const key = new Uint8Array(bytes)
  const counter = BigInt(Math.floor(timestampSeconds / 30))
  const counterBytes = new Uint8Array(8)
  let value = counter

  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = Number(value & 0xFFn)
    value >>= 8n
  }

  return crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
    .then((keyMaterial) => crypto.subtle.sign('HMAC', keyMaterial, counterBytes))
    .then((digest) => {
      const buffer = new Uint8Array(digest)
      const offset = buffer[buffer.length - 1] & 0x0f
      const binary = ((buffer[offset] & 0x7f) << 24)
        | ((buffer[offset + 1] & 0xff) << 16)
        | ((buffer[offset + 2] & 0xff) << 8)
        | (buffer[offset + 3] & 0xff)

      return (binary % 1000000).toString().padStart(6, '0')
    })
}

async function getRecentTotpPair(secret) {
  const now = Math.floor(Date.now() / 1000)
  const current = await generateTotpCode(secret, now)
  const previous = await generateTotpCode(secret, now - 30)
  return [current, previous]
}

function generateTotpSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)

  let secret = ''
  for (let i = 0; i < bytes.length; i += 1) {
    secret += chars[bytes[i] % chars.length]
  }

  return secret
}

function generateSetupTotpSecret() {
  copiedSecret.value = false
  copiedUri.value = false
  setupForm.value.totpSecret = generateTotpSecret()
}

async function copyText(value, type) {
  try {
    await navigator.clipboard.writeText(value)
    if (type === 'secret') {
      copiedSecret.value = true
      copiedUri.value = false
      return
    }

    copiedUri.value = true
    copiedSecret.value = false
  } catch (error) {
    console.error('Failed to copy text:', error)
  }
}

function copySetupSecret() {
  if (!setupForm.value.totpSecret) {
    return
  }

  copyText(setupForm.value.totpSecret, 'secret')
}

function copySetupUri() {
  if (!setupTotpUri.value) {
    return
  }

  copyText(setupTotpUri.value, 'uri')
}

function authHeaders() {
  const token = sessionStorage.getItem('menu-admin-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function loadMenuItems() {
  loading.value = true

  fetch(API_URL, {
    headers: authHeaders(),
  })
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

function beginSetupFlow() {
  setupMode.value = true
  setupMessage.value = ''
  errorMessage.value = ''
  showSetupTotpQr.value = false
  setupForm.value = {
    username: '',
    password: '',
    confirmPassword: '',
    totpEnabled: false,
    totpSecret: generateTotpSecret(),
    totpVerifyPrevious: '',
    totpVerifyCurrent: '',
  }
}

function cancelSetupFlow() {
  setupMode.value = false
  setupMessage.value = ''
  errorMessage.value = ''
  showSetupTotpQr.value = false
  setupForm.value = {
    username: '',
    password: '',
    confirmPassword: '',
    totpEnabled: false,
    totpSecret: '',
    totpVerifyPrevious: '',
    totpVerifyCurrent: '',
  }
}

async function submitSetup() {
  if (!setupForm.value.username.trim() || !setupForm.value.password || !setupForm.value.confirmPassword) {
    errorMessage.value = 'Username and password are required.'
    return
  }

  if (setupForm.value.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }

  if (setupForm.value.password !== setupForm.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (setupForm.value.totpEnabled && !setupForm.value.totpSecret.trim()) {
    errorMessage.value = 'A TOTP secret is required when enabling TOTP.'
    return
  }

  if (setupForm.value.totpEnabled) {
    const secret = setupForm.value.totpSecret.trim()
    const previous = setupForm.value.totpVerifyPrevious.trim()
    const current = setupForm.value.totpVerifyCurrent.trim()

    if (!secret || !previous || !current) {
      errorMessage.value = 'Enter both the previous and current authenticator codes to confirm sync.'
      return
    }

    const [expectedCurrent, expectedPrevious] = await getRecentTotpPair(secret)

    if (previous !== expectedPrevious || current !== expectedCurrent) {
      errorMessage.value = 'The authenticator codes do not match the secret. Please check the app and try again.'
      return
    }
  }

  setupSubmitting.value = true
  errorMessage.value = ''
  setupMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/auth/setup-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: setupForm.value.username.trim(),
        password: setupForm.value.password,
        role: 'admin',
        totpEnabled: setupForm.value.totpEnabled,
        ...(setupForm.value.totpEnabled ? { totpSecret: setupForm.value.totpSecret.trim() } : {}),
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Unable to create the first admin.')
    }

    setupMessage.value = 'Admin account created. Signing you in...'
    username.value = setupForm.value.username.trim()
    password.value = setupForm.value.password
    showSetupTotpQr.value = false
    setupForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
      totpEnabled: false,
      totpSecret: '',
      totpVerifyPrevious: '',
      totpVerifyCurrent: '',
    }
    setupMode.value = false
    await handleLogin()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to create the first admin.'
  } finally {
    setupSubmitting.value = false
  }
}

async function handleLogin() {
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Username and password are required.'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  setupMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value,
        ...(requiresTotp.value ? { totpCode: totpCode.value.trim() } : {}),
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok && !data.requiresTotp) {
      throw new Error(data.error || 'Unable to sign in.')
    }

    if (data.requiresTotp) {
      requiresTotp.value = true
      errorMessage.value = data.message || 'Authenticator code required.'
      return
    }

    if (!data.token) {
      throw new Error('Login response missing token.')
    }

    sessionStorage.setItem('menu-admin-token', data.token)
    accessGranted.value = true
    requiresTotp.value = false
    totpCode.value = ''
    password.value = ''
    resetForm()
    loadMenuItems()
  } catch (error) {
    requiresTotp.value = false
    errorMessage.value = error.message || 'Unable to sign in.'
  } finally {
    submitting.value = false
  }
}

function logoutAdmin() {
  accessGranted.value = false
  requiresTotp.value = false
  username.value = ''
  password.value = ''
  totpCode.value = ''
  sessionStorage.removeItem('menu-admin-token')
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
      headers: authHeaders(),
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
      headers: authHeaders(),
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

onMounted(async () => {
  const token = sessionStorage.getItem('menu-admin-token')
  if (!token) {
    return
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Session expired')
    }

    accessGranted.value = true
    loadMenuItems()
  } catch {
    sessionStorage.removeItem('menu-admin-token')
    accessGranted.value = false
  }
})
</script>
