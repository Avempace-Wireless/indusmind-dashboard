# Comparison View Component Documentation

## Overview

The **Comparison View** is a comprehensive multi-meter and multi-period energy analysis component that allows users to compare consumption patterns across different meters and time periods. It features multiple visualization modes, real-time calculations, and detailed analytics.

**Location:** `src/features/comparison/views/ComparisonView.vue`  
**Store:** `src/features/comparison/store/useComparisonStore.ts`  
**API Service:** `src/services/comparisonAPI.ts`

---

## Key Features

- ✅ Multi-meter selection with centralized store integration
- ✅ Multiple comparison modes (by meters, by periods/matrix)
- ✅ Four visualization types (bar, line, heatmap, table)
- ✅ Aggregation levels (hourly, daily, weekly, monthly)
- ✅ Real-time KPI calculations (highest, lowest, average, total, variance)
- ✅ Detailed comparison table with variance and trend analysis
- ✅ Professional loading UX with spinners and timeout protection
- ✅ Disabled controls during loading to prevent race conditions
- ✅ Pagination support (10 items per page)
- ✅ View options toggles for customization
- ✅ CSV export functionality

---

## Quick Calculations (Top Concepts)

These definitions apply throughout the view (table, charts, KPI cards):

- **Average (Moyenne)** = $\frac{\sum\text{meter totals}}{\text{number of meters}}$ for the selected period.
- **Total** = sum of all selected meters’ totals for the selected period.
- **Ecart (Variance % in table)** = $\frac{\text{value} - \text{average}}{\text{average}} \times 100$ for each row.
- **Tendance (Trend)** = based on ecart threshold: up if $> +5\%$, down if $< -5\%$, else stable.
- **Variance (KPI)** = $\frac{\text{max total} - \text{min total}}{\text{average}} \times 100$ (spread across meters).

---

## Component Structure

### 1. Top Section: Meter Selection
```vue
<!-- Compact meter selection with visual toggles -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-5">
  <button v-for="meterId in validSelectedMeterIds" 
          @click="toggleMeterVisibility(meterId)"
          :class="[isActive ? 'bg-{color}' : 'bg-gray-50']"
          :disabled="isLoading">
    {{ getMeterName(meterId) }}
  </button>
</div>
```

**Features:**
- Color-coded meter pills matching their assigned colors
- Toggle visibility per meter without changing selection
- Disabled during loading state
- Shows count of selected meters

### 2. Loading Bar (Initial Load Only)
```vue
<!-- Professional loading indicator with spinner and animated dots -->
<div v-if="isLoading && !hasLoadedOnce" class="bg-gradient-to-r from-cyan-50 to-blue-50">
  <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 border-t-cyan-600"></div>
  <p>Récupération des données de comparaison...</p>
  <!-- Animated pulsing dots -->
</div>
```

**Features:**
- Only appears on initial load (`!hasLoadedOnce`)
- Cyan→blue gradient background
- Spinner + animated dots
- Shows fetching message

### 3. KPI Cards Section
```vue
<!-- Five KPI metrics with loading overlays -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
  <div v-for="card in kpiCards" class="rounded-2xl border bg-white dark:bg-gray-900 p-5">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
      <div class="animate-spin h-6 w-6 border-2 border-slate-300 border-t-blue-600"></div>
    </div>
    
    <span class="material-symbols-outlined" :style="{ color: card.color }">{{ card.icon }}</span>
    <p class="text-xs text-gray-500">{{ card.label }}</p>
    <h4 class="text-2xl font-bold">{{ card.value }}</h4>
    <p class="text-xs text-gray-500">{{ card.subtitle }}</p>
  </div>
</div>
```

**KPI Cards (5 total):**
1. **Highest** - Meter with the highest total consumption for the selected period. Also shows that meter’s peak day and value.
2. **Lowest** - Meter with the lowest total consumption for the selected period. Also shows that meter’s minimum day and value.
3. **Average** - Mean consumption per meter (total ÷ number of meters).
4. **Total** - Sum of all selected meters’ consumption for the selected period.
5. **Variance** - Spread between highest and lowest totals as % of average (not statistical variance).

