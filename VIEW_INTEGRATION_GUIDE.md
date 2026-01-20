# Telemetry Integration Guide for Dashboard, History & Comparison Views

## Overview
This guide shows how to integrate real ThingsBoard telemetry data into the three main views.

---

## 1. Dashboard View Integration

### A. Import the Store and Composable

```vue
<script setup lang="ts">
import { useDashboardTelemetryStore } from '@/stores/dashboardTelemetry'
import { useTelemetry } from '@/composables/useTelemetry'

const dashboardTelemetry = useDashboardTelemetryStore()
const { loading: telemetryLoading } = useTelemetry()
</script>
```

### B. Replace Mock Data with Real Telemetry

In `DashboardView.vue`, update the data fetching logic:

```vue
<script setup lang="ts">
// ... existing imports ...
import { useDashboardTelemetryStore } from '@/stores/dashboardTelemetry'

const dashboardTelemetry = useDashboardTelemetryStore()

// Fetch real telemetry data when compteurs change
watch(selectedCompteurs, async (newCompteurs) => {
  if (newCompteurs.length > 0) {
    try {
      await dashboardTelemetry.fetchDashboardData(newCompteurs)
    } catch (error) {
      console.error('Failed to fetch dashboard telemetry:', error)
    }
  }
}, { immediate: true })

// Use cached telemetry data in compteur widgets
const enrichedCompteurs = computed(() => {
  return selectedCompteurs.value.map(compteur => {
    const telemetryData = dashboardTelemetry.getCachedData(compteur.id)
    if (telemetryData) {
      return {
        ...compteur,
        instantaneous: telemetryData.instantaneous,
        today: telemetryData.today,
        yesterday: telemetryData.yesterday,
        // Pass readings for mini charts
        instantReadings: telemetryData.instantReadings,
        todayReadings: telemetryData.todayReadings,
      }
    }
    return compteur
  })
})
</script>

<template>
  <!-- Update CompteurWidget to use enrichedCompteurs -->
  <CompteurWidget
    v-for="(compteur, index) in enrichedCompteurs"
    :key="compteur.id"
    :compteur="compteur"
    :color-index="index"
    :current-mode="widgetModes[compteur.id]"
    @update:mode="(mode) => setWidgetMode(compteur.id, mode)"
  />
</template>
```

### C. Update CompteurWidget to Use Telemetry Readings

In `CompteurWidget.vue`, use the passed telemetry data:

```vue
<script setup lang="ts">
// ... existing code ...

// Use telemetry readings if available
const instantaneousReadings = computed(() => {
  if (props.compteur.instantReadings && props.compteur.instantReadings.length > 0) {
    return props.compteur.instantReadings.map(reading => ({
      height: reading.height,
      value: reading.value.toFixed(1),
      text: `${new Date(reading.timestamp).toLocaleTimeString()}: ${reading.value.toFixed(1)} kW`
    }))
  }
  // Fallback to mock data if no telemetry
  return generateMockInstantaneousData()
})

const todayHourlyReadings = computed(() => {
  if (props.compteur.todayReadings && props.compteur.todayReadings.length > 0) {
    return props.compteur.todayReadings.map(reading => ({
      height: reading.height,
      value: reading.value.toFixed(1),
      text: `${new Date(reading.timestamp).toLocaleTimeString()}: ${reading.value.toFixed(1)} kWh`
    }))
  }
  return generateMockTodayData()
})
</script>
```

### D. Update UnifiedChart for Real-Time Data

```vue
<script setup lang="ts">
import { useTelemetry, TELEMETRY_KEYS } from '@/composables/useTelemetry'

const { fetchChartData } = useTelemetry()
const chartLoading = ref(false)

async function loadChartData() {
  if (props.selectedCompteurs.length === 0) return

  chartLoading.value = true

  try {
    const promises = props.selectedCompteurs
      .filter(c => c.deviceUUID)
      .map(async (compteur, index) => {
        const period = props.period === 'today' ? '24h' : 
                       props.period === 'yesterday' ? '24h' :
                       props.period === '7days' ? '7d' : '30d'

        const keys = props.mode === 'energy' 
          ? TELEMETRY_KEYS.ENERGY 
          : ['temperature']

        const data = await fetchChartData(
          compteur.deviceUUID!,
          period,
          keys
        )

        return { compteur, data, colorIndex: index }
      })

    const results = await Promise.all(promises)

    // Build chart data
    const labels = results[0]?.data.labels || []
    const datasets = results.flatMap(({ compteur, data, colorIndex }) =>
      data.datasets.map((ds: any) => ({
        ...ds,
        label: `${compteur.name} - ${ds.label}`,
        borderColor: getMeterColorByIndex(colorIndex).hex,
      }))
    )

    updateChart({ labels, datasets })
  } catch (error) {
    console.error('Failed to load chart data:', error)
  } finally {
    chartLoading.value = false
  }
}

// Load on mount and when props change
onMounted(() => loadChartData())
watch([() => props.period, () => props.mode, () => props.selectedCompteurs], loadChartData, { deep: true })
</script>
```

