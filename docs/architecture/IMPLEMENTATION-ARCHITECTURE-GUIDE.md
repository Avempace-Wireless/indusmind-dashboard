# Dashboard & Views – Implementation Architecture Guide

**Status**: Phase 1 Complete (Device API + Stores + Dashboard View)
**Last Updated**: January 14, 2026

## Overview

This document provides the implementation architecture for the Dashboard & Views functional specification. It covers:
- Device API integration (PM2200 meters and Indusmind_T_Sensor temperature sensors)
- Store layer (Pinia stores for state management)
- Reusable selector components
- View implementations

---

## Part 1: Device API Integration ✅ COMPLETE

### File: `src/services/deviceAPI.ts`

**Purpose**: Centralized service for fetching and filtering devices from backend API.

**Key Features**:
- Filters PM2200 electrical meters
- Filters Indusmind_T_Sensor temperature sensors
- Supports search functionality
- Mock data for development (set `MOCK_DATA_ENABLED = true`)
- Real API fallback when backend is ready

**Exported Functions**:

```typescript
// Fetch and filter
export async function getAllMeters(): Promise<Meter[]>
export async function getAllSensors(): Promise<Sensor[]>
export async function getAllDevices(): Promise<{ meters: Meter[], sensors: Sensor[] }>

// Search
export async function searchMeters(query: string): Promise<Meter[]>
export async function searchSensors(query: string): Promise<Sensor[]>

// Get individual
export async function getMeterById(id: string): Promise<Meter | null>
export async function getSensorById(id: string): Promise<Sensor | null>
```

**Filtering Rules**:
- **Meters**: `device.name.startsWith('PM2200')`
- **Sensors**: `device.name.startsWith('Indusmind_T_Sensor')`

**Data Structures**:

```typescript
interface Meter {
  id: string
  name: string
  label: string
  deviceUUID: string
  type: 'meter'
}

interface Sensor {
  id: string
  name: string
  label: string
  deviceUUID: string
  type: 'sensor'
}
```

---

## Part 2: Pinia Stores ✅ COMPLETE

### Store 1: `src/stores/useDeviceMetersStore.ts`

**Purpose**: Centralized state for PM2200 electrical meters.

**Key Features**:
- Max 8 meters selection limit (`MAX_SELECTABLE_METERS = 8`)
- Persists to `localStorage` key: `dashboard:meters:selected`
- Color mapping based on selection order
- Search integration with device API

**State**:
```typescript
allMeters: Ref<Meter[]>              // All available PM2200 meters
selectedMeterIds: Ref<string[]>      // IDs of selected meters (max 8)
isLoading: Ref<boolean>              // Fetch state
error: Ref<string | null>            // Error message
lastModified: Ref<Date | null>       // Last change timestamp
```

**Key Actions**:
```typescript
fetchMeters()                         // Fetch all meters from API
setSelectedMeters(ids: string[])     // Set selection (enforces max 8)
toggleMeter(id: string)               // Add/remove meter
clearSelection()                      // Clear all
selectAllMeters()                     // Select up to max 8
searchMeters(query: string)           // Search by name/label
restoreSelection()                    // Restore from localStorage
persistSelection()                    // Save to localStorage
```

**Key Getters**:
```typescript
selectedMeters                        // Computed: selected meter objects
selectedMeterColors                   // Computed: color map
canSelectMore                         // Computed: boolean
stats                                 // Computed: { total, selected, remaining, maxSelectable }
primaryMeter                          // Computed: first selected (for Power/History views)
```

---

### Store 2: `src/stores/useSensorsStore.ts`

**Purpose**: Centralized state for Indusmind temperature sensors.

**Key Features**:
- Max 8 sensors selection limit
- Persists to `localStorage` key: `dashboard:sensors:selected`
- Color mapping based on selection order
- Mirrored API to meters store for consistency

**State/Actions/Getters**: Same structure as `useDeviceMetersStore` but for sensors.

---

## Part 3: Reusable Selector Components ✅ COMPLETE

### Component 1: `src/components/common/MeterSelector.vue`

**Purpose**: Modal dialog for selecting PM2200 meters.

**Features**:
- Search input (by name or label)
- Pagination (5, 10, 15, 20 items per page)
- Multi-select checkboxes
- Color indicators for selected meters
- Max 8 selection enforcement with feedback
- Responsive design
- Full i18n support

**Props**:
```typescript
interface Props {
  isOpen: boolean
}
```

**Emits**:
```typescript
interface Emits {
  apply: [meterIds: string[]]
  close: []
}
```

**Usage**:
```vue
<template>
  <MeterSelector
    :is-open="showMeterSelector"
    @apply="handleMeterSelection"
    @close="showMeterSelector = false"
  />
</template>

<script setup>
const showMeterSelector = ref(false)

function handleMeterSelection(meterIds: string[]) {
  metersStore.setSelectedMeters(meterIds)
  // Selection is now persisted and synced globally
}
</script>
```

