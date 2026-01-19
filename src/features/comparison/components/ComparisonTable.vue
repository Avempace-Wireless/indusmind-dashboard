<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</span>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800">
            <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Meter</th>
            <th v-for="column in columns" :key="column.key" class="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              {{ column.label }}
            </th>
            <th class="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trend</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.meterName" class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <!-- Meter Name with Color -->
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: row.color }"></div>
                <span class="font-medium text-gray-900 dark:text-white">{{ row.meterName }}</span>
              </div>
            </td>
            <!-- Data Columns -->
            <td v-for="column in columns" :key="column.key" class="text-right py-4 px-4 text-gray-700 dark:text-gray-300">
              {{ row.data[column.key] }}
            </td>
            <!-- Trend Indicator -->
            <td class="text-right py-4 px-4">
              <div v-if="row.trend" :class="['inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', row.trendClass]">
                <span class="material-symbols-outlined text-sm">{{ row.trendIcon }}</span>
                {{ row.trend }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer Summary (optional) -->
    <div v-if="showSummary" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-500">Average Consumption</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ summary.avgConsumption }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-500">Peak Usage</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ summary.peakUsage }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-500">Total Savings</p>
          <p class="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{{ summary.totalSavings }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500 dark:text-gray-500">Top Performer</p>
          <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{{ summary.topPerformer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
}

interface Row {
  meterName: string
  color: string
  data: Record<string, string | number>
  trend?: string
  trendIcon?: string
  trendClass?: string
}

interface Summary {
  avgConsumption: string
  peakUsage: string
  totalSavings: string
  topPerformer: string
}

interface Props {
  title: string
  subtitle?: string
  columns: Column[]
  rows: Row[]
  summary?: Summary
  showSummary?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  showSummary: false,
  summary: () => ({
    avgConsumption: '0',
    peakUsage: '0',
    totalSavings: '0',
    topPerformer: '-'
  })
})
</script>
