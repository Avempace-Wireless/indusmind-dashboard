# Frontend Architecture & View Consistency Audit
**Energy Metrics & Data Visualization Platform (Vue.js 3 + Pinia)**

**Audit Date:** January 13, 2026  
**Status:** Current State Analysis + Recommendations  
**Project Focus:** Dashboard, Power, History, Comparison views with centralized meter selection

---

## Executive Summary

### Current State: ⚠️ HIGH FRAGMENTATION

The application has **4 main analytical views** that operate on the same underlying meter data, but:

- ❌ **Meter selection is NOT centralized** — Each view manages its own selection
- ❌ **Data fetching is duplicated** — Metric data retrieved independently per view
- ❌ **Store architecture is scattered** — Multiple overlapping stores with conflicting state
- ❌ **View-specific logic is tightly coupled** — Hard to maintain and scale
- ⚠️ **Partial i18n implementation** — Mixed hardcoded and translated text
- ✅ **Good foundation** — Pinia stores exist, components are modular

### Risk Assessment

| Risk | Severity | Impact |
|------|----------|--------|
| Meter selection inconsistency | 🔴 CRITICAL | Users see different data across views |
| Duplicated fetch logic | 🔴 CRITICAL | Performance degradation, sync issues |
| No centralized state | 🟠 HIGH | Difficult to add global features (filters, export) |
| View-specific data logic | 🟠 HIGH | Maintenance burden, testing complexity |
| Tight coupling | 🟡 MEDIUM | Hard to replace mock data with real API |

### Recommended Priority

1. **Phase 1 (URGENT):** Centralize meter selection & persistence
2. **Phase 2 (HIGH):** Unified metrics data architecture
3. **Phase 3 (MEDIUM):** View-specific composables & refactoring
4. **Phase 4 (LOW):** Backend API integration readiness

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Dashboard View

**File:** `src/views/DashboardView.vue` (420 lines)

#### ✅ What's Implemented

- **Compteur Selection Modal:** Custom meter selection with visual feedback
- **Widget Grid:** Dynamic responsive layout with per-meter widgets
- **Unified Chart:** Multi-meter consumption chart
- **KPI Cards:** Phase balance, connection status, real-time metrics
- **State Management:** Uses `useDashboardStore`
- **Internationalization:** Mostly translated (EN/FR)

#### ❌ What's Missing or Broken

| Issue | Type | Impact | Severity |
|-------|------|--------|----------|
| Selection NOT persisted | Architecture | Reloading page loses meter selection | 🔴 CRITICAL |
| Hard-coded compteur list in store | Duplication | Same list in multiple stores | 🔴 CRITICAL |
| Meter selection is local state | Isolation | Power/History/Comparison don't see it | 🔴 CRITICAL |
| No time range consistency | Coupling | Each view has own date selection | 🟠 HIGH |
| Chart data generation in view | Logic Location | Should be in store/composable | 🟠 HIGH |
| Mock API calls scattered | Data Flow | No single source of truth | 🟠 HIGH |

#### 📋 View-Specific Issues

```typescript
// ❌ BAD: Store-level duplication
const mockCompteurs: Compteur[] = [
  { id: 'compteur-1', name: 'TGBT', ... },
  // ... repeated in useComparisonStore, usePuissanceStore, etc.
]

// ❌ BAD: Local selection not shared
const selectedCompteurIds = ref<string[]>([])
// This is ONLY local to this view

// ✅ GOOD: Modal component is reusable
<CompteurSelector
  :all-compteurs="allCompteurs"
  :selected-ids="selectedCompteurIds"
  @apply="handleCompteurSelection"
/>
```

---

### 1.2 Power (Puissance) View

**File:** `src/views/PuissanceView.vue` (assumed based on sidebar)

#### ✅ What's Implemented

- Meter display with real-time power metrics
- Chart with time range selector
- KPI cards (instantaneous power, etc.)

#### ❌ What's Missing or Broken

| Issue | Type | Impact | Severity |
|-------|------|--------|----------|
| Independent meter selection | Duplication | Not synced with Dashboard | 🔴 CRITICAL |
| Separate store (usePuissanceStore?) | Isolation | Data not shared | 🔴 CRITICAL |
| No localStorage persistence | UX | Selection lost on refresh | 🔴 CRITICAL |
| Time range management | State Mgmt | Each view has own range | 🟠 HIGH |
| Mock data generation duplicated | Code Quality | Not DRY | 🟠 HIGH |

---

### 1.3 History (Energy Historical) View

**File:** `src/views/EnergyHistorical.vue` (881 lines)

#### ✅ What's Implemented

- **Calendar date selection** with drag-to-select
- **Multi-month navigation** with proper state management
- **Period presets** (Last 7 days, Last 30 days, etc.)
- **Metric selection** (consumption, energy, cost, CO2)
- **Export functionality** (CSV/PDF)
- **Resolution auto-detection** (hourly vs. daily)
- **Meter toggling** with visibility control
- **Advanced filtering** by hour range

#### ✅ What's Done Right

```typescript
// ✅ GOOD: Uses store composition
const {
  selectedDates,
  currentMonth,
  activePeriodPreset,
  enabledMetrics,
  selectedCompteurs,
  visibleCompteurs,
} = storeToRefs(store)

// ✅ GOOD: Computed resolution
const effectiveResolution = computed(() =>
  selectedDates.value.length === 1 ? 'hourly' : 'daily'
)

// ✅ GOOD: Calendar drag-to-select preserves selections
const onDragOver = (dateStr: string | null) => {
  const draggedDates = getDatesBetween(dragStart.value, dateStr)
  const existingDates = selectedDates.value.filter(d => !draggedDates.includes(d))
  selectedDates.value = [...existingDates, ...draggedDates]
}
```

