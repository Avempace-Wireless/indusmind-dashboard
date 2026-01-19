<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 max-w-6xl mx-auto">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">{{ t('navigation.dashboard') }}</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ t('support.title') }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('support.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ t('support.subtitle') }}</p>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <div class="flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg mb-4">
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('support.email') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">support@indusmind.com</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
          <div class="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-4">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ t('support.phone') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">+33 1 45 67 89 00</p>
          <p class="text-gray-500 dark:text-gray-500 text-xs mt-2">{{ t('support.hours') }}</p>
        </div>
      </div>

      <!-- Quick Support Links -->
      <!-- <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">{{ t('support.faq') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p class="font-medium text-gray-900 dark:text-white mb-2">How do I view energy consumption data?</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Navigate to the Dashboard or History view to see detailed energy consumption data and trends.</p>
          </div>
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p class="font-medium text-gray-900 dark:text-white mb-2">How can I configure alerts?</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Go to Alerts section to set up notifications for energy consumption thresholds.</p>
          </div>
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p class="font-medium text-gray-900 dark:text-white mb-2">How do I export reports?</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Use the Reports section to generate and download energy analysis reports.</p>
          </div>
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <p class="font-medium text-gray-900 dark:text-white mb-2">Where can I find my profile information?</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Visit the Profile page from the menu to view and manage your account details.</p>
          </div>
        </div>
      </div> -->
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const { t } = useI18n()
</script>
