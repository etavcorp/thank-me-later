<template>
  <section
    :class="accessGranted ? 'min-h-screen bg-zinc-950 px-4 pb-16 pt-4 text-zinc-200 md:px-6 md:pt-6 lg:px-8' : 'min-h-screen bg-zinc-950 px-4 pb-16 pt-28 text-zinc-200 md:px-6 lg:px-8'"
  >
    <div
      v-if="toastMessage"
      class="fixed bottom-5 right-5 z-[130] rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 shadow-lg shadow-black/20"
    >
      {{ toastMessage }}
    </div>

    <div v-if="accountCreatedConfirmation" class="mx-auto max-w-lg rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/30">
      <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-3xl">✅</div>
      <p class="mb-4 text-xs uppercase tracking-[0.35em] text-brand-400">Account ready</p>
      <h1 class="mb-4 text-3xl font-serif text-white">Your account has been created</h1>
      <p class="mb-6 text-zinc-300">Sign in with the exact username and password you just created to continue.</p>

      <div class="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-left text-sm text-zinc-300">
        <p class="mb-2"><span class="text-zinc-400">Username:</span> <strong class="text-white">{{ createdAccount.username }}</strong></p>
        <p><span class="text-zinc-400">Default access:</span> <strong class="text-white">{{ createdAccount.role || 'viewer' }}</strong></p>
      </div>

      <button
        type="button"
        @click="returnToLogin()"
        class="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600"
      >
        Continue to login
      </button>
    </div>

    <div v-else-if="!accessGranted" class="mx-auto max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30">
      <p class="mb-4 text-xs uppercase tracking-[0.35em] text-brand-400">Admin access</p>
      <h1 class="mb-6 text-3xl font-serif text-white">Welcome</h1>

      <div v-if="!setupStatusReady" class="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-5 text-sm text-zinc-400">
        Checking admin access...
      </div>

      <div v-else-if="!setupMode">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="admin-username" class="mb-2 block text-sm text-zinc-400">Username</label>
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
            <label for="admin-password" class="mb-2 block text-sm text-zinc-400">Password</label>
            <input
              id="admin-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter password"
              class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            class="mt-2 w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="submitting"
          >
            {{ submitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <button
          type="button"
          @click="beginSetupFlow"
          :disabled="setupStatus.hasAdmin && setupTab === 'create-user'"
          class="mt-4 w-full rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ setupStatus.hasAdmin ? 'Create user' : 'Create first admin' }}
        </button>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-serif text-white">{{ setupTab === 'first-admin' ? 'Create first admin' : 'Create user' }}</h2>
          <button type="button" @click="cancelSetupFlow" class="text-sm uppercase tracking-[0.2em] text-zinc-400 hover:text-brand-400">Back</button>
        </div>

        <div class="grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
          <button
            type="button"
            @click="setupTab = 'first-admin'"
            :disabled="setupStatus.hasAdmin"
            :class="setupTab === 'first-admin' ? 'bg-brand-500 text-white' : 'text-zinc-300 hover:text-white'"
            class="rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            First admin
          </button>
          <button
            type="button"
            @click="setupTab = 'create-user'"
            :class="setupTab === 'create-user' ? 'bg-brand-500 text-white' : 'text-zinc-300 hover:text-white'"
            class="rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors"
          >
            Create user
          </button>
        </div>

        <div v-if="setupTab === 'first-admin'" class="space-y-4">
          <div>
            <label for="setup-username" class="mb-2 block text-sm text-zinc-400">Username</label>
            <input id="setup-username" v-model="setupForm.username" type="text" autocomplete="username" placeholder="Enter admin username" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <div>
            <label for="setup-password" class="mb-2 block text-sm text-zinc-400">Password</label>
            <input id="setup-password" v-model="setupForm.password" type="password" autocomplete="new-password" placeholder="Create a strong password" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <div>
            <label for="setup-confirm-password" class="mb-2 block text-sm text-zinc-400">Confirm password</label>
            <input id="setup-confirm-password" v-model="setupForm.confirmPassword" type="password" autocomplete="new-password" placeholder="Repeat password" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <label class="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-300">
            <input v-model="setupForm.totpEnabled" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500" />
            Enable authenticator app
          </label>

          <div v-if="setupForm.totpEnabled && !showSetupTotpQr" class="space-y-3">
            <button type="button" @click="showSetupTotpQr = true" class="w-full rounded-full border border-brand-500/60 bg-brand-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-300 transition-colors hover:bg-brand-500/20">I’m ready to see the QR code</button>
          </div>

          <div v-else-if="setupForm.totpEnabled" class="space-y-4">
            <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Scan with your authenticator app</p>
                <button type="button" @click="showSetupTotpQr = false" class="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-brand-400">Hide</button>
              </div>

              <div class="rounded-xl border border-zinc-700 bg-zinc-950/80 p-3">
                <img v-if="setupQrDataUrl" :src="setupQrDataUrl" alt="Authenticator QR code" class="mx-auto block h-52 w-52 object-contain" />
                <p v-else class="text-center text-sm text-zinc-400">QR code generation is unavailable right now.</p>
              </div>

              <div class="mt-4 text-left">
                <p class="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Authenticator secret</p>
                <div class="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-sm tracking-[0.18em] text-zinc-200">{{ maskedTotpSecret }}</div>
              </div>

              <div v-if="showSetupReveal" class="mt-4 flex flex-wrap gap-2">
                <button type="button" @click="copySetupSecret" class="rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-400">{{ copiedSecret ? 'Secret copied' : 'Copy secret' }}</button>
                <button type="button" @click="copySetupUri" class="rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-400">{{ copiedUri ? 'Link copied' : 'Copy setup link' }}</button>
              </div>

              <button v-else type="button" @click="showSetupReveal = true" class="mt-4 w-full rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400">Reveal copy options</button>
            </div>

            <div class="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p class="text-sm text-zinc-300">Verify your authenticator is synced correctly by entering both recent codes.</p>

              <div>
                <label for="setup-totp-previous" class="mb-2 block text-sm text-zinc-400">Previous code</label>
                <input id="setup-totp-previous" v-model="setupForm.totpVerifyPrevious" type="text" inputmode="numeric" maxlength="6" placeholder="123456" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
              </div>

              <div>
                <label for="setup-totp-current" class="mb-2 block text-sm text-zinc-400">Current code</label>
                <input id="setup-totp-current" v-model="setupForm.totpVerifyCurrent" type="text" inputmode="numeric" maxlength="6" placeholder="654321" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div>
            <label for="user-username" class="mb-2 block text-sm text-zinc-400">Username</label>
            <input id="user-username" v-model="setupForm.username" type="text" autocomplete="username" placeholder="Enter username" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <div>
            <label for="user-password" class="mb-2 block text-sm text-zinc-400">Password</label>
            <input id="user-password" v-model="setupForm.password" type="password" autocomplete="new-password" placeholder="Create a password" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <div>
            <label for="user-activation-code" class="mb-2 block text-sm text-zinc-400">Activation code</label>
            <input id="user-activation-code" v-model="setupForm.activationCode" type="text" autocomplete="one-time-code" placeholder="Enter activation code" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-300">
            <p class="mb-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Default role</p>
            <p class="font-medium text-zinc-100">Viewer</p>
            <p class="mt-2 text-zinc-400">New users start with read-only access and must be manually upgraded by an admin.</p>
          </div>
        </div>

        <button type="button" @click="submitSetup" class="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70" :disabled="setupSubmitting">
          {{ setupSubmitting ? (setupTab === 'first-admin' ? 'Creating admin...' : 'Creating user...') : (setupTab === 'first-admin' ? 'Create admin' : 'Create user') }}
        </button>
      </div>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-400">{{ errorMessage }}</p>
      <p v-else-if="setupMessage" class="mt-4 text-sm text-brand-400">{{ setupMessage }}</p>
    </div>

    <div v-else class="mx-auto max-w-7xl">
      <header class="mb-6 flex items-center justify-between gap-3 rounded-[24px] border border-zinc-800 bg-zinc-900/80 px-4 py-4 shadow-2xl shadow-black/20 md:px-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-lg text-zinc-200 lg:hidden"
            @click="mobileSidebarOpen = !mobileSidebarOpen"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <img src="/tmlclogo.png" alt="Thank Me Later logo" class="h-10 w-auto object-contain brightness-0 invert" />
          <div class="text-lg font-semibold tracking-[0.2em] text-zinc-100">[ADMIN]</div>
        </div>

        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-zinc-300 sm:inline">Welcome back, {{ currentUsername }}</span>
          <span class="text-sm text-zinc-300 sm:hidden">{{ currentUsername }}</span>
          <button @click="logoutAdmin" class="rounded-full border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400">Logout</button>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside
          :class="mobileSidebarOpen ? 'flex' : 'hidden'"
          class="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-3 shadow-2xl shadow-black/20 lg:flex"
        >
          <nav class="w-full space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              @click="selectTab(tab.key)"
              :class="activeTab === tab.key ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-zinc-300 hover:bg-white/5 hover:text-white'"
              class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors"
            >
              <span>{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          </nav>
        </aside>

        <main class="min-h-[640px] rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-4 shadow-2xl shadow-black/20 sm:p-6 xl:p-8">
          <div v-if="activeTab === 'dashboard'" class="flex min-h-[560px] items-center justify-center">
            <div class="max-w-xl text-center">
              <p class="mb-3 text-xs uppercase tracking-[0.35em] text-brand-400">Overview</p>
              <h2 class="mb-4 text-4xl font-serif text-white">Welcome back, {{ currentUsername }}.</h2>
              <p class="text-base text-zinc-300">Your admin dashboard is ready. Use the sidebar to manage menu items, review orders, check traffic, and maintain your bookings.</p>
            </div>
          </div>

          <div v-else-if="activeTab === 'menu-editor'" class="space-y-8">
            <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="mb-3 text-xs uppercase tracking-[0.35em] text-brand-400">Menu</p>
                <h1 class="text-4xl font-serif text-white">Manage menu</h1>
              </div>
            </div>

            <div v-if="isReadOnlyUser" class="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Read-only access: you can view the menu, but you cannot add, edit, or delete items.
            </div>

            <div class="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
              <div v-if="!isReadOnlyUser" class="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
                <h2 class="mb-6 text-2xl font-serif text-white">{{ editingId ? 'Edit menu item' : 'Add new menu item' }}</h2>

                <form @submit.prevent="submitForm" class="space-y-4">
                  <div>
                    <label class="mb-2 block text-sm text-zinc-400">Title</label>
                    <input v-model="form.title" type="text" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" placeholder="Menu item title" />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm text-zinc-400">Price</label>
                    <input v-model="form.price" type="text" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" placeholder="$22" />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm text-zinc-400">Description</label>
                    <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" placeholder="Menu item description"></textarea>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button type="submit" class="flex-1 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600">{{ editingId ? 'Save changes' : 'Add item' }}</button>
                    <button v-if="editingId" type="button" @click="resetForm" class="rounded-full border border-zinc-700 px-4 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400">Cancel</button>
                  </div>
                </form>

                <p v-if="formMessage" class="mt-4 text-sm text-brand-400">{{ formMessage }}</p>
              </div>

              <div class="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
                <div class="mb-6 flex items-center justify-between">
                  <h2 class="text-2xl font-serif text-white">Current items</h2>
                  <span class="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">{{ menuItems.length }} items</span>
                </div>

                <div v-if="loading" class="text-zinc-400">Loading menu...</div>
                <div v-else-if="menuItems.length === 0" class="text-zinc-400">No menu items yet.</div>
                <div v-else class="space-y-4">
                  <div v-for="item in menuItems" :key="item.id" class="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div class="mb-2 flex items-center gap-3">
                          <h3 class="text-xl font-serif text-white">{{ item.title }}</h3>
                          <span class="rounded-full bg-brand-500/15 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-400">${{ item.price }}</span>
                        </div>
                        <p class="text-zinc-400">{{ item.description }}</p>
                      </div>
                      <div v-if="!isReadOnlyUser" class="mt-2 flex gap-2 md:mt-0">
                        <button @click="startEdit(item)" class="rounded-full border border-zinc-700 px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-400">Edit</button>
                        <button @click="deleteItem(item.id)" class="rounded-full border border-red-700/70 px-3 py-2 text-xs uppercase tracking-[0.18em] text-red-300 transition-colors hover:border-red-500 hover:text-red-200">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex min-h-[560px] items-center justify-center">
            <div class="text-center">
              <p class="mb-3 text-xs uppercase tracking-[0.35em] text-brand-400">{{ tabLabel }}</p>
              <h2 class="text-4xl font-serif text-white">Coming Soon</h2>
            </div>
          </div>
        </main>
      </div>
    </div>

    <div v-if="showBackupCodesModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div class="w-full max-w-lg rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/40">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.25em] text-brand-400">Recovery codes</p>
            <h2 class="mt-2 text-2xl font-serif text-white">Backup access</h2>
          </div>
          <button type="button" @click="showBackupCodesModal = false" class="rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400">Close</button>
        </div>

        <p class="mb-5 text-sm text-zinc-300">Store these codes somewhere safe. Each one works once and can be used if you lose your authenticator.</p>

        <div class="grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <div v-for="code in backupCodes" :key="code" class="rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-center font-mono text-sm text-zinc-100">{{ code }}</div>
        </div>

        <button type="button" @click="copyRecoveryCodes" class="mt-5 w-full rounded-full border border-brand-500/60 bg-brand-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-300 transition-colors hover:bg-brand-500/20">Copy backup codes</button>
      </div>
    </div>

    <div v-if="totpModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/40">
        <p class="text-[10px] uppercase tracking-[0.25em] text-brand-400">Two-step verification</p>
        <h2 class="mt-3 text-2xl font-serif text-white">Enter your security code</h2>

        <div class="mt-5 space-y-4">
          <div>
            <label for="totp-modal-code" class="mb-2 block text-sm text-zinc-400">Authenticator code</label>
            <input id="totp-modal-code" v-model="totpCode" type="text" inputmode="numeric" maxlength="6" placeholder="123456" class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-500 transition-colors" />
          </div>

          <label class="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-3 text-sm text-zinc-300">
            <input v-model="totpRememberThisBrowser" type="checkbox" class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500" />
            Remember this browser
          </label>

          <button type="button" @click="submitTotpLogin" class="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70" :disabled="submitting">{{ submitting ? 'Verifying...' : 'Verify code' }}</button>
        </div>
      </div>
    </div>

    <div v-if="welcomeModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div class="w-full max-w-2xl rounded-[30px] border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl shadow-black/40">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.25em] text-brand-400">Welcome</p>
            <h2 class="mt-2 text-3xl font-serif text-white">Welcome back, {{ currentUsername }}.</h2>
          </div>
          <button type="button" @click="dismissWelcomeModal()" class="rounded-full border border-zinc-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400">Close</button>
        </div>

        <p class="mb-6 text-zinc-300">Here’s the quickest way to get comfortable with the menu editor and your most important controls.</p>

        <div class="mb-6 grid gap-3 md:grid-cols-3">
          <div class="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p class="mb-2 text-xs uppercase tracking-[0.2em] text-brand-400">01</p>
            <p class="font-medium text-white">Add new items</p>
            <p class="mt-2 text-sm text-zinc-400">Populate your menu with pricing, titles, and descriptions.</p>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p class="mb-2 text-xs uppercase tracking-[0.2em] text-brand-400">02</p>
            <p class="font-medium text-white">Edit live content</p>
            <p class="mt-2 text-sm text-zinc-400">Update or remove current menu items in seconds.</p>
          </div>
          <div class="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p class="mb-2 text-xs uppercase tracking-[0.2em] text-brand-400">03</p>
            <p class="font-medium text-white">Manage access</p>
            <p class="mt-2 text-sm text-zinc-400">Create users, assign the right permissions, and maintain security.</p>
          </div>
        </div>

        <div class="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
          <p class="mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Getting started checklist</p>
          <ul class="space-y-3 text-sm text-zinc-300">
            <li class="flex items-center gap-3"><span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/15 text-xs text-brand-300">✓</span> Confirm your menu setup and pricing</li>
            <li class="flex items-center gap-3"><span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/15 text-xs text-brand-300">✓</span> Add at least one featured menu item</li>
            <li class="flex items-center gap-3"><span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/15 text-xs text-brand-300">✓</span> Create any needed team members from the user flow</li>
          </ul>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button type="button" @click="dismissWelcomeModal()" class="flex-1 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-400">Take a quick tour</button>
          <button type="button" @click="dismissWelcomeModal()" class="flex-1 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-600">Start managing</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()

const rawApiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin)).trim()
const API_BASE = rawApiUrl.replace(/\/$/, '').replace(/\/api\/menu$/, '').replace(/\/api$/, '')
const API_URL = `${API_BASE}/api/menu`

const menuItems = ref([])
const loading = ref(false)
const accessGranted = ref(false)
const username = ref('')
const password = ref('')
const totpCode = ref('')
const totpRememberThisBrowser = ref(false)
const pendingTotpLogin = ref(null)
const requiresTotp = ref(false)
const setupMode = ref(false)
const setupTab = ref('first-admin')
const setupStatusReady = ref(false)
const setupStatus = ref({ hasAdmin: false, canCreateUser: false, defaultRole: 'viewer', activationRequired: true })
const currentUserRole = ref('viewer')
const setupSubmitting = ref(false)
const setupMessage = ref('')
const errorMessage = ref('')
const formMessage = ref('')
const toastMessage = ref('')
const submitting = ref(false)
const editingId = ref(null)
const form = ref({ title: '', price: '', description: '' })
const accountCreatedConfirmation = ref(false)
const createdAccount = ref({ username: '', role: 'viewer' })
const showBackupCodesModal = ref(false)
const totpModalOpen = ref(false)
const welcomeModalOpen = ref(false)
const WELCOME_MODAL_STORAGE_KEY = 'thank-me-later-welcome-modal-dismissed'
const backupCodes = ref([])
const showSetupReveal = ref(false)
const showSetupTotpQr = ref(false)
const setupQrDataUrl = ref('')
const copiedSecret = ref(false)
const copiedUri = ref(false)
const mobileSidebarOpen = ref(false)
const activeTab = ref('dashboard')
const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: '📁' },
  { key: 'menu-editor', label: 'Menu Editor', icon: '🍔' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'traffic', label: 'Traffic', icon: '📈' },
  { key: 'bookings', label: 'Bookings', icon: '📅' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]
const setupForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  activationCode: '',
  role: 'viewer',
  totpEnabled: false,
  totpSecret: '',
  totpVerifyPrevious: '',
  totpVerifyCurrent: '',
})

const isReadOnlyUser = computed(() => currentUserRole.value === 'viewer')
const currentUsername = computed(() => {
  const token = sessionStorage.getItem('menu-admin-token')
  if (!token) {
    return username.value.trim() || 'admin'
  }

  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = atob(padded)
    const parsed = JSON.parse(
      decodeURIComponent(
        Array.from(decoded, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
      ),
    )
    return parsed.username || parsed.user?.username || parsed.sub || username.value.trim() || 'admin'
  } catch {
    return username.value.trim() || 'admin'
  }
})
const tabLabel = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || 'Dashboard')
const TRUSTED_DEVICE_STORAGE_KEY = 'thank-me-later-trusted-device-token'

function getStoredTrustedDeviceToken() {
  return localStorage.getItem(TRUSTED_DEVICE_STORAGE_KEY) || ''
}

function setStoredTrustedDeviceToken(token) {
  if (token) {
    localStorage.setItem(TRUSTED_DEVICE_STORAGE_KEY, token)
    return
  }

  localStorage.removeItem(TRUSTED_DEVICE_STORAGE_KEY)
}