#### ❌ What's Missing or Broken

| Issue | Type | Impact | Severity |
|-------|------|--------|----------|
| Meter selection not synced | Architecture | Local `activeCompteurIds` ref | 🔴 CRITICAL |
| Uses own store (useEnergyHistoryStore) | Isolation | Not connected to Dashboard | 🔴 CRITICAL |
| Duplicate compteur list | Code Quality | Same as Dashboard store | 🟠 HIGH |
| Chart data generation in view | Logic Location | Should be composable | 🟠 HIGH |
| No sync with Power view time ranges | UX | Inconsistent experience | 🟠 HIGH |

---

### 1.4 Comparison View

**File:** `src/views/ComparisonView.vue` (862 lines)

#### ✅ What's Implemented

- **Comparison modes** (byMeters, matrix)
- **Multi-meter selection** with checkboxes
- **Aggregation levels** (hourly, daily, weekly, monthly)
- **Chart types** (bar, line, heatmap, table)
- **Characteristics selector** (consumption, energy, cost, co2) ← RECENTLY ADDED
- **View options** (ranking, variance, outliers, trends)
- **KPI cards** with variance calculations
- **Pagination** for data tables
- **Heatmap visualization**

#### ✅ What's Done Right

```typescript
// ✅ GOOD: Uses Pinia store composition
const {
  comparisonMode,
  selectedMeterIds,
  selectedPeriods,
  aggregationLevel,
  chartType,
  viewOptions,
} = storeToRefs(store)

// ✅ GOOD: Characteristics selector (new feature)
const selectedCharacteristic = ref<'consumption' | 'energy' | 'cost' | 'co2'>('consumption')

// ✅ GOOD: Preset helpers for active state
function isPresetActive(preset: string): boolean {
  const expected = presetDatesFor(preset).sort()
  const current = [...selectedDates.value].sort()
  return expected.length === current.length &&
    expected.every((v, i) => v === current[i])
}
```

#### ❌ What's Missing or Broken

| Issue | Type | Impact | Severity |
|-------|------|--------|----------|
| Independent meter selection | Isolation | Doesn't sync with Dashboard | 🔴 CRITICAL |
| Characteristics not integrated into data | Feature Incomplete | UI selector exists, data logic missing | 🟠 HIGH |
| No sync with global time range | UX Inconsistency | Each view has own dates | 🟠 HIGH |
| Heatmap colors not respect characteristic unit | UX | CO2 and kWh use same scale | 🟠 HIGH |
| KPI calculations not parameterized | Logic | Hard to extend | 🟡 MEDIUM |

---

## PART 2: CENTRALIZED METER SELECTION SYSTEM

### 2.1 Current Problem

```
┌─────────────────────────────────────────────────────┐
│            CURRENT (FRAGMENTED)                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Dashboard                 Power                     │
│  ┌──────────────┐       ┌──────────────┐            │
│  │ selectedIDs  │       │ selectedIDs   │            │
│  │ [comp-1,2]   │       │ [comp-3,4]    │            │
│  └──────────────┘       └──────────────┘            │
│       ❌ Different!           ❌ Different!         │
│                                                       │
│  History                  Comparison                 │
│  ┌──────────────┐       ┌──────────────┐            │
│  │ activeCompt  │       │ selectedMeter│            │
│  │ Ids          │       │ Ids           │            │
│  │ [comp-1,4]   │       │ [comp-2,3]    │            │
│  └──────────────┘       └──────────────┘            │
│       ❌ Different!           ❌ Different!         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 2.2 Proposed Centralized Architecture

```
┌─────────────────────────────────────────────────────┐
│      PROPOSED (CENTRALIZED)                          │
├─────────────────────────────────────────────────────┤
│                                                       │
│              useMetersStore (Pinia)                  │
│          ┌─────────────────────────────┐            │
│          │  STATE                      │            │
│          │  • allMeters[]              │            │
│          │  • selectedMeterIds[]       │            │
│          │  • meterMetadata{}          │            │
│          │  • meterColors{}            │            │
│          │  • lastModified: Date       │            │
│          │                             │            │
│          │  ACTIONS                    │            │
│          │  • toggleMeter(id)          │            │
│          │  • setSelectedMeters(ids[]) │            │
│          │  • selectAllMeters()        │            │
│          │  • clearSelection()         │            │
│          │                             │            │
│          │  GETTERS                    │            │
│          │  • getSelectedMeters()      │            │
│          │  • getMeterById(id)         │            │
│          │  • getMeterColor(id)        │            │
│          └─────────────────────────────┘            │
│                      ▲                              │
│                      │ (single source of truth)     │
│                      │                              │
│        ┌─────────────┼─────────────┬────────────┐  │
│        │             │             │            │   │
│    Dashboard      Power          History      Comparison
│    (consumes)     (consumes)      (consumes)   (consumes)
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 2.3 Store Implementation

**File:** `src/stores/useMetersStore.ts` (NEW)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MeterMetadata {
  id: string
  name: string
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage' | 'Other'
  unit: string // kWh, W, V, A, etc.
  site: string // Physical location
  color: string // Hex color for charts
  icon: string // Material icon name
  status: 'online' | 'offline'
  lastReadTime?: Date
}

