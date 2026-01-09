# Energy History View - Perfect Implementation Prompt

## Executive Summary
Resume and elevate the **Energy Historical Dashboard** to become the definitive multi-metric analytical platform. The view must seamlessly integrate with all existing TailAdmin-based views, improve the calendar interface, and implement the complete dynamic framework described in the strategic objectives.

---

## Current State Analysis

### Existing Implementation
- **View**: `src/views/EnergyHistorical.vue` (558 lines)
- **CSS**: `src/assets/energy-dashboard.css` (917 lines, production-ready BEM)
- **Data**: `src/data/energyHistoricalMock.ts` (mock data with hourly granularity)
- **Route**: `/history` → `Énergie – Historique`
- **Layout**: 60-40 responsive split (left: chart area, right: controls)
- **Components**: Metric cards, chart, calendar, characteristics filter, meters control, options

### Current Capabilities
✅ Line chart with hourly granularity  
✅ Drag-to-select calendar dates  
✅ Single/multi-date comparison mode  
✅ Filter by characteristics (energy, CO2, cost, consumption)  
✅ Time range filtering (De/À meters control)  
✅ Photovoltaic overlay toggle  
✅ Responsive design (mobile, tablet, desktop)  
✅ Professional BEM CSS architecture  

### Known Limitations to Address
❌ No data table with exact hourly values  
❌ Limited metric types (only 4, needs generic framework)  
❌ No metric card value updates based on selections  
❌ Calendar lacks "data availability indicators"  
❌ No preset date comparisons (same day last week, etc.)  
❌ Export functionality not implemented  
❌ No keyboard navigation in calendar  
❌ Meter controls don't actually filter chart data  
❌ No integration with other dashboard views  
❌ No actual dynamic data loading (mock only)  

---

## Technical Foundation

### Architecture
```
Vue 3 Composition API + TypeScript
├── Layout: AdminLayout (TailAdmin wrapper)
├── Styling: BEM CSS (energy-dashboard.css)
├── Data: Mock service + Pinia stores
├── Charts: Chart.js v4 with vue-chartjs
└── Calendar: Custom Vue implementation
```

### Design System (TailAdmin-Compatible)
```
Colors:
  - bodydark: #111827 (text primary)
  - bodydark2: #6b7280 (text secondary)
  - stroke: #e5e7eb (borders)
  - success/accent: #10b981 (green)
  
Spacing: 1rem base unit
Responsive: 4 breakpoints (mobile, tablet, desktop, large)
Typography: 4-level hierarchy
Animations: GPU-accelerated, 0.2-0.3s transitions
Accessibility: WCAG AA, keyboard navigation ready
```

### Existing Components by Area

**Layout Components**
- `AdminLayout.vue`: Main page wrapper
- `PageBreadcrumb.vue`: Navigation breadcrumb
- Sidebar: Dynamic menu navigation

**Chart Components**
- `BarChart.vue`: Multi-series bar chart
- `LineChart.vue`: Multi-series line chart
- `HistoryChart.vue`: Historical data chart
- `EnergyLineChart.vue`: Energy-specific line chart
- `KPICard.vue`: Key metric cards

**Table Components**
- `DataTable.vue`: Generic data table with sorting/filtering
- `InvoiceTable.vue`: Invoice-style tabular display
- Others: `BasicTable*`, `DataTable*` variants

**Form Components**
- Date inputs (flatpickr)
- Range sliders
- Checkboxes with custom styling
- Dropdowns/selects

### Related Views (Reference Implementation)
- `DashboardView.vue`: Main dashboard (uses metrics, charts)
- `PuissanceView.vue`: Power analysis (uses advanced filtering)
- `AnalysisView.vue`: Analysis tools
- `CostAnalysisView.vue`: Financial metrics
- `ConsumptionView.vue`: Consumption tracking
- `PerformanceView.vue`: Performance metrics
- `ComparisonView.vue`: Comparative analysis
- `BenchmarkingView.vue`: Benchmarking dashboard

### Data Stores Available
- `useDashboardStore.ts`: General dashboard data
- `useHistoryStore.ts`: Historical data management
- `useKPIStore.ts`: KPI data
- `useReportsStore.ts`: Report generation
- `useSettingsStore.ts`: User preferences

---

## Requirements Breakdown

### 1. Dynamic Multi-Metric System

**Framework**
Implement generic metric system that works with ANY metric type:

