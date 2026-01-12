# Thermal Management View Documentation

## Overview
The Thermal Management View (`ThermalManagementView.vue`) is a comprehensive multi-zone climate control dashboard designed for facility management and HVAC monitoring. It provides real-time temperature monitoring, zone-level control, and advanced analytics with interactive charts.

---

## View Information

| Property | Value |
|----------|-------|
| **URL** | `/thermal-management` |
| **Route Name** | `thermal-management` |
| **File** | `src/views/ThermalManagementView.vue` |
| **Status** | ✅ **COMPLETE** |
| **Translation Key** | `thermal.pageTitle` |
| **Layout** | AdminLayout (with sidebar, header, dark/light mode) |

---

## Features

### 1. **Page Header with Status Overview**
- Real-time status cards displaying:
  - **Active Zones**: Count of operational zones (e.g., 6/6)
  - **Average Temperature**: Current facility average temperature
  - **Energy Efficiency**: System efficiency percentage
  - **System Status**: Overall operational status
- Color-coded status indicators (blue, green, amber, purple)
- Responsive grid layout (1-4 columns based on screen size)

### 2. **Zone Control Section**

#### Display Controls (Compact Panel)
- **Columns Per Row Slider**: Adjust layout (1-6 columns)
- **Zone Selection**: Checkboxes to show/hide specific zones
- **Quick Actions**:
  - Select All: Enable all zones
  - Clear: Disable all zones
  - Reset Order: Restore default zone ordering
- **Drag-and-Drop Reordering**: Reorder zones by dragging zone cards

#### Zone Cards (Responsive Grid)
Each zone card displays:
- **Zone Name**: e.g., "Zone 1", "Zone 2"
- **Current Temperature**: Real-time temperature reading
- **Mode Toggle**: Switch between Auto/Manual mode
- **Temperature Input** (Auto mode only):
  - Set desired temperature (10-40°C)
  - Min/Max temperature limits (default 19-24°C)
  - Step value: 0.5°C
  - Disabled in Manual mode
- **Power Status**: Visual indicator (ACTIVE/INACTIVE)
- **Power Button**: Toggle zone power on/off
- **Status Indicator**: Color-coded based on operational state

### 3. **Charts & Analytics Section**

#### Period Selector
- Quick buttons for time ranges: **1h**, **6h**, **12h**, **24h**
- Dynamically regenerates chart data based on selection

#### Chart Type Toggle
- **Line Chart**: Temperature trends over time (default)
- **Bar Chart**: Comparative view of temperature data
- Toggle buttons for easy switching

#### Zone Temperatures Chart
- **Type**: Line/Bar (switchable)
- **Data**: Real-time temperature readings for all 6 zones
- **Features**:
  - Color-coded by zone (Blue, Green, Red, Emerald, Amber, Purple)
  - 0.7 opacity for clarity
  - 2px borders for visibility
  - Interactive legend
  - Y-axis shows temperature range (10-30°C) with °C suffix
  - Responsive and adaptable to parent container

#### Min/Max Temperature Chart
- **Type**: Bar chart (stacked comparison)
- **Datasets per Zone**:
  - Min Temperature (Blue)
  - Current Temperature (Green)
  - Max Temperature (Red)
- **Features**:
  - 0.8 opacity for better visibility
  - 2px borders
  - Shows min/max/current comparison
  - Helps identify temperature variations per zone

#### Data Range Slider
- **Type**: Dual-thumb range slider
- **Position**: Below chart x-axis
- **Functionality**:
  - Filter chart data by percentage range
  - Minimum 5% gap between handles enforced
  - Visual track shows active range
  - Allows zooming into specific time periods
- **Styling**: Minimal design with no extra padding/borders

---

## Data Structure

### Zone Object
```typescript
interface Zone {
  id: number
  maxTemp: number | null    // Maximum temperature limit
  minTemp: number | null    // Minimum temperature limit
  power: boolean             // Power status (on/off)
  mode: 'manual' | 'auto'   // Control mode
  currentTemp: number       // Current temperature (runtime)
}
```

### Initial Zones Data
- **6 Zones** with:
  - Zones 1-4: Default limits (19-24°C)
  - Zones 5-6: No limits initially (null values)
  - Default mode: Auto
  - Default power: true (on)

### Chart Data
- **Type**: Realistic temperature data with sine wave variation
- **Generation**: `generateTempData()` function
- **Filtering**: `filterDataByRange()` based on range slider position
- **Update Trigger**: Period selector changes

---

## Component Props & State

### Reactive State
```typescript
// Zone management
zones: ref([...])
columnsPerRow: ref(3)        // 1-6 columns
visibleZoneIds: ref([...])   // Selected zones to display
zonesOrder: ref([...])        // Custom ordering

// Chart controls
chartPeriod: ref(24)         // 1, 6, 12, or 24 hours
chartType: ref('line')       // 'line' or 'bar'
dataRangeStart: ref(0)       // 0-100 percent
dataRangeEnd: ref(100)       // 0-100 percent

// UI state
draggedZoneId: ref(null)     // For drag-and-drop
```

### Computed Properties
- **displayedZones**: Filtered zones based on visibleZoneIds
- **activeZones**: Count of zones with power on
- **tempChartData**: Chart.js dataset for temperature chart
- **minMaxChartData**: Chart.js dataset for min/max chart
- **filteredChartTimeLabels**: X-axis labels based on range slider

---

## User Interactions

### Temperature Control
- **Auto Mode**: User can edit temperature inputs
- **Manual Mode**: Temperature inputs are locked (disabled)
- **Input Range**: 10°C to 40°C with 0.5°C increments
- **Validation**: Min must be ≤ Max

