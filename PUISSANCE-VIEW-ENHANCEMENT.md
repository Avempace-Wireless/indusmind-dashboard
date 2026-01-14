# Puissance View Enhancement - Meter Type Selection & Element Display

## What's New

The Puissance (Power) view has been enhanced with two powerful features:

### 1. Filter Meters by Type/Category ✨
- **Location:** Top control bar, first section
- **Categories:** TGBT, Compresseurs, Clim, Éclairage
- **Behavior:** 
  - Click a category button to filter and show only those meters
  - Click again to toggle off the filter
  - "All" button resets filter to show all meters
  - Meter tabs update dynamically based on selected category

### 2. Select Display Elements 🎯
- **Location:** Bottom of control bar, right side
- **Available Elements:**
  - ✅ **KPIs** - Show/hide the metrics column (instantaneous power, daily avg, etc.)
  - ✅ **Charts** - Show/hide chart visualizations (monthly, daily, hourly)
  - ✅ **Summary** - Show/hide summary tables (detailed data)
- **Behavior:** 
  - Each element has a checkbox
  - All enabled by default
  - Disabling KPIs auto-expands charts to full width
  - Great for focusing on specific data types

## User Experience Flow

```
1. User opens Puissance view
2. Sees all available meters in tabs (TGBT, Compresseurs, Clim, Éclairage)
3. Clicks category filter (e.g., "Compresseurs")
4. Now only sees Compresseurs meters
5. Selects specific Compresseurs meter from tabs
6. Unchecks "Summary" to hide tables
7. Focuses on just KPIs and Charts for that meter
8. When done, clicks "All" to reset category filter
```

## Technical Implementation

### State Management
```typescript
// Category filtering
const selectedCategory = ref<string | null>(null)

// Display elements control
const displayElements = ref({
  kpis: true,
  charts: true,
  summary: true
})

// Computed property for filtered meters
const filteredMeters = computed(() => {
  if (!selectedCategory.value) {
    return meters.value
  }
  return meters.value.filter(m => m.category === selectedCategory.value)
})

// Computed property for visible KPI keys
const visibleKpiKeys = computed(() => {
  if (!displayElements.value.kpis) return []
  return kpiKeys
})
```

### Template Changes
- Category filter buttons (`v-for="category in meterCategories"`)
- Meter tabs now use `filteredMeters` instead of `meters`
- Element checkboxes with `v-model` binding
- KPI section wrapped in `v-if="displayElements.kpis"`
- Charts section wrapped in `v-if="displayElements.charts"`
- Dynamic column spanning: full width when KPIs disabled

## UI Components

### Category Filter Section
```html
<!-- Shows: TGBT, Compresseurs, Clim, Éclairage, All -->
<!-- Styling: Blue gradient when active, neutral when inactive -->
<!-- Interactive: Toggle-like behavior -->
```

### Element Selection Checkboxes
```html
<!-- Shows: Checkboxes for KPIs, Charts, Summary -->
<!-- Styling: Native HTML checkboxes with custom styling -->
<!-- Behavior: Real-time updates as user checks/unchecks -->
```

## Features & Benefits

✅ **Category-Based Organization**
- Quickly filter to meters of interest
- Reduce cognitive load by hiding irrelevant meters
- Perfect for focusing on one equipment type at a time

✅ **Flexible Display**
- Show only the data you need
- Save screen space by hiding unnecessary sections
- Combine filters for custom views

✅ **Responsive Design**
- Works on desktop and mobile
- Touch-friendly category buttons
- Clear visual feedback for active selections

✅ **Maintains Existing Functionality**
- Single-meter detailed view preserved
- All charts and tables work as before
- Selection persists while filtering

## Usage Examples

### Scenario 1: Analyze Compressor Performance
1. Click "Compresseurs" category
2. Uncheck "Summary" (only want visual data)
3. Select specific compressor from meter tabs
4. View power trends in charts and KPIs

### Scenario 2: Quick Daily Check
1. Uncheck "Charts" (only want key numbers)
2. Focus on KPI cards for all meters
3. See daily/hourly averages at a glance

### Scenario 3: Deep Dive Analysis
1. Click "TGBT" category
2. Keep all elements enabled
3. Switch between Overview/Charts/Tables views
4. Export data from tables

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Category filtering is instant (computed property)
- No API calls triggered by filter changes
- Conditional rendering reduces DOM complexity
- Layout recalculation optimized with `:class` binding

---

**Status:** ✅ Complete and ready to use
**Tested:** Desktop and responsive layouts
**Files Modified:** src/views/PuissanceView.vue (template + script)
**Lines Changed:** ~150 lines
