# Power View & History View – Implementation Code Snippets

This document provides ready-to-use code snippets for implementing the Power View (Puissance.vue) and History View following the device API architecture.

---

## Power View (Puissance.vue) – Quick Implementation Guide

### Step 1: Update Imports

**Replace existing imports with**:

```typescript
import { ref, computed, onMounted } from 'vue'
import { useMetersStore } from '@/stores/useDeviceMetersStore'
import MeterSelector from '@/components/common/MeterSelector.vue'
import type { Meter } from '@/services/deviceAPI'
```

### Step 2: Setup Store and State

```typescript
const metersStore = useMetersStore()
const showMeterSelector = ref(false)
const showComparisonPanel = ref(false)
const comparisonMeterIds = ref<string[]>([])

onMounted(async () => {
  // Fetch meters from device API
  await metersStore.fetchMeters()
})
```

### Step 3: Computed Properties for Primary Meter

```typescript
// Primary meter (first selected) - single selection
const primaryMeter = computed(() => metersStore.primaryMeter)

// Check if primary meter is selected
const hasPrimaryMeter = computed(() => !!primaryMeter.value)

// Comparison meters (for optional comparison)
const comparisonMeters = computed(() =>
  metersStore.allMeters.filter(m =>
    comparisonMeterIds.value.includes(m.id)
  )
)

// All selected meters for charts (primary + comparison)
const allSelectedMeters = computed(() => {
  if (!primaryMeter.value) return []
  const selected = [primaryMeter.value]
  selected.push(...comparisonMeters.value.filter(m => m.id !== primaryMeter.value.id))
  return selected
})
```

### Step 4: KPI Data Fetching

```typescript
interface KPI {
  title: string
  value: number
  unit: string
  change?: number
  trend?: 'up' | 'down'
}

// Fetch KPI data for primary meter
const kpiList = computed(() => {
  if (!primaryMeter.value) return []

  // TODO: Replace with actual API call
  // const kpis = await metricsAPI.getMetricsForMeter(primaryMeter.value.id)

  // Mock data for now
  return [
    {
      title: 'Average Power Last Month',
      value: 245.5,
      unit: 'kW',
      change: -5.2,
      trend: 'down'
    },
    {
      title: 'Average Power This Month',
      value: 232.8,
      unit: 'kW',
      change: 8.1,
      trend: 'up'
    },
    // ... more KPIs
  ]
})
```

### Step 5: Template – Primary Meter Selection