### Zone Display Management
- **Show/Hide**: Toggle individual zones via checkboxes
- **Reorder**: Drag zones to rearrange their display order
- **Bulk Actions**: Select All / Clear / Reset Order buttons
- **Layout**: Adjust columns (1-6) via slider

### Chart Navigation
- **Period Selection**: Click 1h/6h/12h/24h buttons
- **Chart Type**: Toggle between Line and Bar charts
- **Data Zoom**: Use dual-thumb slider to focus on time ranges
- **Responsive**: Charts adapt to container size

---

## Styling & Design

### Color Scheme
- **Zone Indicators**:
  - Z1: Blue (#3B82F6)
  - Z2: Green (#10B981)
  - Z3: Red (#EF4444)
  - Z4: Emerald (#059669)
  - Z5: Amber (#F59E0B)
  - Z6: Purple (#A855F7)

- **Status Colors**:
  - Active: Green (#10B981)
  - Inactive: Gray (#9CA3AF)
  - Alert: Red (#EF4444)

### Grid Layouts
- **Header Cards**: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
- **Zone Cards**: Responsive (1-6 cols via slider)
- **Chart Container**: Full width, responsive height

### Dark Mode
- Full dark mode support via TailwindCSS `dark:` prefix
- Consistent color palette for dark backgrounds
- Border and text colors adapt automatically

---

## Internationalization (i18n)

### Translation Keys (Namespace: `thermal`)
- `thermal.pageTitle`: "Thermal Management & Monitoring System"
- `thermal.subtitle`: "Multi-zone climate control for optimal facility management"
- `thermal.menuItem`: "Thermal Management" (sidebar)
- `thermal.zone`: "Zone {number}"
- `thermal.currentTemp`: "Temperature"
- `thermal.maxTemp`: "Max Temp"
- `thermal.minTemp`: "Min Temp"
- `thermal.manual`: "Manual"
- `thermal.auto`: "Auto"
- `thermal.powerOn`: "ACTIVE"
- `thermal.powerOff`: "INACTIVE"
- `thermal.sections.zoneControl`: "Zone Control & Management"
- `thermal.controls.columns`: "Columns"
- `thermal.controls.zones`: "Zones"
- `thermal.controls.selectAll`: "Select All"
- `thermal.controls.clear`: "Clear"
- `thermal.controls.resetOrder`: "Reset Order"
- `thermal.charts.zoneTemps.title`: "Zone Temperatures"
- `thermal.charts.minMax.title`: "Temperature Limits"

Supported Languages: English (EN), French (FR)

---

## Dependencies

### Vue 3 Composition API
- `ref`, `computed`, `reactive` from `vue`
- `useRoute` from `vue-router`
- `useI18n` from `vue-i18n`

### Chart.js Integration
- **Library Versions**:
  - chart.js: ^4.5.1
  - vue-chartjs: ^5.3.3
- **Registered Modules**:
  - CategoryScale, LinearScale
  - PointElement, LineElement, BarElement
  - Title, Tooltip, Legend

### Components
- **AdminLayout**: Main layout wrapper with sidebar
- **LineChart**: vue-chartjs Line component
- **BarChart**: vue-chartjs Bar component

### Styling
- **TailwindCSS**: Responsive design, dark mode, utilities
- **PostCSS**: For CSS processing

---

## Performance Considerations

1. **Chart Data Generation**: Only regenerates on period change
2. **Range Slider Filtering**: Efficient array slicing without mutation
3. **Computed Properties**: Reactive updates on zone/display changes
4. **Lazy Component Loading**: Chart components load on demand

---

## Testing Guide

### Manual Tests
1. **Zone Visibility**: Toggle checkboxes to show/hide zones
2. **Column Adjustment**: Move slider left/right to change layout
3. **Temperature Editing**: Switch mode to Auto, edit temps, switch back to Manual
4. **Drag Reordering**: Drag zones to rearrange (verify order persists)
5. **Chart Switching**: Click period buttons and chart type toggle
6. **Range Slider**: Move handles to filter chart data
7. **Dark Mode**: Toggle dark mode in header, verify colors adapt
8. **Responsive**: Test on mobile (320px), tablet (768px), desktop (1920px)

### Edge Cases
- Zones 5/6 with no temperature limits
- All zones deselected (empty display)
- Single zone selected (full width)
- Range slider at 0% or 100%
- Rapid period changes while chart loading

---

## Future Enhancements

- [ ] Real-time data integration with backend API
- [ ] Persist user preferences (columns, order, visible zones) to localStorage
- [ ] Zone presets (Office, Production, Storage profiles)
- [ ] Temperature trend alerts
- [ ] Historical data export (CSV, PDF)
- [ ] Zone grouping (multi-zone control)
- [ ] Scheduling/automation rules
- [ ] Integration with external HVAC systems

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (not supported)

---

## Known Issues & Limitations

- Charts require minimum width of 300px for proper display
- Range slider thumb positioning may overlap on very small screens
- Temperature inputs limited to 10-40°C range
- Mock data uses static values (real integration pending)

---

## File Reference

**Location**: `src/views/ThermalManagementView.vue`
**Lines**: 761 total lines
**Sections**:
- Template (lines 1-507)
- Script setup (lines 509-761)

---

## Related Files

- [App Sidebar](../../../src/components/layout/AppSidebar.vue) - Navigation menu
- [Admin Layout](../../../src/components/layout/AdminLayout.vue) - Main layout wrapper
- [i18n English](../../../src/i18n/en.json) - English translations
- [i18n French](../../../src/i18n/fr.json) - French translations
- [Router Config](../../../src/router/index.ts) - Route definitions

---

## Last Updated
- **Date**: January 12, 2026
- **Version**: 1.0
- **Status**: Complete and tested
