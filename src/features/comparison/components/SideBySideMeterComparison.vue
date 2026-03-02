<template>
  <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 overflow-hidden">
    <!-- Header -->
    <div v-if="!isLoading" class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('comparison.sideBySide.title') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ t('comparison.sideBySide.subtitle', {
            meterCount: visibleMeters.length,
            granularity: granularityLabel
          }) }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ timePeriodsCount }} {{ t('comparison.sideBySide.periods') }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-96">
      <div class="flex flex-col items-center gap-3">
        <div class="animate-spin rounded-full h-10 w-10 border-3 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
        <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- Main Comparison Grid -->
    <div v-else class="overflow-x-auto">
      <!-- Column Headers (Meters) -->
      <div class="flex gap-4 pb-4">
        <!-- Row Labels Column -->
        <div class="flex-shrink-0 w-32">
          <div class="px-3 py-2">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t('comparison.sideBySide.timeLabel') }}
            </p>
          </div>
        </div>

        <!-- Meter Columns -->
        <div v-for="meter in visibleMeters" :key="meter.id" class="flex-shrink-0 w-56">
          <div class="px-4 py-3 rounded-lg border-2 transition-colors" :style="{
            borderColor: getMeterColor(meter.id),
            backgroundColor: getMeterColor(meter.id) + '08'
          }">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getMeterColor(meter.id) }"></div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ meter.name }}</p>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ meter.totalConsumption.toFixed(2) }} kWh</p>
          </div>
        </div>
      </div>

      <!-- Time Period Rows -->
      <div class="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div v-if="alignedData.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p class="text-sm">{{ t('comparison.empty.description') }}</p>
        </div>

        <div
          v-for="(row, rowIdx) in alignedData"
          :key="row.period"
          class="flex gap-4 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <!-- Time Label -->
          <div class="flex-shrink-0 w-32">
            <div class="px-3 py-3">
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ row.periodLabel }}</p>
            </div>
          </div>

          <!-- Meter Data Cells -->
          <div v-for="meter in visibleMeters" :key="`${meter.id}-${row.period}`" class="flex-shrink-0 w-56">
            <div class="px-4 py-3 rounded-lg border transition-colors" :style="{
              borderColor: (row.meterValues[meter.id]?.value ?? 0) > avgConsumption ? '#ef4444' + '40' : '#10b981' + '40',
              backgroundColor: (row.meterValues[meter.id]?.value ?? 0) > avgConsumption ? '#ef4444' + '08' : '#10b981' + '08'
            }">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ (row.meterValues[meter.id]?.value ?? 0).toFixed(2) }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">kWh</p>
                </div>
                <!-- Variance Indicator -->
                <div v-if="row.meterValues[meter.id]?.variance !== undefined" class="text-right">
                  <span :class="{
                    'text-green-600 dark:text-green-400': row.meterValues[meter.id].variance < -5,
                    'text-gray-600 dark:text-gray-400': row.meterValues[meter.id].variance >= -5 && row.meterValues[meter.id].variance <= 5,
                    'text-red-600 dark:text-red-400': row.meterValues[meter.id].variance > 5
                  }" class="text-xs font-semibold">
                    {{ row.meterValues[meter.id].variance > 0 ? '+' : '' }}{{ row.meterValues[meter.id].variance.toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="!isLoading && visibleMeters.length > 0" class="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" style="background-color: #ef4444"></div>
        <span class="text-xs text-gray-600 dark:text-gray-400">{{ t('comparison.sideBySide.aboveAverage') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" style="background-color: #10b981"></div>
        <span class="text-xs text-gray-600 dark:text-gray-400">{{ t('comparison.sideBySide.belowAverage') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMetersStore } from '@/stores/useMetersStore'
import { storeToRefs } from 'pinia'
import { useComparisonStore } from '@/features/comparison/store/useComparisonStore'

const { t } = useI18n()
const metersStore = useMetersStore()
const comparisonStore = useComparisonStore()

const {
  isLoading,
  apiTimeSeriesData,
  aggregationLevel
} = storeToRefs(comparisonStore)

// Props
interface Props {
  activeMeterIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  activeMeterIds: () => []
})

// Compute granularity label based on aggregation level
const granularityLabel = computed(() => {
  const level = aggregationLevel.value
  if (level === 'hourly') return t('common.hourly')
  if (level === 'daily') return t('common.daily')
  if (level === 'monthly') return t('common.monthly')
  return level
})

// Get visible selected meters
const visibleMeters = computed(() => {
  return apiTimeSeriesData.value
    .map(meterData => {
      const meter = comparisonStore.availableMeters.find(m => m.deviceUUID === meterData.meterId)
      return {
        id: meter?.id || meterData.meterId,
        name: meter?.name || meterData.meterId.substring(0, 8),
        deviceUUID: meterData.meterId,
        totalConsumption: meterData.totalConsumption,
        values: meterData.values
      }
    })
    .filter(m => !props.activeMeterIds || props.activeMeterIds.length === 0 || props.activeMeterIds.includes(m.id))
})

// Calculate average consumption across all data
const avgConsumption = computed(() => {
  if (visibleMeters.value.length === 0) return 0
  const allValues = visibleMeters.value.flatMap(m => m.values.map(v => v.value))
  if (allValues.length === 0) return 0
  return allValues.reduce((sum, val) => sum + val, 0) / allValues.length
})

// Build aligned data: one row per time period with all meters' values side-by-side
const alignedData = computed(() => {
  if (visibleMeters.value.length === 0) return []

  // Get all unique time periods from first meter (all meters should have same periods)
  const firstMeter = visibleMeters.value[0]
  if (!firstMeter || firstMeter.values.length === 0) return []

  return firstMeter.values.map((firstValue, idx) => {
    const period = new Date(firstValue.ts).toISOString().split('T')[0] // YYYY-MM-DD

    // Determine period label based on aggregation level
    let periodLabel: string
    if (aggregationLevel.value === 'hourly') {
      const date = new Date(firstValue.ts)
      const hh = String(date.getHours()).padStart(2, '0')
      periodLabel = `${period} ${hh}:00`
    } else {
      periodLabel = period
    }

    // Collect values from all meters for this period
    const meterValues: Record<string, { value: number; variance: number }> = {}

    visibleMeters.value.forEach(meter => {
      const value = meter.values[idx]?.value ?? 0
      const variance = avgConsumption.value !== 0
        ? ((value - avgConsumption.value) / avgConsumption.value) * 100
        : 0

      meterValues[meter.id] = {
        value,
        variance
      }
    })

    return {
      period,
      periodLabel,
      meterValues
    }
  })
})

// Compute number of time periods
const timePeriodsCount = computed(() => {
  return alignedData.value.length
})

// Helper to get meter color
function getMeterColor(meterId: string): string {
  return metersStore.getMeterColor(meterId)
}
</script>

<style scoped>
/* Horizontal scrolling for large datasets */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

@media (prefers-color-scheme: dark) {
  .overflow-x-auto {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
