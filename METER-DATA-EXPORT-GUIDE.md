# How to Export Meter Data as JSON

The `/history` view now uses **centralized meter data** from `metersData.ts`. Here's how to access and export the data:

## 📊 Data Structure

```typescript
{
  id: "compteur-1",
  name: "TGBT",
  category: "TGBT",
  metrics: {
    consumption: 1250.5,  // kWh
    power: 52.1,         // kW
    cost: 187.58,        // EUR
    co2: 312.6,          // kg
    voltage: 400,        // V
    current: 75,         // A
    temperature: 42      // °C
  },
  timeSeries: {
    hourly: [
      { timestamp: "00:00", value: 45.2, quality: "good" },
      { timestamp: "01:00", value: 42.8, quality: "good" },
      // ... 24 data points
    ],
    daily: [
      { timestamp: "2026-01-01", value: 1180.5, quality: "good" },
      // ... 30 data points
    ],
    monthly: [
      { timestamp: "2025-01", value: 35250.0, quality: "good" },
      // ... 12 data points
    ]
  },
  kpis: {
    current: 52.1,
    peak: 78.9,
    average: 48.3,
    total: 1250.5,
    avgPowerLastMonth: 51.2,
    avgPowerThisMonth: 49.8,
    avgPowerYesterday: 47.5,
    avgPowerToday: 52.1,
    avgPowerBeforeYesterday: 48.9,
    instantaneousPower: 52.1
  },
  elements: [
    {
      id: "L1",
      name: "L1",
      metrics: { ... },
      timeSeries: { ... },
      kpis: { ... }
    },
    // L2, L3 ...
  ]
}
```

## 🔧 Export Methods

### 1. Browser Console (Development)

```javascript
// Import the utility
import { 
  downloadAllMetersJSON,
  downloadMeterDataJSON,
  logMeterData,
  exportHourlyDataJSON
} from '@/utils/exportMeterData'

// Download all meters data
downloadAllMetersJSON()
// Creates: all-meters-data.json

// Download specific meter
downloadMeterDataJSON('compteur-1')
// Creates: compteur-1-data.json

// Download meter element
downloadMeterDataJSON('compteur-1', 'L1')
// Creates: compteur-1-L1-data.json

// Log to console
logMeterData('compteur-1')
// Logs full meter object

logMeterData('compteur-1', 'L1')
// Logs element object

// Get hourly data as JSON string
const hourlyJSON = exportHourlyDataJSON('compteur-1')
console.log(hourlyJSON)
```

### 2. From Vue Component

```vue
<script setup>
import { downloadAllMetersJSON, logMeterData } from '@/utils/exportMeterData'

function handleExport() {
  downloadAllMetersJSON()
}

function debugMeter() {
  logMeterData('compteur-1', 'L1')
}
</script>

<template>
  <button @click="handleExport">Export Data</button>
  <button @click="debugMeter">Debug TGBT L1</button>
</template>
```

### 3. From Store

```typescript
// In useEnergyHistoryStore or any other store
import { useMetersStore } from '@/stores/useMetersStore'

const metersStore = useMetersStore()

// Get full meter data with time series
const meterData = metersStore.getFullMeterData('compteur-1')
console.log('Full meter:', meterData)

// Get element data
const elementData = metersStore.getElementData('compteur-1', 'L1')
console.log('L1 element:', elementData)

// Export as JSON
const json = JSON.stringify(meterData, null, 2)
console.log(json)
```

## 📁 Available Meters

| ID | Name | Category | Elements |
|----|------|----------|----------|
| `compteur-1` | TGBT | TGBT | L1, L2, L3 |
| `compteur-2` | Compresseurs | Compresseurs | Unit-1, Unit-2, Unit-3 |
| `compteur-3` | Clim | Clim | Zone-A, Zone-B |
| `compteur-4` | Éclairage | Éclairage | - |
| `compteur-5` | Compresseur Zone 2 | Compresseurs | - |
| `compteur-6` | Clim Bureau | Clim | - |

## 🎯 Usage Examples

### Export TGBT Hourly Data

```javascript
import { exportHourlyDataJSON } from '@/utils/exportMeterData'

// Aggregated TGBT data (all phases)
const tgbtHourly = exportHourlyDataJSON('compteur-1')

// Phase L1 only
const l1Hourly = exportHourlyDataJSON('compteur-1', 'L1')

// Parse and use
const data = JSON.parse(l1Hourly)
data.forEach(point => {
  console.log(`${point.timestamp}: ${point.value} kW`)
})
```

### Export for External Tools

```javascript
// Get data for Power BI, Excel, Grafana, etc.
import { METERS_DATA } from '@/data/metersData'

// Format for CSV export
const csvData = METERS_DATA.map(meter => ({
  id: meter.id,
  name: meter.name,
  category: meter.category,
  current_power: meter.metrics.power,
  consumption: meter.metrics.consumption,
  cost: meter.metrics.cost
}))

console.table(csvData)
```

### Query Historical Data

```javascript
import { useEnergyHistoryStore } from '@/stores/useEnergyHistoryStore'

const historyStore = useEnergyHistoryStore()

// The store now pulls from centralized metersData.ts
// for 'consumption' metric type

// Get data for specific date
const dailyData = historyStore.getMetricDataForDate(
  '2026-01-13',
  'consumption',
  'compteur-1'
)

console.log('Hourly breakdown:', dailyData.hourlyData)
console.log('Peak hour:', dailyData.peakHour, 'at', dailyData.peakValue, 'kW')
```

## ✅ Integration Status

- ✅ **PuissanceView** - Uses centralized data
- ✅ **EnergyHistorical** - Uses centralized data (consumption metric)
- ✅ **DashboardView** - Uses centralized meter store
- ✅ **ComparisonView** - Uses comparison store
- ✅ **useMetersStore** - Loads from metersData.ts
- ✅ **useEnergyHistoryStore** - Falls back to centralized data

## 🔍 Debugging

### Check if data is loaded

```javascript
import { useMetersStore } from '@/stores/useMetersStore'

const store = useMetersStore()
console.log('All meters:', store.allMeters)
console.log('Selected:', store.selectedMeters)
console.log('By category:', store.metersByCategory)
```

### Verify element support

```javascript
const tgbt = store.getFullMeterData('compteur-1')
console.log('TGBT elements:', tgbt?.elements)
// Should show: [{ id: 'L1', ... }, { id: 'L2', ... }, { id: 'L3', ... }]
```

### Export for bug reports

```javascript
import { downloadAllMetersJSON } from '@/utils/exportMeterData'

// Include in bug reports
downloadAllMetersJSON()
// Attach the downloaded JSON file
```
