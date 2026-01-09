<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Settings</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Configure system preferences and user settings</p>
          </div>
        </div>
      </div>

      <!-- Theme Settings (FR74) -->
      <div class="bg-white dark:bg-[#1c2534] rounded-lg p-6 shadow border border-gray-200 dark:border-[#2a3649]">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="light"
              v-model="theme"
              @change="setTheme"
              class="w-4 h-4"
            />
            <span class="text-gray-700 dark:text-gray-300">Light Mode</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="dark"
              v-model="theme"
              @change="setTheme"
              class="w-4 h-4"
            />
            <span class="text-gray-700 dark:text-gray-300">Dark Mode</span>
          </label>
        </div>
      </div>

      <!-- Notification Settings (FR75-76) -->
      <div class="bg-white dark:bg-[#1c2534] rounded-lg p-6 shadow border border-gray-200 dark:border-[#2a3649]">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notifications</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="notifications.email" class="w-4 h-4" />
            <span class="text-gray-700 dark:text-gray-300">Email Notifications</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="notifications.sms" class="w-4 h-4" />
            <span class="text-gray-700 dark:text-gray-300">SMS Alerts</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="notifications.push" class="w-4 h-4" />
            <span class="text-gray-700 dark:text-gray-300">Push Notifications</span>
          </label>
        </div>
      </div>

      <!-- User Profile (FR65) -->
      <div class="bg-white dark:bg-[#1c2534] rounded-lg p-6 shadow border border-gray-200 dark:border-[#2a3649]">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input v-model="profile.name" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#2a3649] bg-white dark:bg-[#0d0f14] text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              v-model="profile.email"
              type="email"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#2a3649] bg-white dark:bg-[#0d0f14] text-gray-900 dark:text-white"
            />
          </div>
          <button class="bg-[#135bec] hover:bg-[#0f4bcf] text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Tariff Settings (FR48-54) -->
      <div class="bg-white dark:bg-[#1c2534] rounded-lg p-6 shadow border border-gray-200 dark:border-[#2a3649]">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tariff Information</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Peak Rate (TND/kWh)</label>
              <input
                v-model.number="tariff.peakRate"
                type="number"
                step="0.01"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#2a3649] bg-white dark:bg-[#0d0f14] text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Off-Peak Rate (TND/kWh)</label>
              <input
                v-model.number="tariff.offPeakRate"
                type="number"
                step="0.01"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#2a3649] bg-white dark:bg-[#0d0f14] text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Update Tariff
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useSettingsStore } from '@/stores/useSettingsStore'

const settingsStore = useSettingsStore()

const theme = ref(settingsStore.settings.theme)
const notifications = ref({ ...settingsStore.settings.notificationPreferences })
const profile = ref({ name: '', email: '' })
const tariff = ref({ ...settingsStore.settings.tariffInfo })

const setTheme = () => {
  settingsStore.setTheme(theme.value)
}
</script>
