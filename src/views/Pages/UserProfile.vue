<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6 max-w-6xl mx-auto">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">{{ t('navigation.dashboard') }}</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ t('profile.title') }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ t('profile.title') }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ t('profile.subtitle') }}</p>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <!-- Profile Header with Avatar -->
        <div class="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-32"></div>

        <div class="px-6 pb-6">
          <!-- Avatar -->
          <div class="flex items-end gap-6 -mt-16 mb-6">
            <div class="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 ring-2 ring-emerald-500/30 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-5xl">
              IM
            </div>
            <div class="pb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">IndusMind Manager</h2>
              <p class="text-emerald-600 dark:text-emerald-400 font-semibold">Energy Management System Administrator</p>
            </div>
          </div>

          <!-- Personal Information Section -->
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">{{ t('profile.personalInfo') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.name') }}
                </label>
                <input
                  type="text"
                  value="IndusMind Manager"
                  readonly
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.email') }}
                </label>
                <input
                  type="email"
                  value="manager@indusmind.com"
                  readonly
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.phone') }}
                </label>
                <input
                  type="tel"
                  value="+1 (555) 123-4567"
                  readonly
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.role') }}
                </label>
                <div class="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                  <span class="text-emerald-700 dark:text-emerald-400 font-semibold">{{ t('user.manager') }}</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.department') }}
                </label>
                <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium">
                  {{ t('profile.energyManagement') }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.joinDate') }}
                </label>
                <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white font-medium">
                  January 15, 2024
                </div>
              </div>
            </div>
          </div>

          <!-- Permissions Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">{{ t('profile.permissions') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-700 dark:text-emerald-400 font-medium">{{ t('profile.dashboardAccess') }}</span>
              </div>
              <div class="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-700 dark:text-emerald-400 font-medium">{{ t('profile.reportsGeneration') }}</span>
              </div>
              <div class="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-700 dark:text-emerald-400 font-medium">{{ t('profile.settingsManagement') }}</span>
              </div>
              <div class="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-700 dark:text-emerald-400 font-medium">{{ t('profile.userManagement') }}</span>
              </div>
              <div class="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-700 dark:text-emerald-400 font-medium">{{ t('profile.alertConfiguration') }}</span>
              </div>
              <div class="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-emerald-700 dark:text-emerald-400 font-medium">{{ t('profile.equipmentManagement') }}</span>
              </div>
            </div>
          </div>

          <!-- Change Password Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">{{ t('profile.changePassword') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.currentPassword') }}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.newPassword') }}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ t('profile.confirmPassword') }}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <button class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
              {{ t('profile.update') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const { t } = useI18n()
</script>