**How each KPI is calculated:**
- **Highest** = max of `totalConsumption` across meters; **peak day** is the highest single day for that meter in the range.
- **Lowest** = min of `totalConsumption` across meters; **min day** is the lowest single day for that meter in the range.
- **Average** = $\frac{\sum\text{meter totals}}{\text{number of meters}}$.
- **Total** = $\sum\text{meter totals}$.
- **Variance** = $\frac{\text{max total} - \text{min total}}{\text{average}} \times 100$.

**Example KPI Display:**
| Card | Value | Subtitle | Color |
|------|-------|----------|-------|
| Highest | 285.43 kWh | TGBT | Green |
| Lowest | 45.23 kWh | Lighting | Gray |
| Average | 156.40 kWh | All Meters | Blue |
| Total | 625.60 kWh | 4 items | Purple |
| Variance | ±55.2% | From Average | Orange |

### 4. Main Chart Area
With loading overlay showing spinner + "Chargement du graphique..."

**Chart Types:**
- **Bar Chart** - Side-by-side comparison
- **Line Chart** - Trend visualization
- **Heatmap** - Color-intensity matrix
- **Table** - Detailed data view

### 5. Right Control Panel
Contains:
- Comparison mode selector
- Period presets (last 7 days, 4 weeks, 3 months)
- Custom calendar date picker
- Aggregation level buttons (H/D/W/M)
- Chart type selector
- View options checkboxes

**Control Panel Property:** `opacity-60 pointer-events-none` when loading

---

## Comparison Modes

### Mode 1: By Meters (byMeters)
Compares consumption **across all selected meters** for a **single time period**.

**Data Structure:**
```typescript
{
  meterId: "uuid-123",
  label: "TGBT",      // Meter name
  value: 285.43,      // Total kWh
  color: "#ef4444"    // Meter color
}
```

**Chart Display:**
- X-axis: Meter names
- Y-axis: Consumption (kWh)
- One bar/point per meter
- Different colors per meter

**Table Display:**
- One row per meter
- Shows: Rank, Meter Name, Value, Écart %, Tendance

**Example:**
```
TGBT      │████████████████████ 285.43 kWh (+15%)  ↑ up
Clim      │████████████ 195.22 kWh (-5%)   → stable
Compressors│█████████████████ 245.87 kWh (+8%)   ↑ up
Lighting  │███ 45.23 kWh (-65%)  ↓ down
```

---

### Mode 2: Matrix (by Periods)
Compares consumption **for each meter** across **multiple time periods**.

**Data Structure:**
```typescript
{
  meterId: "uuid-123",
  meterLabel: "TGBT",
  periodLabel: "2024-01-15",  // Date
  value: 42.15,               // Daily kWh
  color: "#ef4444"
}
```

**Chart Display:**
- X-axis: Time periods (dates, weeks, months)
- Y-axis: Consumption (kWh)
- Multiple lines/bars (one per meter)
- Line colors = meter colors

**Table Display:**
- One row per period
- Shows: Rank, Period, Value, Écart %, Tendance

**Example:**
```
2024-01-15 │████████████████ 285.14 (avg: 245.82) (+16%)  ↑ up
2024-01-14 │█████████████ 218.45 (avg: 245.82) (-11%)  ↓ down
2024-01-13 │████████████████ 278.92 (avg: 245.82) (+14%)  ↑ up
2024-01-12 │████████████ 203.45 (avg: 245.82) (-17%)  ↓ down
```

---

## Aggregation Levels

Controls the time granularity of data:

