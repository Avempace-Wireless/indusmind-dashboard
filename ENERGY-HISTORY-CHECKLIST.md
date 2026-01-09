# Energy History View - Implementation Checklist & Architecture

## Quick Reference Checklist

### Phase 1: Foundation (Days 1-2)
- [ ] **Data Structure Refactoring**
  - [ ] Create `Metric` interface
  - [ ] Create `TimeSeries` interface  
  - [ ] Update `energyHistoricalMock.ts` to generate multi-metric data
  - [ ] Generate data for 7 default metrics (Energy, CO2, Cost, Solar, Consumption, Efficiency, Savings)
  - [ ] Test mock data generation (verify hourly values make sense)

- [ ] **Pinia Store Creation**
  - [ ] Create `useEnergyHistoryStore.ts`
  - [ ] State: selectedMetrics, selectedDates, timeRange, chartData
  - [ ] Getters: filteredData, selectedMetricsData, timeSeriesForChart
  - [ ] Actions: loadMetricsForDate, selectMetrics, selectDates, setTimeRange
  - [ ] Persist user selections to localStorage

- [ ] **Component Extraction**
  - [ ] Extract characteristics filter to `EnergyCharacteristics.vue`
  - [ ] Extract meters control to `EnergyMeters.vue`
  - [ ] Extract calendar to `EnergyCalendar.vue`
  - [ ] Update EnergyHistorical.vue to compose using new components

- [ ] **Calendar Enhancement**
  - [ ] Add data availability indicators (●)
  - [ ] Add preset comparison buttons (week vs week, month vs month, etc.)
  - [ ] Add year/month selector
  - [ ] Implement keyboard navigation (arrow keys, Enter)
  - [ ] Add hover tooltip showing data summary

- [ ] **CSS Updates**
  - [ ] Add calendar presets styling
  - [ ] Add data availability indicator styling
  - [ ] Add year/month selector styling
  - [ ] Ensure all new elements responsive

### Phase 2: Visualization (Days 3-4)
- [ ] **Metric Cards**
  - [ ] Create `EnergyMetricCards.vue` with dynamic metric rendering
  - [ ] Add trend indicators (↑/↓) and change %
  - [ ] Add click-to-focus functionality
  - [ ] Make scrollable container for >4 metrics
  - [ ] Color-code by metric

- [ ] **Chart Enhancement**
  - [ ] Support multiple datasets (one per metric)
  - [ ] Implement dual Y-axes for different units
  - [ ] Add legend toggle (click to hide/show)
  - [ ] Smooth animation between metric changes
  - [ ] Add range selection on chart
  - [ ] Add metric focus mode

- [ ] **Data Table**
  - [ ] Create `EnergyDataTable.vue`
  - [ ] Display hourly data (00:00 - 23:00)
  - [ ] Dynamic columns (date + metric combinations)
  - [ ] Sort by time, value, or metric
  - [ ] Search/filter functionality
  - [ ] Pagination (20 rows per page)
  - [ ] Highlight anomalies (red background if >2σ from mean)
  - [ ] Add copy-to-clipboard button for each cell

- [ ] **Meters Control Functionality**
  - [ ] Make De/À actually filter chart data
  - [ ] Add visual range indicator/slider
  - [ ] Add preset buttons (Full day, Business hours, Off-peak)
  - [ ] Update chart in real-time

- [ ] **Options Panel**
  - [ ] Implement "Un jour" toggle (already exists, verify works)
  - [ ] Add "Exporter" button (CSV export)
  - [ ] Add "Réinitialiser" button (reset all filters)
  - [ ] Add settings icon for preferences modal

### Phase 3: Integration (Days 4-5)
- [ ] **Export Functionality**
  - [ ] Implement CSV export
  - [ ] Implement PDF export (using jsPDF or similar)
  - [ ] Include metadata (date, metrics, time range)
  - [ ] Add file naming with timestamp

- [ ] **State Management**
  - [ ] Ensure all filters update chart/table in real-time
  - [ ] Persist user selections
  - [ ] Handle multi-metric display state
  - [ ] Manage loading states

