# Integrating ThingsBoard Telemetry API with Frontend

## Overview
This guide shows how to connect the frontend dashboard widgets and charts to the backend ThingsBoard telemetry API.

## 1. API Service (`src/services/telemetryAPI.ts`) ✅ Created
Handles HTTP calls to `/telemetry/:deviceUUID/timeseries` endpoint.

## 2. Composable (`src/composables/useTelemetry.ts`) ✅ Created
Provides reactive telemetry data fetching with:
- `fetchInstantaneous()` - Last 30 min data
- `fetchTodayHourly()` - Today's hourly data
- `fetchYesterdayHourly()` - Yesterday's hourly data  
- `fetchChartData()` - Flexible period data for charts
- `fetchCurrentValue()` - Latest value for a key

## 3. Update CompteurWidget to Use Real Data

### A. Add telemetry composable to `CompteurWidget.vue`

Replace the mock data generation (lines ~330-390) with real API calls:

```vue
<script setup lang="ts">
import { computed, ref, watch, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Compteur, CompteurMode } from '@/composables/useCompteurSelection'
import { getMeterColorByIndex } from '@/utils/meterColors'
import { useTelemetry, TELEMETRY_KEYS } from '@/composables/useTelemetry'

// ... existing props/emits ...

// Add telemetry composable
const { 
  loading: telemetryLoading, 
  fetchInstantaneous, 
  fetchTodayHourly, 
  fetchYesterdayHourly,
  fetchCurrentValue 
} = useTelemetry()

const isLoadingTelemetry = ref(false)
const telemetryData = ref({
  instantaneous: [] as any[],
  todayHourly: [] as any[],
  yesterdayHourly: [] as any[],
  currentValue: 0
})

// Replace computed mock data with reactive telemetry data
const instantaneousReadings = computed(() => {
  return telemetryData.value.instantaneous.length > 0
    ? telemetryData.value.instantaneous.map(reading => ({
        height: reading.height,
        value: reading.value.toFixed(1),
        text: `${new Date(reading.timestamp).toLocaleTimeString()}: ${reading.value.toFixed(1)} kW`
      }))
    : [] // Empty state
})

const todayHourlyReadings = computed(() => {
  return telemetryData.value.todayHourly.length > 0
    ? telemetryData.value.todayHourly.map(reading => ({
        height: reading.height,
        value: reading.value.toFixed(1),
        text: `${new Date(reading.timestamp).toLocaleTimeString()}: ${reading.value.toFixed(1)} kWh`
      }))
    : []
})

const yesterdayHourlyReadings = computed(() => {
  return telemetryData.value.yesterdayHourly.length > 0
    ? telemetryData.value.yesterdayHourly.map(reading => ({
        height: reading.height,
        value: reading.value.toFixed(1),
        text: `${new Date(reading.timestamp).toLocaleTimeString()}: ${reading.value.toFixed(1)} kWh`
      }))
    : []
})

// Update current value from API
const currentValue = computed(() => {
  if (currentMode.value === 'instantanée' && telemetryData.value.currentValue > 0) {
    return telemetryData.value.currentValue
  }
  // Fallback to prop value
  return props.compteur[currentMode.value === 'instantanée' ? 'instantaneous' : currentMode.value === 'jour' ? 'today' : 'yesterday']
})

// Fetch telemetry data on mount and mode change
async function loadTelemetryData() {
  if (!props.compteur.deviceUUID) {
    console.warn('[CompteurWidget] No deviceUUID available for compteur:', props.compteur.id)
    return
  }

  isLoadingTelemetry.value = true

  try {
    // Fetch based on current mode
    switch (currentMode.value) {
      case 'instantanée':
        const [instant, currentVal] = await Promise.all([
          fetchInstantaneous(props.compteur.deviceUUID, TELEMETRY_KEYS.POWER),
          fetchCurrentValue(props.compteur.deviceUUID, 'ActivePowerTotal')
        ])
        telemetryData.value.instantaneous = instant
        telemetryData.value.currentValue = currentVal
        break

      case 'jour':
        telemetryData.value.todayHourly = await fetchTodayHourly(
          props.compteur.deviceUUID,
          TELEMETRY_KEYS.ENERGY
        )
        break

      case 'hier':
        telemetryData.value.yesterdayHourly = await fetchYesterdayHourly(
          props.compteur.deviceUUID,
          TELEMETRY_KEYS.ENERGY
        )
        break
    }
  } catch (error) {
    console.error('[CompteurWidget] Failed to load telemetry:', error)
  } finally {
    isLoadingTelemetry.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadTelemetryData()
})

// Reload data when mode changes
watch(currentMode, () => {
  loadTelemetryData()
})

// Update isLoading to include telemetry loading
const isLoading = computed(() => props.isLoading || isLoadingTelemetry.value)
</script>
```

## 4. Update UnifiedChart to Use Real Data

Add telemetry integration to `UnifiedChart.vue`:

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart, /* ... */ } from 'chart.js'
import { getMeterColorByIndex } from '@/utils/meterColors'
import { useTelemetry, TELEMETRY_KEYS } from '@/composables/useTelemetry'
import type { Compteur } from '@/composables/useCompteurSelection'

