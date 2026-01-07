<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Voltage</h3>
      <div :class="statusBadge" class="px-2 py-1 rounded text-xs font-medium">
        {{ status }}
      </div>
    </div>

    <div class="relative h-48">
      <div class="flex items-center justify-center h-full">
        <div class="w-full max-w-xs">
          <!-- Voltage Range Indicator -->
          <div class="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="absolute inset-0 flex">
              <div class="w-1/6 bg-red-500/30"></div>
              <div class="w-2/3 bg-green-500/30"></div>
              <div class="w-1/6 bg-red-500/30"></div>
            </div>
            <div
              class="absolute top-0 bottom-0 w-1 bg-gray-900 dark:bg-white transition-all duration-300"
              :style="{ left: `${indicatorPosition}%` }"
            >
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                {{ formattedValue }} V
              </div>
            </div>
          </div>

          <!-- Scale Labels -->
          <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ min }}V</span>
            <span>{{ nominal }}V</span>
            <span>{{ max }}V</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 text-center">
      <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Volts</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Range: {{ min }}V - {{ max }}V
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  nominal?: number
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  nominal: 230,
  min: 207,
  max: 253,
})

const formattedValue = computed(() => props.value.toFixed(1))

const status = computed(() => {
  const deviation = Math.abs(props.value - props.nominal) / props.nominal
  if (deviation < 0.05) return 'Normal'
  if (deviation < 0.1) return 'Warning'
  return 'Critical'
})

const statusBadge = computed(() => {
  const deviation = Math.abs(props.value - props.nominal) / props.nominal
  if (deviation < 0.05) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (deviation < 0.1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
})

const indicatorPosition = computed(() => {
  const range = props.max - props.min
  const position = ((props.value - props.min) / range) * 100
  return Math.max(0, Math.min(100, position))
})
</script>