| Level | Abbreviation | Grouping | Example Period | Use Case |
|-------|--------------|----------|-----------------|----------|
| **Hourly** | H | Per hour | 2024-01-15 14:00 | Detailed intra-day analysis |
| **Daily** | D | Per day | 2024-01-15 | Daily consumption patterns |
| **Weekly** | W | Per ISO week | Week 3 2024 | Week-over-week trends |
| **Monthly** | M | Per calendar month | January 2024 | Month-over-month comparison |

**Rules:**
- Hourly aggregation limited to ≤ 30-day ranges (backend constraint)
- Auto-downgrade hourly → daily for ranges > 30 days
- Daily is recommended for 4-week and 3-month presets

---

## Chart Type Details

### Type 1: Bar Chart
```
TGBT      │███████████ 285.43
Clim      │████████ 195.22
Compress  │██████████ 245.87
Lighting  │█ 45.23
```
- Best for: Direct meter/period comparison
- Default type
- Easy value reading

### Type 2: Line Chart
```
      ╱╲    ╱╲
     ╱  ╲╱  ╱  ╲  TGBT
    ╱
   ╱        ╱╲╱╲   Clim
          ╱
    ─────────────────── Lighting
```
- Best for: Trend visualization
- Shows meter lines across periods
- Easy to spot patterns

### Type 3: Heatmap
```
        2024-01-15  2024-01-16  2024-01-17
TGBT    🔴         🟡         🟢
Clim    🟡         🔴         🟡
Compress🟢         🟡         🔴
Light   🟦         🟦         🟢
```
- Best for: Pattern spotting across matrix
- Color intensity = consumption level
- Red (high) → Blue (low)

### Type 4: Table
```
Rank  Label          Value    Écart   Tendance
 1    TGBT          285.43   +15%    ↑ up
 2    Compressors   245.87   +8%     ↑ up
 3    Clim          195.22   -5%     → stable
 4    Lighting       45.23   -65%    ↓ down
```
- Best for: Precise values + analytics
- Includes rank, variance, trend
- Pagination: 10 rows/page

---

## Comparison Table (comparisonTable)

### Structure
```typescript
{
  rank: number,           // 1, 2, 3, 4...
  label: string,          // Meter name or period
  value: string,          // kWh formatted to 2 decimals
  variance: number,       // Percentage as number
  varianceText: string,   // "+15.2%" or "-8.5%"
  trend: 'up' | 'down' | 'stable',
  color: string           // Hex color for visualization
}
```

### Calculations

#### Écart (Variance %)
```typescript
const avgNum = parseFloat(kpiCards.find(k => k.label === 'Average')?.value)
const variance = ((item.value - avgNum) / avgNum * 100).toFixed(1)
```

**Formula:** `((value - average) / average) × 100`

**Interpretation:**
- **+15%** → 15% higher than average
- **-8%** → 8% lower than average
- **Positive (green)** → Above-average consumption
- **Negative (red)** → Below-average consumption

**Example Calculation:**
```
Average: 156.40 kWh
TGBT:    285.43 kWh
Écart:   ((285.43 - 156.40) / 156.40 * 100) = +82.4%

Lighting: 45.23 kWh
Écart:    ((45.23 - 156.40) / 156.40 * 100) = -71.1%
```

#### Tendance (Trend)
```typescript
trend: parseFloat(variance) > 5
  ? 'up'                    // 📈 green
  : parseFloat(variance) < -5
  ? 'down'                  // 📉 red
  : 'stable'                // → gray
```

**Rules:**
| Condition | Trend | Icon | Color |
|-----------|-------|------|-------|
| Variance > +5% | up | trending_up | Green |
| -5% ≤ Variance ≤ +5% | stable | trending_flat | Gray |
| Variance < -5% | down | trending_down | Red |

**Examples:**
```
Variance: +18% → Trend: up (↑) - Significantly above average
Variance: +2%  → Trend: stable (→) - Slightly above average
Variance: -12% → Trend: down (↓) - Significantly below average
```

### Sorting
- Default: **Value descending** (highest to lowest)
- Ranks recalculated after sorting
- Rank 1 = highest consumption