```typescript
interface Metric {
  id: string                    // unique identifier
  label: string                 // display name (French)
  unit: string                  // kWh, kg CO2, EUR, etc.
  category: 'energy' | 'environmental' | 'financial' | 'operational' | 'custom'
  type: 'absolute' | 'rate' | 'cost' | 'efficiency' | 'custom'
  color: string                 // hex color for charts
  enabled: boolean              // toggleable
  aggregationType: 'sum' | 'average' | 'max' | 'min'  // how to aggregate hourly
}

interface TimeSeries {
  timestamp: string             // ISO 8601
  value: number
  metricId: string
}

interface TimeSeriesData {
  date: string                  // YYYY-MM-DD
  metric: Metric
  hourlyData: TimeSeries[]
  summary: {
    total: number
    average: number
    max: number
    min: number
    peak_hour: string
  }
}
```

**Characteristics Panel**
- Display available metrics organized by category
- Allow users to select multiple metrics
- Show metric unit/context in tooltip
- Persist user selections
- Enable/disable real-time chart updates

**Default Metrics to Include**
```
Energy Metrics:
  - Énergie (Energy): kWh
  - CO2: kg CO2
  - Photovoltaïque (Solar): kWh

Financial Metrics:
  - Coût (Cost): EUR
  - Coût Pic (Peak Cost): EUR

Operational Metrics:
  - Consommation (Consumption Rate): kWh/h
  - Efficacité (Efficiency): %
```

### 2. Enhanced Calendar Interface

**Improvements**
```vue
<div class="calendar-selector__enhanced">
  <!-- Month Navigation with Year Selector -->
  <div class="calendar-selector__header-enhanced">
    <button>Previous Year</button>
    <select>Year options</select>
    <button>Next Year</button>
  </div>
  
  <!-- Month View Navigation -->
  <div class="calendar-selector__nav-month">
    <button v-for="month in months" @click="setMonth">
      {{ month }}
    </button>
  </div>
  
  <!-- Week View Toggle -->
  <button @click="toggleWeekView">Week View</button>
  
  <!-- Data Availability Indicators -->
  <div class="calendar-selector__indicators">
    <div class="indicator" :class="{ '--has-data': hasData }">
      ● = Data available
    </div>
  </div>
  
  <!-- Calendar Grid with Enhanced Features -->
  <div class="calendar-selector__grid-enhanced">
    <!-- Day cells with: -->
    <!-- 1. Availability indicator (●) -->
    <!-- 2. Quick summary (max value shown) -->
    <!-- 3. Hover state with full summary -->
    <!-- 4. Drag-to-select highlighting -->
  </div>
  
  <!-- Preset Comparisons -->
  <div class="calendar-selector__presets">
    <button @click="compareSameDayLastWeek">Same day (last week)</button>
    <button @click="compareSameDayLastMonth">Same day (last month)</button>
    <button @click="compareWeekOverWeek">Week vs week</button>
    <button @click="compareMonthOverMonth">Month vs month</button>
  </div>
</div>
```

**Features**
- Data availability indicators (● for days with data)
- Quick hover summary (showing max metric value)
- Preset date comparison shortcuts
- Keyboard navigation: arrow keys for date selection
- Week view option (shows 7-day period)
- Year selector dropdown
- Month quick-select buttons

### 3. Metric Cards Enhancement

**Current State**
- Shows 2 metric cards (for 2 dates)
- Displays totalMWh only

**Enhanced State**
- Dynamic cards based on selected metrics
- Multiple metrics displayed side-by-side (scrollable if >4)
- Show: current value + change from previous + trend arrow
- Color-coded by metric
- Click to focus on specific metric in chart

```vue
<div class="metric-cards__container">
  <div 
    v-for="metric in selectedMetrics" 
    :key="metric.id"
    class="metric-cards__card"
    :style="{ borderLeftColor: metric.color }"
    @click="focusMetricInChart(metric.id)"
  >
    <div class="metric-cards__header">
      <span class="metric-cards__label">{{ metric.label }}</span>
      <span class="metric-cards__unit">{{ metric.unit }}</span>
    </div>
    <div class="metric-cards__value">{{ formattedValue }}</div>
    <div class="metric-cards__trend">
      <span class="metric-cards__change">+5.2%</span>
      <svg class="metric-cards__arrow">↑</svg>
    </div>
    <div class="metric-cards__meta">Last updated: {{ lastUpdate }}</div>
  </div>
</div>
```

