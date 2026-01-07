<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Comparison</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Period Comparison</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Compare consumption across different time periods</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Period 1</label>
          <select class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Period 2</label>
          <select class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <option>Last Month</option>
            <option>Same Month Last Year</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">This Month</h3>
        <div class="text-3xl font-bold text-blue-600 mb-4">12,450 kWh</div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Average Power:</span>
            <span class="font-semibold text-slate-900 dark:text-white">425.5 kW</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Peak Demand:</span>
            <span class="font-semibold text-slate-900 dark:text-white">702.8 kW</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Total Cost:</span>
            <span class="font-semibold text-slate-900 dark:text-white">2,890 TND</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Last Month</h3>
        <div class="text-3xl font-bold text-slate-600 mb-4">13,120 kWh</div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Average Power:</span>
            <span class="font-semibold text-slate-900 dark:text-white">448.7 kW</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Peak Demand:</span>
            <span class="font-semibold text-slate-900 dark:text-white">725.3 kW</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Total Cost:</span>
            <span class="font-semibold text-slate-900 dark:text-white">3,045 TND</span>
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