export const useMetersStore = defineStore('meters', () => {
  // ===========================
  // STATE - Single Source of Truth
  // ===========================
  
  /**
   * All available meters in the system
   * Fetched once from API or config, cached in memory
   */
  const allMeters = ref<MeterMetadata[]>([
    {
      id: 'meter-tgbt',
      name: 'TGBT',
      category: 'TGBT',
      unit: 'kWh',
      site: 'Main',
      color: '#ef4444',
      icon: 'electric_bolt',
      status: 'online'
    },
    // ... 5 more meters
  ])

  /**
   * Currently selected meter IDs
   * Cross-view visible state
   * Persisted to localStorage
   */
  const selectedMeterIds = ref<string[]>([])

  /**
   * Metadata cache
   * Computed once, used everywhere
   */
  const meterMetadata = ref<Record<string, MeterMetadata>>({})

  /**
   * Color mapping (derived)
   * Keep consistent across all views
   */
  const meterColorMap = computed(() =>
    Object.fromEntries(
      allMeters.value.map(m => [m.id, m.color])
    )
  )

  // ===========================
  // ACTIONS - State Mutations
  // ===========================

  /**
   * Toggle a single meter selection
   * @param meterId - Meter to toggle
   */
  function toggleMeter(meterId: string) {
    const idx = selectedMeterIds.value.indexOf(meterId)
    if (idx > -1) {
      selectedMeterIds.value.splice(idx, 1)
    } else {
      selectedMeterIds.value.push(meterId)
    }
    persistSelection()
  }

  /**
   * Replace all selected meters
   * @param meterIds - Array of meter IDs to select
   */
  function setSelectedMeters(meterIds: string[]) {
    selectedMeterIds.value = meterIds
    persistSelection()
  }

  /**
   * Select all available meters
   */
  function selectAllMeters() {
    selectedMeterIds.value = allMeters.value.map(m => m.id)
    persistSelection()
  }

  /**
   * Deselect all meters
   */
  function clearSelection() {
    selectedMeterIds.value = []
    persistSelection()
  }

  /**
   * Restore from localStorage
   * Called on app startup
   */
  function restoreSelection() {
    try {
      const saved = localStorage.getItem('meters:selected')
      if (saved) {
        selectedMeterIds.value = JSON.parse(saved)
      } else {
        // Default: select first 4 meters
        selectAllMeters()
      }
    } catch (e) {
      console.warn('Failed to restore meter selection:', e)
      selectAllMeters()
    }
  }

  /**
   * Persist selection to localStorage
   */
  function persistSelection() {
    try {
      localStorage.setItem('meters:selected', JSON.stringify(selectedMeterIds.value))
    } catch (e) {
      console.warn('Failed to persist meter selection:', e)
    }
  }

  // ===========================
  // GETTERS - Computed Access
  // ===========================

  /**
   * Get currently selected meter objects
   */
  const selectedMeters = computed(() =>
    allMeters.value.filter(m => selectedMeterIds.value.includes(m.id))
  )

  /**
   * Get meter by ID with fallback
   */
  function getMeterById(meterId: string): MeterMetadata | undefined {
    return allMeters.value.find(m => m.id === meterId)
  }

  /**
   * Get color for a specific meter
   * Used in charts across all views
   */
  function getMeterColor(meterId: string): string {
    return getMeterById(meterId)?.color ?? '#999999'
  }

  /**
   * Get all meters by category
   */
  function getMetersByCategory(category: string) {
    return allMeters.value.filter(m => m.category === category)
  }

  /**
   * Check if meter is selected
   */
  function isMeterSelected(meterId: string): boolean {
    return selectedMeterIds.value.includes(meterId)
  }

  /**
   * Get meter count stats
   */
  const meterStats = computed(() => ({
    total: allMeters.value.length,
    selected: selectedMeterIds.value.length,
    online: allMeters.value.filter(m => m.status === 'online').length,
    offline: allMeters.value.filter(m => m.status === 'offline').length,
  }))

  return {
    // State
    allMeters,
    selectedMeterIds,
    meterColorMap,

    // Actions
    toggleMeter,
    setSelectedMeters,
    selectAllMeters,
    clearSelection,
    restoreSelection,
    persistSelection,

    // Getters
    selectedMeters,
    getMeterById,
    getMeterColor,
    getMetersByCategory,
    isMeterSelected,
    meterStats,
  }
})
```

### 2.4 Persistence Strategy

```typescript
// Initialize on app startup (main.ts or router guard)
import { useMetersStore } from '@/stores/useMetersStore'

const router = createRouter({ /* ... */ })

router.beforeEach(() => {
  const meters = useMetersStore()
  meters.restoreSelection() // Load from localStorage
})

