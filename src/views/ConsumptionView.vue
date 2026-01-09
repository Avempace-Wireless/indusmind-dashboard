<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Consumption</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Consumption Analysis</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Analyze energy consumption patterns across sites and equipment</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Total Consumption -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Consumption</span>
          <span class="material-symbols-outlined text-blue-600">flash_on</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">12,450 kWh</div>
        <div class="text-sm text-green-600 mt-2">↓ 5.2% vs last month</div>
      </div>

      <!-- Average Power -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Average Power</span>
          <span class="material-symbols-outlined text-amber-600">bolt</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">425.5 kW</div>
        <div class="text-sm text-slate-600 dark:text-slate-400 mt-2">Current month</div>
      </div>

      <!-- Total Cost -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cost</span>
          <span class="material-symbols-outlined text-emerald-600">payments</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white">2,890 TND</div>
        <div class="text-sm text-red-600 mt-2">↑ 3.1% vs budget</div>
      </div>
    </div>

    <!-- Placeholder for detailed charts -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Consumption by Site</h2>
      <div class="h-64 flex items-center justify-center text-slate-400">
        <div class="text-center">
          <span class="material-symbols-outlined text-6xl mb-4">bar_chart</span>
          <p>Detailed consumption charts coming soon</p>
        </div>
      </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