### Pagination
- **10 items per page**
- Previous/Next buttons
- Page indicator: "Page X of Y"
- Range indicator: "Showing 1-10 of 48"

---

## View Options (Toggles)

Located in right panel, control table column visibility:

```typescript
showRanking: boolean        // Toggle rank column
showVariance: boolean       // Toggle écart % column
highlightOutliers: boolean  // Yellow highlight if |variance| > 20%
showTrendArrows: boolean    // Toggle tendance column
showAverageLine: boolean    // Toggle average line in charts (future)
```

**Example with Options:**
```
// showRanking = true, showVariance = true, showTrendArrows = true
Rank  Label      Value    Écart    Tendance
 1    TGBT      285.43   +82.4%   ↑ up
 2    Compress  245.87    +57%    ↑ up

// showRanking = false, showVariance = false, showTrendArrows = false
Label      Value
TGBT      285.43
Compress  245.87
```

---

## Loading States & UX

### Initial Load
- **Loading bar** visible (cyan gradient, spinner, dots)
- **KPI cards** show overlay spinner (h-6 w-6)
- **Chart area** shows overlay spinner (h-10 w-10)
- **All controls disabled** (opacity-60, pointer-events-none, cursor-not-allowed)

### Subsequent Loads
- Loading bar hidden
- Data updates seamlessly
- Controls remain disabled

### Error State
- **Error message** in red banner with Retry button
- Previous data still visible
- Click "Retry" to re-fetch

### Timeout Protection
- API timeout: 2 minutes via `AbortController`
- After 2 min: Shows error, `isLoading = false`
- Prevents stuck loading states

---

## Period Selection

### Preset Shortcuts
```
Last 7 Days   → Generates 7 dates: today back to 7 days ago
Last 4 Weeks  → Generates 28 dates: today back to 28 days ago
Last 3 Months → Generates ~91 dates: today back to 90 days ago
```

### Custom Calendar
- Month navigator (prev/next)
- "Go to Today" button
- Click individual dates to toggle selection
- "Clear Dates" button to reset

### Date Range Storage
- `selectedDates`: Array of YYYY-MM-DD strings
- `selectedPeriods`: Alias for selectedDates
- Re-fetches API when changed (with `hasLoadedOnce` check)

---

## API Integration

### Endpoint
```
POST /api/telemetry/comparison/all
```

**Request Body:**
```typescript
{
  meterIds: string[],           // Device UUIDs
  startTs: number,              // Unix timestamp (ms)
  endTs: number,                // Unix timestamp (ms)
  aggregation: AggregationLevel // 'hourly' | 'daily' | 'weekly' | 'monthly'
}
```

**Response:**
```typescript
{
  comparison: {
    data: MeterTimeSeriesData[],  // Time series per meter
    meta: {
      totalDataPoints: number,
      executionTimeMs: number,
      apiCallCount: number
    }
  },
  kpis: {
    data: {
      highest: { meterId, value },
      lowest: { meterId, value },
      average: number,
      total: number,
      variance: number,
      meterTotals: Array<{ meterId, total }>
    }
  },
  summary: {
    data: {
      meterSummaries: Array<{ meterId, trend, variance }>
    }
  }
}
```

### Performance
- **Concurrency:** 5 parallel ThingsBoard calls max
- **Chunking:** 3-day chunks per query
- **Caching:** Recent 7 days cached in store
- **Timeout:** 120 seconds (2 minutes)

**Expected Load Times:**
- Last 7 Days: 2-4 seconds
- Last 4 Weeks: 8-12 seconds
- Last 3 Months: 15-25 seconds

---

## Usage Examples

### Example 1: Compare 4 Meters for Last 7 Days (by Meters)

**Setup:**
```typescript
comparisonMode = 'byMeters'
selectedMeters = [TGBT, Clim, Compressors, Lighting]
selectedPeriods = [7 recent dates]
aggregationLevel = 'daily'
chartType = 'bar'
```