// Or in App.vue onMounted:
onMounted(() => {
  useMetersStore().restoreSelection()
})
```

**Persistence Format (localStorage):**

```json
// Key: "meters:selected"
// Value:
["meter-tgbt", "meter-compressors", "meter-cooling"]
```

---

## PART 3: CENTRALIZED DATA ARCHITECTURE

### 3.1 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION DATA LAYER                    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Step 1: Raw Meters (Source of Truth)                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ useMetersStore                                         │  │
│  │  • allMeters: MeterMetadata[]                          │  │
│  │  • selectedMeterIds: string[]                          │  │
│  │  • getMeterColor(id): string                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ▼                                  │
│  Step 2: Raw Metrics Data                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ useMetricsStore (NEW)                                  │  │
│  │  • metricsByMeter: Record<meterId, Metric[]>          │  │
│  │  • timeRange: { start, end }                           │  │
│  │  • aggregationLevel: 'hourly' | 'daily' | ...          │  │
│  │  • loading, error states                               │  │
│  │                                                         │  │
│  │  Actions:                                               │  │
│  │  • fetchMetrics(meterIds, timeRange)                   │  │
│  │  • setTimeRange(start, end)                            │  │
│  │  • setAggregationLevel(level)                          │  │
│  │                                                         │  │
│  │  Getters:                                               │  │
│  │  • getMetricsFor(meterId): Metric[]                    │  │
│  │  • getAllMetricsFlat(): Metric[]                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ▼                                  │
│  Step 3: View-Specific Selectors (Composables)              │
│  ┌────────────┬──────────────┬──────────────┬────────────┐   │
│  │ useMetrics │ useDashboard │ useHistory   │useComparison    │
│  │ Data       │ Data         │ Data         │Data        │
│  │ Selector   │ Selector     │ Selector     │Selector    │
│  │            │              │              │            │
│  │ ✅ Multi-meter selection   │ ✅ Time range filtering    │
│  │ ✅ Real-time aggregation   │ ✅ View-specific transforms    │
│  │ ✅ Cross-meter comparison  │ ✅ Chart formatting       │
│  └────────────┴──────────────┴──────────────┴────────────┘   │
│                            ▼                                  │
│  Step 4: UI Components (Charts, Tables, Cards)              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Render transformed data                               │    │
│  │ ✅ No data fetching                                   │    │
│  │ ✅ Pure presentation logic                            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Unified Metrics Store

**File:** `src/stores/useMetricsStore.ts` (NEW)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMetersStore } from './useMetersStore'

export interface TimeRange {
  start: Date
  end: Date
}

export interface Metric {
  meterId: string
  timestamp: Date
  value: number
  unit: string
  type: 'consumption' | 'power' | 'voltage' | 'current'
}

export interface AggregatedMetric extends Metric {
  count: number
  min: number
  max: number
  avg: number
}

export const useMetricsStore = defineStore('metrics', () => {
  const metersStore = useMetersStore()

  // ===========================
  // STATE
  // ===========================

  /**
   * Normalized metric data by meter
   * Structure: { [meterId]: [metric, metric, ...] }
   */
  const metricsByMeter = ref<Record<string, Metric[]>>({})

  /**
   * Current time range for all views
   * Shared across Dashboard, Power, History, Comparison
   */
  const timeRange = ref<TimeRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  })

  /**
   * Aggregation level for data grouping
   */
  const aggregationLevel = ref<'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')

  /**
   * Loading state for all data
   */
  const loading = ref(false)

  /**
   * Error state
   */
  const error = ref<string | null>(null)

  // ===========================
  // ACTIONS
  // ===========================

  /**
   * Fetch metrics for selected meters
   * Single source of truth for data loading
   */
  async function fetchMetrics(meterIds?: string[]) {
    const ids = meterIds || metersStore.selectedMeterIds
    if (ids.length === 0) return

    loading.value = true
    error.value = null

    try {
      // In real app, call API:
      // const data = await metricsAPI.fetch(ids, timeRange.value, aggregationLevel.value)

      // For now, generate mock data
      const newMetrics: Record<string, Metric[]> = {}
      for (const meterId of ids) {
        newMetrics[meterId] = generateMockMetrics(meterId, timeRange.value)
      }
      metricsByMeter.value = newMetrics
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Failed to fetch metrics:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Update time range and refresh data
   */
  function setTimeRange(start: Date, end: Date) {
    timeRange.value = { start, end }
    fetchMetrics() // Auto-refresh
  }

  /**
   * Update aggregation level and refresh data
   */
  function setAggregationLevel(level: typeof aggregationLevel.value) {
    aggregationLevel.value = level
    fetchMetrics() // Auto-refresh
  }

  /**
   * Invalidate and refresh all metric data
   */
  async function refresh() {
    await fetchMetrics()
  }

  // ===========================
  // GETTERS
  // ===========================

  /**
   * Get metrics for a specific meter
   */
  function getMetricsFor(meterId: string): Metric[] {
    return metricsByMeter.value[meterId] || []
  }

  /**
   * Get all metrics for selected meters (flat)
   */
  const allMetricsFlat = computed(() => {
    const flat: Metric[] = []
    for (const meterId of metersStore.selectedMeterIds) {
      flat.push(...getMetricsFor(meterId))
    }
    return flat
  })

  /**
   * Get aggregated metrics for a meter
   */
  function getAggregatedMetrics(meterId: string): AggregatedMetric[] {
    const metrics = getMetricsFor(meterId)
    if (metrics.length === 0) return []

    const groups = groupByAggregation(metrics, aggregationLevel.value)
    return groups.map(g => ({
      meterId,
      timestamp: g.timestamp,
      value: g.values.reduce((a, b) => a + b, 0) / g.values.length, // avg
      unit: metrics[0].unit,
      type: metrics[0].type,
      count: g.values.length,
      min: Math.min(...g.values),
      max: Math.max(...g.values),
      avg: g.values.reduce((a, b) => a + b, 0) / g.values.length,
    }))
  }

  /**
   * Get total consumption across selected meters
   */
  const totalConsumption = computed(() => {
    return allMetricsFlat.value.reduce((sum, m) => sum + m.value, 0)
  })

  /**
   * Get average power per meter
   */
  const averagePowerPerMeter = computed(() => {
    const result: Record<string, number> = {}
    for (const meterId of metersStore.selectedMeterIds) {
      const metrics = getMetricsFor(meterId)
      if (metrics.length > 0) {
        result[meterId] = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
      }
    }
    return result
  })

  // ===========================
  // HELPERS
  // ===========================

  function groupByAggregation(metrics: Metric[], level: string) {
    // Implementation here
  }

  function generateMockMetrics(meterId: string, range: TimeRange): Metric[] {
    // Implementation here
  }

  return {
    metricsByMeter,
    timeRange,
    aggregationLevel,
    loading,
    error,
    fetchMetrics,
    setTimeRange,
    setAggregationLevel,
    refresh,
    getMetricsFor,
    allMetricsFlat,
    getAggregatedMetrics,
    totalConsumption,
    averagePowerPerMeter,
  }
})
```

