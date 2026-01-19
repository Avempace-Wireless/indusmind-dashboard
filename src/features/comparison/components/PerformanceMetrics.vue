<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ subtitle }}</p>
      </div>
      <slot name="actions"></slot>
    </div>

    <!-- Metrics Grid -->
    <div :class="['grid gap-4', gridClass]">
      <div v-for="metric in metrics" :key="metric.key" class="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 hover:shadow-md transition-shadow">
        <!-- Metric Header -->
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{{ metric.label }}</p>
          <span v-if="metric.badge" :class="['text-xs font-semibold px-2 py-1 rounded-full', badgeClass(metric.badge)]">
            {{ metric.badge }}
          </span>
        </div>

        <!-- Value -->
        <p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ metric.value }}</p>

        <!-- Change/Trend -->
        <div v-if="metric.change" class="flex items-center gap-2 text-sm">
          <span :class="['material-symbols-outlined text-lg', metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
            {{ metric.change > 0 ? 'trending_up' : 'trending_down' }}
          </span>
          <span :class="['font-semibold', metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
            {{ metric.change > 0 ? '+' : '' }}{{ Math.abs(metric.change) }}%
          </span>
          <span class="text-gray-500 dark:text-gray-500">vs last period</span>
        </div>

        <!-- Target Indicator (Optional) -->
        <div v-if="metric.target" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-600 dark:text-gray-400">Target</span>
            <span class="text-xs font-medium text-gray-900 dark:text-white">{{ metric.target }}</span>
          </div>
          <!-- Progress Bar -->
          <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div :class="['h-full transition-all', progressColor(metric.progress)]" :style="{ width: progressWidth(metric.progress) }"></div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ metric.progress }}% achieved</p>
        </div>
      </div>
    </div>

    <!-- Footer Note -->
    <div v-if="footerNote" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
      <span class="material-symbols-outlined text-sm mr-2 align-middle">info</span>
      {{ footerNote }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Metric {
  key: string
  label: string
  value: string | number
  change?: number
  target?: string
  progress?: number
  badge?: string
}

interface Props {
  title: string
  subtitle?: string
  metrics: Metric[]
  footerNote?: string
  columns?: 'auto' | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  footerNote: '',
  columns: 3
})

const gridClass = computed(() => {
  const colsMap: Record<string, string> = {
    'auto': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-auto',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    '6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }
  return colsMap[String(props.columns)] || colsMap['3']
})

const badgeClass = (badge: string) => {
  const classes: Record<string, string> = {
    'Excellent': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400',
    'Good': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400',
    'Fair': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400',
    'Poor': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400',
    'Stable': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }
  return classes[badge] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
}

const progressColor = (progress?: number) => {
  if (!progress) return 'bg-gray-400'
  if (progress >= 100) return 'bg-green-500'
  if (progress >= 75) return 'bg-blue-500'
  if (progress >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const progressWidth = (progress?: number) => {
  if (!progress) return '0%'
  return Math.min(progress, 100) + '%'
}
</script>
