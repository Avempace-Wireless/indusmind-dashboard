# Meters Feature Components

This directory contains reusable UI components for the meters feature views.

## Component Catalog

### Layout Components

#### `MeterHeader.vue`
Displays the page title and description with optional "Manage Meters" button.

**Props:**
- `title: string` - Page title
- `description: string` - Page description
- `showManageButton?: boolean` - Show manage button
- `manageButtonLabel?: string` - Button text

**Emits:**
- `manage-meters` - When manage button is clicked

**Usage:**
```vue
<MeterHeader 
  title="Puissance"
  description="Power consumption analysis"
  show-manage-button
  @manage-meters="openSelector"
/>
```

#### `PageHeader.vue`
Complete page header with breadcrumbs, title, subtitle, and action slots.

**Props:**
- `title: string` - Page title
- `subtitle?: string` - Page subtitle
- `breadcrumbs: Breadcrumb[]` - Breadcrumb navigation

**Slots:**
- `badge` - Optional badge next to title
- `actions` - Action buttons area

**Usage:**
```vue
<PageHeader 
  title="Alerts"
  subtitle="System alerts and notifications"
  :breadcrumbs="[
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Alerts', active: true }
  ]"
>
  <template #actions>
    <button>Export</button>
  </template>
</PageHeader>
```

### Data Display Components

#### `MeterSelector.vue`
Interactive meter selection with visual feedback and colors.

**Props:**
- `selectedMeterIds: string[]` - Selected meter IDs
- `activeMeterIds?: string[]` - Active/visible meters
- `getMeterColor: (id: string) => string` - Function to get meter color
- `getMeterName: (id: string) => string` - Function to get meter name
- `selectorTitle?: string` - Title text
- `emptyStateLabel?: string` - Empty state message

**Emits:**
- `select` - When meter is selected (payload: meterId)

**Usage:**
```vue
<MeterSelector 
  :selected-meter-ids="selectedMeters"
  :get-meter-color="metersStore.getMeterColor"
  :get-meter-name="metersStore.getMeterName"
  selector-title="Select Meters"
  @select="selectMeter"
/>
```

#### `SummaryCards.vue`
Grid of KPI/summary statistic cards.

**Props:**
- `items: SummaryCardItem[]` - Card items array

**Interface:**
```typescript
interface SummaryCardItem {
  key: string
  value: string | number
  label: string
  valueClass?: string        // CSS class for value text color
  className?: string         // Additional classes
}
```

**Usage:**
```vue
<SummaryCards 
  :items="[
    { key: 'alerts', value: '12', label: 'Critical Alerts' },
    { key: 'consumption', value: '450 kWh', label: 'Daily Usage' }
  ]"
/>
```

#### `ItemsList.vue`
Paginated list container with empty state and pagination controls.

**Props:**
- `items: any[]` - Items to display
- `totalPages: number` - Total number of pages
- `currentPage: number` - Current page number
- `emptyIcon?: string` - Icon for empty state (Material Symbol)
- `emptyLabel?: string` - Empty state message
- `containerClass?: string` - Container CSS classes

**Emits:**
- `prev-page` - Previous page clicked
- `next-page` - Next page clicked

**Slots:**
- `items` - Receives `{ items }` - slot content for list items

**Usage:**
```vue
<ItemsList 
  :items="filteredAlerts"
  :total-pages="totalPages"
  :current-page="currentPage"
  @prev-page="currentPage--"
  @next-page="currentPage++"
>
  <template #items="{ items }">
    <AlertItem v-for="alert in items" :key="alert.id" :alert="alert" />
  </template>
</ItemsList>
```

#### `TabControl.vue`
Tab navigation with icons and badges.

**Props:**
- `tabs: Tab[]` - Tab definitions
- `activeTab: string` - Active tab ID

**Interface:**
```typescript
interface Tab {
  id: string
  label: string
  icon?: string    // Material Symbol name
  badge?: string   // Badge text (typically count)
}
```

**Emits:**
- `select-tab` - When tab is selected (payload: tabId)

**Slot:**
- `default` - Tab content area

**Usage:**
```vue
<TabControl 
  :tabs="[
    { id: 'chart', label: 'Chart', icon: 'bar_chart' },
    { id: 'table', label: 'Table', icon: 'table_chart', badge: '5' }
  ]"
  :active-tab="activeTab"
  @select-tab="activeTab = $event"
>
  <!-- Tab content -->
</TabControl>
```