- [ ] **Error Handling**
  - [ ] Add loading skeletons
  - [ ] Add error messages with retry
  - [ ] Handle empty data gracefully
  - [ ] Validate date ranges

- [ ] **UI Polish**
  - [ ] Add toast notifications for actions
  - [ ] Add success/error feedback
  - [ ] Add loading indicators
  - [ ] Ensure all buttons have hover states

### Phase 4: Testing & Deployment (Day 5+)
- [ ] **Browser Testing**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Mobile browser (iOS Safari, Chrome Android)

- [ ] **Responsive Testing**
  - [ ] Mobile (320px, 375px, 480px)
  - [ ] Tablet (768px, 1024px)
  - [ ] Desktop (1280px, 1440px, 1920px)

- [ ] **Functionality Testing**
  - [ ] Calendar date selection works
  - [ ] Metric selection filters chart
  - [ ] Time range filtering works
  - [ ] Chart updates correctly
  - [ ] Table displays all data
  - [ ] Export generates valid file
  - [ ] Keyboard navigation works

- [ ] **Accessibility Testing**
  - [ ] Keyboard Tab order correct
  - [ ] Focus visible on all elements
  - [ ] Color contrast ≥ 4.5:1
  - [ ] Screen reader compatible

- [ ] **Performance Testing**
  - [ ] Lighthouse score ≥ 90
  - [ ] Page load < 2s
  - [ ] Chart render < 500ms
  - [ ] Table scroll smooth
  - [ ] No memory leaks

- [ ] **Code Quality**
  - [ ] No ESLint errors
  - [ ] No TypeScript errors
  - [ ] Type safety throughout
  - [ ] Components properly documented
  - [ ] Code follows BEM conventions

---

## Component Architecture

### Component Tree
```
EnergyHistorical.vue (Main View)
├── AdminLayout
├── PageBreadcrumb
└── Dashboard
    ├── LeftPanel (60%)
    │   ├── EnergyMetricCards
    │   │   ├── MetricCard (dynamic, one per selected metric)
    │   │   │   ├── Header (label + unit)
    │   │   │   ├── Value (large number)
    │   │   │   ├── Trend (% change + arrow)
    │   │   │   └── Meta (last updated)
    │   │   └── ScrollContainer (if >4 metrics)
    │   └── EnergyChart
    │       ├── ChartHeader
    │       │   ├── TitleGroup
    │       │   └── Controls (zoom, reset, export)
    │       ├── Canvas (Chart.js)
    │       └── Legend
    │
    └── RightPanel (40%)
        ├── EnergyCalendar
        │   ├── Header (prev/next buttons)
        │   ├── YearMonthSelector
        │   ├── PresetComparison (buttons)
        │   ├── Weekdays
        │   └── Grid (day buttons with indicators)
        │
        ├── EnergyCharacteristics
        │   ├── Title
        │   ├── SearchBox
        │   ├── CategoryGroup (Energy, Financial, Operational)
        │   └── MetricCheckbox (repeating)
        │
        ├── EnergyMeters
        │   ├── Title
        │   ├── FromControl (input + unit select)
        │   ├── PresetButtons (Full day, Business, Off-peak)
        │   └── ToControl (input + unit select)
        │
        └── EnergyOptions
            ├── UnJourToggle
            ├── ExporterButton
            ├── RéinitialiserButton
            └── SettingsIcon
```

### Data Flow
```
User Interaction
      ↓
Store Action (selectMetrics, selectDates, setTimeRange)
      ↓
State Update
      ↓
Computed Getters (filteredData, chartSeries, tableRows)
      ↓
Component Update (watcher triggers)
      ↓
Visual Refresh (chart, cards, table)
      ↓
New User Interaction...
```