```vue
<template>
  <!-- Meter Selector Modal -->
  <MeterSelector
    :is-open="showMeterSelector"
    @apply="handleMeterSelection"
    @close="showMeterSelector = false"
  />

  <div class="w-full flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ $t('power.title') }}</h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {{ $t('power.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Primary Meter Selection -->
    <div class="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-4 mb-4">
        <span class="font-medium">{{ $t('power.selectMeter') }}</span>
        <button
          @click="showMeterSelector = true"
          class="px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-600 transition"
        >
          {{ primaryMeter?.name || $t('power.selectMeterPlaceholder') }}
        </button>
      </div>

      <!-- Empty state if no meter selected -->
      <div v-if="!hasPrimaryMeter" class="text-center py-8 text-slate-600 dark:text-slate-400">
        <p>{{ $t('power.noMeterSelected') }}</p>
      </div>

      <!-- Primary meter details -->
      <div v-else class="space-y-2">
        <p><strong>{{ $t('power.selected') }}:</strong> {{ primaryMeter.name }}</p>
        <p><strong>{{ $t('power.label') }}:</strong> {{ primaryMeter.label }}</p>
        <p><strong>{{ $t('power.uuid') }}:</strong> {{ primaryMeter.deviceUUID }}</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div v-if="hasPrimaryMeter" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="kpi in kpiList"
        :key="kpi.title"
        class="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
      >
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">{{ kpi.title }}</p>
        <p class="text-2xl font-bold text-slate-900 dark:text-white">
          {{ kpi.value.toFixed(1) }} <span class="text-sm">{{ kpi.unit }}</span>
        </p>
        <p v-if="kpi.change" class="text-xs mt-2" :class="[kpi.trend === 'up' ? 'text-green-600' : 'text-red-600']">
          {{ kpi.trend === 'up' ? '↑' : '↓' }} {{ Math.abs(kpi.change).toFixed(1) }}%
        </p>
      </div>
    </div>

    <!-- Charts Section -->
    <div v-if="hasPrimaryMeter" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Monthly Chart -->
      <PowerBarChart
        :labels="monthlyLabels"
        :data="monthlyData"
        :color="metersStore.getMeterColor(primaryMeter.id)"
        :title="`Power - ${primaryMeter.name}`"
      />
      <!-- More charts... -->
    </div>

    <!-- Comparison Panel (Optional) -->
    <div v-if="hasPrimaryMeter" class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
      <button
        @click="showComparisonPanel = !showComparisonPanel"
        class="text-primary hover:underline font-medium"
      >
        {{ showComparisonPanel ? $t('power.hideComparison') : $t('power.showComparison') }}
      </button>

      <div v-if="showComparisonPanel" class="mt-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <p class="font-medium mb-3">{{ $t('power.selectMetersToCompare') }}</p>

        <!-- Comparison Meter Selection -->
        <div class="space-y-2 max-h-48 overflow-y-auto mb-4">
          <div
            v-for="meter in metersStore.allMeters"
            :key="meter.id"
            class="flex items-center gap-3"
          >
            <input
              type="checkbox"
              :checked="comparisonMeterIds.includes(meter.id)"
              @change="(e) => toggleComparisonMeter(meter.id, e.target.checked)"
              :disabled="!comparisonMeterIds.includes(meter.id) && comparisonMeterIds.length >= 8"
              class="w-4 h-4 rounded"
            />
            <label class="flex-1 text-sm cursor-pointer">{{ meter.name }}</label>
          </div>
        </div>

        <!-- Comparison Charts -->
        <div v-if="comparisonMeterIds.length > 0" class="mt-6">
          <h4 class="font-medium mb-4">{{ $t('power.comparisonChart') }}</h4>
          <!-- Add comparison chart component here -->
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="hasPrimaryMeter" class="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <!-- Add data table component -->
    </div>
  </div>
</template>
```

### Step 6: Event Handlers

```typescript
function handleMeterSelection(meterIds: string[]) {
  // Set primary meter (first one selected)
  if (meterIds.length > 0) {
    // Store will have updated selectedMeters
    metersStore.setSelectedMeters([meterIds[0]]) // Only first for primary
  }
  showMeterSelector.value = false
}

function toggleComparisonMeter(meterId: string, checked: boolean) {
  if (checked) {
    if (comparisonMeterIds.value.length < 8) {
      comparisonMeterIds.value.push(meterId)
    }
  } else {
    const idx = comparisonMeterIds.value.indexOf(meterId)
    if (idx > -1) {
      comparisonMeterIds.value.splice(idx, 1)
    }
  }
}

// Mock data generators (TODO: Replace with API calls)
const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const monthlyData = [250, 245, 270, 265, 280, 275]
```

---

## History View – Quick Implementation Guide

### Structure (Mirror Power View)