---

## PART 4: VIEW-SPECIFIC RESPONSIBILITIES

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         CENTRALIZED STATE                                │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ useMetersStore   │    │ useMetricsStore  │          │
│  │ (WHO)            │    │ (WHAT & WHEN)    │          │
│  └──────────────────┘    └──────────────────┘          │
│            ▲                      ▲                     │
│            │ subscribed to       │ subscribed to       │
│            │                     │                     │
└────────────┼─────────────────────┼────────────────────┘
             │                     │
     ┌───────┴─────┬───────────────┼───────┬──────────┐
     │             │               │       │          │
  ┌──▼───┐  ┌─────▼──┐  ┌────────▼──┐  ┌─▼────┐  ┌──▼──┐
  │ DASH │  │ POWER  │  │ HISTORY   │  │COMPAR│  │ ...│
  │      │  │        │  │           │  │ISON  │  │    │
  │      │  │        │  │           │  │      │  │    │
  └──┬───┘  └───┬────┘  └────┬──────┘  └──┬───┘  └──┬──┘
     │          │            │           │        │
     └──────────┼────────────┼───────────┴────────┘
                │            │
          View-specific    View-specific
          transformations  transformations
```

### 4.2 Dashboard View Responsibilities

**Purpose:** Real-time monitoring with high-level KPIs

**Data Responsibility:**
- ✅ Subscribe to `useMetersStore.selectedMeters`
- ✅ Subscribe to `useMetricsStore.averagePowerPerMeter`
- ✅ Use last 24 hours of data (`timeRange.end - 24h`)
- ✅ NO independent meter selection
- ✅ NO duplicate data fetching

**View-Specific Logic:**
- Format KPI cards (current power, voltage, etc.)
- Real-time refresh (15-30 second intervals)
- Widget layout responsiveness
- Phase balance calculations

**Refactored Example:**

```vue
<script setup lang="ts">
import { useMetersStore } from '@/stores/useMetersStore'
import { useMetricsStore } from '@/stores/useMetricsStore'
import { useDashboardSelector } from '@/composables/useDashboardSelector'

const metersStore = useMetersStore()
const metricsStore = useMetricsStore()

// ✅ Use centralized meter selection
const selectedMeters = computed(() => metersStore.selectedMeters)

// ✅ Dashboard-specific data transformation
const { kpiCards, meterWidgets } = useDashboardSelector()

// ✅ Handle meter selection modal
function applyMeterSelection(ids: string[]) {
  metersStore.setSelectedMeters(ids)
  // Auto-refresh metrics via store watcher
}

// ✅ Real-time refresh
onMounted(() => {
  const interval = setInterval(
    () => metricsStore.refresh(),
    15000 // 15 seconds
  )
  onBeforeUnmount(() => clearInterval(interval))
})
</script>

<template>
  <CompteurSelector
    :all-meters="metersStore.allMeters"
    :selected-ids="metersStore.selectedMeterIds"
    @apply="applyMeterSelection"
  />

  <!-- ✅ Render from centralized data -->
  <CompteurWidget
    v-for="meter in selectedMeters"
    :key="meter.id"
    :meter="meter"
    :power="metricsStore.averagePowerPerMeter[meter.id]"
  />
