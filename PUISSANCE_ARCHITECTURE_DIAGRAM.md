# Puissance View Architecture Diagram

## Component Hierarchy

```
AdminLayout
└── PuissanceView.vue (386 lines)
    ├── Header Section
    │   ├── Title & Description
    │   └── Controls Card
    │       ├── Meter Selector (4 buttons)
    │       └── View Mode Toggle (3 buttons)
    │
    ├── Overview Mode View
    │   └── Grid (lg:cols-3)
    │       ├── Left Column (1/3)
    │       │   └── KPI Cards (6x)
    │       │       ├── KPICard.vue
    │       │       ├── KPICard.vue
    │       │       ├── KPICard.vue
    │       │       ├── KPICard.vue
    │       │       ├── KPICard.vue
    │       │       └── KPICard.vue
    │       │
    │       └── Right Column (2/3)
    │           ├── Monthly Chart Section
    │           │   ├── [View Details Button]
    │           │   └── BarChart.vue
    │           │
    │           └── Daily/Hourly Charts
    │               ├── [View Details Button] + BarChart.vue
    │               └── [View Details Button] + BarChart.vue
    │
    ├── Charts Mode View
    │   ├── Monthly Chart (Full Width)
    │   │   ├── [View Details Button]
    │   │   └── BarChart.vue
    │   │
    │   └── Daily/Hourly Charts (2-col grid)
    │       ├── [View Details Button] + BarChart.vue
    │       └── [View Details Button] + BarChart.vue
    │
    ├── Tables Mode View
    │   ├── Hourly Table (Full Width)
    │   │   ├── [View Details Button]
    │   │   └── DataTable.vue
    │   │
    │   └── Daily Tables (2-col grid)
    │       ├── [View Details Button] + DataTable.vue
    │       └── [View Details Button] + DataTable.vue
    │
    ├── ChartDetailModal.vue (240 lines)
    │   ├── Modal Header
    │   ├── PeriodSelector.vue
    │   │   ├── Period Buttons (5)
    │   │   └── Timeline View (scrollable)
    │   ├── Enlarged Chart
    │   │   └── BarChart.vue (400px height)
    │   ├── Statistics Cards (4)
    │   │   ├── Average Card
    │   │   ├── Peak Card
    │   │   ├── Minimum Card
    │   │   └── Total Card
    │   └── Footer (Export + Close)
    │
    └── TableDetailModal.vue (260 lines)
        ├── Modal Header
        ├── Toolbar
        │   ├── Search Input
        │   └── Period Tabs (3: Hourly/Daily/Monthly)
        ├── Table
        │   ├── Header Row (Sortable)
        │   └── Data Rows
        ├── Pagination
        │   ├── Previous Button
        │   ├── Page Numbers
        │   └── Next Button
        └── Footer (Export CSV + Close)
```

## Data Flow

### Overview Mode Display
```
User Loads Page
    ↓
selectedMeter = 'compressor'
viewMode = 'overview'
    ↓
meters computed property (with translations)
    ↓
currentMeterData computed property
    ↓
Display Overview Layout:
- Left: KPI Cards (6x) showing currentMeterData.kpiValues
- Right: Charts showing currentMeterData.monthlyData, dailyData, hourlyData
```

### Chart Detail Modal Flow
```
User clicks "View Details" on chart
    ↓
showChartModal('monthly'|'daily'|'hourly')
    ↓
chartModalData.value = { title, subtitle, data, labels }
chartModalOpen.value = true
    ↓
ChartDetailModal mounts
    ↓
PeriodSelector displays
    ↓
User selects period (Hour/Day/Week/Month/Year)
    ↓
Period selector emits 'period-change'
    ↓
(In real app: fetch data for selected period)
    ↓
Chart updates with new period data
    ↓
Statistics cards update
    ↓
User can export as PNG
    ↓
User closes modal
    ↓
chartModalOpen.value = false
    ↓
Modal unmounts
```

### Table Detail Modal Flow
```
User clicks "View Details" on table
    ↓
showTableModal('hourly'|'daily'|'monthly')
    ↓
tableModalData.value = { title, columns }
tableModalOpen.value = true
    ↓
TableDetailModal mounts
    ↓
currentData = hourlyTableData (default)
    ↓
User can:
├─ Type search query
│  └─ filteredData updates
├─ Click column header
│  └─ Sort state changes
├─ Click page number
│  └─ Navigate pages
├─ Click period tab
│  └─ Switch data source
│     ├─ Hourly: hourlyTableData
│     ├─ Daily: dailyTableData
│     └─ Monthly: dailyAverageData
└─ Click Export CSV
   └─ Download filtered data
    ↓
User closes modal
    ↓
tableModalOpen.value = false
    ↓
Modal unmounts
```

## State Management

### PuissanceView Root State
```typescript
// Meter Selection
const selectedMeter = ref('compressor')  // 'tgbt' | 'compressor' | 'cooling' | 'lighting'

// View Mode Selection
const viewMode = ref('overview')  // 'overview' | 'charts' | 'tables'

// Chart Modal
const chartModalOpen = ref(false)
const chartModalData = ref({
  title: string,
  subtitle: string,
  data: number[],
  labels: string[]
})

// Table Modal
const tableModalOpen = ref(false)
const tableModalData = ref({
  title: string,
  columns: TableColumn[]
})

// Computed Values
const meters = computed(() => [...])           // 4 meter objects
const currentMeterData = computed(() => ...)   // allMeters[selectedMeter]
const kpiKeys = ['avgPowerLastMonth', ...]     // 6 KPI keys
```

