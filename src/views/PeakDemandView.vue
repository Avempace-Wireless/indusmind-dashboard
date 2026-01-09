<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Peak Demand</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Peak Demand Analysis</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Track and manage peak energy demand periods</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Current Peak</h3>
        <div class="text-3xl font-bold text-red-600">650.2 kW</div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Today at 14:35</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Monthly Peak</h3>
        <div class="text-3xl font-bold text-amber-600">702.8 kW</div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Jan 3 at 15:20</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Load Factor</h3>
        <div class="text-3xl font-bold text-blue-600">68.5%</div>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Avg / Peak ratio</p>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