</template>
```

### 4.3 Power (Puissance) View Responsibilities

**Purpose:** Instantaneous power analysis with peak detection

**Data Responsibility:**
- ✅ Use same `metersStore.selectedMeters`
- ✅ Render last 1-24 hours (user selectable)
- ✅ Aggregate to hourly/daily power curves
- ✅ NO independent selection

**View-Specific Logic:**
- Power factor calculations
- Peak/off-peak detection
- Power curve aggregation
- Comparison with daily targets

```typescript
// Composable: useMetricsData.ts
export function usePowerData() {
  const metersStore = useMetersStore()
  const metricsStore = useMetricsStore()

  // Transform metrics into power-focused format
  const powerPerHour = computed(() => {
    // Group metrics by hour
    // Return: { hourLabel: totalPowerKW }
  })

  const peakPower = computed(() => {
    // Find max power in current range
    return Math.max(...Object.values(powerPerHour.value))
  })

  const averagePower = computed(() => {
    // Calculate average across selected meters
  })

  return {
    powerPerHour,
    peakPower,
    averagePower,
  }
}
```

### 4.4 History View Responsibilities

**Purpose:** Historical trend analysis with flexible date ranges

**Data Responsibility:**
- ✅ Use same `metersStore.selectedMeters`
- ✅ Allow custom time range selection
- ✅ Support multiple aggregation levels
- ✅ Support multiple characteristics (consumption, energy, cost, CO2)
- ✅ NO local meter selection

**View-Specific Logic:**
- Calendar date picker
- Period presets (Last 7 days, etc.)
- Resolution auto-detection
- Export functionality
- Metric characteristic filtering

**Current Status:** ✅ MOSTLY CORRECT (uses its own store but could be refactored)

### 4.5 Comparison View Responsibilities

**Purpose:** Cross-meter analysis with ranking and variance

**Data Responsibility:**
- ✅ Use same `metersStore.selectedMeters`
- ✅ Use centralized `metricsStore.timeRange`
- ✅ Support aggregation levels
- ✅ Support characteristic selection
- ✅ NO independent selection

**View-Specific Logic:**
- Comparison mode selection (byMeters, matrix)
- Heatmap generation
- Ranking calculation
- Variance analysis
- Characteristic-specific unit scaling

**Example Refactor:**

```typescript
// composables/useComparisonData.ts
export function useComparisonData() {
  const metersStore = useMetersStore()
  const metricsStore = useMetricsStore()
  const comparisonMode = ref<'byMeters' | 'matrix'>('byMeters')
  const selectedCharacteristic = ref<'consumption' | 'energy' | 'cost' | 'co2'>('consumption')

  // Comparison-specific calculations
  const comparisonMatrix = computed(() => {
    // Generate comparison data based on mode and characteristic
    // Returns normalized data for heatmap/table
  })

  const rankings = computed(() => {
    // Calculate rankings based on selected metric
  })

  const variance = computed(() => {
    // Calculate variance from average
  })

  return {
    comparisonMatrix,
    rankings,
    variance,
    selectedCharacteristic,
    comparisonMode,
  }
}
```

---

## PART 5: REFACTORING ROADMAP

### Phase 1: Centralize Meter Selection (URGENT)

**Goal:** All views use same meter selection

**Steps:**

1. **Create `useMetersStore.ts`** ✅ (provided above)
   - Define `MeterMetadata` interface
   - State: `allMeters`, `selectedMeterIds`
   - Actions: `toggleMeter`, `setSelectedMeters`, `persistSelection`
   - Getters: `selectedMeters`, `getMeterColor`, etc.

2. **Remove meter duplication from all stores**
   - ❌ Delete: `useDashboardStore.mockCompteurs`
   - ❌ Delete: `useComparisonStore.availableMeters`
   - ❌ Delete: `useEnergyHistoryStore.selectedCompteurs`
   - ✅ Replace with: `useMetersStore.allMeters`

3. **Update Dashboard.vue to use centralized selection**
   - Remove: Local `selectedCompteurIds` ref
   - Add: `const { selectedMeterIds } = storeToRefs(useMetersStore())`
   - Update: `CompteurSelector` to call `metersStore.setSelectedMeters()`

4. **Update Power.vue**
   - Remove: Independent meter selection
   - Use: `metersStore.selectedMeters`

5. **Update History.vue**
   - Remove: `activeCompteurIds` ref
   - Use: `metersStore.selectedMeterIds`
   - Sync with: Dashboard meter changes

6. **Update Comparison.vue**
   - Remove: `selectedMeterIds` from comparison store
   - Use: `metersStore.selectedMeterIds`

7. **Test synchronization**
   - [ ] Select meters in Dashboard → Check Power view updates
   - [ ] Select meters in Power → Check Comparison view updates
   - [ ] Reload page → Check selection persists
   - [ ] Clear selection → Check all views reflect change

**Effort:** 4-6 hours  
**Risk:** Medium (affects all 4 views)  
**Benefit:** CRITICAL (fixes data sync across app)

---

### Phase 2: Unified Metrics Data (HIGH)

**Goal:** Single source of truth for metric data

**Steps:**

1. **Create `useMetricsStore.ts`** ✅ (provided above)
   - State: `metricsByMeter`, `timeRange`, `aggregationLevel`
   - Actions: `fetchMetrics`, `setTimeRange`, `setAggregationLevel`, `refresh`
   - Getters: `getMetricsFor`, `allMetricsFlat`, `totalConsumption`

2. **Refactor data fetching**
   - Move all metric generation to `useMetricsStore`
   - Remove duplicated mock data generation
   - Implement single `fetchMetrics()` for all views

3. **Wire views to centralized metrics**
   - Dashboard: `metricsStore.averagePowerPerMeter`
   - Power: `metricsStore.getAggregatedMetrics()`
   - History: `metricsStore.getMetricsFor(meterIds)`
   - Comparison: `metricsStore.allMetricsFlat`

4. **Handle time range consistency**
   - All views use `metricsStore.timeRange`
   - Watchers auto-refresh when changed
   - No view-specific date state for metrics

5. **Test data flow**
   - [ ] Change time range in History → Check Dashboard updates
   - [ ] Select meters → Check all metrics refresh
   - [ ] Verify loading states propagate

**Effort:** 6-8 hours  
**Risk:** High (major data flow change)  
**Benefit:** CRITICAL (enables global filters, exports, consistency)

---

### Phase 3: View-Specific Composables (MEDIUM)

**Goal:** Extract transformation logic into reusable composables

**New Composables to Create:**

```typescript
// src/composables/useDashboardData.ts
export function useDashboardData() {
  // Dashboard KPI calculations
  // Real-time metric aggregations
}

// src/composables/usePowerData.ts
export function usePowerData() {
  // Power curve generation
  // Peak detection
  // Power factor calculations
}

