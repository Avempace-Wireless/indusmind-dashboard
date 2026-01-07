<template>
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
    <!-- Widget Header with color accent -->
    <div :class="[
      'px-4 py-3 border-b-2',
      colorClasses.border
    ]">
      <div class="flex items-center gap-2 mb-1">
        <span :class="['material-symbols-outlined text-xl', colorClasses.text]">bolt</span>
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">{{ compteur.name }} – {{ modeTitle }}</h3>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-400">{{ compteur.subtitle }}</p>
    </div>

    <!-- Mode Tabs -->
    <div class="flex gap-1 px-4 pt-3 border-b border-slate-200 dark:border-slate-700">
      <button
        v-for="mode in modes"
        :key="mode"
        @click="setMode(mode)"
        :class="[
          'flex-1 py-2 px-2 text-xs font-medium transition-colors rounded-t-md',
          currentMode === mode
            ? ['text-slate-900 dark:text-slate-100 border-b-2', colorClasses.border]
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        ]"
      >
        {{ modeLabels[mode] }}
      </button>
    </div>

    <!-- Single KPI Display -->
    <div class="px-4 py-6">
      <div class="flex items-baseline justify-between mb-3">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-400">{{ modeLabel }}</span>
        <span class="text-xs text-slate-500 dark:text-slate-500">{{ timestamp }}</span>
      </div>
      <div class="flex items-baseline gap-2 mb-3">
        <span :class="['text-4xl font-bold', currentMode === 'instantanée' ? colorClasses.text : 'text-slate-900 dark:text-slate-100']">
          {{ formatValue(currentValue) }}
        </span>
        <span class="text-base font-medium text-slate-600 dark:text-slate-400">{{ unitForMode }}</span>
      </div>

      <!-- Mini Charts -->
      <div class="mt-3">
        <!-- Bar Chart for Instantaneous (Recent readings) -->
        <div v-if="currentMode === 'instantanée'" class="space-y-1">
          <div class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-end gap-px px-1 relative group">
            <div
              v-for="(reading, index) in instantaneousReadings"
              :key="index"
              :class="['flex-1 rounded-t transition-opacity', colorClasses.bg, 'opacity-70 hover:opacity-100 cursor-pointer relative']"
              :style="{ height: `${reading.height}%` }"
              @mouseenter="showTooltip(reading, $event)"
              @mouseleave="hideTooltip"
            >
            </div>
            <!-- Tooltip -->
            <div
              v-if="tooltip.visible"
              class="absolute z-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
              :style="{ left: `${tooltip.x}px`, top: '-30px' }"
            >
              {{ tooltip.text }}
            </div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
            <span>-30min</span>
            <span>-15min</span>
            <span>Maintenant</span>
          </div>
        </div>

        <!-- Bar Chart for Today (Hourly) -->
        <div v-else-if="currentMode === 'jour'" class="space-y-1">
          <div class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-end gap-px px-1 relative group">
            <div
              v-for="(reading, index) in todayHourlyReadings"
              :key="index"
              :class="['flex-1 rounded-t transition-opacity', colorClasses.bg, 'opacity-70 hover:opacity-100 cursor-pointer']"
              :style="{ height: `${reading.height}%` }"
              @mouseenter="showTooltip(reading, $event)"
              @mouseleave="hideTooltip"
            ></div>
            <!-- Tooltip -->
            <div
              v-if="tooltip.visible"
              class="absolute z-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
              :style="{ left: `${tooltip.x}px`, top: '-30px' }"
            >
              {{ tooltip.text }}
            </div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>Maintenant</span>
          </div>
        </div>

        <!-- Bar Chart for Yesterday (Full Day) -->
        <div v-else-if="currentMode === 'hier'" class="space-y-1">
          <div class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-end gap-px px-1 relative group">
            <div
              v-for="(reading, index) in yesterdayHourlyReadings"
              :key="index"
              :class="['flex-1 rounded-t transition-opacity', colorClasses.bg, 'opacity-70 hover:opacity-100 cursor-pointer']"
              :style="{ height: `${reading.height}%` }"
              @mouseenter="showTooltip(reading, $event)"
              @mouseleave="hideTooltip"
            ></div>
            <!-- Tooltip -->
            <div
              v-if="tooltip.visible"
              class="absolute z-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
              :style="{ left: `${tooltip.x}px`, top: '-30px' }"
            >
              {{ tooltip.text }}
            </div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>24h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="absolute inset-0 rounded-lg bg-white/80 dark:bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
      <div class="animate-spin">
        <span class="material-symbols-outlined text-slate-500 dark:text-slate-300 text-3xl">sync</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Compteur, CompteurMode } from '@/composables/useCompteurSelection'

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  compteur: Compteur
  currentMode?: CompteurMode
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentMode: 'instantanée',
  isLoading: false,
})

const emit = defineEmits<{
  'update:mode': [mode: CompteurMode]
}>()

// ============================================================================
// CONSTANTS
// ============================================================================

const modes: CompteurMode[] = ['instantanée', 'jour', 'hier']

const modeLabels: Record<CompteurMode, string> = {
  instantanée: 'Instantané',
  jour: 'Aujourd\'hui',
  hier: 'Hier',
}

// ============================================================================
// STATE
// ============================================================================

const currentMode = ref<CompteurMode>(props.currentMode)

