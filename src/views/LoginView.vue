<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Login</h1>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              v-model="password"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const email = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value)
    // Get redirect from query parameter or default to dashboard
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