// src/composables/useHistoryData.ts
export function useHistoryData() {
  // Time-series data transformation
  // Resolution auto-detection
  // Characteristic filtering
}

// src/composables/useComparisonData.ts
export function useComparisonData() {
  // Comparison matrix generation
  // Ranking calculations
  // Variance analysis
}
```

**Benefits:**
- ✅ Testable logic (unit test composables, not components)
- ✅ Reusable across components
- ✅ Smaller view files (< 200 lines target)
- ✅ Type-safe data pipelines

**Effort:** 4-5 hours  
**Risk:** Low (additive, no breaking changes)  
**Benefit:** HIGH (improves maintainability, testability)

---

### Phase 4: Backend Integration Readiness (LOW)

**Goal:** Structure ready for real API calls

**Steps:**

1. **API Service Layer**
   ```typescript
   // src/services/metricsAPI.ts
   export const metricsAPI = {
     getAllMeters(): Promise<MeterMetadata[]> { ... },
     getMetrics(meterIds: string[], range: TimeRange): Promise<Metric[]> { ... },
   }
   ```

2. **Replace mock data**
   ```typescript
   // In useMetersStore
   async function fetchAllMeters() {
     allMeters.value = await metricsAPI.getAllMeters()
   }

   // In useMetricsStore
   async function fetchMetrics(meterIds: string[]) {
     const data = await metricsAPI.getMetrics(meterIds, timeRange.value)
     // Process and normalize
   }
   ```

3. **Error handling & retry logic**
   - Implement exponential backoff
   - Cache responses
   - Show user feedback

**Effort:** 2-3 hours (when backend ready)  
**Risk:** Low (isolated changes)  
**Benefit:** Medium (production-ready)

---

## PART 6: QUALITY & VALIDATION CHECKLIST

### 6.1 Dashboard View

#### Meter Selection & Persistence
- [ ] Uses `metersStore.selectedMeterIds` (not local state)
- [ ] Selector modal calls `metersStore.setSelectedMeters()`
- [ ] Selection persists after page reload
- [ ] Selection changes reflect in Power/History/Comparison views
- [ ] Default selection loads if none saved

#### Data Management
- [ ] No hardcoded meter list in component
- [ ] No duplicated metric fetch logic
- [ ] Uses `metricsStore.averagePowerPerMeter`
- [ ] KPI calculations use centralized data
- [ ] Real-time refresh (15-30s interval) works
- [ ] Loading state displays during fetch

#### Responsiveness & UX
- [ ] Grid layout responsive (mobile, tablet, desktop)
- [ ] Widgets responsive width within grid
- [ ] Touch targets ≥ 48px on mobile
- [ ] No layout shift when loading
- [ ] Meter colors consistent with legend

#### Error Handling
- [ ] Shows message if no meters selected
- [ ] Shows message if data fetch fails
- [ ] Retry button available on error
- [ ] No console errors

### 6.2 Power View

#### Meter Sync
- [ ] Uses centralized `metersStore.selectedMeters`
- [ ] Reacts to meter changes (watchers/computed)
- [ ] Shows "no meters" state if empty

#### Data & Charts
- [ ] Uses `useMetricsStore.getAggregatedMetrics()`
- [ ] Aggregation level configurable (hourly/daily)
- [ ] Time range synced with other views
- [ ] Chart updates when time range changes
- [ ] Power factor calculations correct
- [ ] Peak/off-peak detection works

#### Performance
- [ ] Chart renders < 1 second
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling on data tables

### 6.3 History View

#### Meter Management
- [ ] Uses `metersStore.selectedMeters`
- [ ] Meter toggles sync across app
- [ ] Meter colors consistent

#### Date Range & Aggregation
- [ ] Calendar date selection works
- [ ] Multi-month navigation preserves selections
- [ ] Drag-to-select merges with existing selections
- [ ] Period presets work (Last 7 days, etc.)
- [ ] Resolution auto-detects (1 date = hourly, multiple = daily)
- [ ] Time range filter (hour-based) works
- [ ] Aggregation level changes update view

#### Metric Selection
- [ ] Metric checkboxes toggle correctly
- [ ] Chart updates when metrics change
- [ ] Table columns match selected metrics
- [ ] Metric units display correctly

#### Export
- [ ] CSV export includes all selected data
- [ ] PDF export formats correctly
- [ ] Filename includes date
- [ ] Export respects filters/selections

#### Data Accuracy
- [ ] Totals match expectations
- [ ] No missing data gaps
- [ ] Characteristic calculations correct

### 6.4 Comparison View

#### Meter & Period Selection
- [ ] Uses `metersStore.selectedMeters`
- [ ] Meter changes auto-update comparison
- [ ] Period selection persists temporarily
- [ ] Presets work (Last 7 days, Last 4 weeks, etc.)

#### Comparison Modes
- [ ] "By Meters" mode shows single-period comparison ✅
- [ ] "Matrix" mode shows multi-period multi-meter ✅
- [ ] Mode toggle updates chart/table

#### Aggregation & Characteristics
- [ ] Aggregation level changes update data
- [ ] Characteristic selector works (consumption, energy, cost, co2)
- [ ] Chart title shows selected characteristic ✅
- [ ] KPI units match characteristic
- [ ] Heatmap colors scale to characteristic range

#### Visualizations
- [ ] Bar chart renders correctly
- [ ] Line chart renders correctly
- [ ] Heatmap colors intuitive
- [ ] Table pagination works
- [ ] Variance colors (red/yellow/green) accurate

#### Data Integrity
- [ ] Totals match expectations
- [ ] Variance calculations correct
- [ ] Ranking order accurate
- [ ] Outlier highlighting functional

### 6.5 Cross-View Synchronization

#### Meter Selection
- [ ] Change in Dashboard → Power updates ✓
- [ ] Change in Power → History updates ✓
- [ ] Change in History → Comparison updates ✓
- [ ] Change in Comparison → Dashboard updates ✓
- [ ] No race conditions on rapid changes

#### Data Consistency
- [ ] Same meter in all views = same data
- [ ] Same time range = same filtered data
- [ ] Meter colors consistent across views
- [ ] No duplicate data fetches

#### Performance
- [ ] No unnecessary re-renders
- [ ] Data fetch completes <2 seconds
- [ ] Charts render smoothly
- [ ] No 100% CPU usage
- [ ] Memory usage stable (<100MB)

### 6.6 Persistence & Recovery

#### Local Storage
- [ ] Selected meters saved to localStorage
- [ ] Preferences (theme, language) saved
- [ ] Data recovers on page reload ✓
- [ ] Clear data button works

#### Error Recovery
- [ ] Network error shows retry button
- [ ] Retry fetches fresh data
- [ ] Corrupted localStorage doesn't crash app
- [ ] Fallback to defaults on corruption

### 6.7 Internationalization

#### Language Support
- [ ] English translations complete
- [ ] French translations complete
- [ ] No hardcoded English/French text
- [ ] All UI strings in i18n files
- [ ] Placeholder text translated
- [ ] Error messages translated
- [ ] Tooltips translated

#### Language Switching
- [ ] Switching language updates all views
- [ ] Date formatting respects language
- [ ] Numbers/currency format correct per language

### 6.8 Accessibility

#### Keyboard Navigation
- [ ] All buttons/inputs keyboard accessible
- [ ] Tab order logical
- [ ] Enter/Space triggers actions
- [ ] ESC closes modals

#### Screen Readers
- [ ] Chart labels announced
- [ ] Status updates described
- [ ] Error messages readable
- [ ] ARIA labels present on icons

#### Color Contrast
- [ ] Text contrast ≥ 4.5:1 (normal text)
- [ ] Component contrast ≥ 3:1
- [ ] Color not only indicator (icons + color)
- [ ] Dark mode contrast adequate

---

## PART 7: IMPLEMENTATION CHECKLIST

### Ready-to-Implement Tasks

- [ ] **Task 1:** Create `useMetersStore.ts` with centralized selection
- [ ] **Task 2:** Remove meter duplication from all stores
- [ ] **Task 3:** Update Dashboard.vue to use `useMetersStore`
- [ ] **Task 4:** Update Power.vue to use `useMetersStore`
- [ ] **Task 5:** Update History.vue to use `useMetersStore`
- [ ] **Task 6:** Update Comparison.vue to use `useMetersStore`
- [ ] **Task 7:** Test meter selection sync across views
- [ ] **Task 8:** Implement localStorage persistence
- [ ] **Task 9:** Create `useMetricsStore.ts`
- [ ] **Task 10:** Wire views to centralized metrics
- [ ] **Task 11:** Create view-specific composables
- [ ] **Task 12:** Run validation checklist

### Branch Strategy

```bash
# Phase 1: Centralize Meters
git checkout -b feature/centralized-meter-selection
# Make commits for each step