function clearStoredTrustedDeviceToken() {
  localStorage.removeItem(TRUSTED_DEVICE_STORAGE_KEY)
}

function showToast(message) {
  toastMessage.value = message
  window.clearTimeout(showToast.timeoutId)
  showToast.timeoutId = window.setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const maskedTotpSecret = computed(() => {
  const secret = setupForm.value.totpSecret.trim()
  if (!secret) return '••••••••••••'
  if (secret.length <= 4) return '*'.repeat(secret.length)
  return `${secret.slice(0, 2)}${'*'.repeat(Math.max(secret.length - 4, 4))}${secret.slice(-2)}`
})

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

function generateRecoveryCodes() {
  const codes = []
  for (let i = 0; i < 8; i += 1) {
    const value = Math.floor(100000 + Math.random() * 900000)
    codes.push(`TML-${String(value)}`)
  }
  return codes
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

function copyRecoveryCodes() {
  if (!backupCodes.value.length) {
    return
  }

  navigator.clipboard.writeText(backupCodes.value.join('\n'))
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
    cache: 'no-store',
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

async function fetchSetupStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/setup-status`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error('unable to fetch setup status')
    }

    const data = await response.json().catch(() => ({}))
    setupStatus.value = {
      hasAdmin: Boolean(data.hasAdmin),
      canCreateUser: Boolean(data.canCreateUser),
      defaultRole: data.defaultRole || 'admin',
      activationRequired: Boolean(data.activationRequired),
    }
    if (setupStatus.value.hasAdmin) {
      setupTab.value = 'create-user'
    }
  } catch {
    setupStatus.value = { hasAdmin: false, canCreateUser: false, defaultRole: 'admin', activationRequired: true }
  } finally {
    setupStatusReady.value = true
  }
}

function beginSetupFlow() {
  setupMode.value = true
  setupTab.value = setupStatus.value.hasAdmin ? 'create-user' : 'first-admin'
  setupMessage.value = ''
  errorMessage.value = ''
  showSetupTotpQr.value = false
  showSetupReveal.value = false

  if (setupStatus.value.hasAdmin) {
    setupForm.value = {
      username: '',
      password: '',
      confirmPassword: '',
      activationCode: '',
      role: 'viewer',
      totpEnabled: false,
      totpSecret: '',
      totpVerifyPrevious: '',
      totpVerifyCurrent: '',
    }
    return
  }

  setupForm.value = {
    username: '',
    password: '',
    confirmPassword: '',
    activationCode: '',
    role: 'admin',
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
  showSetupReveal.value = false
  setupForm.value = {
    username: '',
    password: '',
    confirmPassword: '',
    activationCode: '',
    role: 'admin',
    totpEnabled: false,
    totpSecret: '',
    totpVerifyPrevious: '',
    totpVerifyCurrent: '',
  }
}

function returnToLogin() {
  accountCreatedConfirmation.value = false
  setupMode.value = false
  username.value = createdAccount.value.username || ''
  password.value = ''
  errorMessage.value = ''
  setupMessage.value = ''
}

async function submitSetup() {
  if (setupTab.value === 'first-admin') {
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

    const isTotpSetup = setupForm.value.totpEnabled

    try {
      const response = await fetch(`${API_BASE}/api/auth/setup-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: setupForm.value.username.trim(),
          password: setupForm.value.password,
          role: 'admin',
          totpEnabled: isTotpSetup,
          ...(isTotpSetup ? { totpSecret: setupForm.value.totpSecret.trim() } : {}),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to create the first admin.')
      }

      setupStatus.value = {
        ...setupStatus.value,
        hasAdmin: true,
        canCreateUser: true,
        defaultRole: 'admin',
        activationRequired: false,
      }
      createdAccount.value = { username: setupForm.value.username.trim(), role: 'admin' }
      setupMode.value = false
      showSetupTotpQr.value = false
      showSetupReveal.value = false
      if (isTotpSetup) {
        backupCodes.value = generateRecoveryCodes()
        showBackupCodesModal.value = true
      }
      setupForm.value = { username: '', password: '', confirmPassword: '', activationCode: '', role: 'viewer', totpEnabled: false, totpSecret: '', totpVerifyPrevious: '', totpVerifyCurrent: '' }
      accountCreatedConfirmation.value = true
      setupTab.value = 'create-user'
      await fetchSetupStatus()
    } catch (error) {
      errorMessage.value = error.message || 'Unable to create the first admin.'
    } finally {
      setupSubmitting.value = false
    }

    return
  }

  if (!setupForm.value.username.trim() || !setupForm.value.password) {
    errorMessage.value = 'Username and password are required.'
    return
  }

  if (setupForm.value.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }

  if (!setupForm.value.activationCode.trim()) {
    errorMessage.value = 'An activation code is required to create a user.'
    return
  }

  setupSubmitting.value = true
  errorMessage.value = ''
  setupMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/auth/create-user`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        username: setupForm.value.username.trim(),
        password: setupForm.value.password,
        role: 'viewer',
        activationCode: setupForm.value.activationCode.trim(),
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Unable to create user.')
    }

    createdAccount.value = { username: setupForm.value.username.trim(), role: 'viewer' }
    setupForm.value = { username: '', password: '', confirmPassword: '', activationCode: '', role: 'viewer', totpEnabled: false, totpSecret: '', totpVerifyPrevious: '', totpVerifyCurrent: '' }
    setupMode.value = false
    setupStatus.value = {
      ...setupStatus.value,
      hasAdmin: true,
      canCreateUser: true,
      defaultRole: 'admin',
      activationRequired: false,
    }
    setupTab.value = 'create-user'
    setupMessage.value = 'User created successfully. They were assigned the viewer role by default.'
    accountCreatedConfirmation.value = true
    await fetchSetupStatus()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to create user.'
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
        trustedDeviceToken: getStoredTrustedDeviceToken(),
        rememberThisBrowser: totpRememberThisBrowser.value,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok && !data.requiresTotp) {
      throw new Error(data.error || 'Unable to sign in.')
    }

    if (data.requiresTotp) {
      pendingTotpLogin.value = {
        username: username.value.trim(),
        password: password.value,
      }
      requiresTotp.value = true
      totpModalOpen.value = true
      totpCode.value = ''
      errorMessage.value = data.message || 'Authenticator code required.'
      return
    }

    if (!data.token) {
      throw new Error('Login response missing token.')
    }

    if (data.trustedDeviceToken) {
      setStoredTrustedDeviceToken(data.trustedDeviceToken)
    }

    currentUserRole.value = data.user?.role || data.role || 'viewer'
    sessionStorage.setItem('menu-admin-token', data.token)
    completeSuccessfulLogin()
  } catch (error) {
    requiresTotp.value = false
    errorMessage.value = error.message || 'Unable to sign in.'
  } finally {
    submitting.value = false
  }
}

async function submitTotpLogin() {
  if (!pendingTotpLogin.value) {
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: pendingTotpLogin.value.username,
        password: pendingTotpLogin.value.password,
        totpCode: totpCode.value.trim(),
        trustedDeviceToken: getStoredTrustedDeviceToken(),
        rememberThisBrowser: totpRememberThisBrowser.value,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok && !data.requiresTotp) {
      throw new Error(data.error || 'Invalid TOTP code.')
    }

    if (data.requiresTotp) {
      errorMessage.value = data.message || 'Authenticator code required.'
      return
    }

    if (!data.token) {
      throw new Error('Login response missing token.')
    }

    if (data.trustedDeviceToken) {
      setStoredTrustedDeviceToken(data.trustedDeviceToken)
    }

    currentUserRole.value = data.user?.role || data.role || 'viewer'
    sessionStorage.setItem('menu-admin-token', data.token)
    totpModalOpen.value = false
    completeSuccessfulLogin()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to verify authenticator code.'
  } finally {
    submitting.value = false
  }
}

function completeSuccessfulLogin() {
  accessGranted.value = true
  requiresTotp.value = false
  totpCode.value = ''
  totpRememberThisBrowser.value = false
  pendingTotpLogin.value = null
  password.value = ''
  resetForm()
  loadMenuItems()

  if (shouldShowWelcomeModal()) {
    welcomeModalOpen.value = true
  }

  const redirect = sessionStorage.getItem('auth-return-url') || '/admin'
  if (redirect && redirect !== '/admin') {
    router.push(redirect)
  }
}

function dismissWelcomeModal() {
  welcomeModalOpen.value = false
  localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, 'true')
}

function shouldShowWelcomeModal() {
  return !localStorage.getItem(WELCOME_MODAL_STORAGE_KEY)
}

function logoutAdmin() {
  accessGranted.value = false
  activeTab.value = 'dashboard'
  mobileSidebarOpen.value = false
  requiresTotp.value = false
  currentUserRole.value = 'viewer'
  username.value = ''
  password.value = ''
  totpCode.value = ''
  totpRememberThisBrowser.value = false
  pendingTotpLogin.value = null
  sessionStorage.removeItem('menu-admin-token')

  // Preserve the trusted-device token so a remembered 30-day browser can skip TOTP
  // across a normal logout/login cycle without forcing the user through MFA again.
  resetForm()
}

function resetForm() {
  editingId.value = null
  form.value = { title: '', price: '', description: '' }
}

function selectTab(tabKey) {
  if (!tabKey) {
    return
  }

  activeTab.value = tabKey
  mobileSidebarOpen.value = false
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
      cache: 'no-store',
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
      cache: 'no-store',
      headers: authHeaders(),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Unable to delete item.')
    }

    menuItems.value = menuItems.value.filter((item) => item.id !== id)
    formMessage.value = 'Menu item deleted.'
    showToast('Menu item deleted successfully.')
  } catch (error) {
    formMessage.value = error.message
  }
}

onMounted(async () => {
  const redirectTarget = typeof route.query.returnUrl === 'string' ? route.query.returnUrl : route.query.redirect
  if (redirectTarget) {
    sessionStorage.setItem('auth-return-url', redirectTarget)
  }

  await fetchSetupStatus()

  const token = sessionStorage.getItem('menu-admin-token')
  if (!token) {
    return
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Session expired')
    }

    const meData = await response.json().catch(() => ({}))
    currentUserRole.value = meData.role || 'viewer'
    accessGranted.value = true
    activeTab.value = 'dashboard'
    const tokenUsername = currentUsername.value
    if (tokenUsername && tokenUsername !== 'admin') {
      username.value = tokenUsername
    }
    loadMenuItems()
    if (shouldShowWelcomeModal()) {
      welcomeModalOpen.value = true
    }
  } catch {
    sessionStorage.removeItem('menu-admin-token')
    accessGranted.value = false
    currentUserRole.value = 'viewer'
  }
})
</script>