### Comparison & Analysis Components

#### `ComparisonCard.vue`
Period-over-period comparison card showing current vs previous metrics with trend indicators.

**Props:**
- `label: string` - Metric name
- `icon: string` - Material Symbol icon name
- `backgroundColor: string` - Hex color code for styling
- `currentValue: string` - Current period value
- `previousValue: string` - Previous period value for comparison
- `unit?: string` - Unit of measurement (e.g., 'kWh', '%')
- `period?: string` - Period label (default: 'Current vs Previous')
- `footer?: string` - Footer note/disclaimer

**Features:**
- Automatic trend calculation (up/down/stable)
- Percentage change display
- Color-coded badge (Increased/Decreased/Stable)
- Responsive design

**Usage:**
```vue
<ComparisonCard 
  label="Energy Consumption"
  icon="flash_on"
  background-color="#3b82f6"
  current-value="450 kWh"
  previous-value="380 kWh"
  unit="kWh"
  period="Monthly Comparison"
/>
```

#### `ComparisonTable.vue`
Side-by-side meter comparison table with multiple metrics and trend indicators.

**Props:**
- `title: string` - Table title
- `subtitle?: string` - Table subtitle
- `columns: Column[]` - Column definitions
- `rows: Row[]` - Data rows
- `summary?: Summary` - Summary statistics footer
- `showSummary?: boolean` - Show summary row

**Interfaces:**
```typescript
interface Column {
  key: string
  label: string
}

interface Row {
  meterName: string
  color: string
  data: Record<string, string | number>
  trend?: string
  trendIcon?: string
  trendClass?: string
}

interface Summary {
  avgConsumption: string
  peakUsage: string
  totalSavings: string
  topPerformer: string
}
```

**Usage:**
```vue
<ComparisonTable
  title="Energy Consumption Comparison"
  subtitle="Last 30 days analysis"
  :columns="[
    { key: 'consumption', label: 'Consumption (kWh)' },
    { key: 'cost', label: 'Cost ($)' },
    { key: 'efficiency', label: 'Efficiency %' }
  ]"
  :rows="comparisonRows"
  :show-summary="true"
  :summary="summaryStats"
/>
```

#### `PerformanceMetrics.vue`
Dashboard of performance KPI cards with targets, trends, and progress bars.

**Props:**
- `title: string` - Dashboard title
- `subtitle?: string` - Dashboard subtitle
- `metrics: Metric[]` - Metric items
- `footerNote?: string` - Footer explanation
- `columns?: 2 | 3 | 4 | 5 | 6` - Grid columns (default: 3)

**Metric Interface:**
```typescript
interface Metric {
  key: string
  label: string
  value: string | number
  change?: number              // % change from previous
  target?: string              // Target value
  progress?: number            // % progress to target
  badge?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Stable'
}
```

**Features:**
- Automatic trend indicators (% change)
- Target progress bars with color coding
- Performance badges
- Responsive grid layout

**Usage:**
```vue
<PerformanceMetrics
  title="Energy Performance"
  subtitle="Q4 2024 Metrics"
  :metrics="[
    { 
      key: 'efficiency',
      label: 'Energy Efficiency',
      value: '87%',
      change: 12,
      target: '95%',
      progress: 92,
      badge: 'Excellent'
    },
    { 
      key: 'savings',
      label: 'Cost Savings',
      value: '$3,240',
      change: 8,
      target: '$4,000',
      progress: 81,
      badge: 'Good'
    }
  ]"
  :columns="3"
/>
```

### State Management Components

#### `DataStateContainer.vue`
Smart wrapper for consistent loading/empty/data state handling across all views.

**Props:**
- `isDataReady: boolean` - Whether data loading is complete
- `hasData: boolean` - Whether data exists
- `selectedMeterIds: string[]` - Selected meters array
- `currentMeterIndex?: number` - Current meter index
- `totalMeters?: number` - Total meter count
- `loadingTitle?: string` - Loading state title
- `loadingMessage?: string` - Loading state message
- `emptyTitle?: string` - Empty state title
- `emptyMessage?: string` - Empty state message

**States:**
1. **Loading** - Shows spinner when data is loading
2. **Empty** - Shows empty state when no data
3. **No Selection** - Shows meter selection prompt
4. **Ready** - Shows slot content

