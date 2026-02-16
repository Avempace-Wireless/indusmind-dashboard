<template>
  <div class="w-full h-full flex items-center justify-center">
    <div v-if="loading" class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
      <p class="text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
    </div>
    <div v-else-if="meters.length === 0" class="text-center text-slate-500 dark:text-slate-400">
      <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">bar_chart</span>
      <p>{{ $t('globalMeters.selectMetersToCompare') }}</p>
    </div>
    <div v-else class="text-center">
      <!-- Bar Chart Implementation -->
      <svg class="w-full h-full max-h-80" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid Lines -->
        <line x1="80" y1="250" x2="750" y2="250" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-700" />

        <!-- Bars (sorted by power descending) -->
        <g v-for="(meter, index) in sortedMeters" :key="meter.id">
          <!-- Bar -->
          <rect
            :x="80 + index * 220"
            :y="250 - (meter.currentPower / 100) * 200"
            width="150"
            :height="Math.max(1, (meter.currentPower / 100) * 200)"
            :fill="getMeterColor(index)"
            class="transition-all duration-200 hover:opacity-80"
            @mouseover="hoveredMeterId = meter.id"
            @mouseleave="hoveredMeterId = null"
          />

          <!-- Meter Label -->
          <text
            :x="80 + index * 220 + 75"
            :y="270"
            font-size="12"
            text-anchor="middle"
            class="fill-slate-700 dark:fill-slate-300 font-semibold"
          >
            {{ meter.name.substring(0, 8) }}
          </text>

          <!-- Value on top of bar -->
          <text
            :x="80 + index * 220 + 75"
            :y="240 - (meter.currentPower / 100) * 200"
            font-size="11"
            text-anchor="middle"
            class="fill-gray-900 dark:fill-white font-bold"
          >
            {{ meter.currentPower.toFixed(1) }} kW
          </text>
        </g>

        <!-- Y-Axis Labels -->
        <text x="70" y="255" font-size="11" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">0</text>
        <text x="70" y="205" font-size="11" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">25</text>
        <text x="70" y="155" font-size="11" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">50</text>
        <text x="70" y="105" font-size="11" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">75</text>
        <text x="70" y="55" font-size="11" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">100</text>
      </svg>

      <div class="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <p>{{ $t('globalMeters.instantaneousPower') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getMeterOrderRank } from '@/utils/meterColors'

const props = defineProps<{
  meters: any[]
  loading: boolean
}>()

const hoveredMeterId = ref<string | null>(null)

const sortedMeters = computed(() => {
  return [...props.meters].sort((a, b) => {
    const rankDiff = getMeterOrderRank(a.name) - getMeterOrderRank(b.name)
    if (rankDiff !== 0) return rankDiff
    return b.currentPower - a.currentPower
  })
})

const getMeterColor = (index: number) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  return colors[index % colors.length]
}
</script>