### Store Structure
```typescript
useEnergyHistoryStore {
  state: {
    selectedMetrics: Metric[]
    selectedDates: string[]
    timeRange: { from: number, to: number }
    chartData: TimeSeriesData[]
    availableDates: string[]
    loading: boolean
    error: string | null
  }
  
  getters: {
    filteredChartData()      // Filter by dates + time range
    selectedMetricsData()    // Get data for selected metrics only
    timeSeriesForChart()     // Format for Chart.js
    tableRows()              // Format for data table
    metricsSummary()         // Summary stats for cards
  }
  
  actions: {
    async loadMetricsForDate(date)
    selectMetrics(metrics)
    selectDates(dates)
    setTimeRange(from, to)
    toggleMetric(metricId)
    resetFilters()
    exportAsCSV()
    exportAsPDF()
  }
}
```

---

## File Structure

### New Files to Create
```
src/
├── components/energy/
│   ├── EnergyMetricCards.vue          (NEW - 150 lines)
│   ├── EnergyChart.vue                (NEW - 200 lines)
│   ├── EnergyDataTable.vue            (NEW - 250 lines)
│   ├── EnergyCalendar.vue             (NEW - 200 lines)
│   ├── EnergyCharacteristics.vue      (NEW - 100 lines)
│   ├── EnergyMeters.vue               (NEW - 80 lines)
│   ├── EnergyOptions.vue              (NEW - 80 lines)
│   └── index.ts                       (NEW - exports)
├── data/
│   ├── energyMetrics.ts               (NEW - metric definitions)
│   └── energyHistoricalMock.ts        (UPDATE - multi-metric data)
├── stores/
│   └── useEnergyHistoryStore.ts       (NEW - state management)
└── services/
    └── energyHistoryService.ts        (NEW - API ready)
```

### Files to Update
```
src/
├── views/
│   └── EnergyHistorical.vue           (UPDATE - refactor to use components)
├── assets/
│   └── energy-dashboard.css           (UPDATE - add new component styles)
└── router/
    └── index.ts                       (NO CHANGE - route already exists)
```

---

## Color & Styling Guide

### Metric Colors (for chart lines & cards)
```typescript
const metricColors = {
  energy: '#10b981',           // green (primary)
  co2: '#ef4444',              // red (warning)
  cost: '#f59e0b',             // amber (financial)
  solar: '#fbbf24',            // yellow (renewable)
  consumption: '#3b82f6',      // blue (operational)
  efficiency: '#8b5cf6',       // purple (performance)
  savings: '#06b6d4'           // cyan (positive)
}
```

### UI Colors (follow TailAdmin)
```
Text Primary: #111827 (bodydark)
Text Secondary: #6b7280 (bodydark2)
Borders: #e5e7eb (stroke)
Backgrounds: #f9fafb (gray-50), #ffffff (white)
Accents: #10b981 (success green)
Hover: #f3f4f6 (gray-100)
```

### Responsive Breakpoints (Tailwind)
```
Mobile: < 768px
Tablet: 768px - 1023px
Desktop: 1024px - 1279px
Large: ≥ 1280px
```

---

## Time Estimates

| Task | Complexity | Time | Notes |
|------|-----------|------|-------|
| Data refactoring | Medium | 2-3h | Mock generation, validation |
| Pinia store | Medium | 2-3h | State + getters + actions |
| Component extraction | Low | 2-3h | Copy + adapt existing code |
| Calendar enhancement | Medium | 3-4h | Presets, keyboard nav, indicators |
| Metric cards | Low | 2h | Similar to existing KPICard |
| Chart enhancement | High | 4-5h | Multi-metric, dual axes, focus |
| Data table | High | 4-5h | Complex table with many features |
| Export functionality | Medium | 2-3h | CSV easy, PDF moderate |
| CSS styling | Medium | 2-3h | New components + responsive |
| Testing | Medium | 3-4h | Functionality, responsive, a11y |
| Documentation | Low | 1-2h | Component APIs, user guide |
| **Total** | | **28-35h** | **Approximately 1 week** |

---

## Known Challenges & Solutions

### Challenge 1: Multiple Y-Axes with Different Units
**Problem**: Energy (kWh) vs Cost (EUR) on same chart - different scales
**Solution**: 
- Implement dual Y-axis chart configuration
- Left axis for first metric, right for second
- Visual indicator on axis label showing which line uses which axis
- Example: "Energy (kWh)" [green line] | "Cost (EUR)" [orange line]

