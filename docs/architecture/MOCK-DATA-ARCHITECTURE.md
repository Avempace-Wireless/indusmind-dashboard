# Mock Data Architecture

> Comprehensive guide to the unified mock data system and data flow across all views

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Core Components](#core-components)
- [Data Flow by View](#data-flow-by-view)
- [Data Generation](#data-generation)
- [Best Practices](#best-practices)

---

## Overview

The Indusmind Dashboard uses a **centralized mock data architecture** where all meter and sensor data originates from a single source of truth: `src/data/mockData.ts`. This eliminates data fragmentation and ensures consistency across all views.

### Key Principles

1. **Single Source of Truth**: All mock data defined in one place
2. **Read-Only Seed Data**: Mock data is never mutated directly
3. **Store-Managed State**: Pinia stores import seed data and manage their own state
4. **View Independence**: Each view accesses data through its corresponding store
5. **Backward Compatibility**: Legacy `metersData.ts` re-exports for existing code

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      src/data/mockData.ts                       │
│                   (Single Source of Truth)                      │
│                                                                 │
│  • MOCK_METERS (9 meters)                                       │
│  • MOCK_SENSORS (8 sensors)                                     │
│  • SENSOR_COLOR_PALETTE (8 colors)                              │
│  • Helper Functions (generateHourlyData, etc.)                  │
│  • Utility Functions (getMeterById, etc.)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ import once on initialization
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                    ┌──────────────────────┐
│ useMetersStore    │                    │ useSensorsStore      │
│                   │                    │                      │
│ • allMeters       │                    │ • allSensors         │
│ • selectedIds     │                    │ • selectedIds        │
│ • localStorage    │                    │ • localStorage       │
└───────────────────┘                    └──────────────────────┘
        │                                           │
        │ provide reactive state                   │
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐     ┌──────────────────┐
│ Dashboard    │    │ Puissance    │     │ Temperature      │
│ View         │    │ View         │     │ Management       │
└──────────────┘    └──────────────┘     └──────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐     
│ History      │    │ Comparison   │     
│ View         │    │ View         │     
└──────────────┘    └──────────────┘     
```

---

## Core Components

### 1. `src/data/mockData.ts`

**Purpose**: Centralized mock data seed file (895 lines)

**Exports**:
```typescript
// Interfaces
export interface DataPoint { timestamp, value, quality }
export interface TimeSeriesData { hourly, daily, monthly }
export interface Meter { id, name, category, metrics, timeSeries, kpis, elements? }
export interface Sensor { id, name, zone, readings, timeSeries, minTemp, maxTemp, avgTemp }

// Data
export const MOCK_METERS: Meter[] = [...]  // 9 meters
export const MOCK_SENSORS: Sensor[] = [...] // 8 sensors
export const SENSOR_COLOR_PALETTE = ['#f97316', '#ef4444', ...] // 8 colors

// Utilities
export function getMeterById(id: string): Meter | undefined
export function getSensorById(id: string): Sensor | undefined
export function getMetersByCategory(category): Meter[]
export function getAllSensors(): Sensor[]
```

**Data Structure**:

**Meters** (9 total):
- **TGBT** (Main Panel): id='8', has elements [L1, L2, L3]
- **Compresseurs**: id='4', has elements [Unit-1, Unit-2, Unit-3]
- **Clim**: id='3', has elements [Zone-A, Zone-B]
- **TGBT Secondaire**: id='5', no elements
- **Éclairage**: id='9', no elements
- **Compresseur Zone 2**: id='10', no elements
- **Clim Bureau**: id='11', no elements
- **Ligne Production**: id='12', no elements

**Sensors** (8 total):
- sensor-1 to sensor-8 with different zones (Zone-A to Zone-H)

### 2. `src/stores/useMetersStore.ts`

**Purpose**: Global meter state management

**Initialization**:
```typescript
import { MOCK_METERS } from '../data/mockData'

const allMeters = ref<MeterMetadata[]>(
  MOCK_METERS.map(meter => ({
    id: meter.id,
    name: meter.name,
    category: meter.category,
    // ... extract metadata only
  }))
)
```

**State**:
- `allMeters`: Metadata for all 9 meters
- `selectedMeterIds`: Array of currently selected meter IDs
- `lastModified`: Timestamp of last selection change

**Methods**:
- `toggleMeter(id)`: Add/remove meter from selection
- `setSelectedMeters(ids)`: Replace entire selection
- `getFullMeterData(id)`: Get complete meter with time-series from MOCK_METERS
- `getElementData(meterId, elementId)`: Get sub-element data (L1, Unit-1, etc.)

**Persistence**: localStorage key `'meters:selected'`

### 3. `src/stores/useSensorsStore.ts`

**Purpose**: Temperature sensor state management

**Initialization**:
```typescript
import { MOCK_SENSORS, SENSOR_COLOR_PALETTE, getAllSensors } from '../data/mockData'

const colorPalette = SENSOR_COLOR_PALETTE

async function fetchSensors() {
  allSensors.value = getAllSensors()
}
```

**State**:
- `allSensors`: All 8 temperature sensors
- `selectedSensorIds`: Max 8 selected (enforced)
- `MAX_SELECTABLE_SENSORS`: 8

**Methods**:
- `fetchSensors()`: Load sensors from mockData
- `toggleSensor(id)`: Add/remove sensor (respects max limit)
- `getSensorColor(id)`: Get color from palette based on selection order
- `isSensorSelected(id)`: Check if sensor is selected

**Persistence**: localStorage key `'dashboard:sensors:selected'`

### 4. `src/data/metersData.ts` (Backward Compatibility Layer)

**Purpose**: Re-export layer for legacy code (28 lines)

```typescript
export {
  type DataPoint,
  type Meter,
  MOCK_METERS as METERS_DATA, // Re-export with old name
  getMetersByCategory,
  getMeterById,
} from './mockData'
```

---

## Data Flow by View

### 1. Dashboard View (`src/views/DashboardView.vue`)

**Purpose**: Real-time monitoring overview with KPI cards and charts

**Data Sources**:
```typescript
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()

// Access meter metadata
const allMeters = metersStore.allMeters
const selectedMeterIds = metersStore.selectedMeterIds

// Access detailed time-series data
const meterData = metersStore.getFullMeterData(meterId)
```

**Data Retrieved**:
- Meter metadata (name, category, color, status)
- Current power consumption (instantaneous)
- KPIs (current, peak, average, total)
- Hourly time-series for mini charts

**Components**:
- `CompteurSelector.vue`: Displays all 9 meters, allows selection
- `KPICard.vue`: Shows consumption, cost, CO2 metrics
- `PowerChart.vue`: Real-time power consumption chart

**State Management**:
- Meter selection persisted via `useMetersStore`
- View-specific filters in `useDashboardStore`

### 2. Puissance View (`src/views/PuissanceView.vue`)

**Purpose**: Detailed power analysis with multi-element breakdown

**Data Sources**:
```typescript
import { useMetersStore } from '@/stores/useMetersStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import type { Meter, KPIValues } from '@/data/mockData'

const metersStore = useMetersStore()
const { selectedCompteurs } = useCompteurSelection()

// Get full meter data with elements
const meterData = metersStore.getFullMeterData(compteurId)
```

**Data Retrieved**:
- Full meter data (all properties)
- Element-level data (L1, L2, L3 for TGBT)
- KPI values for each element
- Time-series data for charts

**Key Features**:
- Multi-element visualization (stacked bar charts)
- Element toggle (show/hide L1, L2, L3)
- Period selection (hourly, daily, monthly)
- Export functionality

**Components**:
- `CompteurSelector.vue`: Shared meter selector
- `PowerBreakdownChart.vue`: Element-level breakdown
- `TableDetailModal.vue`: Detailed data table

**State Management**:
- Global meter selection via `useMetersStore`
- Local element visibility state (refs)

### 3. Energy History View (`src/views/EnergyHistorical.vue`)

**Purpose**: Historical energy consumption analysis with date range selection

**Data Sources**:
```typescript
const metersStore = useMetersStore()
const historyStore = useEnergyHistoryStore()

// Get selected meters
const selectedMeters = metersStore.selectedMeters

// Fetch historical data for date range
await historyStore.fetchHistoricalData({
  compteurIds: selectedMeterIds.value,
  metricType: 'consumption',
  dateRange: { start: startDate, end: endDate }
})
```

**Data Retrieved**:
- Daily aggregated consumption data
- Hourly breakdown for selected date
- Peak/average/min values
- Multi-meter comparison

**Data Transformation**:
```typescript
// useEnergyHistoryStore.ts
function generateMockDailyData(dateStr, metricType, compteurId) {
  const meterData = metersStore.getFullMeterData(compteurId)
  
  if (meterData) {
    // Use centralized hourly data
    const hourlyData = meterData.timeSeries.hourly.map((dataPoint, index) => ({
      hour: index,
      value: dataPoint.value,
      quality: dataPoint.quality === 'fair' ? 'estimated' : dataPoint.quality
    }))
    
    return { hourlyData, totalValue, averageValue, peakData, minData }
  }
}
```

**Components**:
- `CompteurSelector.vue`: Meter selection
- `DateRangePicker.vue`: Date range selection
- `HistoricalChart.vue`: Multi-meter line chart
- `HourlyBreakdown.vue`: Hourly distribution

**State Management**:
- Meter selection via `useMetersStore`
- Historical data cache in `useEnergyHistoryStore`
- Date range in local state

### 4. Comparison View (`src/views/ComparisonView.vue`)

**Purpose**: Side-by-side meter comparison with period-over-period analysis

**Data Sources**:
```typescript
const metersStore = useMetersStore()
const comparisonStore = useComparisonStore()

// Get meters to compare
const meter1 = metersStore.getFullMeterData(meterId1)
const meter2 = metersStore.getFullMeterData(meterId2)

// Access time-series data
const hourlyData1 = meter1.timeSeries.hourly
const hourlyData2 = meter2.timeSeries.hourly
```

**Data Retrieved**:
- Side-by-side meter data
- Time-series for selected periods
- Percentage differences
- Cost/CO2 comparisons

**Comparison Logic**:
```typescript
// Calculate percentage difference
const diff = ((meter2.metrics.consumption - meter1.metrics.consumption) / 
              meter1.metrics.consumption) * 100
```

**Components**:
- `MeterComparisonCard.vue`: Side-by-side metrics
- `ComparisonChart.vue`: Overlay line chart
- `DifferenceIndicator.vue`: % change visualization

**State Management**:
- Meter selection via `useMetersStore`
- Comparison pairs in `useComparisonStore`
- Period selection in local state

### 5. Thermal Management View (`src/views/ThermalManagementView.vue`)

**Purpose**: Temperature sensor monitoring across zones

**Data Sources**:
```typescript
const sensorsStore = useSensorsStore()

// Fetch all sensors
await sensorsStore.fetchSensors()

// Get selected sensors
const selectedSensors = sensorsStore.selectedSensors

// Get sensor color mapping
const sensorColors = sensorsStore.selectedSensorColors
```

**Data Retrieved**:
- All 8 temperature sensors
- Real-time temperature readings
- Historical temperature trends
- Zone-based grouping

**Data Structure**:
```typescript
// Each sensor from MOCK_SENSORS
{
  id: 'sensor-1',
  name: 'Hall Principal',
  zone: 'Zone-A',
  readings: DataPoint[], // Current values
  timeSeries: {
    hourly: DataPoint[],
    daily: DataPoint[],
    monthly: DataPoint[]
  },
  minTemp: 18,
  maxTemp: 28,
  avgTemp: 22
}
```

**Components**:
- `SensorSelector.vue`: Sensor selection (max 8)
- `TemperatureChart.vue`: Multi-sensor line chart
- `ZoneCard.vue`: Zone-based temperature summary

**State Management**:
- Sensor selection via `useSensorsStore`
- Max 8 sensors enforced
- Color palette managed by store

**Color Assignment**:
```typescript
// Color assigned based on selection order
function getSensorColor(sensorId: string): string {
  const index = selectedSensorIds.value.indexOf(sensorId)
  return colorPalette[index % colorPalette.length] // Cycle through 8 colors
}
```

---

## Data Generation

### Time-Series Generation

All time-series data is generated using helper functions that create realistic patterns:

#### Hourly Data (24 points)
```typescript
function generateHourlyData(baseValue: number, variation: number): DataPoint[] {
  // Creates 24 hourly points
  // Peak hours: 6am-10pm (6-22) → higher values
  // Night hours: 10pm-6am (22-6) → 70% of base value
  
  const peakMultiplier = hour >= 6 && hour < 22 
    ? 1 + (hour - 6) * 0.02 
    : 0.7
  
  const value = baseValue * peakMultiplier + (Math.random() - 0.5) * variation
}
```

**Usage**: Real-time monitoring, intraday analysis

#### Daily Data (30 points)
```typescript
function generateDailyData(baseValue: number, variation: number, days = 30): DataPoint[] {
  // Creates 30 daily points (last 30 days)
  // Random variation around base value
  
  const value = baseValue + (Math.random() - 0.5) * variation
}
```

**Usage**: Month-over-month trends, daily consumption

#### Monthly Data (12 points)
```typescript
function generateMonthlyData(baseValue: number, variation: number, months = 12): DataPoint[] {
  // Creates 12 monthly points (last 12 months)
  // Multiplies by 30 to represent monthly totals
  
  const value = baseValue * 30 + (Math.random() - 0.5) * variation * 30
}
```

**Usage**: Year-over-year trends, seasonal analysis

### Data Quality

All generated data includes a `quality` field:
- `'good'`: Normal data (default)
- `'estimated'`: Interpolated or calculated values
- `'missing'`: Gaps in data stream
- `'fair'`: Partial data
- `'poor'`: Low confidence data

---

## Best Practices

### ✅ DO

1. **Import from mockData.ts for new code**
   ```typescript
   import { MOCK_METERS, getMeterById } from '@/data/mockData'
   ```

2. **Access data through stores**
   ```typescript
   const metersStore = useMetersStore()
   const meterData = metersStore.getFullMeterData(id)
   ```

3. **Let stores manage state mutations**
   ```typescript
   metersStore.toggleMeter(id) // ✅ Store handles selection
   ```

4. **Use type imports from mockData**
   ```typescript
   import type { Meter, Sensor, DataPoint } from '@/data/mockData'
   ```

5. **Leverage utility functions**
   ```typescript
   import { getMetersByCategory } from '@/data/mockData'
   const tgbtMeters = getMetersByCategory('TGBT')
   ```

### ❌ DON'T

1. **Don't mutate MOCK_METERS or MOCK_SENSORS directly**
   ```typescript
   MOCK_METERS[0].metrics.power = 100 // ❌ Don't mutate seed data
   ```

2. **Don't bypass stores to access data**
   ```typescript
   import { MOCK_METERS } from '@/data/mockData'
   const meter = MOCK_METERS.find(m => m.id === id) // ❌ Use store instead
   ```

3. **Don't import from metersData.ts in new code**
   ```typescript
   import { METERS_DATA } from '@/data/metersData' // ❌ Legacy only
   ```

4. **Don't duplicate data in components**
   ```typescript
   const localMeters = ref([...MOCK_METERS]) // ❌ Use store state
   ```

### Migration Guide (Legacy Code)

If you encounter old code importing from `metersData.ts`:

**Before**:
```typescript
import { METERS_DATA } from '@/data/metersData'
const meter = METERS_DATA.find(m => m.id === id)
```

**After**:
```typescript
import { useMetersStore } from '@/stores/useMetersStore'
const metersStore = useMetersStore()
const meter = metersStore.getFullMeterData(id)
```

### Adding New Mock Data

To add a new meter:

1. Add to `MOCK_METERS` array in `mockData.ts`:
```typescript
{
  id: '13',
  name: 'New Equipment',
  category: 'TGBT',
  metrics: { /* ... */ },
  timeSeries: {
    hourly: generateHourlyData(baseValue, variation),
    daily: generateDailyData(baseValue, variation),
    monthly: generateMonthlyData(baseValue, variation)
  },
  kpis: { /* ... */ }
}
```

2. No changes needed in stores (auto-detected)
3. Restart dev server if needed

To add a new sensor:

1. Add to `MOCK_SENSORS` array in `mockData.ts`
2. Ensure `SENSOR_COLOR_PALETTE` has enough colors (8 max)
3. Call `sensorsStore.fetchSensors()` to reload

---

## Summary

The unified mock data architecture provides:

- **🎯 Single Source of Truth**: All data in one place
- **🔄 Reactive State**: Vue 3 + Pinia reactivity
- **💾 Persistence**: localStorage for selections
- **🎨 Consistency**: Shared color palettes and interfaces
- **📊 Realistic Data**: Time-series with meaningful patterns
- **🔧 Maintainability**: Easy to update and extend
- **✅ Type Safety**: Full TypeScript support
- **🔙 Backward Compatible**: Legacy code still works

This architecture scales well for future enhancements like real API integration, as stores can be updated to fetch from endpoints while views remain unchanged.