### PeriodSelector State
```typescript
const selectedTimeline = ref<string | null>(null)  // Selected timeline item

const timelineItems = computed(() => {
  // Returns array of { label, date } based on selectedPeriod:
  // 'hour' → 24 items
  // 'day' → 30 items
  // 'week' → 12 items
  // 'month' → 12 items
  // 'year' → 5 items
})

const selectedRangeText = computed(() => string)  // Display text
```

### TableDetailModal State
```typescript
const searchQuery = ref('')                    // Search input
const activePeriod = ref('hourly')             // 'hourly' | 'daily' | 'monthly'
const currentPage = ref(1)                     // Current page number
const sortBy = ref<string | null>(null)        // Sort column key
const sortOrder = ref('asc')                   // 'asc' | 'desc'
const itemsPerPage = 15

const currentData = computed(() => {
  // Returns hourlyData, dailyData, or monthlyData based on activePeriod
})

const filteredData = computed(() => {
  // Applies search filter and sort, returns filtered array
})

const paginatedData = computed(() => {
  // Returns current page of filteredData
})
```

## Event Flow

### User Interactions

```
├─ Meter Selection
│  └─ Click meter button
│     └─ selectedMeter = meter.id
│        └─ currentMeterData updates
│           └─ All charts/tables re-render
│
├─ View Mode Selection
│  └─ Click view button
│     └─ viewMode = 'overview'|'charts'|'tables'
│        └─ Template conditionals show correct view
│
├─ Chart Detail
│  ├─ Click "View Details" on chart
│  │  └─ showChartModal(chartType)
│  │     └─ chartModalOpen = true
│  │        └─ ChartDetailModal mounts
│  │
│  └─ Period Selection
│     └─ Click period button
│        └─ emit('period-change')
│           └─ (Modal updates chart data)
│
├─ Table Detail
│  ├─ Click "View Details" on table
│  │  └─ showTableModal(tableType)
│  │     └─ tableModalOpen = true
│  │        └─ TableDetailModal mounts
│  │
│  ├─ Search
│  │  └─ Type in search input
│  │     └─ searchQuery updates
│  │        └─ filteredData re-computes
│  │
│  ├─ Sort
│  │  └─ Click column header
│  │     └─ toggleSort(columnKey)
│  │        └─ sortBy/sortOrder update
│  │           └─ filteredData re-sorts
│  │
│  ├─ Paginate
│  │  └─ Click page button
│  │     └─ currentPage update
│  │        └─ paginatedData returns new page
│  │
│  └─ Period Tab
│     └─ Click period tab
│        └─ activePeriod update
│           └─ currentData returns new table data
│
└─ Modal Close
   ├─ Click Close button
   │  └─ emit('close')
   │     └─ chartModalOpen/tableModalOpen = false
   ├─ Click overlay
   │  └─ @click.self="closeModal"
   │     └─ Same as above
   └─ Click X button
      └─ closeModal()
         └─ Same as above
```

## Responsive Breakpoints

```
Mobile (<640px)
├─ Single column layout
├─ Stacked widgets
├─ Full-width modals
└─ Touch-optimized buttons

Tablet (640px - 1024px)
├─ 2-column beginning
├─ Charts side-by-side where possible
├─ Tables scrollable
└─ Adjusted modal size

Desktop (>1024px)
├─ Full 3-column overview
├─ Spacious modals
├─ Large charts (400px height in modals)
└─ Multiple columns for tables
```

## Theme Integration Points

```
Light Mode                          Dark Mode
├─ Background: #FFFFFF             ├─ Background: #0F172A (slate-900)
├─ Text: #111827 (gray-900)        ├─ Text: #E2E8F0 (gray-200)
├─ Borders: #E5E7EB (gray-200)     ├─ Borders: #334155 (slate-700)
├─ Cards: White with shadow         ├─ Cards: Slate-900 with subtle shadow
├─ Headers: #F8FAFC (slate-50)     ├─ Headers: #1E293B (slate-800)
└─ Hover: #F3F4F6 (gray-100)       └─ Hover: #334155 (slate-700)

Meter Colors (Both Modes)
├─ TGBT: #ef4444 (red)
├─ Compresseur: #22c55e (green)
├─ Climatisation: #3b82f6 (blue)
└─ Éclairage: #eab308 (yellow)

Button Gradients
├─ Overview: from-blue-500 to-blue-600
├─ Charts: from-indigo-500 to-indigo-600
├─ Tables: from-purple-500 to-purple-600
└─ Pagination: from-blue-500 to-blue-600
```

## Performance Optimizations

```
Chart Rendering
├─ Chart.js instance destroyed on unmount
├─ Recreated when data changes
└─ Watch for labels/data changes

Table Rendering
├─ Pagination limits DOM to ~15 rows
├─ Computed properties prevent re-renders
└─ Filtering happens in JavaScript

Animation Performance
├─ CSS transitions use GPU acceleration
├─ 200-300ms smooth animations
└─ Transform + opacity for performance

Dark Mode Detection
├─ Detected once at mount
├─ Cached for repeated use
└─ No repeated DOM queries
```

## Modal Rendering

```
Vue Component Tree
└─ PuissanceView
    ├─ Template content
    └─ Teleport to body
        ├─ Overlay (Fixed position)
        └─ Modal (Fixed position, z-50)

Benefit:
- Proper stacking context
- No parent overflow issues
- Cleaner DOM structure
- Proper backdrop blur
```

---

**Note:** All metrics and line counts are current as of implementation.