// ... existing props ...

const { fetchChartData } = useTelemetry()
const chartData = ref<any>(null)
const loading = ref(false)

// Map period to API format
function getPeriodForAPI(): '1h' | '6h' | '24h' | '7d' | '30d' {
  const mapping = {
    'today': '24h',
    'yesterday': '24h',
    '7days': '7d',
    '30days': '30d'
  }
  return mapping[props.period] || '24h'
}

// Load chart data from API
async function loadChartData() {
  if (props.selectedCompteurs.length === 0) {
    chartData.value = null
    return
  }

  loading.value = true

  try {
    // Fetch data for all selected compteurs
    const promises = props.selectedCompteurs
      .filter(c => c.deviceUUID) // Only compteurs with deviceUUID
      .map(async (compteur, index) => {
        const keys = props.mode === 'energy' 
          ? TELEMETRY_KEYS.ENERGY 
          : ['temperature'] // Adjust for temperature sensors

        const data = await fetchChartData(
          compteur.deviceUUID!,
          getPeriodForAPI(),
          keys
        )

        return {
          compteur,
          data,
          colorIndex: index
        }
      })

    const results = await Promise.all(promises)

    // Combine data for Chart.js
    const allLabels = results[0]?.data.labels || []
    const datasets = results.flatMap(({ compteur, data, colorIndex }) => 
      data.datasets.map((ds: any) => ({
        ...ds,
        label: `${compteur.name} - ${ds.label}`,
        borderColor: getMeterColorByIndex(colorIndex).hex,
        backgroundColor: getMeterColorByIndex(colorIndex).hex + '20'
      }))
    )

    chartData.value = {
      labels: allLabels,
      datasets
    }

    updateChart()
  } catch (error) {
    console.error('[UnifiedChart] Failed to load chart data:', error)
  } finally {
    loading.value = false
  }
}

// Update chart when data changes
function updateChart() {
  if (!chartRef.value || !chartData.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDarkMode.value ? '#e2e8f0' : '#1e293b',
            font: { size: 11 }
          }
        },
        tooltip: {
          backgroundColor: isDarkMode.value ? '#1e293b' : '#ffffff',
          titleColor: isDarkMode.value ? '#f1f5f9' : '#0f172a',
          bodyColor: isDarkMode.value ? '#cbd5e1' : '#475569',
          borderColor: isDarkMode.value ? '#334155' : '#e2e8f0',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: isDarkMode.value ? '#334155' : '#e2e8f0' },
          ticks: { color: isDarkMode.value ? '#94a3b8' : '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: isDarkMode.value ? '#334155' : '#e2e8f0' },
          ticks: { color: isDarkMode.value ? '#94a3b8' : '#64748b', font: { size: 10 } }
        }
      }
    }
  })
}

// Load data on mount
onMounted(() => {
  loadChartData()
})

// Reload when period or mode changes
watch([() => props.period, () => props.mode, () => props.selectedCompteurs], () => {
  loadChartData()
}, { deep: true })
</script>
```

## 5. Ensure Compteur Has deviceUUID

Update your compteur selection to include `deviceUUID` from the devices API:

```typescript
// In DashboardView.vue or similar
const selectedCompteurs = computed(() => {
  return selectedCompteurIds.value
    .map(id => {
      const device = allCompteurs.value.find(c => c.id === id)
      if (device) {
        return {
          ...device,
          deviceUUID: device.deviceUUID, // ← Ensure this is passed
          // ... other properties
        }
      }
      return null
    })
    .filter(Boolean)
})
```

## 6. Test the Integration

1. **Start backend** with ThingsBoard credentials:
   ```bash
   cd indusmind-backend
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   cd indusmind-dashboard
   npm run dev
   ```

3. **Select a meter** with a valid `deviceUUID` (e.g., `545ffcb0-ab9c-11f0-a05e-97f672464deb`)

4. **Check console logs** for telemetry API calls and responses

5. **Verify charts update** with real data from ThingsBoard

## 7. Handle Empty Data States

Add fallback UI when no telemetry data is available:

```vue
<div v-if="instantaneousReadings.length === 0" class="h-12 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">
  {{ $t('compteur.noDataAvailable') }}
</div>
```

## Common Telemetry Keys

### PM2200 Meters:
- **Power**: `ActivePowerTotal`, `ReactivePowerTotal`, `ApparentPowerTotal`
- **Energy**: `ActiveEnergyTotal`, `ReactiveEnergyTotal`
- **Current**: `Current_Avg`, `Current_A`, `Current_B`, `Current_C`
- **Voltage**: `Voltage_Avg`, `Voltage_AB`, `Voltage_BC`, `Voltage_CA`
- **Power Factor**: `PowerFactor_Avg`
- **Frequency**: `Frequency`

### Temperature Sensors:
- **Temperature**: `temperature`, `Temperature`

## Debugging

Enable detailed logging by checking browser console for:
- `[TelemetryAPI]` - API call logs
- `[useTelemetry]` - Composable logs
- `[CompteurWidget]` - Widget logs
- `[UnifiedChart]` - Chart logs

Check backend logs for ThingsBoard auth and API call details.