**Result:**
```
Bar Chart (X: Meters, Y: Total kWh):
TGBT      │████████████ 285.43
Clim      │████████ 195.22
Compress  │██████████ 245.87
Lighting  │█ 45.23

KPI Cards:
Highest:  285.43 (TGBT)
Average:  193.19
Variance: ±71.2%

Table (sorted by value desc):
Rank  Meter       Value    Écart    Tendance
 1    TGBT       285.43   +47.7%   ↑ up
 2    Compress   245.87   +27.3%   ↑ up
 3    Clim       195.22    +1.1%   → stable
 4    Lighting    45.23   -76.6%   ↓ down
```

---

### Example 2: Track TGBT Consumption Over Last 4 Weeks (Matrix)

**Setup:**
```typescript
comparisonMode = 'matrix'
selectedMeters = [TGBT, Clim, Compressors]
selectedPeriods = [28 dates]
aggregationLevel = 'daily'
chartType = 'line'
```

**Result:**
```
Line Chart (X: Dates, Y: kWh):
           2024-01-01  ...  2024-01-14  ...  2024-01-28
TGBT:  ▲ 
       ╱  ╲╱  ╲╱  ╲╱  ╲╱  (zigzag pattern)
    ╱

Clim:  ═══════════════════════  (relatively flat)
           
Compress: ╱─╲╱─╲╱─╲ (cyclical pattern)

Table (sorted by value desc, one per date):
Rank  Date       Value    Écart    Tendance
 1    2024-01-20 312.45   +28%     ↑ up
 2    2024-01-19 298.76   +22%     ↑ up
 3    2024-01-18 245.32   +0.5%    → stable
 4    2024-01-17 198.91   -18%     ↓ down
 5    2024-01-16 212.34   -13%     ↓ down
...
```

---

### Example 3: Weekly Aggregation to Spot Trends

**Setup:**
```typescript
comparisonMode = 'matrix'
selectedMeters = [All 4]
selectedPeriods = [Last 90 days]
aggregationLevel = 'weekly'
chartType = 'line'
```

**Result:**
```
Line Chart (X: Weeks, Y: kWh/week):
        Week 1  Week 2  Week 3  Week 4  ...
TGBT      ╱╲      ╱╲      ╱╲      ╱╲
         ╱  ╲    ╱  ╲    ╱  ╲    ╱  ╲
        (fluctuating ~200-300 kWh/week)

Clim    ──────────────────────────────────
        (stable ~150-180 kWh/week)

Data cleaned to show 13 weeks instead of 90 days
```

---

### Example 4: Heatmap to Identify Patterns

**Setup:**
```typescript
comparisonMode = 'matrix'
selectedMeters = [TGBT, Clim, Compress, Lighting]
selectedPeriods = [Last 14 days]
chartType = 'heatmap'
```

**Result:**
```
           Day1  Day2  Day3  Day4  Day5  Day6  Day7 ...
TGBT       🔴   🔴   🟡   🟡   🔴   🔴   🔴
Clim       🟢   🟡   🟢   🟡   🟢   🟡   🟡
Compress   🔴   🟡   🔴   🟡   🔴   🟡   🔴
Lighting   🟦   🟦   🟦   🟦   🟦   🟦   🟦

Legend:
🔴 High (> average +30%)
🟡 Medium (±30% from avg)
🟢 Low (< average -30%)
🟦 Very Low
```

---

### Example 5: Table View with All Options Enabled

**Setup:**
```typescript
chartType = 'table'
showRanking = true
showVariance = true
highlightOutliers = true (|variance| > 20%)
showTrendArrows = true
```

**Result:**
```
Rank  Meter       Value    Écart     Tendance  [Highlighted if |écart| > 20%]
───────────────────────────────────────────────────────────────────────────
 1    TGBT       285.43   +82.4%    ↑ up      ← Yellow highlight (>20%)
 2    Compress   245.87   +57.1%    ↑ up      ← Yellow highlight (>20%)
 3    Clim       195.22   -3.8%     → stable
 4    Lighting    45.23   -71.1%    ↓ down    ← Yellow highlight (>20%)

Pagination: Page 1 of 1 | Showing 1-4 of 4
[← Previous] [← Previous] [→ Next] [→ Next]
```

