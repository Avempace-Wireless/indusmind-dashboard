<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Performance</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">KPI Dashboard</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Monitor key performance indicators and targets</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      <!-- KPI Card 1 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Energy Efficiency</h3>
          <span class="material-symbols-outlined text-green-600">trending_up</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white mb-2">92.5%</div>
        <div class="flex items-center gap-2 mb-4">
          <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-green-600 rounded-full" style="width: 92.5%"></div>
          </div>
          <span class="text-xs text-slate-600 dark:text-slate-400">Target: 90%</span>
        </div>
        <p class="text-sm text-green-600">Above target</p>
      </div>

      <!-- KPI Card 2 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Cost Efficiency</h3>
          <span class="material-symbols-outlined text-amber-600">payments</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white mb-2">87.2%</div>
        <div class="flex items-center gap-2 mb-4">
          <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-amber-600 rounded-full" style="width: 87.2%"></div>
          </div>
          <span class="text-xs text-slate-600 dark:text-slate-400">Target: 85%</span>
        </div>
        <p class="text-sm text-green-600">Above target</p>
      </div>

      <!-- KPI Card 3 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Equipment Uptime</h3>
          <span class="material-symbols-outlined text-blue-600">check_circle</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white mb-2">98.1%</div>
        <div class="flex items-center gap-2 mb-4">
          <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-blue-600 rounded-full" style="width: 98.1%"></div>
          </div>
          <span class="text-xs text-slate-600 dark:text-slate-400">Target: 95%</span>
        </div>
        <p class="text-sm text-green-600">Above target</p>
      </div>

      <!-- KPI Card 4 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Load Factor</h3>
          <span class="material-symbols-outlined text-purple-600">insights</span>
        </div>
        <div class="text-3xl font-bold text-slate-900 dark:text-white mb-2">68.5%</div>
        <div class="flex items-center gap-2 mb-4">
          <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-purple-600 rounded-full" style="width: 68.5%"></div>
          </div>
          <span class="text-xs text-slate-600 dark:text-slate-400">Target: 70%</span>
        </div>
        <p class="text-sm text-red-600">Below target</p>
      </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
