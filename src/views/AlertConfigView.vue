<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white\">Alerts</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Alert Configuration</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage alert rules and thresholds</p>
          </div>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <span class="material-symbols-outlined">add</span>
            New Rule
          </button>
        </div>
      </div>

      <div class="space-y-4">
      <!-- Alert Rule 1 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">High Power Consumption</h3>
              <span class="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded">CRITICAL</span>
              <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">ACTIVE</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Trigger when power consumption exceeds 500 kW</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-600 dark:text-slate-400">Threshold:</span>
                <span class="ml-2 font-semibold text-slate-900 dark:text-white">500 kW</span>
              </div>
              <div>
                <span class="text-slate-600 dark:text-slate-400">Notifications:</span>
                <span class="ml-2 font-semibold text-slate-900 dark:text-white">Email, SMS</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined text-slate-600">edit</span>
            </button>
            <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined text-slate-600">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Alert Rule 2 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Equipment Offline</h3>
              <span class="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded">MEDIUM</span>
              <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">ACTIVE</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Alert when any equipment goes offline</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-600 dark:text-slate-400">Condition:</span>
                <span class="ml-2 font-semibold text-slate-900 dark:text-white">Status = Offline</span>
              </div>
              <div>
                <span class="text-slate-600 dark:text-slate-400">Notifications:</span>
                <span class="ml-2 font-semibold text-slate-900 dark:text-white">Email</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined text-slate-600">edit</span>
            </button>
            <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined text-slate-600">delete</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