---

## 2. Energy History View Integration

### A. Import History Store

```vue
<script setup lang="ts">
import { useHistoryTelemetryStore } from '@/stores/historyTelemetry'
import { TELEMETRY_KEYS } from '@/composables/useTelemetry'

const historyTelemetry = useHistoryTelemetryStore()
</script>
```

### B. Fetch Historical Data

In `EnergyHistorical.vue`:

```vue
<script setup lang="ts">
// ... existing imports ...
import { useHistoryTelemetryStore } from '@/stores/historyTelemetry'
import { TELEMETRY_KEYS } from '@/composables/useTelemetry'

const historyTelemetry = useHistoryTelemetryStore()

// Map your resolution to API periods
const resolutionToPeriod = {
  'hourly': '24h',
  'daily': '30d',
  'weekly': '30d',
  'monthly': '30d',
}

// Fetch historical data when parameters change
async function loadHistoricalData() {
  if (activeCompteurIds.value.length === 0) {
    return
  }

  const selectedMeters = allCompteurs.value.filter(c => 
    activeCompteurIds.value.includes(c.id) && c.deviceUUID
  )

  if (selectedMeters.length === 0) {
    console.warn('No meters with deviceUUID selected')
    return
  }

  try {
    const period = resolutionToPeriod[resolution.value] || '24h'
    
    // Determine keys based on metric type
    const keys = metricType.value === 'energy' 
      ? TELEMETRY_KEYS.ENERGY 
      : TELEMETRY_KEYS.POWER

    await historyTelemetry.fetchHistoricalData(
      selectedMeters,
      period,
      keys,
      'AVG' // or 'SUM' for energy totals
    )

    // Use historyTelemetry.historicalData for chart
    updateChartWithTelemetryData(historyTelemetry.historicalData)
  } catch (error) {
    console.error('Failed to load historical data:', error)
  }
}

// Update chart with real telemetry data
function updateChartWithTelemetryData(data: any[]) {
  if (data.length === 0) return

  // Extract labels (timestamps)
  const labels = data.map(d => d.date)

  // Extract datasets for each meter
  const datasets = activeCompteurIds.value.map((meterId, index) => {
    const meter = allCompteurs.value.find(m => m.id === meterId)
    if (!meter) return null

    const meterKey = `${meter.name}_${metricType.value === 'energy' ? 'ActiveEnergyTotal' : 'ActivePowerTotal'}`
    
    return {
      label: meter.name,
      data: data.map(d => d[meterKey] || 0),
      borderColor: metersStore.getMeterColor(meterId),
      backgroundColor: metersStore.getMeterColor(meterId) + '20',
      borderWidth: 2,
      tension: 0.4,
      fill: viewMode.value === 'area',
    }
  }).filter(Boolean)

  // Update your Chart.js instance
  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets = datasets
    chartInstance.update()
  }
}

// Watch for changes
watch([activeCompteurIds, resolution, metricType], () => {
  loadHistoricalData()
}, { immediate: true })
</script>

<template>
  <!-- Show loading state -->
  <div v-if="historyTelemetry.loading" class="flex items-center justify-center p-8">
    <span class="material-symbols-outlined animate-spin mr-3">progress_activity</span>
    Loading historical data...
  </div>

  <!-- Show error -->
  <div v-if="historyTelemetry.error" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
    {{ historyTelemetry.error }}
  </div>

  <!-- Existing chart -->
  <canvas ref="chartCanvas"></canvas>
</template>
```

### C. Custom Date Range Support

