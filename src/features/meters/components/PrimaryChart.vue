<template>
  <div class="w-full h-full flex items-center justify-center">
    <div v-if="loading" class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
      <p class="text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
    </div>
    <div v-else-if="meters.length === 0" class="text-center text-slate-500 dark:text-slate-400">
      <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">show_chart</span>
      <p>{{ $t('globalMeters.selectMetersToVisualize') }}</p>
    </div>
    <div v-else class="text-center">
      <!-- Chart implementation would go here -->
      <!-- For now, showing placeholder -->
      <svg class="w-full h-full max-h-96" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid Lines -->
        <line x1="60" y1="250" x2="750" y2="250" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-700" />
        <line x1="60" y1="200" x2="750" y2="200" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-700" opacity="0.5" />
        <line x1="60" y1="150" x2="750" y2="150" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-700" opacity="0.5" />
        <line x1="60" y1="100" x2="750" y2="100" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-700" opacity="0.5" />
        <line x1="60" y1="50" x2="750" y2="50" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-700" opacity="0.5" />

        <!-- Y-Axis Labels -->
        <text x="45" y="255" font-size="12" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">0</text>
        <text x="45" y="205" font-size="12" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">25</text>
        <text x="45" y="155" font-size="12" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">50</text>
        <text x="45" y="105" font-size="12" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">75</text>
        <text x="45" y="55" font-size="12" text-anchor="end" class="fill-slate-500 dark:fill-slate-400">100</text>

        <!-- Sample line for each meter -->
        <polyline
          v-for="(meter, index) in meters.slice(0, 3)"
          :key="meter.id"
          :points="`60,150 150,120 240,100 330,110 420,90 510,100 600,80 690,120 750,100`"
          fill="none"
          :stroke="getMeterColor(index)"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />

        <!-- Legend -->
        <g v-for="(meter, index) in meters.slice(0, 3)" :key="`legend-${meter.id}`">
          <rect :x="70 + index * 200" :y="10" width="12" height="12" :fill="getMeterColor(index)" />
          <text :x="90 + index * 200" :y="20" font-size="12" class="fill-slate-700 dark:fill-slate-300">{{ meter.name }}</text>
        </g>
      </svg>

      <div class="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <p>{{ metricType === 'power' ? $t('globalMeters.power') : $t('globalMeters.energy') }} - Last {{ timeRange }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  meters: any[]
  metricType: 'power' | 'energy'
  timeRange: string
  loading: boolean
}>()

const getMeterColor = (index: number) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  return colors[index % colors.length]
}
</script>