---

### Component 2: `src/components/common/SensorSelector.vue`

**Purpose**: Modal dialog for selecting temperature sensors.

**Features**: Same as MeterSelector but for sensors.

**Usage**: Same pattern as MeterSelector.

---

## Part 4: View Implementations

### View 1: Dashboard (`src/views/DashboardView.vue`) ✅ COMPLETE

**Changes Made**:
- Replaced `CompteurSelector` with `MeterSelector`
- Import `useDeviceMetersStore` instead of legacy meter store
- Use `metersStore.selectedMeters` (reactive array of Meter objects)
- Call `metersStore.fetchMeters()` on mount
- Show empty state when no meters selected
- Display widgets for each selected meter
- Pass meter data to components

**Key Implementation Points**:

```vue
<script setup lang="ts">
import { useDeviceMetersStore } from '@/stores/useDeviceMetersStore'
import MeterSelector from '@/components/common/MeterSelector.vue'

const metersStore = useDeviceMetersStore()
const showMeterSelector = ref(false)

onMounted(async () => {
  // Fetch meters from device API
  await metersStore.fetchMeters()
})

function handleMeterSelection(meterIds: string[]) {
  metersStore.setSelectedMeters(meterIds)
}
</script>
```

---

### View 2: Power View (`src/views/Puissance.vue`) ⚠️ IN PROGRESS

**Specification**:
- No category selection (meters are flat entities)
- **Primary Selection**: Single meter selector
  - One PM2200 meter drives KPIs and charts
  - Replaces current hardcoded selection buttons
- **Optional Comparison**: Secondary panel
  - "Select meters to compare" button
  - Multi-select (max 8 meters)
  - Charts show primary meter + comparison meters
  - Use legend to distinguish primary vs compared

**Implementation Steps**:

1. **Import new stores and components**:
   ```typescript
   import { useDeviceMetersStore } from '@/stores/useDeviceMetersStore'
   import MeterSelector from '@/components/common/MeterSelector.vue'
   ```

2. **Replace meter selection UI**:
   - Remove current hardcoded buttons
   - Add "Select Meter" button that opens MeterSelector
   - Use `primaryMeter` from store (first selected)
   - Use `selectedMeters` for comparison options

3. **Update KPI display**:
   ```typescript
   const primaryMeter = computed(() => metersStore.primaryMeter)
   
   const kpiList = computed(() => {
     if (!primaryMeter.value) return []
     // Fetch KPI data for primaryMeter.id
     return [...]
   })
   ```

4. **Add comparison panel**:
   ```vue
   <div v-if="showComparisonPanel">
     <MeterSelector
       :is-open="showComparisonSelector"
       @apply="handleComparisonSelection"
     />
     <!-- Comparison controls -->
   </div>
   ```

5. **Chart updates**:
   - Primary meter: solid line
   - Compared meters: dashed lines or different style
   - Legend shows all selected meters with colors

**Layout**:
```
┌─────────────────────────────────────────┐
│ Select Meter [dropdown] ▼               │
│ Select meters to compare [button]       │
└─────────────────────────────────────────┘
    ↓ Primary meter: PM2200-TGBT-Indusmind
├─ KPI Cards (from selected meter)
├─ Charts (primary + compared)
├─ Data Tables
└─ Version info
```

---

### View 3: History View (`src/views/HistoryView.vue`) ⚠️ PLANNED

**Specification**:
- Mirror Power View for consistency
- **Primary Selection**: Single meter selector
- **Optional Comparison**: Secondary panel (max 8)
- **Date Controls**: Range picker + granularity selector
- Charts react to: meter change, date change, comparison change

**Implementation**: Same pattern as Power View but for historical data.

---

### View 4: Thermal Management View (`src/views/ThermalManagementView.vue`) ⚠️ PLANNED

**Specification**:
- **Manage Sensors Button**: Right-aligned in header
- Opens `SensorSelector` modal
- Multi-select sensors (max 8)
- Selected sensors define charts and KPIs

**Key Implementation**:

```vue
<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1>{{ $t('thermal.title') }}</h1>
      <button @click="showSensorSelector = true">
        {{ $t('thermal.manageSensors') }}
      </button>
    </div>

    <!-- Sensor Selector -->
    <SensorSelector
      :is-open="showSensorSelector"
      @apply="handleSensorSelection"
      @close="showSensorSelector = false"
    />

    <!-- Display selected sensors -->
    <div v-if="selectedSensors.length === 0" class="empty-state">
      <!-- Show guidance -->
    </div>

    <div v-else>
      <!-- Charts for selected sensors -->
      <TemperatureChart :sensors="selectedSensors" />
      <!-- KPI cards -->
      <SensorKPIs :sensors="selectedSensors" />
    </div>
  </div>
</template>

<script setup>
import { useSensorsStore } from '@/stores/useSensorsStore'
import SensorSelector from '@/components/common/SensorSelector.vue'

const sensorsStore = useSensorsStore()
const showSensorSelector = ref(false)

onMounted(async () => {
  await sensorsStore.fetchSensors()
})

function handleSensorSelection(sensorIds: string[]) {
  sensorsStore.setSelectedSensors(sensorIds)
}
</script>
```