### 4. Multi-Line Chart Enhancements

**Current State**
- Simple line chart comparing 2 dates
- Single metric (energy)

**Enhanced State**
- Support overlay of multiple metrics on same chart
- Dual Y-axes for different units (energy vs cost)
- Legend click to hide/show series
- Range selection on chart to drill down
- Tooltip showing all metrics at time point
- Grid lines with hour labels
- Smooth animation between metric changes

```typescript
// Chart data structure
interface ChartDataset {
  label: string              // "2026-01-08 Energy" or "Energy - 2026-01-08"
  data: number[]
  borderColor: string
  backgroundColor: string
  yAxisID: string            // 'y' for primary, 'y1' for secondary
  fill: boolean
  tension: 0.3
  pointRadius: 3
  pointHoverRadius: 5
}

// Support dual Y-axes
const chartOptions = {
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { text: 'Energy (kWh)' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { text: 'Cost (EUR)' }
    }
  }
}
```

### 5. Data Table with Hourly Breakdown

**New Component**: `src/components/energy/EnergyDataTable.vue`

```vue
<div class="energy-data-table">
  <div class="energy-data-table__controls">
    <input type="text" placeholder="Search..." />
    <select @change="changeSortBy">
      <option>Sort by Time</option>
      <option>Sort by Value</option>
    </select>
    <button @click="exportAsCSV">Export CSV</button>
    <button @click="exportAsPDF">Export PDF</button>
  </div>
  
  <div class="energy-data-table__container">
    <table class="energy-data-table__table">
      <thead>
        <tr>
          <th>Time</th>
          <th v-for="date in selectedDates" :key="date">
            {{ date }}
          </th>
          <th v-for="metric in selectedMetrics" :key="metric.id">
            {{ metric.label }} ({{ metric.unit }})
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(hour, idx) in hours" :key="idx">
          <td>{{ hour }}</td>
          <td v-for="date in selectedDates" :key="date">
            {{ getValueForDateHour(date, hour) }}
          </td>
          <td v-for="metric in selectedMetrics" :key="metric.id">
            {{ getValueForMetricHour(metric, hour) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="energy-data-table__pagination">
    <span>Showing {{ pageStart }}-{{ pageEnd }} of {{ totalRows }}</span>
    <button @click="prevPage">Previous</button>
    <button @click="nextPage">Next</button>
  </div>
</div>
```

**Features**
- Hourly granularity (00:00 - 23:00)
- Columns for each date + each metric
- Sort by time, value, or specific metric
- Search/filter rows
- Export to CSV/PDF
- Pagination (20 rows per page)
- Highlight anomalies (values >2σ from mean)

### 6. Controls Panel Improvements

**Characteristics Filter**
```
→ Organize metrics by category (Energy, Environmental, Financial, Operational)
→ Show metric unit in label
→ Add search box to filter metric list
→ Display "X of Y metrics selected"
```

**Meters Control (Time Range)**
```
→ Make De/À actually filter the data shown
→ Add visual feedback (slider showing selected range)
→ Allow preset time ranges:
   - "Full day" (0-23)
   - "Business hours" (8-18)
   - "Off-peak" (22-6)
   - "Custom"
→ Show hour labels above inputs
```

**Options Panel**
```
→ "Un jour" toggle: single date vs multi-date comparison
→ "Exporter" button: export data as CSV
→ "Partager" button: generate shareable link
→ "Réinitialiser" button: reset all filters
→ Settings icon: open view preferences modal
```

### 7. Data Integration (Mock → API Ready)

**Current**: Mock data in `energyHistoricalMock.ts`

**Structure for Easy Backend Integration**:
```typescript
// Service interface (prepare for API calls)
interface EnergyHistoryService {
  getMetricsForDate(date: string): Promise<TimeSeriesData[]>
  getMetricsForRange(startDate: string, endDate: string): Promise<TimeSeriesData[]>
  getAvailableDates(): Promise<string[]>
  getMetricsList(): Promise<Metric[]>
  exportData(params: ExportParams): Promise<Blob>
}

// Pinia store to manage state
const useEnergyHistoryStore = defineStore('energyHistory', () => {
  // Reactive state
  const selectedMetrics = ref<Metric[]>([])
  const selectedDates = ref<string[]>([])
  const chartData = ref<TimeSeriesData[]>([])
  const timeRange = ref({ from: 0, to: 23 })
  
  // Computed
  const filteredData = computed(() => {
    // Filter based on selections
  })
  
  // Actions
  async function loadMetricsForDate(date: string) {
    // Load from service
  }
})
```