```vue
<script setup lang="ts">
// For custom date range picker
async function fetchCustomDateRange() {
  if (!startDate.value || !endDate.value) return

  const selectedMeters = allCompteurs.value.filter(c => 
    activeCompteurIds.value.includes(c.id) && c.deviceUUID
  )

  try {
    // Calculate interval based on range duration
    const durationMs = endDate.value.getTime() - startDate.value.getTime()
    const intervalMs = durationMs > 7 * 24 * 60 * 60 * 1000 
      ? 24 * 60 * 60 * 1000 // 1 day for ranges > 7 days
      : 60 * 60 * 1000 // 1 hour otherwise

    await historyTelemetry.fetchCustomRange(
      selectedMeters,
      startDate.value,
      endDate.value,
      intervalMs,
      TELEMETRY_KEYS.ENERGY,
      'AVG'
    )

    updateChartWithTelemetryData(historyTelemetry.historicalData)
  } catch (error) {
    console.error('Failed to fetch custom range:', error)
  }
}
</script>
```

---

## 3. Comparison View Integration

### A. Import Comparison Store

```vue
<script setup lang="ts">
import { useComparisonTelemetryStore } from '@/stores/comparisonTelemetry'

const comparisonTelemetry = useComparisonTelemetryStore()
</script>
```

### B. Compare Multiple Devices

In `ComparisonView.vue`:

```vue
<script setup lang="ts">
// ... existing imports ...
import { useComparisonTelemetryStore } from '@/stores/comparisonTelemetry'

const comparisonTelemetry = useComparisonTelemetryStore()

// Fetch comparison data
async function loadComparisonData() {
  const selectedMeters = allCompteurs.value.filter(c => 
    activeMeterIds.value.includes(c.id) && c.deviceUUID
  )

  if (selectedMeters.length === 0) return

  try {
    if (comparisonMode.value === 'byMeters') {
      // Compare multiple devices over same period
      await comparisonTelemetry.compareDevices(
        selectedMeters,
        activePeriod.value, // '24h', '7d', '30d'
        metricType.value // 'energy' or 'power'
      )
    } else {
      // Compare single device across multiple periods
      if (selectedMeters.length > 0) {
        await comparisonTelemetry.comparePeriodsForDevice(
          selectedMeters[0],
          ['24h', '7d', '30d'],
          metricType.value
        )
      }
    }

    // Update chart with comparison data
    updateComparisonChart(comparisonTelemetry.comparisonData)
  } catch (error) {
    console.error('Failed to load comparison data:', error)
  }
}

// Update chart
function updateComparisonChart(data: any[]) {
  if (data.length === 0) return

  const labels = data.map(d => d.meterName || d.period)
  const values = data.map(d => d.value)
  const colors = data.map((_, index) => metersStore.getMeterColor(activeMeterIds.value[index]))

  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets = [{
      label: `${metricType.value === 'energy' ? 'Energy (kWh)' : 'Power (kW)'}`,
      data: values,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: 2,
    }]
    chartInstance.update()
  }
}

// Watch for changes
watch([activeMeterIds, activePeriod, comparisonMode, metricType], () => {
  loadComparisonData()
}, { immediate: true })
</script>

<template>
  <!-- KPI Cards with Real Data -->
  <div v-if="comparisonTelemetry.comparisonData.length > 0" class="grid grid-cols-4 gap-4">
    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg">
      <p class="text-sm text-gray-500">Highest Consumer</p>
      <p class="text-2xl font-bold">{{ comparisonTelemetry.highest?.meterName }}</p>
      <p class="text-lg">{{ comparisonTelemetry.highest?.value.toFixed(2) }} {{ comparisonTelemetry.highest?.unit }}</p>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg">
      <p class="text-sm text-gray-500">Lowest Consumer</p>
      <p class="text-2xl font-bold">{{ comparisonTelemetry.lowest?.meterName }}</p>
      <p class="text-lg">{{ comparisonTelemetry.lowest?.value.toFixed(2) }} {{ comparisonTelemetry.lowest?.unit }}</p>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg">
      <p class="text-sm text-gray-500">Total</p>
      <p class="text-2xl font-bold">{{ comparisonTelemetry.total.toFixed(2) }}</p>
      <p class="text-sm">{{ comparisonTelemetry.comparisonData[0]?.unit }}</p>
    </div>

    <div class="bg-white dark:bg-slate-900 p-4 rounded-lg">
      <p class="text-sm text-gray-500">Average</p>
      <p class="text-2xl font-bold">{{ comparisonTelemetry.average.toFixed(2) }}</p>
      <p class="text-sm">{{ comparisonTelemetry.comparisonData[0]?.unit }}</p>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="comparisonTelemetry.loading" class="flex items-center justify-center p-8">
    <span class="material-symbols-outlined animate-spin mr-3">progress_activity</span>
    Comparing devices...
  </div>

  <!-- Chart -->
  <canvas ref="chartCanvas"></canvas>
</template>
```

