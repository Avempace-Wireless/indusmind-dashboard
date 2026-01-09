# Puissance View - Advanced Features Quick Reference

## 🎯 What's New

### 1. Three View Modes
- **Overview**: Widgets left (KPI cards), Charts right (2-column layout) ← DEFAULT
- **Charts**: Full-width chart analysis with period selector
- **Tables**: Full-width tables with search, sort, and pagination

### 2. Interactive Detail Modals
- **Chart Details**: Click "View Details" button on any chart
  - Period selector (Hour/Day/Week/Month/Year)
  - Enlarged chart (400px height)
  - Statistics (Average, Peak, Min, Total)
  - Export as PNG
  
- **Table Details**: Click "View Details" button on any table
  - Period tabs (Hourly/Daily/Monthly)
  - Real-time search
  - Column sorting
  - Smart pagination (15 rows/page)
  - Export as CSV

### 3. Period Selector Component
- Choose granularity: Hour → Day → Week → Month → Year
- Timeline visualization with scrollable items
- Shows last N periods (24 hours, 30 days, 12 weeks, etc.)
- Visual feedback on selected period

### 4. Enhanced Search & Filtering
- **Tables**: Type to search across all columns
- **Charts**: Select period to change data granularity
- **Meter Selector**: Switch meter instantly
- **View Modes**: Toggle between Overview/Charts/Tables

## 📐 Layout Overview

### Overview Mode (Default)
```
┌─────────────────────────────────────────────────┐
│ Header + Meter Selector + View Mode Toggle      │
├──────────────────────────────────────────────────┤
│  Left (1/3)        │    Right (2/3)             │
│                    │                            │
│  KPI Card 1        │    Monthly Chart           │
│  KPI Card 2        │    [View Details]          │
│  KPI Card 3        │                            │
│  KPI Card 4        │    ┌──────┐  ┌──────┐     │
│  KPI Card 5        │    │Daily │  │Hourly│     │
│  KPI Card 6        │    │Chart │  │Chart │     │
│                    │    │[Zoom]│  │[Zoom]│     │
│                    │    └──────┘  └──────┘     │
└──────────────────────────────────────────────────┘
```

### Charts View
```
┌─────────────────────────────────────────────────┐
│ Header + Meter Selector + View Mode Toggle      │
├─────────────────────────────────────────────────┤
│  Monthly Chart (Full Width)                     │
│  [View Details Button]                          │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────┐ │
│  │ Daily Chart          │  │ Hourly Chart     │ │
│  │ [View Details]       │  │ [View Details]   │ │
│  └──────────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Tables View
```
┌─────────────────────────────────────────────────┐
│ Header + Meter Selector + View Mode Toggle      │
├─────────────────────────────────────────────────┤
│  Hourly Table (Full Width)                      │
│  [View Details Button]                          │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────┐ │
│  │ Daily Total Table    │  │ Daily Avg Table  │ │
│  │ [View Details]       │  │ [View Details]   │ │
│  └──────────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 🖱️ User Interactions

### Viewing Overview (Default)
```
Land on /puissance
    ↓
See Overview mode with KPI cards left, charts right
    ↓
Click meter button to switch data
    ↓
Charts/KPIs update instantly
```

### Deep-Diving into Chart
```
Click "View Details" on chart
    ↓
Modal opens with period selector
    ↓
Select Hour/Day/Week/Month/Year
    ↓
Chart updates with enlarged view
    ↓
View statistics (Avg, Peak, Min, Total)
    ↓
Click "Export" to download as PNG
    ↓
Click "Close" or overlay to return
```

### Exploring Table Data
```
Click "View Details" on table
    ↓
Modal opens with period tabs
    ↓
(Optional) Type in search box
    ↓
(Optional) Click column header to sort
    ↓
(Optional) Click page numbers to navigate
    ↓
Click "Export CSV" to download data
    ↓
Click "Close" or overlay to return
```

### Switching Views
```
Click "Overview" button
    ↓
See 2-column layout (widgets left, charts right)

Click "Charts" button
    ↓
See full-width charts for detailed analysis

Click "Tables" button
    ↓
See full-width tables with pagination
```

## 🎨 Visual Design