```vue
<template>
  <!-- Same as Power View but for historical data -->
  <div class="w-full flex flex-col gap-6">
    <!-- Meter Selector -->
    <MeterSelector :is-open="showMeterSelector" @apply="handleMeterSelection" />

    <!-- Date Range Picker -->
    <div class="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('history.fromDate') }}</label>
          <input
            v-model="dateFrom"
            type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('history.toDate') }}</label>
          <input
            v-model="dateTo"
            type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('history.granularity') }}</label>
          <select v-model="granularity" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600">
            <option value="hourly">{{ $t('history.hourly') }}</option>
            <option value="daily">{{ $t('history.daily') }}</option>
            <option value="weekly">{{ $t('history.weekly') }}</option>
            <option value="monthly">{{ $t('history.monthly') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Primary Meter Display -->
    <!-- Same as Power View -->

    <!-- Historical Charts -->
    <div v-if="hasPrimaryMeter" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Historical consumption chart -->
      <HistoricalChart
        :data="historicalData"
        :meter="primaryMeter"
        :from="dateFrom"
        :to="dateTo"
        :granularity="granularity"
      />
      <!-- Aggregation chart -->
    </div>

    <!-- Comparison Panel (Optional) -->
    <!-- Same as Power View -->

    <!-- Historical Data Table -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMetersStore } from '@/stores/useDeviceMetersStore'
import MeterSelector from '@/components/common/MeterSelector.vue'

const metersStore = useMetersStore()
const showMeterSelector = ref(false)
const dateFrom = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
const dateTo = ref(new Date().toISOString().split('T')[0])
const granularity = ref('daily')
const comparisonMeterIds = ref<string[]>([])

const primaryMeter = computed(() => metersStore.primaryMeter)
const hasPrimaryMeter = computed(() => !!primaryMeter.value)

// Fetch historical data
const historicalData = computed(() => {
  if (!primaryMeter.value) return []
  // TODO: Fetch from API using dateFrom, dateTo, granularity
  return []
})

onMounted(async () => {
  await metersStore.fetchMeters()
})

function handleMeterSelection(meterIds: string[]) {
  if (meterIds.length > 0) {
    metersStore.setSelectedMeters([meterIds[0]])
  }
  showMeterSelector.value = false
}
</script>
```

---

## Translation Keys Required

Add these to `en.json` and `fr.json`:

### Power View (en.json)
```json
{
  "power": {
    "title": "Power Analysis",
    "subtitle": "Real-time power monitoring and KPI tracking",
    "selectMeter": "Select Meter",
    "selectMeterPlaceholder": "Click to select a meter",
    "selected": "Selected Meter",
    "label": "Label",
    "uuid": "Device UUID",
    "noMeterSelected": "Select a meter to view power analytics",
    "showComparison": "Show Comparison",
    "hideComparison": "Hide Comparison",
    "selectMetersToCompare": "Select meters to compare (max 8)",
    "comparisonChart": "Comparison Chart"
  }
}
```

### History View (en.json)
```json
{
  "history": {
    "title": "Historical Data",
    "subtitle": "View and analyze historical energy consumption",
    "fromDate": "From Date",
    "toDate": "To Date",
    "granularity": "Data Granularity",
    "hourly": "Hourly",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly"
  }
}
```

---

## Integration Checklist

- [ ] Replace imports with device API stores
- [ ] Update template to use MeterSelector
- [ ] Add date controls for History View
- [ ] Update computed properties for charts
- [ ] Replace mock data with API calls
- [ ] Implement comparison meter logic
- [ ] Add color mapping from store
- [ ] Test responsive design
- [ ] Test dark mode
- [ ] Verify i18n keys
- [ ] Test selection persistence
- [ ] Performance test with large datasets

---

## Common Pitfalls to Avoid

1. **Don't forget to call `metersStore.fetchMeters()` on mount**
   - Without this, `allMeters` will be empty

2. **Don't use `selectedMeterIds` directly**
   - Use `selectedMeters` computed property instead (contains full Meter objects)

3. **Don't exceed max 8 items in comparison**
   - Always check length before adding

4. **Don't forget color consistency**
   - Use `metersStore.getMeterColor(meter.id)` for all charts

5. **Don't hardcode meter data**
   - Always fetch from API (even if using mock data initially)

---

## Testing the Implementation

```typescript
// Test: Fetch meters
await metersStore.fetchMeters()
console.log(metersStore.allMeters) // Should show PM2200 meters

// Test: Select primary meter
metersStore.setSelectedMeters(['3']) // PM2200-Climatisation
console.log(metersStore.primaryMeter) // Should show selected meter

// Test: Get color
const color = metersStore.getMeterColor('3')
console.log(color) // Should return hex color

// Test: Comparison meters
comparisonMeterIds.value = ['4', '6']
console.log(comparisonMeters.value) // Should show 2 meters
```

---

**Ready to implement?** Start with Power View, then mirror for History View. Use these snippets as a starting point and adapt as needed.
