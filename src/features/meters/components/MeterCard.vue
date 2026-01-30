<template>
  <div
    :class="[
      'rounded-lg border-l-4 transition-all duration-200 cursor-pointer p-4 bg-white dark:bg-slate-800 border-t border-r border-b border-slate-200 dark:border-slate-700',
      isSelected
        ? 'shadow-lg shadow-slate-500/20'
        : 'hover:shadow-md'
    ]"
    :style="meter.color ? { borderLeftColor: meter.color } : {}"
    @click="emit('toggle-select', meter.id)"
  >
    <!-- Header: Name & Status -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-gray-900 dark:text-white truncate">{{ meter.name }}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ meter.location || meter.id }}</p>
      </div>
      <div class="flex-shrink-0 ml-2">
        <span :class="[
          'inline-flex h-2.5 w-2.5 rounded-full',
          meter.status === 'online'
            ? 'bg-green-500'
            : meter.status === 'offline'
            ? 'bg-gray-400'
            : 'bg-red-500'
        ]"></span>
      </div>
    </div>

    <!-- Primary Metric: Current Power -->
    <div class="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
      <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{{ $t('globalMeters.currentPower') }}</div>
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ meter.currentPower ? meter.currentPower.toFixed(2) : '--' }}
        </span>
        <span class="text-sm text-slate-500 dark:text-slate-400">kW</span>
      </div>
      <div :class="[
        'text-xs mt-1 font-semibold',
        getPowerTrendColor
      ]">
        {{ getPowerTrendIcon }} {{ getPowerTrendText }}
      </div>
    </div>

    <!-- Consumption Comparison: Today vs Yesterday (IMPORTANT) -->
    <div class="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
      <div class="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold uppercase tracking-wide">{{ $t('globalMeters.dailyComparison') }}</div>
      <div class="grid grid-cols-2 gap-3">
        <!-- Today -->
        <div class="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{{ $t('globalMeters.today') }}</div>
          <div class="font-bold text-gray-900 dark:text-white text-sm">{{ meter.todayConsumption?.toFixed(1) || '--' }} <span class="text-xs text-slate-500">kWh</span></div>
        </div>
        <!-- Yesterday -->
        <div class="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{{ $t('globalMeters.yesterday') }}</div>
          <div class="font-bold text-gray-900 dark:text-white text-sm">{{ meter.yesterdayConsumption?.toFixed(1) || '--' }} <span class="text-xs text-slate-500">kWh</span></div>
        </div>
      </div>
      <!-- Delta Indicator -->
      <div v-if="meter.todayConsumption && meter.yesterdayConsumption" class="mt-2 text-xs">
        <span :class="getDeltaColor">
          {{ getDeltaIcon }} {{ getDeltaText }}
        </span>
      </div>
    </div>

    <!-- Secondary Metrics (Compact) -->
    <div class="grid grid-cols-3 gap-2">
      <!-- Voltage -->
      <div class="rounded-lg bg-slate-50 dark:bg-slate-900 p-2">
        <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ $t('globalMeters.voltage') }}</div>
        <div class="font-semibold text-gray-900 dark:text-white text-xs">{{ meter.voltage ? meter.voltage.toFixed(0) : '--' }} <span class="text-[9px] text-slate-500">V</span></div>
      </div>
      <!-- Current -->
      <div class="rounded-lg bg-slate-50 dark:bg-slate-900 p-2">
        <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ $t('globalMeters.current') }}</div>
        <div class="font-semibold text-gray-900 dark:text-white text-xs">{{ meter.current ? meter.current.toFixed(1) : '--' }} <span class="text-[9px] text-slate-500">A</span></div>
      </div>
      <!-- Power Factor -->
      <div class="rounded-lg bg-slate-50 dark:bg-slate-900 p-2">
        <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ $t('globalMeters.powerFactor') }}</div>
        <div class="font-semibold text-gray-900 dark:text-white text-xs">{{ meter.powerFactor ? meter.powerFactor.toFixed(2) : '--' }}</div>
      </div>
    </div>

    <!-- Selection Checkbox (Visual Feedback) -->
    <div v-if="isSelected" class="mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold">
      <span class="material-symbols-outlined text-lg">check_circle</span>
      {{ $t('globalMeters.selected') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Meter {
  id: string
  name: string
  location?: string
  status: 'online' | 'offline' | 'alert'
  currentPower: number
  todayConsumption: number
  yesterdayConsumption: number
  voltage: number
  current: number
  powerFactor: number
  trend?: number // percentage change
  color?: string // Hex color
  colorTailwind?: string // Tailwind color name
}

interface Props {
  meter: Meter
  isSelected: boolean
}

interface Emit {
  (e: 'toggle-select', meterId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { t } = useI18n()

const getPowerTrendColor = computed(() => {
  if (!props.meter.trend) return 'text-slate-500'
  return props.meter.trend > 0 ? 'text-red-500' : 'text-green-500'
})

const getPowerTrendIcon = computed(() => {
  if (!props.meter.trend) return '→'
  return props.meter.trend > 0 ? '↑' : '↓'
})

const getPowerTrendText = computed(() => {
  if (!props.meter.trend) return t('globalMeters.stable')
  const abs = Math.abs(props.meter.trend)
  return `${props.meter.trend > 0 ? t('globalMeters.increasing') : t('globalMeters.decreasing')} (${abs.toFixed(1)}%)`
})

const getDeltaColor = computed(() => {
  const delta = props.meter.todayConsumption - props.meter.yesterdayConsumption
  if (delta > 0) return 'text-red-600 dark:text-red-400 font-semibold'
  if (delta < 0) return 'text-green-600 dark:text-green-400 font-semibold'
  return 'text-slate-600 dark:text-slate-400'
})

const getDeltaIcon = computed(() => {
  const delta = props.meter.todayConsumption - props.meter.yesterdayConsumption
  if (delta > 0) return '↑'
  if (delta < 0) return '↓'
  return '→'
})

const getDeltaText = computed(() => {
  const delta = props.meter.todayConsumption - props.meter.yesterdayConsumption
  const absDelta = Math.abs(delta)
  const percent = props.meter.yesterdayConsumption > 0
    ? ((absDelta / props.meter.yesterdayConsumption) * 100).toFixed(1)
    : '0.0'

  if (delta > 0) return `${t('globalMeters.consumptionUp')} ${absDelta.toFixed(1)} kWh (${percent}%)`
  if (delta < 0) return `${t('globalMeters.consumptionDown')} ${absDelta.toFixed(1)} kWh (${percent}%)`
  return t('globalMeters.sameAsYesterday')
})
</script>