---

## Disabled Controls During Loading

When `isLoading === true`:

```typescript
// Right panel becomes ghosted
<div :class="{ 'opacity-60 pointer-events-none': isLoading }">
  <!-- All controls inside are unresponsive -->
</div>

// Individual button/input disabling
:disabled="isLoading"
:class="isLoading ? 'opacity-50 cursor-not-allowed' : ''"
```

**Affected Controls:**
- Period preset buttons (last 7 days, etc.)
- Calendar date picker
- Month navigation (prev/next)
- Clear dates button
- Comparison mode radio buttons
- Aggregation level buttons (H/D/W/M)
- Chart type selector buttons
- Meter toggle pills
- View options checkboxes

**Visual Feedback:**
- Gray text/icons
- Reduced opacity (~50-60%)
- `cursor-not-allowed`
- No hover effects

---

## Best Practices

### 1. Meter Selection
- Use "Manage Meters" button to select/deselect
- Active meter visibility toggles don't affect API calls
- Selection persists in localStorage via metersStore

### 2. Time Range
- Prefer daily aggregation for > 30-day ranges
- Start with "Last 7 Days" then narrow to specific dates
- Use calendar for precise date selection

### 3. Comparison Mode
- **byMeters:** Best for ranking consumption
- **matrix:** Best for trending over time
- Switch freely; data is reused

### 4. Chart Type
- **bar:** Quick visual ranking
- **line:** Identify trends and patterns
- **heatmap:** Spot outliers and clusters
- **table:** Get exact values

### 5. Aggregation
- **hourly:** Intra-day peaks (≤ 30 days only)
- **daily:** General consumption patterns
- **weekly:** Ignore daily noise
- **monthly:** Long-term trends

### 6. View Options
- Enable ranking to see consumption order
- Use variance highlights to spot anomalies
- Trend arrows show significance (>5% threshold)

---

## Troubleshooting

### Table Shows No Data
**Issue:** Comparison table appears empty
**Cause:** In matrix mode, filtering logic was filtering by meter name
**Solution:** Fixed in component; filter only applies in byMeters mode

### Loading Stuck
**Issue:** Spinner doesn't stop
**Cause:** API timeout or network issue
**Solution:** 2-minute timeout triggers after which you can retry

### KPI Cards Show "0"
**Issue:** All KPI values are zero
**Cause:** No data returned from API
**Solution:** Check date range; API may have no data for selected meters/period

### Chart Not Updating
**Issue:** Data changed but chart stayed the same
**Cause:** Watch handler not triggering
**Solution:** Switch chart type or aggregation to force reinit

---

## File References

| File | Purpose |
|------|---------|
| [ComparisonView.vue](src/features/comparison/views/ComparisonView.vue) | Main UI component |
| [useComparisonStore.ts](src/features/comparison/store/useComparisonStore.ts) | State management & calculations |
| [comparisonAPI.ts](src/services/comparisonAPI.ts) | API client & request building |
| [comparison.controller.ts](src/controllers/comparison.controller.ts) | Backend handler |
| [comparison.service.ts](src/services/comparison.service.ts) | Data fetching & aggregation |

---

## Version History

- **v1.0** - Initial release with byMeters and matrix modes
- **v1.1** - Added 3-day chunked fetching with concurrency pool
- **v1.2** - Combined /comparison/all endpoint (3 -> 1 HTTP call)
- **v1.3** - Professional loading UX with disabled controls
- **v1.4** - Fixed table filtering bug in matrix mode
- **v1.5** - Complete documentation and examples

---

**Last Updated:** February 12, 2026  
**Component Status:** ✅ Production Ready