---

## Implementation Roadmap

### Phase 1: Foundation (Priority P0)
1. **Refactor data structure** to support multi-metric framework
   - Update `energyHistoricalMock.ts` with new Metric interface
   - Generate mock data for all 7 default metrics
   - Expand daily data from 1 to 7 metrics
   
2. **Create metric management system**
   - Extract characteristics filter logic to reusable component
   - Implement metric selection state in Pinia store
   - Add metric categories and grouping
   
3. **Enhance calendar interface**
   - Add data availability indicators
   - Implement preset comparison buttons
   - Add keyboard navigation (arrow keys)
   - Add year/month selector

4. **Update metric cards**
   - Dynamic card generation based on selected metrics
   - Show trend indicators and change %
   - Add scroll container if >4 metrics

### Phase 2: Visualization (Priority P1)
1. **Expand chart functionality**
   - Support multiple metrics on same chart
   - Implement dual Y-axes for different units
   - Add legend click to toggle series
   - Add metric focus mode (click metric card to show only that metric)

2. **Create data table component**
   - Hourly breakdown table
   - Sort, search, pagination
   - Highlight anomalies
   - Export buttons

3. **Implement meters control filtering**
   - Actually filter hourly data based on De/À range
   - Show visual range indicator
   - Add preset range buttons

### Phase 3: Polish & Integration (Priority P2)
1. **Add advanced features**
   - Export as CSV/PDF
   - Share view link
   - Settings modal (default metrics, precision, etc.)
   - Toast notifications for actions

2. **Integrate with other views**
   - Link to Reports view for historical comparison
   - Link to Performance view for trend analysis
   - Link to CostAnalysis for financial insights
   - Link to Benchmarking for comparisons

3. **Prepare for API integration**
   - Create service layer interface
   - Add loading states and error handling
   - Implement pagination for large datasets
   - Add real-time data updates

### Phase 4: Optimization & Deployment (Priority P3)
1. **Performance tuning**
   - Lazy load data (only visible date range)
   - Optimize chart rendering
   - Implement virtual scrolling for large tables
   
2. **Testing**
   - Unit tests for calculations
   - E2E tests for workflows
   - Performance testing with Lighthouse
   
3. **Documentation**
   - Component API documentation
   - User guide for new features
   - Developer guide for adding new metrics

---

## Code Guidelines

### Vue 3 Composition API
```typescript
// Use script setup
<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  
  // Type-safe
  interface MyInterface { /* ... */ }
  const myRef = ref<MyInterface>()
</script>
```

### BEM Naming Convention
```css
/* Block */
.energy-dashboard { }

/* Element */
.energy-dashboard__chart { }

/* Modifier */
.energy-dashboard__chart--loading { }

/* Not allowed */
.energy-dashboard-chart { }  /* Use double underscore */
.energy-dashboard__chart_title { }  /* Use double dash for modifier */
```

### TailAdmin Compatibility
- Use existing color tokens: `bodydark`, `bodydark2`, `stroke`, etc.
- Use existing spacing: `p-6`, `gap-6`, `mb-4`, etc.
- Use existing shadows: `shadow-default`, `shadow-1`, etc.
- Use existing borders: `border-stroke`, `border-1`, etc.

### File Organization
```
src/
├── components/energy/
│   ├── EnergyMetricCards.vue
│   ├── EnergyChart.vue
│   ├── EnergyCalendar.vue
│   ├── EnergyDataTable.vue
│   ├── EnergyCharacteristics.vue
│   ├── EnergyMeters.vue
│   └── EnergyOptions.vue
├── data/
│   ├── energyHistoricalMock.ts  (update)
│   └── energyMetrics.ts         (new)
├── stores/
│   └── useEnergyHistoryStore.ts (update/create)
├── views/
│   └── EnergyHistorical.vue     (update)
└── assets/
    └── energy-dashboard.css      (keep existing)
```

---

## Success Criteria

