<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-start gap-3">
        <div class="p-2.5 rounded-lg" :style="{ backgroundColor: backgroundColor + '20' }">
          <span class="material-symbols-outlined text-xl" :style="{ color: backgroundColor }">
            {{ icon }}
          </span>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ label }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{{ period }}</p>
        </div>
      </div>
      <span v-if="badge" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" :class="badgeClass">
        <span class="material-symbols-outlined text-sm">{{ badgeIcon }}</span>
        {{ badge }}
      </span>
    </div>

    <!-- Main Value -->
    <div class="space-y-3">
      <div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ currentValue }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ unit }}</p>
      </div>

      <!-- Comparison Row -->
      <div class="pt-3 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="text-xs text-gray-500 dark:text-gray-500">Previous Period</p>
            <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">{{ previousValue }}</p>
          </div>
          <div :class="['flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium', trendClass]">
            <span class="material-symbols-outlined text-base">{{ trendIcon }}</span>
            {{ trendPercentage }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Note -->
    <div v-if="footer" class="text-xs text-gray-500 dark:text-gray-500 mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
      {{ footer }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  icon: string
  backgroundColor: string
  currentValue: string
  previousValue: string
  unit?: string
  period?: string
  footer?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  period: 'Current vs Previous',
  footer: ''
})

const trendPercentage = computed(() => {
  const current = parseFloat(props.currentValue.replace(/[^0-9.-]/g, ''))
  const previous = parseFloat(props.previousValue.replace(/[^0-9.-]/g, ''))

  if (previous === 0) return 0
  return Math.abs(((current - previous) / previous) * 100).toFixed(1)
})

const isPositive = computed(() => {
  const current = parseFloat(props.currentValue.replace(/[^0-9.-]/g, ''))
  const previous = parseFloat(props.previousValue.replace(/[^0-9.-]/g, ''))
  return current >= previous
})

const trendIcon = computed(() => {
  return isPositive.value ? 'trending_up' : 'trending_down'
})

const trendClass = computed(() => {
  return isPositive.value
    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
})

const badge = computed(() => {
  if (Math.abs(Number(trendPercentage.value)) < 5) {
    return 'Stable'
  }
  return isPositive.value ? 'Increased' : 'Decreased'
})

const badgeIcon = computed(() => {
  if (Math.abs(Number(trendPercentage.value)) < 5) {
    return 'equal'
  }
  return isPositive.value ? 'arrow_upward' : 'arrow_downward'
})

const badgeClass = computed(() => {
  if (Math.abs(Number(trendPercentage.value)) < 5) {
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }
  return isPositive.value
    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400'
})
</script>
