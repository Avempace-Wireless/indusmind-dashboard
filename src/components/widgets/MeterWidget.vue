/**
 * MeterWidget - New simplified meter widget using widget registry system
 *
 * This is a demonstration of the new architecture.
 * Uses BaseWidget, useWidgetData, and TelemetryTransformers.
 */

<template>
  <BaseWidget
    :widget="widgetConfig"
    :device-u-u-i-d="deviceUUID"
    :context="widgetContext"
    :title="title || compteur.name"
    :icon="icon"
    :show-header="showHeader"
    :show-refresh="showRefresh"
    :custom-class="colorClasses.widget"
  >
    <template #default="{ data, loading }">
      <div class="meter-widget-content">
        <!-- Mode Tabs -->
        <div class="mode-tabs">
          <button
            v-for="mode in availableModes"
            :key="mode"
            @click="currentMode = mode"
            :class="['mode-tab', { active: currentMode === mode }, colorClasses.activeTab]"
          >
            {{ modeLabels[mode] }}
          </button>
        </div>

        <!-- Current Value Display -->
        <div class="value-display">
          <div class="value-header">
            <span class="value-label">{{ modeLabel }}</span>
            <span class="value-timestamp">{{ formatTimestamp(currentTimestamp) }}</span>
          </div>

          <div class="value-main">
            <span :class="['value-number', colorClasses.text]">
              {{ formatValue(currentDisplayValue) }}
            </span>
            <span class="value-unit">{{ currentUnit }}</span>
          </div>
        </div>

        <!-- Mini Chart -->
        <div class="mini-chart">
          <div v-if="!chartData || chartData.length === 0" class="chart-empty">
            <span>{{ $t('common.noData') }}</span>
          </div>
          <div v-else class="chart-bars">
            <div
              v-for="(bar, index) in chartData"
              :key="index"
              :class="['chart-bar', colorClasses.chartBar]"
              :style="{ height: `${bar.height}%` }"
              :title="`${bar.label}: ${bar.value}`"
            >
            </div>
          </div>
          <div v-if="chartData && chartData.length > 0" class="chart-labels">
            <span>{{ chartLabels.start }}</span>
            <span>{{ chartLabels.middle }}</span>
            <span>{{ chartLabels.end }}</span>
          </div>
        </div>
      </div>
    </template>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseWidget from '@/components/widgets/BaseWidget.vue'
import { getWidgetConfig } from '@/config/widgetRegistry'
import type { TransformContext } from '@/types/widgetRegistry'

interface Props {
  /** Meter information */
  compteur: {
    id: string
    name: string
    deviceUUID: string
  }

  /** Initial mode */
  initialMode?: 'instantanée' | 'jour' | 'hier'

  /** Color index for theming */
  colorIndex?: number

  /** Custom title */
  title?: string

  /** Custom icon */
  icon?: string

  /** Show widget header */
  showHeader?: boolean

  /** Show refresh button */
  showRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialMode: 'instantanée',
  colorIndex: 0,
  showHeader: true,
  showRefresh: true
})

// Current display mode
const currentMode = ref<'instantanée' | 'jour' | 'hier'>(props.initialMode)

// Available modes
const availableModes = ['instantanée', 'jour', 'hier'] as const

// Mode labels
const modeLabels = {
  'instantanée': 'Instantané',
  'jour': 'Aujourd\'hui',
  'hier': 'Hier'
}

// Color classes based on color index
const colorClasses = computed(() => {
  const colors = [
    {
      text: 'text-blue-600',
      bg: 'bg-blue-600',
      border: 'border-blue-600',
      chartBar: 'bg-blue-500',
      activeTab: 'border-b-2 border-blue-600',
      widget: 'meter-widget-blue'
    },
    {
      text: 'text-emerald-600',
      bg: 'bg-emerald-600',
      border: 'border-emerald-600',
      chartBar: 'bg-emerald-500',
      activeTab: 'border-b-2 border-emerald-600',
      widget: 'meter-widget-emerald'
    },
    {
      text: 'text-amber-600',
      bg: 'bg-amber-600',
      border: 'border-amber-600',
      chartBar: 'bg-amber-500',
      activeTab: 'border-b-2 border-amber-600',
      widget: 'meter-widget-amber'
    },
    {
      text: 'text-violet-600',
      bg: 'bg-violet-600',
      border: 'border-violet-600',
      chartBar: 'bg-violet-500',
      activeTab: 'border-b-2 border-violet-600',
      widget: 'meter-widget-violet'
    }
  ]

  return colors[props.colorIndex % colors.length]
})

// Widget configuration based on mode
const widgetConfig = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return getWidgetConfig('meter-instant-power')!
    case 'jour':
      return getWidgetConfig('meter-today-energy')!
    case 'hier':
      return getWidgetConfig('meter-yesterday-energy')!
    default:
      return getWidgetConfig('meter-instant-power')!
  }
})

// Device UUID
const deviceUUID = computed(() => props.compteur.deviceUUID)

// Widget context
const widgetContext = computed<TransformContext>(() => ({
  device: {
    uuid: props.compteur.deviceUUID,
    name: props.compteur.name
  }
}))

// Mode-specific computed properties
const modeLabel = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return 'Puissance Actuelle'
    case 'jour':
      return 'Énergie Aujourd\'hui'
    case 'hier':
      return 'Énergie Hier'
    default:
      return ''
  }
})

const currentUnit = computed(() => {
  return currentMode.value === 'instantanée' ? 'kW' : 'kWh'
})

// These would come from the widget data in practice
const currentDisplayValue = ref(0)
const currentTimestamp = ref(Date.now())
const chartData = ref<Array<{ height: number; value: string; label: string }>>([])

const chartLabels = computed(() => {
  switch (currentMode.value) {
    case 'instantanée':
      return { start: '-30 min', middle: '-15 min', end: 'Maintenant' }
    case 'jour':
    case 'hier':
      return { start: '0h', middle: '12h', end: '23h' }
    default:
      return { start: '', middle: '', end: '' }
  }
})

// Format value for display
const formatValue = (value: number): string => {
  const decimals = currentMode.value === 'instantanée' ? 1 : 2
  return value.toFixed(decimals)
}

// Format timestamp
const formatTimestamp = (ts: number): string => {
  const date = new Date(ts)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Watch for widget data changes
// In a real implementation, this would be handled by BaseWidget
// and the data would be passed through the slot
</script>

<style scoped>
.meter-widget-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
  margin: -1.25rem -1.25rem 0;
  padding: 0 1.25rem;
}

.mode-tab {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab:hover {
  color: #111827;
}

.mode-tab.active {
  color: #111827;
  font-weight: 600;
}

.value-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.value-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.value-timestamp {
  font-size: 0.75rem;
  color: #9ca3af;
}

.value-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.value-number {
  font-size: 2.25rem;
  font-weight: 700;
}

.value-unit {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
}

.mini-chart {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.chart-empty {
  height: 3rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.chart-bars {
  height: 3rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  display: flex;
  align-items: flex-end;
  gap: 1px;
  padding: 0.25rem;
}

.chart-bar {
  flex: 1;
  min-height: 2px;
  border-radius: 0.125rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 1;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: #9ca3af;
  padding: 0 0.25rem;
}
</style>
