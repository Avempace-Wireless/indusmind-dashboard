<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 max-w-6xl mx-auto">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">{{ t('navigation.dashboard') }}</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ t('accountSettings.title') }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('accountSettings.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ t('accountSettings.subtitle') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sticky top-20 space-y-2">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg font-medium transition-all',
                activeSection === section.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              {{ section.label }}
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Security Section -->
          <div v-if="activeSection === 'security'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('accountSettings.security') }}</h2>

            <!-- 2FA -->
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">{{ t('accountSettings.twoFactorAuth') }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('accountSettings.twoFactorDesc') }}</p>
              </div>
              <button class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                {{ t('accountSettings.enable') }}
              </button>
            </div>

            <!-- Active Sessions -->
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 mt-8">{{ t('accountSettings.sessions') }}</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ t('accountSettings.currentSession') }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('accountSettings.lastActive') }}: 2 minutes ago</p>
                </div>
                <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Active</span>
              </div>
            </div>
            <button class="mt-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium">
              {{ t('accountSettings.signOutAll') }}
            </button>
          </div>

          <!-- Preferences Section -->
          <div v-if="activeSection === 'preferences'" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('accountSettings.preferences') }}</h2>

            <div class="space-y-6">
              <!-- Language -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('accountSettings.language') }}
                </label>
                <select class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <!-- Timezone -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('accountSettings.timezone') }}
                </label>
                <select class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                  <option value="utc">UTC</option>
                  <option value="est">EST</option>
                  <option value="pst">PST</option>
                </select>
              </div>

              <!-- Email Notifications -->
              <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ t('accountSettings.emailNotifications') }}</h3>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked class="w-4 h-4 rounded text-emerald-500" />
                    <span class="text-gray-700 dark:text-gray-300">{{ t('accountSettings.alerts') }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked class="w-4 h-4 rounded text-emerald-500" />
                    <span class="text-gray-700 dark:text-gray-300">{{ t('accountSettings.reports') }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" class="w-4 h-4 rounded text-emerald-500" />
                    <span class="text-gray-700 dark:text-gray-300">{{ t('accountSettings.updates') }}</span>
                  </label>
                </div>
              </div>
            </div>

            <button class="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">
              {{ t('accountSettings.saveChanges') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const { t } = useI18n()

const activeSection = ref('security')
const sections = [
  { id: 'security', label: t('accountSettings.security') },
  { id: 'preferences', label: t('accountSettings.preferences') }
]
</script>
