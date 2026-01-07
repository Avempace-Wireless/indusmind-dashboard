<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Analysis</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analysis & Insights</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Advanced analytics and usage patterns</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Insights</h2>
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span class="material-symbols-outlined text-blue-600">lightbulb</span>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Efficiency Opportunity</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Weekend consumption is 15% higher than necessary. Consider scheduling adjustments.</p>
          </div>
        </div>
        <div class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span class="material-symbols-outlined text-green-600">trending_down</span>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Cost Savings</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Shifting 20% of load to off-peak hours could save 450 TND/month.</p>
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