# Phase 2: Centralize Metrics
git checkout -b feature/unified-metrics-store
# Make commits for each store refactor

# Phase 3: View Refactoring
git checkout -b feature/view-specific-composables
# Make commits per view

# Phase 4: Backend Integration
git checkout -b feature/backend-api-integration
# Make commits for API layer
```

---

## PART 8: SUMMARY & RECOMMENDATIONS

### Critical Issues

| # | Issue | Impact | Solution | Priority |
|---|-------|--------|----------|----------|
| 1 | Meter selection duplicated | Users see different data across views | Implement `useMetersStore` | 🔴 URGENT |
| 2 | No data persistence | Selection lost on reload | Add localStorage sync | 🔴 URGENT |
| 3 | Metrics fetched independently | Data inconsistency, poor performance | Create `useMetricsStore` | 🔴 URGENT |
| 4 | No time range sync | Views out of sync | Centralize `timeRange` | 🟠 HIGH |
| 5 | Chart logic in views | Hard to test and maintain | Extract to composables | 🟠 HIGH |

### Architecture Improvements (Estimated ROI)

| Improvement | Effort | Benefit | Timeline |
|-------------|--------|---------|----------|
| Centralized meter selection | 4-6h | CRITICAL (fixes major sync issues) | Week 1 |
| Unified metrics store | 6-8h | CRITICAL (ensures consistency) | Week 1-2 |
| View composables | 4-5h | HIGH (improves testability) | Week 2 |
| Backend API readiness | 2-3h | MEDIUM (future-proof) | Week 3 |

### Long-Term Benefits

✅ **Single Source of Truth:** All views use same data  
✅ **Easier Testing:** Testable stores and composables  
✅ **Scalability:** Easy to add new views/features  
✅ **Performance:** Single data fetch, no duplication  
✅ **Maintainability:** Clear separation of concerns  
✅ **Backend Ready:** Clean API layer for production  

---

**Document Status:** ✅ READY FOR IMPLEMENTATION  
**Next Step:** Begin Phase 1 (Centralized Meter Selection)  
**Estimated Total Time:** 16-22 hours  
**Recommended Approach:** Iterative per phase with testing between each

