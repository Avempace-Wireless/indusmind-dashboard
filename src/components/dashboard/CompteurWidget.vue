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
      <p class="text-xs text-slate-600 dark:text-slate-400">{{ translatedSubtitle }}</p>
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

    <!-- No Data Available State (API-only mode) -->
    <div v-if="showNoDataState" class="px-4 py-12 flex flex-col items-center justify-center text-center">
      <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-5xl mb-3">
        hourglass_empty
      </span>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
        {{ $t('common.noData') }}
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-500">
        {{ $t('common.noDataAvailable') }}
      </p>
    </div>

    <!-- Single KPI Display -->
    <div v-else class="px-4 py-6">
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
          <div v-if="instantaneousReadings.length === 0" class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ $t('common.noData') }}</span>
          </div>
          <div v-else class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-end gap-px px-1 relative group">
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
            <span>{{ $t('compteur.time.min30') }}</span>
            <span>{{ $t('compteur.time.min15') }}</span>
            <span>{{ $t('compteur.time.now') }}</span>
          </div>
        </div>

        <!-- Bar Chart for Today (Hourly) -->
        <div v-else-if="currentMode === 'jour'" class="space-y-1">
          <div v-if="todayHourlyReadings.length === 0" class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ $t('common.noData') }}</span>
          </div>
          <div v-else class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-end gap-px px-1 relative group">
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
            <span>{{ $t('compteur.time.h0') }}</span>
            <span>{{ $t('compteur.time.h6') }}</span>
            <span>{{ $t('compteur.time.h12') }}</span>
            <span>{{ $t('compteur.time.h18') }}</span>
            <span>{{ $t('compteur.time.now') }}</span>
          </div>
        </div>

        <!-- Bar Chart for Yesterday (Full Day) -->
        <div v-else-if="currentMode === 'hier'" class="space-y-1">
          <div v-if="yesterdayHourlyReadings.length === 0" class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
            <span class="text-xs text-slate-400 dark:text-slate-500">{{ $t('common.noData') }}</span>
          </div>
          <div v-else class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-end gap-px px-1 relative group">
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
            <span>{{ $t('compteur.time.h0') }}</span>
            <span>{{ $t('compteur.time.h6') }}</span>
            <span>{{ $t('compteur.time.h12') }}</span>
            <span>{{ $t('compteur.time.h18') }}</span>
            <span>{{ $t('compteur.time.h24') }}</span>
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
import { computed, ref, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Compteur, CompteurMode } from '@/composables/useCompteurSelection'
import { getMeterColorByIndex } from '@/utils/meterColors'
import { DEFAULT_WIDGET_CONFIG, getKeyConfig, formatTelemetryValue } from '@/config/telemetryConfig'
import { useApiOnly } from '@/config/dataMode'

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  compteur: Compteur
  currentMode?: CompteurMode
  isLoading?: boolean
  colorIndex?: number  // Index in selected meters array for color consistency
}

const props = withDefaults(defineProps<Props>(), {
  currentMode: 'instantanée',
  isLoading: false,
  colorIndex: 0,
})

const emit = defineEmits<{
  'update:mode': [mode: CompteurMode]
}>()

// ============================================================================
// CONSTANTS
// ============================================================================

const { t } = useI18n()

const modes: CompteurMode[] = ['instantanée', 'jour', 'hier']

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

const modeLabels = computed(() => ({
  instantanée: t('compteur.modes.instantaneousLabel'),
  jour: t('compteur.modes.daily'),
  hier: t('compteur.modes.yesterday'),
}))

const translatedSubtitle = computed(() => {
  const subtitleMap: Record<string, string> = {
    'Compresseurs industriels': t('equipment.compressorsIndustrial'),
    'Climatisation générale': t('equipment.climGeneral'),
    'Climatisation bureaux': t('equipment.climOffices'),
    'Éclairage général': t('equipment.lightingGeneral'),
    'Compresseur secondaire': t('equipment.compressorSecondary'),
  }
  return subtitleMap[props.compteur.subtitle] || props.compteur.subtitle
})