---

## 4. Common Integration Patterns

### A. Error Handling

```vue
<script setup lang="ts">
// Display error messages
const showError = computed(() => {
  return dashboardTelemetry.error || 
         historyTelemetry.error || 
         comparisonTelemetry.error
})
</script>

<template>
  <div v-if="showError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-red-600">error</span>
      <span class="text-red-900 dark:text-red-100">{{ showError }}</span>
    </div>
  </div>
</template>
```

### B. Loading States

```vue
<template>
  <!-- Global loading overlay -->
  <div v-if="dashboardTelemetry.loading || historyTelemetry.loading || comparisonTelemetry.loading" 
       class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-xl">
      <span class="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
      <p class="mt-2 text-sm">Loading telemetry data...</p>
    </div>
  </div>
</template>
```

### C. Empty States

```vue
<template>
  <div v-if="comparisonTelemetry.comparisonData.length === 0 && !comparisonTelemetry.loading" 
       class="flex flex-col items-center justify-center p-12 text-gray-500">
    <span class="material-symbols-outlined text-6xl mb-4 opacity-30">bar_chart</span>
    <p class="text-lg font-medium">No telemetry data available</p>
    <p class="text-sm mt-2">Select meters with valid deviceUUID to view comparisons</p>
  </div>
</template>
```

---

## 5. Testing Integration

### Test Checklist:

1. **Dashboard View**:
   - ✅ Select meters with valid deviceUUID
   - ✅ Verify CompteurWidget shows real instantaneous power
   - ✅ Check mini charts display recent data points
   - ✅ Verify UnifiedChart renders multi-device data

2. **History View**:
   - ✅ Change time period and verify data updates
   - ✅ Toggle between hourly/daily/weekly resolutions
   - ✅ Test custom date range selection
   - ✅ Export data to CSV/PDF with real values

3. **Comparison View**:
   - ✅ Compare 2+ devices and verify ranking
   - ✅ Switch comparison modes (by meters / by periods)
   - ✅ Verify KPI cards show correct highest/lowest/total/average
   - ✅ Check heatmap/chart updates with real data

### Debugging Tips:

- Open browser DevTools → Network tab → Filter by "telemetry"
- Check Console for `[TelemetryAPI]`, `[useTelemetry]`, store logs
- Verify backend logs show successful ThingsBoard API calls
- Ensure selected meters have `deviceUUID` property populated
- Check ThingsBoard portal to confirm device has telemetry data

---

## 6. Performance Optimization

### A. Caching

```vue
<script setup lang="ts">
// Cache telemetry data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000
const lastFetchTime = ref<number>(0)

async function fetchDataWithCache() {
  const now = Date.now()
  if (now - lastFetchTime.value < CACHE_DURATION) {
    console.log('Using cached telemetry data')
    return
  }

  await fetchTelemetryData()
  lastFetchTime.value = now
}
</script>
```

### B. Debouncing

```vue
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const debouncedFetch = useDebounceFn(() => {
  loadHistoricalData()
}, 500)

watch([activeCompteurIds, resolution], () => {
  debouncedFetch()
})
</script>
```

### C. Lazy Loading

```vue
<script setup lang="ts">
// Only fetch when view is visible
import { useIntersectionObserver } from '@vueuse/core'

const chartContainer = ref<HTMLElement>()
const { stop } = useIntersectionObserver(
  chartContainer,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      loadChartData()
      stop() // Fetch once
    }
  }
)
</script>
```

---

## Summary

- **Dashboard**: Use `dashboardTelemetry` store for real-time widget data
- **History**: Use `historyTelemetry` store for time-series charts
- **Comparison**: Use `comparisonTelemetry` store for multi-device analysis
- All stores use `telemetryAPI` service which calls `/telemetry/:deviceUUID/timeseries`
- Backend authenticates to ThingsBoard and proxies requests
- Frontend gets clean, transformed data ready for charts

Now your dashboard shows **real energy data from ThingsBoard devices**! 🎉
