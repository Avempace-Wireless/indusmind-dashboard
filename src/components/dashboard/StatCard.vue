<template>
  <div class="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#1c2534] p-5 border border-gray-200 dark:border-[#2a3649] shadow-sm relative overflow-hidden group">
    <!-- Decorative floating circle (Stitch pattern) -->
    <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>

    <!-- Header: Label and Icon -->
    <div class="flex items-center justify-between z-10">
      <p class="text-gray-600 dark:text-text-muted text-sm font-medium">{{ label }}</p>
      <span class="material-symbols-outlined text-gray-600 dark:text-text-muted">{{ icon }}</span>
    </div>

    <!-- Main Value and Trend -->
    <div class="flex items-end gap-3 mt-2 z-10">
      <p class="text-gray-900 dark:text-white text-3xl font-bold font-mono tracking-tight">{{ formattedValue }}</p>
      <div v-if="showTrend" :class="[
        'flex items-center gap-1 mb-1 rounded-full px-2 py-0.5',
        trendUp
          ? 'bg-green-500/10 text-green-500'
          : 'bg-red-500/10 text-red-500'
      ]">
        <span class="material-symbols-outlined text-sm">
          {{ trendUp ? 'trending_up' : 'trending_down' }}
        </span>
        <p class="text-xs font-bold">{{ Math.abs(trend) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: number | string
  unit?: string
  icon: string
  trend?: number
  showTrend?: boolean
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  trend: 0,
  showTrend: true,
  decimals: 1
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value

  const num = Number(props.value)
  if (isNaN(num)) return '0'

  const formatted = num.toFixed(props.decimals)
  return `${formatted} ${props.unit}`.trim()
})

const trendUp = computed(() => props.trend >= 0)
</script>