---

## Part 5: Internationalization (i18n) 📝 REQUIRED

### Translation Keys to Add

**Common Keys** (reusable):
```yaml
common:
  selectUpTo: "Select up to"
  items: "items"
  search: "Search..."
  loading: "Loading..."
  noResults: "No results found"
  selected: "selected"
  maxSelectionReached: "Maximum selection reached"
  clearAll: "Clear All"
  apply: "Apply"
  previous: "Previous"
  next: "Next"
  page: "Page"
  of: "of"
  itemsPerPage: "Items per page"
```

**Dashboard Keys**:
```yaml
dashboard:
  manageMeters: "Manage Meters"
  noMetersSelected:
    title: "No meters selected"
    description: "Select meters to view their data"
    action: "Select Meters"
  unifiedChart:
    subtitle: "{count} meter(s) selected"
```

**Thermal Keys**:
```yaml
thermal:
  title: "Temperature Control"
  manageSensors: "Manage Sensors"
  noSensorsSelected:
    title: "No sensors selected"
    description: "Select temperature sensors"
    action: "Select Sensors"
```

**Comparison Keys**:
```yaml
comparison:
  selectToCompare: "Select meters to compare"
  primary: "Primary"
  comparison: "Comparison"
```

---

## Part 6: Testing Checklist ✓

### Functionality
- [x] Device API filters PM2200 and sensors correctly
- [x] Meters store enforces max 8 selection
- [x] Sensors store enforces max 8 selection
- [x] Selector components support search and pagination
- [x] Selection persists on page reload
- [x] Selection persists across views
- [ ] Power View shows primary meter selection
- [ ] Power View comparison panel works
- [ ] History View mirrors Power View
- [ ] Thermal View shows sensor selection
- [ ] Charts update when selection changes

### UX/Responsiveness
- [ ] Mobile: Modals display correctly on small screens
- [ ] Tablet: Pagination is usable
- [ ] Desktop: Full feature set visible
- [ ] Dark mode: All components styled correctly

### i18n
- [ ] All translation keys exist in EN and FR
- [ ] Selection persists across language switch
- [ ] Language switching doesn't reset selected items

---

## Part 7: Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       Views                             │
├─────────────────────────────────────────────────────────┤
│  DashboardView ✅ │ Puissance ⚠️ │ HistoryView ⚠️ │ Thermal ⚠️ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Reusable Selectors                     │
├─────────────────────────────────────────────────────────┤
│    MeterSelector ✅    │    SensorSelector ✅           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Pinia Stores                          │
├─────────────────────────────────────────────────────────┤
│ useDeviceMetersStore ✅ │ useSensorsStore ✅           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Device API Service                    │
├─────────────────────────────────────────────────────────┤
│       deviceAPI.ts (Filters PM2200 & Sensors) ✅       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Backend API / Mock Data                │
├─────────────────────────────────────────────────────────┤
│        GET /devices (Mock: MOCK_DATA_ENABLED)          │
└─────────────────────────────────────────────────────────┘
```

---

## Part 8: Storage & Persistence

### localStorage Keys
- `dashboard:meters:selected` → Array of meter IDs
- `dashboard:sensors:selected` → Array of sensor IDs

### Persistence Behavior
- Selection is automatically saved on change
- Selection is automatically restored on page load
- Selection is shared across all views (global state)
- Clearing localStorage clears both selections

---

## Part 9: Migration Guide (Legacy to Device API)

### For Legacy Components

If you have components using the old hardcoded meter data:

**Before**:
```typescript
import { METERS_DATA } from '@/data/metersData'
const meters = METERS_DATA
```

**After**:
```typescript
import { useDeviceMetersStore } from '@/stores/useDeviceMetersStore'
const metersStore = useDeviceMetersStore()
const meters = metersStore.allMeters
```

### For Views Using CompteurSelector

**Before**:
```vue
<CompteurSelector
  :is-open="showCompteurSelector"
  :all-compteurs="allCompteurs"
  :selected-ids="selectedCompteurIds"
  @apply="handleCompteurSelection"
/>
```

**After**:
```vue
<MeterSelector
  :is-open="showMeterSelector"
  @apply="handleMeterSelection"
/>
```

---

## Next Steps

1. **Power View** - Implement primary meter selection + comparison
2. **History View** - Mirror Power View
3. **Thermal View** - Implement sensor selection
4. **i18n** - Add all translation keys
5. **Testing** - Verify all functionality
6. **Documentation** - Update component storybook

---

**Questions?** Refer to the original functional specification or implementation notes.
