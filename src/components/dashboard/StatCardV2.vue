/**
 * StatCardV2 - Refactored metric card using widget registry system
 *
 * Displays a single KPI metric with optional trend indicator.
 * Uses BaseWidget for consistent loading/error states.
 * Data transformations handled via registry configuration.
 *
 * Props:
 * - widgetId: Registry configuration ID (e.g., 'kpi-active-power')
 * - deviceUUID: Device identifier
 * - label: Display label
 * - icon: Material icon name
 * - unit: Display unit (kW, kWh, A, etc.)
 * - showTrend: Show trend indicator (default: true)
 */

<template>
  <div class="flex flex-col gap-1 rounded-xl bg-white dark:bg-[#1c2534] p-5 border border-gray-200 dark:border-[#2a3649] shadow-sm relative overflow-hidden group">
    <!-- Decorative floating circle (Stitch pattern) -->
    <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>

    <!-- Header: Label and Icon -->
    <div class="flex items-center justify-between z-10">
      <p class="text-gray-600 dark:text-text-muted text-sm font-medium">{{ label }}</p>
      <span class="material-symbols-outlined text-gray-600 dark:text-text-muted">{{ icon }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-end gap-3 mt-2 z-10">
      <div class="h-8 w-24 bg-gray-200 dark:bg-[#2a3649] rounded-lg animate-pulse"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-end gap-3 mt-2 z-10">
      <p class="text-red-500 text-sm">{{ $t('common.error') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasData" class="flex items-end gap-3 mt-2 z-10">
      <p class="text-gray-400 text-sm">{{ $t('common.noData') }}</p>
    </div>

    <!-- Value Display -->
    <div v-else class="flex items-end gap-3 mt-2 z-10">
      <p class="text-gray-900 dark:text-white text-3xl font-bold font-mono tracking-tight">
        {{ formattedValue }}
      </p>
      <div
        v-if="showTrend && trend !== undefined"
        :class="[
          'flex items-center gap-1 mb-1 rounded-full px-2 py-0.5',
          trend >= 0
            ? 'bg-green-500/10 text-green-500'
            : 'bg-red-500/10 text-red-500'
        ]"
      >
        <span class="material-symbols-outlined text-sm">
          {{ trend >= 0 ? 'trending_up' : 'trending_down' }}
        </span>
        <p class="text-xs font-bold">{{ Math.abs(trend) }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWidgetData } from '@/composables/useWidgetData'
import { getWidgetConfig } from '@/config/widgetRegistry'
import type { WidgetConfig } from '@/types/widgetRegistry'

interface Props {
  widgetId: string
  deviceUUID: string
  label: string
  icon: string
  unit?: string
  showTrend?: boolean
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  showTrend: true,
  decimals: 1
})

// Get widget configuration from registry
const widgetConfig = computed<WidgetConfig>(() => {
  const config = getWidgetConfig(props.widgetId)
  if (!config) {
    throw new Error(`Widget configuration not found: ${props.widgetId}`)
  }
  return config
})

// Fetch widget data using composable
const {
  data,
  loading: isLoading,
  error,
  hasData,
  getRequirementData
} = useWidgetData({
  widget: widgetConfig,
  deviceUUID: computed(() => props.deviceUUID || ''),
  context: computed(() => ({
    unit: props.unit,
    decimals: props.decimals
  })),
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  immediate: true
})

// Extract and format the main value
const currentValue = computed(() => {
  if (!hasData.value) return 0
  return getRequirementData('currentValue') || 0
})

const formattedValue = computed(() => {
  const num = Number(currentValue.value)
  if (isNaN(num)) return '0'

  const formatted = num.toFixed(props.decimals)
  return `${formatted} ${props.unit}`.trim()
})

// Calculate trend (if previous value available)
const trend = computed(() => {
  if (!hasData.value) return undefined

  const current = getRequirementData('currentValue') || 0
  const previous = getRequirementData('previousValue')

  if (previous === undefined || previous === 0) return undefined

  const percentChange = ((current - previous) / Math.abs(previous)) * 100
  return Math.round(percentChange)
})
</script>

<style scoped>
/* Smooth transitions for loading/error states */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
