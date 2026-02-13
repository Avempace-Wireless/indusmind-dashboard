<template>
  <div class="min-h-dvh bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 dark:from-slate-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center px-4 py-6 sm:py-12 relative overflow-hidden">
    <!-- Animated Background Shapes -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 left-5 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 right-5 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>

    <div class="max-w-md w-full relative z-10 flex flex-col">
      <!-- Logo and Language Selector -->
      <div class="text-center mb-5">
        <div class="flex justify-center mb-3">
          <div class="bg-gradient-to-br from-emerald-700 to-teal-700 p-4 rounded-2xl shadow-2xl ring-2 ring-emerald-400/30">
            <img class="h-14 w-14 object-contain" src="/images/logo/Indusmind_logo.png" alt="IndusMind Energy" />
          </div>
        </div>
        <div class="flex items-baseline justify-center gap-2 mb-3">
          <span class="text-2xl font-bold text-white">IndusMind</span>
          <span class="text-sm font-bold uppercase text-emerald-300">Energy</span>
        </div>

        <!-- Language Selector -->
        <div class="flex justify-center gap-2">
          <button
            @click="locale = 'en'"
            :class="[
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-md',
              locale === 'en'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105 ring-1 ring-emerald-300/50'
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 backdrop-blur'
            ]"
          >
            EN
          </button>
          <button
            @click="locale = 'fr'"
            :class="[
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-md',
              locale === 'fr'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105 ring-1 ring-emerald-300/50'
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 backdrop-blur'
            ]"
          >
            FR
          </button>
        </div>
      </div>

      <!-- Login Card -->
      <div class="bg-white/10 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-emerald-500/30 p-6">
        <div class="mb-5">
          <h1 class="text-2xl font-bold text-white mb-1">
            {{ t('auth.login.title') }}
          </h1>
          <p class="text-sm text-emerald-100">
            {{ t('auth.login.subtitle') }}
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="mb-5 p-3 bg-red-500/20 dark:bg-red-900/30 border border-red-400/50 rounded-lg flex items-center gap-2">
          <svg class="w-4 h-4 text-red-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="text-xs font-medium text-red-200">{{ t('auth.login.invalidCredentials') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-3">
          <!-- Email Input -->
          <div>
            <label class="block text-xs font-bold text-emerald-100 mb-1.5">
              {{ t('auth.login.email') }}
            </label>
            <input
              v-model="username"
              type="email"
              :placeholder="t('auth.login.emailPlaceholder')"
              class="w-full px-3 py-2.5 border border-white/20 dark:border-emerald-500/30 rounded-lg
                     bg-white/10 dark:bg-slate-700/50 text-white
                     focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                     placeholder-white/50
                     transition-all duration-200 hover:bg-white/15 dark:hover:bg-slate-700/70"
              required
            />
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-xs font-bold text-emerald-100 mb-1.5">
              {{ t('auth.login.password') }}
            </label>
            <div class="relative group/pw">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.login.passwordPlaceholder')"
                class="w-full px-3 py-2.5 pr-11 border border-white/20 dark:border-emerald-500/30 rounded-lg
                       bg-white/10 dark:bg-slate-700/50 text-white
                       focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                       placeholder-white/50
                       transition-all duration-200 hover:bg-white/15 dark:hover:bg-slate-700/70"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                :class="showPassword
                  ? 'bg-emerald-500/25 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                  : 'bg-transparent text-white/40 hover:text-white/70 hover:bg-white/10'"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-[18px] h-[18px] transition-transform duration-300">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-[18px] h-[18px] transition-transform duration-300">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center">
              <input
                v-model="rememberMe"
                type="checkbox"
                id="remember"
                class="h-3.5 w-3.5 text-emerald-400 focus:ring-emerald-500 border-white/30 rounded cursor-pointer"
              />
              <label for="remember" class="ml-2 block text-xs text-emerald-100 cursor-pointer select-none">
                {{ t('auth.login.rememberMe') }}
              </label>
            </div>
            <a href="#" class="text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:underline whitespace-nowrap">
              {{ t('auth.login.forgotPassword') }}
            </a>
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-size-200 bg-pos-0 hover:bg-pos-100
                   text-white font-bold py-3 rounded-lg transition-all duration-500
                   transform hover:scale-[1.02] active:scale-[0.98]
                   shadow-lg hover:shadow-xl hover:shadow-emerald-500/40
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   relative overflow-hidden group text-sm"
          >
            <span class="relative z-10 flex items-center justify-center gap-2">
              <span v-if="!authStore.loading" class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                {{ t('auth.login.signIn') }}
              </span>
              <span v-else class="flex items-center gap-1.5">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('auth.login.signingIn') }}
              </span>
            </span>
            <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-4">
        <p class="text-xs text-emerald-200/70 font-medium">
          © 2026 IndusMind Energy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const { t, locale } = useI18n()
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Set default language to French on mount
onMounted(() => {
  locale.value = 'fr'
})

const handleLogin = async () => {
  console.log('[LoginView] handleLogin called')
  console.log('[LoginView] Username:', username.value)
  console.log('[LoginView] Password:', password.value ? '***' : 'empty')

  // Validate inputs
  if (!username.value) {
    console.warn('[LoginView] Username is empty')
    return
  }

  if (!password.value) {
    console.warn('[LoginView] Password is empty')
    return
  }

  try {
    console.log('[LoginView] Calling authStore.login()')

    await authStore.login(username.value, password.value)

    console.log('[LoginView] Login successful, redirecting...')

    // Get redirect from query parameter or default to global-meters
    const redirect = (route.query.redirect as string) || '/global-meters'
    console.log('[LoginView] Redirecting to:', redirect)
    await router.push(redirect)
  } catch (err) {
    console.error('[LoginView] Login failed:', err)
    // Error is already handled in authStore
  }
}
</script>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}

.bg-size-200 {
  background-size: 200% auto;
}

.bg-pos-0 {
  background-position: 0% center;
}

.hover\:bg-pos-100:hover {
  background-position: 100% center;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.05);
  }
}
</style>