### Functional Requirements
✅ Support any metric type (not hardcoded to energy)  
✅ Multi-metric selection and display  
✅ Calendar with data availability indicators  
✅ Hourly data table with all metrics  
✅ Dual Y-axes for different unit types  
✅ Time range filtering (De/À) working  
✅ Export functionality (CSV at minimum)  
✅ Preset date comparisons  
✅ Keyboard navigation (arrows, Tab, Enter)  

### Design Requirements
✅ Consistent with TailAdmin design system  
✅ Professional typography hierarchy  
✅ Responsive on all devices (mobile first)  
✅ Color-coded by metric  
✅ Clear visual affordance (clickable elements obvious)  
✅ Smooth animations (0.2-0.3s)  
✅ Accessibility (WCAG AA)  

### Technical Requirements
✅ Vue 3 Composition API with TypeScript  
✅ BEM CSS architecture  
✅ Pinia store integration  
✅ No ESLint errors  
✅ No TypeScript errors  
✅ Lazy loading for large datasets  
✅ API-ready service layer  

### User Experience
✅ Fast load times (< 2s)  
✅ Responsive interactions (< 100ms feedback)  
✅ Clear error messages  
✅ Intuitive controls (no learning curve)  
✅ Mobile-friendly touch targets (≥ 48px)  

---

## Integration Points

### Links to Other Views
- **Reports View**: Generate historical reports from selected date range
- **Performance View**: Analyze performance trends over time
- **CostAnalysis View**: Compare cost metrics and optimization impact
- **Benchmarking View**: Compare current performance vs historical benchmarks
- **Comparison View**: More detailed comparative analysis

### Navigation
- Add Energy History link to main sidebar under Analytics
- Breadcrumb: Dashboard → Énergie → Historique
- Related links at bottom of view

### Dashboard Integration
- Show "View Historical Data" button on main dashboard
- Link from alerts to historical context

---

## Testing Scenarios

### Scenario 1: Energy Analyst
**Goal**: Compare this week's energy vs last week  
**Steps**:
1. Open Energy Historical view
2. Click "Week vs week" preset
3. Select Energy metric (already selected)
4. View chart showing comparison
5. Check data table for hourly details
6. Export as CSV for report

### Scenario 2: Cost Manager
**Goal**: Identify peak cost hours and estimate savings  
**Steps**:
1. Open Energy Historical view
2. Select metrics: Energy + Cost
3. Set time range to business hours (8-18)
4. View dual-axis chart showing both metrics
5. Identify peak cost periods
6. Calculate potential savings

### Scenario 3: Sustainability Officer
**Goal**: Track CO2 reduction progress  
**Steps**:
1. Open Energy Historical view
2. Select CO2 metric
3. Compare current month vs last month
4. View trend chart
5. Export data for sustainability report

### Scenario 4: Operations Manager (Mobile)
**Goal**: Quick check on today's energy usage  
**Steps**:
1. Open view on mobile device
2. Calendar shows current date
3. Tap date for quick summary
4. View responsive chart
5. Scroll to see data table

---

## Next Steps

1. **Review this prompt** with stakeholder
2. **Create enhanced data mock** with multi-metric support
3. **Build component library** (metrics, calendar, table, chart)
4. **Implement Pinia store** for state management
5. **Update EnergyHistorical.vue** to use new components
6. **Add API service layer** (preparation for backend)
7. **Testing and optimization**
8. **Documentation and deployment**

---

## Appendix: Metric Categories

### Energy & Environmental
- Énergie (Energy): kWh, MWh, Wh
- CO2 (Carbon Emissions): kg CO2, metric tons, g CO2/kWh
- Photovoltaïque (Solar Generation): kWh, %
- Consommation Non-Renouvelable (Non-Renewable): kWh, %

### Financial
- Coût (Cost): EUR, USD, GBP
- Coût Pic (Peak-Rate Cost): EUR, USD
- Facture (Billing): EUR, USD
- Économies (Savings): EUR, USD, %

### Operational
- Débit (Flow Rate): L/min, gal/h
- Température (Temperature): °C, °F
- Humidité (Humidity): % RH
- Pression (Pressure): PSI, bar
- Production (Output): units, items/h
- Utilisation (Utilization): %
- Efficacité (Efficiency): %
- Rendement (Yield): %
- Disponibilité (Availability): %

---

**Document Version**: 1.0  
**Date**: 2026-01-09  
**Status**: Ready for Implementation  
**Complexity**: Medium-High (5-7 days estimated)  
**Team Size**: 1-2 developers  
