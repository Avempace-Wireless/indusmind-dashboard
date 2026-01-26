<template>
  <div
    class="group relative rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-default"
    :style="cardGradient"
  >
    <!-- Animated Background Gradient -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :style="hoverGradient"
    ></div>

    <!-- Content Container -->
    <div class="relative p-5 h-full flex flex-col justify-between z-10 backdrop-blur-sm">
      <!-- Header: Icon + Title -->
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
            {{ title }}
          </p>
        </div>
        <div
          class="ml-2 p-2 rounded-lg flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: `${meterColor}20` }"
        >
          <span class="material-symbols-outlined text-lg" :style="{ color: meterColor }">
            bolt
          </span>
        </div>
      </div>

      <!-- Main Value -->
      <div class="mb-3">
        <div class="flex items-baseline gap-1">
          <span
            v-if="value !== null && value !== undefined"
            class="text-2xl sm:text-3xl font-bold"
            :style="{ color: meterColor }"
          >
            {{ formattedValue }}
          </span>
          <span
            v-else
            class="text-2xl sm:text-3xl font-bold text-gray-400 dark:text-gray-600"
          >
            N/A
          </span>
          <span
            v-if="value !== null && value !== undefined"
            class="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            {{ unit }}
          </span>
        </div>
      </div>

      <!-- Footer: Meter Name -->
      <div class="pt-2 border-t" :style="{ borderColor: `${meterColor}40` }">
        <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ meterName }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | null
  unit: string
  meterName: string
  meterColor: string
}

const props = defineProps<Props>()

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return 'N/A'
  if (props.value === 0) return '0'
  return props.value.toFixed(1)
})

// Create gradient based on meter color
const cardGradient = computed(() => {
  const color = props.meterColor
  return {
    background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
    border: `2px solid ${color}30`,
  }
})

// Hover gradient effect
const hoverGradient = computed(() => {
  const color = props.meterColor
  return {
    background: `radial-gradient(circle at top right, ${color}20, transparent)`,
  }
})
</script>