**Usage:**
```vue
<DataStateContainer 
  :is-data-ready="isMeterDataReady"
  :has-data="!!currentMeterData"
  :selected-meter-ids="selectedMeterIds"
  :current-meter-index="currentMeterIndex"
  :total-meters="selectedMeterIds.length"
  loading-title="Loading data..."
>
  <!-- Content displayed when ready -->
  <ChartComponent :data="currentMeterData" />
</DataStateContainer>
```
  ]"
>
  <template #actions>
    <button>Export</button>
  </template>
</PageHeader>
```

### Data Display Components

#### `MeterSelector.vue`
Interactive meter selection with visual feedback and colors.

**Props:**
- `selectedMeterIds: string[]` - Selected meter IDs
- `activeMeterIds?: string[]` - Active/highlighted meters
- `getMeterColor: (id: string) => string` - Color function
- `getMeterName: (id: string) => string` - Name function
- `selectorTitle?: string` - Title text
- `emptyStateLabel?: string` - Empty state message

**Emits:**
- `select(meterId: string)` - When meter is selected

**Usage:**
```vue
<MeterSelector 
  :selected-meter-ids="meters"
  :active-meter-ids="[currentMeterId]"
  :get-meter-color="metersStore.getMeterColor"
  :get-meter-name="getMeterName"
  @select="selectMeter"
/>
```

#### `SummaryCards.vue`
Grid of summary statistic cards.

**Props:**
- `items: SummaryCardItem[]` - Card data

**SummaryCardItem interface:**
```typescript
{
  key: string
  value: string | number
  label: string
  valueClass?: string
  className?: string
}
```

**Usage:**
```vue
<SummaryCards 
  :items="[
    { key: 'total', value: 24, label: 'Total Alerts', valueClass: 'text-red-600' },
    { key: 'critical', value: 3, label: 'Critical', valueClass: 'text-red-900' }
  ]"
/>
```

#### `ItemsList.vue`
Paginated list container with empty state.

**Props:**
- `items: any[]` - Items to display
- `totalPages: number` - Total pages
- `currentPage: number` - Current page
- `emptyIcon?: string` - Material icon for empty state
- `emptyLabel?: string` - Empty state message
- `containerClass?: string` - Custom container classes

**Emits:**
- `prev-page` - Previous page button clicked
- `next-page` - Next page button clicked

**Slots:**
- `items` - Named slot receiving items array

**Usage:**
```vue
<ItemsList 
  :items="filteredAlerts"
  :total-pages="totalPages"
  :current-page="currentPage"
  empty-icon="inbox"
  empty-label="No items found"
  @prev-page="prevPage"
  @next-page="nextPage"
>
  <template #items="{ items }">
    <AlertItem 
      v-for="alert in items"
      :key="alert.id"
      :alert="alert"
    />
  </template>
</ItemsList>
```

#### `TabControl.vue`
Tab navigation with badges and icons.

**Props:**
- `tabs: Tab[]` - Tab definitions
- `activeTab: string` - Active tab ID

**Tab interface:**
```typescript
{
  id: string
  label: string
  icon?: string
  badge?: number | string
}
```

**Emits:**
- `select-tab(tabId: string)` - Tab selected

**Usage:**
```vue
<TabControl 
  :tabs="[
    { id: 'chart', label: 'Chart', icon: 'bar_chart' },
    { id: 'table', label: 'Table', badge: 5 }
  ]"
  :active-tab="activeTab"
  @select-tab="activeTab = $event"
>
  <div v-if="activeTab === 'chart'">Chart content</div>
  <div v-else>Table content</div>
</TabControl>
```

### State Management Components

#### `DataStateContainer.vue`
Smart wrapper handling loading, empty, and data states.

**Props:**
- `isDataReady: boolean` - Data is loaded
- `hasData: boolean` - Data exists
- `selectedMeterIds: string[]` - Selected meters
- `currentMeterIndex?: number` - Current index
- `totalMeters?: number` - Total meters
- `loadingTitle?: string` - Loading message
- `emptyTitle?: string` - Empty state title
- `emptyMessage?: string` - Empty state message

**States:**
1. **Loading** - Shows spinner when data is loading
2. **Empty** - Shows empty state when no data
3. **No Selection** - Shows meter selection prompt
4. **Ready** - Shows slot content

**Usage:**
```vue
<DataStateContainer 
  :is-data-ready="isMeterDataReady"
  :has-data="!!currentMeterData"
  :selected-meter-ids="selectedMeterIds"
  :current-meter-index="currentMeterIndex"
  :total-meters="selectedMeterIds.length"
  loading-title="Loading data..."