### Colors
- **TGBT**: Red (#ef4444)
- **Compresseur**: Green (#22c55e)
- **Climatisation**: Blue (#3b82f6)
- **Éclairage**: Yellow (#eab308)

### Button Styles
- **Overview**: Blue gradient (dashboard icon)
- **Charts**: Indigo gradient (bar_chart icon)
- **Tables**: Purple gradient (table_chart icon)
- **View Details**: Light blue background with border
- **Export**: White background with border

### Modals
- Smooth fade-in animation
- Backdrop blur for depth
- Gradient headers
- Professional styling
- Dark mode support

## 📊 Data Structure

### Chart Modal Data
```
chartModalData = {
  title: "Monthly Power",
  subtitle: "Average power consumption",
  data: [120.5, 115.2, ...],  // 12 months
  labels: ["Jan", "Feb", ...]
}
```

### Table Modal Data
```
tableModalData = {
  title: "Hourly Power",
  columns: [
    { key: 'timestamp', label: 'Time', format: 'default' },
    { key: 'power', label: 'Power (kW)', format: 'number' }
  ]
}
// Modal provides: hourlyTableData[], dailyTableData[], monthlyTableData[]
```

### Period Selector Timeline
```
Hour: 24 items (last 24 hours)
Day: 30 items (last 30 days)
Week: 12 items (last 12 weeks)
Month: 12 items (last 12 months)
Year: 5 items (last 5 years)
```

## 🔧 Component Files

| File | Lines | Purpose |
|------|-------|---------|
| PuissanceView.vue | 386 | Main view with 3 modes and modals |
| ChartDetailModal.vue | 240 | Interactive chart detail modal |
| TableDetailModal.vue | 260 | Table exploration with search |
| PeriodSelector.vue | 180 | Reusable period selection |
| KPICard.vue | 79 | KPI metric display |
| BarChart.vue | 146 | Chart rendering |
| DataTable.vue | 230 | Table with sorting |

## ✨ Features Checklist

### View Modes
- [x] Overview mode (2-column widgets + charts)
- [x] Charts mode (full-width charts)
- [x] Tables mode (full-width tables)

### Modals
- [x] Chart detail modal
- [x] Table detail modal
- [x] Period selector integration
- [x] Export functionality

### Interactions
- [x] Meter switching
- [x] View mode switching
- [x] Chart detail view
- [x] Table detail view
- [x] Search in tables
- [x] Sort columns
- [x] Pagination
- [x] Export data

### Theme
- [x] Light mode styling
- [x] Dark mode support
- [x] Meter color coding
- [x] Gradient backgrounds
- [x] Smooth animations
- [x] Responsive layout

## 🚀 Getting Started

1. **Navigate to Puissance**
   ```
   Click "Puissance" in sidebar
   or visit /puissance directly
   ```

2. **Select a Meter**
   - Click meter buttons: TGBT, Compresseur, Climatisation, Éclairage

3. **Choose View Mode**
   - Overview (default): See metrics and charts
   - Charts: Analyze trends
   - Tables: Inspect data

4. **Explore Details**
   - Click "View Details" on any chart/table
   - Use period selector in chart modal
   - Search and sort in table modal

5. **Export Data**
   - Charts: PNG image
   - Tables: CSV file

## 📱 Responsive Breakpoints

- **Mobile** (<640px): Single column, stacked layout
- **Tablet** (640-1024px): 2-column beginning
- **Desktop** (>1024px): Full 3-column overview

## 🔍 Search & Filter

### Chart Filtering
- **Period Selector**: Change data granularity
- **Meter Selector**: Switch equipment
- **View Mode**: Choose visualization

### Table Filtering
- **Period Tabs**: Switch hourly/daily/monthly
- **Search Box**: Real-time text search
- **Column Sort**: Click headers (↑/↓)
- **Pagination**: Navigate pages

## 💾 Export Options

### Charts
- Format: PNG image
- Size: Canvas resolution
- Contents: Chart visualization + title

### Tables
- Format: CSV file
- Contents: All columns + filtered data
- Delimiter: Comma-separated values

## 🎓 Tips & Tricks

1. **Quick Metrics**: View Overview mode for balanced dashboard
2. **Trend Analysis**: Switch to Charts mode for deep dive
3. **Data Validation**: Use Tables mode with search
4. **Comparison**: Switch meters to compare equipment
5. **Export Reports**: Get data for analysis offline
6. **Mobile Friendly**: Responsive layout works on phones
7. **Dark Mode**: Fully optimized for night viewing
8. **Keyboard Navigation**: Tab through interactive elements

## ⚡ Performance Notes

- Charts destroy/recreate on data change
- Pagination limits DOM to ~15 rows
- CSS animations use GPU acceleration
- Computed properties optimize renders
- Dark mode detection cached
- Modals use Teleport for proper rendering

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal not opening | Check if isOpen prop is set |
| Charts not rendering | Ensure Chart.js is installed |
| Search not working | Type full/partial matches |
| Export not working | Check browser permissions |
| Dark mode off | Add `dark` class to `<html>` |

## 📚 Documentation Files

- PUISSANCE_ADVANCED_LAYOUT.md - Full technical documentation
- PUISSANCE_UI_ENHANCEMENTS.md - UI/UX details
- PUISSANCE_UI_ENHANCEMENT_SUMMARY.md - Quick summary
- PUISSANCE_IMPLEMENTATION.md - Original implementation guide

---

**Ready to explore?** Visit `/puissance` and start monitoring! 🚀
