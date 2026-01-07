<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Power Factor</h3>
      <div :class="qualityBadge" class="px-2 py-1 rounded text-xs font-medium">
        {{ quality }}
      </div>
    </div>

    <div class="flex items-center justify-center h-48">
      <div class="relative">
        <svg class="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            :class="bgClass"
            stroke-width="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            :stroke="strokeColor"
            stroke-width="12"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 text-center">
      <p class="text-xs text-gray-400 dark:text-gray-500">
        Target: ≥ 0.95 • Industry Standard: 0.85-0.95
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
})

const formattedValue = computed(() => props.value.toFixed(3))

const quality = computed(() => {
  if (props.value >= 0.95) return 'Excellent'
  if (props.value >= 0.85) return 'Good'
  if (props.value >= 0.75) return 'Fair'
  return 'Poor'
})

const qualityBadge = computed(() => {
  if (props.value >= 0.95) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (props.value >= 0.85) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  if (props.value >= 0.75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
})

const strokeColor = computed(() => {
  if (props.value >= 0.95) return '#10b981'
  if (props.value >= 0.85) return '#135bec'
  if (props.value >= 0.75) return '#f59e0b'
  return '#ef4444'
})

const bgClass = computed(() => 'text-gray-200 dark:text-gray-700')

const circumference = 2 * Math.PI * 70
const dashOffset = computed(() => circumference - (props.value * circumference))
</script>