const colorClasses = computed(() => {
  // Use shared color utility for consistency with charts
  const colorConfig = getMeterColorByIndex(props.colorIndex)
  const tailwindColor = colorConfig.tailwind

  // Map to complete Tailwind class names (required for JIT compilation)
  const colorMap: Record<string, { border: string; text: string; bg: string }> = {
    red: { border: 'border-red-500', text: 'text-red-600 dark:text-red-500', bg: 'bg-red-500' },
    blue: { border: 'border-blue-500', text: 'text-blue-600 dark:text-blue-500', bg: 'bg-blue-500' },
    green: { border: 'border-green-500', text: 'text-green-600 dark:text-green-500', bg: 'bg-green-500' },
    amber: { border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-500', bg: 'bg-amber-500' },
    purple: { border: 'border-purple-500', text: 'text-purple-600 dark:text-purple-500', bg: 'bg-purple-500' },
    pink: { border: 'border-pink-500', text: 'text-pink-600 dark:text-pink-500', bg: 'bg-pink-500' },
    teal: { border: 'border-teal-500', text: 'text-teal-600 dark:text-teal-500', bg: 'bg-teal-500' },
    orange: { border: 'border-orange-500', text: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-500' },
    cyan: { border: 'border-cyan-500', text: 'text-cyan-600 dark:text-cyan-500', bg: 'bg-cyan-500' },
    violet: { border: 'border-violet-500', text: 'text-violet-600 dark:text-violet-500', bg: 'bg-violet-500' },
    lime: { border: 'border-lime-500', text: 'text-lime-600 dark:text-lime-500', bg: 'bg-lime-500' },
    rose: { border: 'border-rose-500', text: 'text-rose-600 dark:text-rose-500', bg: 'bg-rose-500' },
    indigo: { border: 'border-indigo-500', text: 'text-indigo-600 dark:text-indigo-500', bg: 'bg-indigo-500' },
    yellow: { border: 'border-yellow-500', text: 'text-yellow-600 dark:text-yellow-500', bg: 'bg-yellow-500' },
    emerald: { border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-500' },
  }

  return colorMap[tailwindColor] || colorMap.blue
})

/**
 * Check if should show "no data available" state
 * In API-only mode, show this when data is missing or API error occurred
 * Also handles undefined/null values gracefully
 */
const showNoDataState = computed(() => {
  // Check if compteur has an API error flag (set by DashboardView)
  if ((props.compteur as any).isApiError) {
    console.log('[CompteurWidget] Showing no-data state: API error flag detected')
    return true
  }
  
  // Check if explicitly marked as no data
  if ((props.compteur as any).hasData === false) {
    console.log('[CompteurWidget] Showing no-data state: hasData flag is false')
    return true
  }
  
  // In API-only mode, check if current mode has actual data
  if (useApiOnly()) {
    const currentVal = currentValue.value
    const hasData = currentVal !== null && currentVal !== undefined && currentVal > 0
    
    if (!hasData) {
      console.log('[CompteurWidget] Showing no-data state in API-only mode: no value for', currentMode.value, 'value:', currentVal)
      return true
    }
  }
  
  return false
})

/**
 * Get current value based on mode with null safety
 */
const currentValue = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return props.compteur.instantaneous ?? 0
    case 'jour':
      return props.compteur.today ?? 0
    case 'hier':
      return props.compteur.yesterday ?? 0
    default:
      return 0
  }
})

/**
 * Get key configuration based on current mode (DYNAMIC from telemetryConfig)
 */
const keyConfig = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return DEFAULT_WIDGET_CONFIG.instantaneous
    case 'jour':
      return DEFAULT_WIDGET_CONFIG.daily
    case 'hier':
      return DEFAULT_WIDGET_CONFIG.yesterday || DEFAULT_WIDGET_CONFIG.daily // Fallback to daily if no yesterday config
  }
})

/**
 * Get unit label based on mode (DYNAMIC from key config)
 */
const unitForMode = computed(() => {
  return keyConfig.value.unit
})

/**
 * Get mode title for header
 */
const modeTitle = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return t('compteur.modes.instantaneousConsumptionLabel')
    case 'jour':
      return t('compteur.modes.dailyConsumption')
    case 'hier':
      return t('compteur.modes.yesterdayConsumption')
  }
})

/**
 * Get mode label for KPI section
 */
const modeLabel = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return t('compteur.modes.instantaneousLabel')
    case 'jour':
      return t('compteur.modes.dailyConsumption')
    case 'hier':
      return t('compteur.modes.yesterdayConsumption')
  }
})

/**
 * Get timestamp based on mode
 */
const timestamp = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return t('compteur.time.now')
    case 'jour':
      return '10m ago'
    case 'hier':
      return '1d ago'
  }
})

/**
 * Mock hourly data for today (24 bars)
 * Represents consumption distribution throughout the current day
 * Returns empty array if no data available
 */
const todayHourlyReadings = computed(() => {
  const todayValue = props.compteur.today ?? 0
  if (todayValue === 0) return []
  
  const baseValue = todayValue / 24 // Average per hour
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
 * Returns empty array if no data available
 */
const yesterdayHourlyReadings = computed(() => {
  const yesterdayValue = props.compteur.yesterday ?? 0
  if (yesterdayValue === 0) return []
  
  const baseValue = yesterdayValue / 24 // Average per hour
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
 * Returns empty array if no data available
 */
const instantaneousReadings = computed(() => {
  const instantValue = props.compteur.instantaneous ?? 0
  if (instantValue === 0) return []
  
  const baseValue = instantValue
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
 * Format value for display using dynamic key config
 * Handles null/undefined values gracefully
 */
function formatValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '0'
  }
  return formatTelemetryValue(value, keyConfig.value)
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
