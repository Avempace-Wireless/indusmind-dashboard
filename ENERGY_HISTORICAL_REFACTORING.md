# EnergyHistorical View - Centralized Meter Selection Refactoring

## Executive Summary

Successfully refactored **EnergyHistorical.vue** to be fully compatible with the centralized meter selection system, ensuring consistency with Dashboard, Power (Puissance), and Comparison views.

---

## Problem Analysis

### Previous Issues

1. **Local State Duplication**
   - View maintained its own `selectedCategory` state
   - Not synchronized with global `selectedMeterIds` from `useMetersStore`
   - Charts displayed hardcoded/static data instead of selected meters

2. **Data Inconsistency**
   - Meter selection in EnergyHistorical didn't propagate to other views
   - Selecting meters in other views didn't update EnergyHistorical
   - No single source of truth for meter selection

3. **Chart Data Issues**
   - Empty charts due to missing synchronization
   - No graceful empty state handling
   - Charts didn't react to meter selection changes

---

## Refactoring Strategy

### Architecture Changes

```
BEFORE:
EnergyHistorical → Local selectedCategory → Static Data

AFTER:
EnergyHistorical → useMetersStore.selectedMeters → Dynamic Data
                ↓
     Synced with Dashboard/Power/Comparison
```

### Key Principles Applied

✅ **Single Source of Truth**: `useMetersStore.selectedMeters`  
✅ **Reactive Binding**: All data derived from centralized selection  
✅ **Defensive Rendering**: Empty states with clear messaging  
✅ **Bi-directional Sync**: Category selection updates global store  
✅ **Consistent UX**: Same behavior as Power/Dashboard views

---

## Implementation Details

### 1. Centralized Meter Selection

**File**: `src/views/EnergyHistorical.vue`

```typescript
// ✅ BEFORE: Local state (isolated)
const selectedCategory = ref<string | null>('TGBT')
const filteredMeters = computed(() => 
  metersStore.allMeters.filter(m => m.category === selectedCategory.value)
)

// ✅ AFTER: Centralized source of truth
const selectedMetersFromStore = computed(() => metersStore.selectedMeters)
const currentCategory = computed(() => 
  selectedMetersFromStore.value[0]?.category || null
)
```

### 2. Bi-Directional Synchronization

**Category → Global Store**:
```typescript
watch(selectedCategory, (newCategory) => {
  if (!newCategory) {
    metersStore.clearSelection()
    return
  }
  
  // Update centralized selection
  const categoryMeterIds = metersStore.allMeters
    .filter(m => m.category === newCategory)
    .map(m => m.id)
  
  metersStore.setSelectedMeters(categoryMeterIds)
}, { flush: 'post' })
```

**Global Store → Category**:
```typescript
watch(
  () => selectedMetersFromStore.value,
  (meters) => {
    if (meters.length > 0 && !selectedCategory.value) {
      selectedCategory.value = meters[0].category
    }
  },
  { immediate: true }
)
```

### 3. Data Validation & Empty States

**Computed Guards**:
```typescript
const hasValidData = computed(() => {
  return selectedMetersFromStore.value.length > 0 && 
         selectedDates.value.length > 0 &&
         enabledMetrics.value.length > 0
})

const hasChartData = computed(() => {
  return hasValidData.value && 
         chartData.value.datasets.length > 0 &&
         chartData.value.labels.length > 0
})

const emptyStateMessage = computed(() => {
  if (selectedMetersFromStore.value.length === 0) 
    return t('energyHistory.emptyState.noMeters')
  if (selectedDates.value.length === 0) 
    return t('energyHistory.emptyState.noDates')
  if (enabledMetrics.value.length === 0) 
    return t('energyHistory.emptyState.noMetrics')
  return t('energyHistory.emptyState.noData')
})
```

**Template Guard**:
```vue
<div class="relative" style="height: 400px;">
  <!-- Empty State -->
  <div v-if="!hasChartData" class="absolute inset-0 flex flex-col items-center justify-center">
    <span class="material-symbols-outlined text-6xl mb-4 opacity-30">bar_chart</span>
    <p class="text-lg font-medium">{{ emptyStateMessage }}</p>
    <p class="text-sm mt-2">{{ t('energyHistory.emptyState.hint') }}</p>
  </div>
  <!-- Chart -->
  <canvas v-show="hasChartData" ref="chartCanvas"></canvas>
</div>
```

### 4. Initialization Logic

**Ensures default selection on mount**:
```typescript
onMounted(() => {
  // Ensure meters are selected (default to TGBT if none)
  if (metersStore.selectedMeters.length === 0) {
    const tgbtMeters = metersStore.allMeters.filter(m => m.category === 'TGBT')
    if (tgbtMeters.length > 0) {
      metersStore.setSelectedMeters(tgbtMeters.map(m => m.id))
      selectedCategory.value = 'TGBT'
    }
  } else {
    // Sync category with existing selection
    selectedCategory.value = metersStore.selectedMeters[0]?.category || null
  }

  goToToday()
  initChart()
  refreshData()
})
```

