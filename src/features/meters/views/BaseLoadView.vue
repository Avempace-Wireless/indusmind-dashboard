<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Base Load</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Base Load Analysis</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Monitor and optimize baseline energy consumption</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Base Load</h2>
        <div class="text-4xl font-bold text-blue-600 mb-2">285.5 kW</div>
        <p class="text-sm text-slate-600 dark:text-slate-400">Average baseline consumption</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Optimization Potential</h2>
        <div class="text-4xl font-bold text-green-600 mb-2">12.5%</div>
        <p class="text-sm text-slate-600 dark:text-slate-400">Potential reduction available</p>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