### Challenge 2: Performance with Large Datasets
**Problem**: 31 days × 24 hours × 7 metrics = 5,208 data points
**Solution**:
- Lazy load data (only visible month)
- Virtual scrolling for table (show 20 rows, render 50)
- Debounce chart updates (max 1 update per 100ms)
- Cache computed values

### Challenge 3: Metric Unit Conversion
**Problem**: Different metrics have different units and scales
**Solution**:
- Store unit in metric definition
- Format display values based on unit
- Allow unit selection (kWh vs MWh, etc.)
- Normalize for chart (show both values on respective axes)

### Challenge 4: State Explosion
**Problem**: Many filters (metrics, dates, time range, sort, search...)
**Solution**:
- Centralize in Pinia store
- Use computed getters for derivations
- Persist only critical state (user selections)
- Provide reset functionality

### Challenge 5: Calendar Data Availability
**Problem**: Which dates have data? How to show on calendar?
**Solution**:
- Query backend for dates with data
- Show indicator (● or color) on calendar
- For mock: mark specific dates with data
- Hover shows quick summary

---

## Integration Checklist

### With Other Views
- [ ] Link from DashboardView to EnergyHistorical
- [ ] Link from ReportsView for report generation
- [ ] Link from PerformanceView for trend analysis
- [ ] Breadcrumb navigation working
- [ ] Sidebar menu showing Energy History

### With Existing Components
- [ ] Uses AdminLayout (✓ already done)
- [ ] Uses PageBreadcrumb (✓ already done)
- [ ] Uses existing chart components from puissance/
- [ ] Uses existing table components
- [ ] Uses existing calendar patterns
- [ ] Uses existing button/input styles

### With TailAdmin Design System
- [ ] Colors match bodydark/bodydark2/stroke/success
- [ ] Spacing uses Tailwind scale (1rem, 1.5rem, 2rem)
- [ ] Shadows match shadow-default
- [ ] Borders match border-stroke
- [ ] Typography matches heading/body styles
- [ ] Responsive classes (sm:, md:, lg:, xl:)

---

## Testing Scenarios

### Happy Path
1. Load page → Calendar shows current month
2. Select metric (Energy) → Chart updates
3. Select date range → Chart shows selected dates
4. Toggle time range (0-18h) → Chart updates
5. Export CSV → File downloads
6. Click metric card → Chart focuses on that metric

### Edge Cases
1. No data for selected date → Show "No data" message
2. Single metric vs multiple metrics → Chart adapts
3. Different units (kWh vs EUR) → Dual Y-axes show
4. Mobile view → Stack vertically, responsive layout
5. Large dataset → Pagination in table, no freeze
6. Keyboard nav → Arrow keys work, Tab order correct

### Error Cases
1. API fails → Show error + retry button
2. Export fails → Toast error message
3. Invalid date range → Show validation error
4. Memory issues → Lazy load more aggressively
5. Slow network → Show loading skeleton

---

## Success Metrics

### User Metrics
- Time to find specific data: < 30 seconds
- Time to export data: < 5 seconds
- Clicks to compare two dates: < 3
- Mobile usability score: ≥ 90

### Technical Metrics
- Page load time: < 2 seconds
- Chart render time: < 500ms
- Lighthouse score: ≥ 90
- No TypeScript errors: ✓
- No ESLint errors: ✓
- Test coverage: ≥ 80%

### Business Metrics
- User adoption: Track views/month
- Feature usage: Which filters used most
- Export frequency: How often data exported
- User feedback: Net satisfaction score

---

## Rollout Plan

### Phase 1: Beta (Internal)
- Day 1-3: Development
- Day 4: QA testing (internal team)
- Day 5: Bug fixes + optimizations

### Phase 2: Limited Release
- Launch to subset of users (10%)
- Gather feedback
- Fix issues

### Phase 3: Full Release
- Launch to all users
- Monitor performance
- Gather feedback for v2

### Post-Launch Support
- Bug fixes
- Performance optimization
- Feature enhancements
- User documentation

---

**Last Updated**: 2026-01-09  
**Version**: 1.0  
**Status**: Ready for Implementation  