### 5. UI Display Updates

**Before**:
```vue
<p>{{ filteredMeters.length }} meters</p>
<div>{{ filteredMeters.map(m => m.name).join(', ') }}</div>
```

**After** (uses centralized data):
```vue
<p>{{ selectedMetersFromStore.length }} {{ $t('common.meters') }}</p>
<div>{{ selectedMetersFromStore.map(m => m.name).join(', ') }}</div>
```

---

## i18n Updates

### English (`src/i18n/en.json`)

```json
{
  "common": {
    "meter": "meter",
    "meters": "meters",
    "allMeters": "All Meters"
  },
  "energyHistory": {
    "emptyState": {
      "noMeters": "No meters selected",
      "noDates": "No dates selected",
      "noMetrics": "No metrics enabled",
      "noData": "No data available",
      "hint": "Select meters, dates, and enable metrics to view data"
    }
  }
}
```

### French (`src/i18n/fr.json`)

```json
{
  "common": {
    "meter": "compteur",
    "meters": "compteurs",
    "allMeters": "Tous les compteurs"
  },
  "energyHistory": {
    "emptyState": {
      "noMeters": "Aucun compteur sélectionné",
      "noDates": "Aucune date sélectionnée",
      "noMetrics": "Aucune métrique activée",
      "noData": "Aucune donnée disponible",
      "hint": "Sélectionnez des compteurs, des dates et activez des métriques pour voir les données"
    }
  }
}
```

---

## Behavior Verification

### ✅ Meter Selection Flow

1. **User clicks TGBT category** → `selectedCategory = 'TGBT'`
2. **Watcher triggers** → `metersStore.setSelectedMeters(['compteur-1'])`
3. **Global store updates** → All views see TGBT selected
4. **Chart re-renders** → Displays TGBT data only
5. **Navigate to Dashboard** → TGBT still selected ✅

### ✅ Cross-View Consistency

| Action | Dashboard | Power | EnergyHistorical | Comparison |
|--------|-----------|-------|------------------|------------|
| Select TGBT | ✅ | ✅ | ✅ | ✅ |
| Select Clim | ✅ | ✅ | ✅ | ✅ |
| Clear selection | ✅ | ✅ | ✅ | ✅ |

### ✅ Empty State Handling

| Condition | Chart Behavior | Message Displayed |
|-----------|----------------|-------------------|
| No meters selected | Empty state shown | "No meters selected" |
| No dates selected | Empty state shown | "No dates selected" |
| No metrics enabled | Empty state shown | "No metrics enabled" |
| Valid data | Chart rendered | Data visualization |

---

## Testing Checklist

- [x] Category selection updates global store
- [x] Global store changes reflect in view
- [x] Empty states display correctly
- [x] Charts render with selected meter data
- [x] Element selection works (L1/L2/L3)
- [x] Date selection updates charts
- [x] Metric toggling updates charts
- [x] i18n translations work (EN/FR)
- [x] No console errors
- [x] No TypeScript errors
- [x] Consistent with other views

---

## Benefits Achieved

### 🎯 Consistency
- All views use same meter selection
- Synchronized state across application
- Predictable behavior

### 🚀 Performance
- Single source of truth reduces redundancy
- Reactive updates only when needed
- Efficient chart re-rendering

### 🛡️ Reliability
- Defensive rendering prevents crashes
- Clear empty states guide users
- Type-safe computed properties

### 📈 Maintainability
- Centralized meter logic
- No duplicated state management
- Easy to extend/modify

---

## Migration Notes

### For Developers

**Before making changes**:
```typescript
// ❌ DON'T: Create local meter state
const myLocalMeters = ref([])

// ✅ DO: Use centralized store
const { selectedMeters } = storeToRefs(useMetersStore())
```

**When adding new views**:
1. Import `useMetersStore`
2. Use `selectedMeters` computed property
3. Never duplicate meter selection logic
4. Add empty state handling

### Breaking Changes

⚠️ **None** - This is a backward-compatible refactor

---

## Future Enhancements

1. **Meter Filtering UI**
   - Add multi-select dropdown
   - Category-based quick filters
   - Recent selections

2. **Advanced Empty States**
   - Suggested actions
   - Quick setup wizard
   - Sample data preview

3. **Performance Optimization**
   - Virtual scrolling for large datasets
   - Lazy loading for historical data
   - Chart data caching

---

## Conclusion

EnergyHistorical.vue now:
- ✅ Uses centralized meter selection
- ✅ Syncs with all other views
- ✅ Displays data reactively
- ✅ Handles empty states gracefully
- ✅ Maintains consistent UX
- ✅ Follows Vue 3 best practices
- ✅ Fully typed with TypeScript
- ✅ Internationalized (EN/FR)

**Status**: ✅ Production-ready
**Last Updated**: January 13, 2026
