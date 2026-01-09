<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Cost Analysis</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Cost Analysis</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Track energy costs and identify savings opportunities</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Current Month</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white">2,890 TND</div>
        <div class="text-sm text-red-600 mt-2">↑ 3.1%</div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Budget</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white">2,800 TND</div>
        <div class="text-sm text-slate-600 dark:text-slate-400 mt-2">Monthly target</div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Savings YTD</div>
        <div class="text-2xl font-bold text-green-600">1,250 TND</div>
        <div class="text-sm text-green-600 mt-2">vs last year</div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Cost per kWh</div>
        <div class="text-2xl font-bold text-slate-900 dark:text-white">0.23 TND</div>
        <div class="text-sm text-slate-600 dark:text-slate-400 mt-2">Average rate</div>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
