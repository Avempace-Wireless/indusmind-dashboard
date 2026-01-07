<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Benchmarking</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Benchmarking</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Compare performance against industry standards</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">Performance vs Industry Average</h2>

      <div class="space-y-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Energy Intensity (kWh/m²)</span>
            <div class="flex items-center gap-4">
              <span class="text-sm text-slate-600 dark:text-slate-400">Your Facility: <strong class="text-green-600">125</strong></span>
              <span class="text-sm text-slate-600 dark:text-slate-400">Industry Avg: <strong>145</strong></span>
            </div>
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-green-600" style="width: 86.2%"></div>
          </div>
          <p class="text-xs text-green-600 mt-1">13.8% better than industry average</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Cost Efficiency (TND/kWh)</span>
            <div class="flex items-center gap-4">
              <span class="text-sm text-slate-600 dark:text-slate-400">Your Facility: <strong class="text-green-600">0.23</strong></span>
              <span class="text-sm text-slate-600 dark:text-slate-400">Industry Avg: <strong>0.26</strong></span>
            </div>
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-green-600" style="width: 88.5%"></div>
          </div>
          <p class="text-xs text-green-600 mt-1">11.5% better than industry average</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Carbon Emissions (kg CO₂/kWh)</span>
            <div class="flex items-center gap-4">
              <span class="text-sm text-slate-600 dark:text-slate-400">Your Facility: <strong class="text-amber-600">0.52</strong></span>
              <span class="text-sm text-slate-600 dark:text-slate-400">Industry Avg: <strong>0.48</strong></span>
            </div>
          </div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-amber-600" style="width: 108.3%"></div>
          </div>
          <p class="text-xs text-red-600 mt-1">8.3% above industry average - improvement needed</p>
        </div>
      </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