const tooltip = ref({
  visible: false,
  text: '',
  x: 0,
})

// ============================================================================
// COMPUTED
// ============================================================================

/**
 * Semantic color classes based on compteur color
 */
const colorClasses = computed(() => {
  const colorMap = {
    red: {
      border: 'border-red-500',
      text: 'text-red-600 dark:text-red-500',
      bg: 'bg-red-500',
    },
    green: {
      border: 'border-green-500',
      text: 'text-green-600 dark:text-green-500',
      bg: 'bg-green-500',
    },
    blue: {
      border: 'border-blue-500',
      text: 'text-blue-600 dark:text-blue-500',
      bg: 'bg-blue-500',
    },
    yellow: {
      border: 'border-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-500',
      bg: 'bg-yellow-500',
    },
  }

  return colorMap[props.compteur.color] || colorMap.blue
})

/**
 * Get current value based on mode
 */
const currentValue = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return props.compteur.instantaneous
    case 'jour':
      return props.compteur.today
    case 'hier':
      return props.compteur.yesterday
  }
})

/**
 * Get unit label based on mode
 */
const unitForMode = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return 'kW'
    case 'jour':
    case 'hier':
      return 'kWh'
  }
})

/**
 * Get mode title for header
 */
const modeTitle = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return 'Conso instantanée'
    case 'jour':
      return 'Conso du jour'
    case 'hier':
      return 'Conso d\'hier'
  }
})

/**
 * Get mode label for KPI section
 */
const modeLabel = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return 'Instantanée'
    case 'jour':
      return 'Conso du jour'
    case 'hier':
      return 'Conso d\'hier'
  }
})

/**
 * Get timestamp based on mode
 */
const timestamp = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return 'Maintenant'
    case 'jour':
      return '10m ago'
    case 'hier':
      return '1d ago'
  }
})

/**
 * Mock hourly data for today (24 bars)
 * Represents consumption distribution throughout the current day
 */
const todayHourlyReadings = computed(() => {
  const baseValue = props.compteur.today / 24 // Average per hour
  const pattern = [
    20, 15, 12, 10, 15, 25, // 0-5h (night/early morning)
    40, 55, 70, 80, 85, 90, // 6-11h (morning ramp-up)
    95, 90, 85, 88, 92, 87, // 12-17h (afternoon peak)
    75, 60, 45, 35, 30, 25  // 18-23h (evening decline)
  ]

  return pattern.map((height, index) => ({
    height,
    value: (baseValue * height / 50).toFixed(1), // Scale value based on height
    label: `${index}h`,
    text: `${index}h: ${(baseValue * height / 50).toFixed(1)} kWh`
  }))
})

/**
 * Mock hourly data for yesterday (24 bars)
 * Represents full day consumption pattern
 */
const yesterdayHourlyReadings = computed(() => {
  const baseValue = props.compteur.yesterday / 24 // Average per hour
  const pattern = [
    18, 14, 11, 12, 18, 28, // 0-5h
    45, 60, 75, 82, 88, 92, // 6-11h
    98, 93, 88, 85, 90, 84, // 12-17h
    70, 55, 40, 32, 28, 22  // 18-23h
  ]

  return pattern.map((height, index) => ({
    height,
    value: (baseValue * height / 50).toFixed(1),
    label: `${index}h`,
    text: `${index}h: ${(baseValue * height / 50).toFixed(1)} kWh`
  }))
})

/**
 * Mock instantaneous readings (last 30 minutes, every minute = 30 bars)
 * Shows recent power variations
 */
const instantaneousReadings = computed(() => {
  const baseValue = props.compteur.instantaneous
  // Generate 30 data points (1 per minute) with realistic variations
  const readings = []
  for (let i = 0; i < 30; i++) {
    const variation = Math.sin(i / 5) * 0.15 + (Math.random() - 0.5) * 0.1 // Natural wave + noise
    const value = baseValue * (1 + variation)
    const minutesAgo = 30 - i

    readings.push({
      height: 30 + (variation + 0.3) * 100, // Map to 0-100% range
      value: value.toFixed(1),
      label: `-${minutesAgo}min`,
      text: `-${minutesAgo}min: ${value.toFixed(1)} kW`
    })
  }
  return readings
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Show tooltip on bar hover
 */
function showTooltip(reading: { text: string }, event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const container = target.parentElement?.getBoundingClientRect()

  if (container) {
    tooltip.value = {
      visible: true,
      text: reading.text,
      x: rect.left - container.left + rect.width / 2 - 20, // Center tooltip
    }
  }
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  tooltip.value.visible = false
}

/**
 * Format value for display (1 decimal place)
 */
function formatValue(value: number): string {
  return value.toFixed(1)
}

/**
 * Set mode and emit update
 */
function setMode(mode: CompteurMode) {
  currentMode.value = mode
  emit('update:mode', mode)
}

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Watch for prop changes (if parent updates currentMode)
 */
watch(
  () => props.currentMode,
  (newMode) => {
    if (newMode) {
      currentMode.value = newMode
    }
  }
)
</script>

<style scoped>
/* Smooth transitions for mode switching */
.mode-indicator {
  transition: all 0.2s ease-in-out;
}

/* Sparkline animation (future enhancement) */
@keyframes shimmer {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.sparkline {
  animation: shimmer 2s ease-in-out infinite;
}
</style>