>
  <!-- Content displayed when ready -->
  <ChartComponent :data="currentMeterData" />
</DataStateContainer>
```

## Component Usage Patterns

### Pattern 1: Simple Page with Meter Selection
```vue
<template>
  <AdminLayout>
    <MeterHeader 
      title="View Title"
      description="Description"
      @manage-meters="showSelector = true"
    />
    <MeterSelector 
      :selected-meter-ids="selectedMeters"
      :get-meter-color="getColor"
      :get-meter-name="getName"
      @select="selectMeter"
    />
    <DataStateContainer 
      :is-data-ready="isReady"
      :has-data="!!data"
      :selected-meter-ids="selectedMeters"
    >
      <!-- Content -->
    </DataStateContainer>
  </AdminLayout>
</template>
```

### Pattern 2: Alerts View with Filters and Pagination
```vue
<template>
  <AdminLayout>
    <PageHeader 
      title="Alerts"
      :breadcrumbs="breadcrumbs"
    >
      <template #actions>
        <button @click="export">Export</button>
      </template>
    </PageHeader>

    <SummaryCards :items="summaryItems" />

    <ItemsList 
      :items="paginatedAlerts"
      :total-pages="totalPages"
      :current-page="currentPage"
      @prev-page="currentPage--"
      @next-page="currentPage++"
    >
      <template #items="{ items }">
        <AlertItem v-for="alert in items" :key="alert.id" :alert="alert" />
      </template>
    </ItemsList>
  </AdminLayout>
</template>
```

### Pattern 3: Multi-Tab Energy View
```vue
<template>
  <AdminLayout>
    <TabControl 
      :tabs="[
        { id: 'chart', label: 'Chart' },
        { id: 'table', label: 'Table' }
      ]"
      :active-tab="activeTab"
      @select-tab="activeTab = $event"
    >
      <DataStateContainer 
        :is-data-ready="isReady"
        :has-data="!!data"
        :selected-meter-ids="selectedMeters"
      >
        <ChartView v-if="activeTab === 'chart'" :data="data" />
        <TableView v-else :data="data" />
      </DataStateContainer>
    </TabControl>
  </AdminLayout>
</template>
```

## Best Practices

1. **Always use DataStateContainer** for consistent loading/empty state handling
2. **Compose components** - Use MeterHeader + MeterSelector + DataStateContainer pattern
3. **Type your props** - Import and use interfaces from components
4. **Use semantic icons** - Material symbols for Material Design consistency
5. **Prefer slots** - Over multiple boolean props for flexibility
6. **Keep components focused** - Single responsibility principle
7. **Document props/emits** - Use TypeScript for better IDE support

## Migration Guide

### Before (Inline)
```vue
<div class="mb-8">
  <h1 class="text-4xl font-bold">Title</h1>
  <p class="text-gray-600">Description</p>
  <button @click="manage">Manage</button>
</div>
```

### After (Reusable)
```vue
<MeterHeader 
  title="Title"
  description="Description"
  show-manage-button
  @manage-meters="manage"
/>
```

## Component Architecture

```
Meters Feature Views
├── AlertsView.vue              (uses PageHeader, SummaryCards, ItemsList)
├── PuissanceView.vue           (uses MeterHeader, MeterSelector, TabControl, DataStateContainer, PerformanceMetrics)
├── EnergyHistorical.vue        (uses MeterHeader, MeterSelector, DataStateContainer, TabControl, ComparisonCard)
├── ComparisonView.vue          (uses MeterHeader, MeterSelector, DataStateContainer, ComparisonTable, PerformanceMetrics)
├── ThermalManagementView.vue   (uses MeterHeader, MeterSelector, DataStateContainer, PerformanceMetrics)
└── components/
    ├── MeterHeader.vue              (Title + Description + Manage button)
    ├── PageHeader.vue               (Breadcrumbs + Title + Actions)
    ├── MeterSelector.vue            (Meter pill selection)
    ├── SummaryCards.vue             (KPI cards grid)
    ├── ItemsList.vue                (Paginated items list)
    ├── TabControl.vue               (Tab navigation)
    ├── ComparisonCard.vue           (Period-over-period metrics)
    ├── ComparisonTable.vue          (Side-by-side meter comparison)
    ├── PerformanceMetrics.vue       (KPI metrics with targets/trends)
    └── DataStateContainer.vue       (Loading/Empty/Ready states)
```
