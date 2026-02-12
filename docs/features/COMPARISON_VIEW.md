# Comparison View

## Overview
Multi-meter energy consumption comparison view with advanced visualization and analysis capabilities.

## Implementation Details
- **Status**: ✅ Complete
- **Implementation Date**: February 12, 2026
- **AI-Assisted**: Yes
- **Location**: `src/features/comparison/`

## Features
- **Multi-Meter Comparison**: Compare energy consumption across multiple meters simultaneously
- **Time Period Selection**: Flexible date range selection with presets (7 days, 4 weeks, 3 months)
- **Multiple Chart Types**: Bar charts, line charts, heatmaps, and data tables
- **Comparison Modes**:
  - **By Meters**: Compare meters within a single period
  - **Matrix**: Compare meters across multiple periods
- **KPI Cards**: Real-time statistics including:
  - Total Consumption
  - Average Consumption
  - Peak Demand
  - Highest Consumer
  - Lowest Consumer
- **Interactive Features**:
  - Meter visibility toggle
  - Searchable comparison table
  - Pagination controls
  - CSV export functionality
  - Ranking and variance analysis
  - Trend indicators
- **Fully Localized**: English and French translations

## API Integration

### Backend APIs Used
- **Comparison API** (`/api/telemetry/comparison/all`)
  - Multi-meter telemetry data fetching
  - KPI calculations
  - Time series aggregation
  - Per-meter statistics

### Services
- `src/services/comparisonAPI.ts` - Comparison data service
  - `fetchComparisonAll()` - Fetch all comparison data (time series + KPIs)

### Data Flow
1. User selects meters and date ranges
2. Frontend calls `comparisonAPI.fetchComparisonAll()` with parameters
3. Backend processes batch telemetry requests
4. Returns aggregated data with KPIs
5. Vue components render charts and tables

## Store Integration
- **Pinia Store**: `src/features/comparison/store/useComparisonStore.ts`
  - Manages comparison data state
  - Handles KPI calculations with localized metadata
  - Provides computed properties for charts and tables
  - Integrates with meters store for color assignments

- **Meters Store**: `src/stores/useMetersStore.ts`
  - Meter selection management
  - Color palette assignment
  - Meter metadata

## Components

### Main View
- **File**: `src/features/comparison/views/ComparisonView.vue` (1301 lines)
- **Features**:
  - Responsive layout (70% chart area, 30% controls)
  - Real-time loading states
  - Error handling with retry capability
  - Dark mode support

### Key UI Elements
- Meter selection pills with color-coded indicators
- Interactive calendar for period selection
- Aggregation level selector (Hourly/Daily/Monthly)
- Chart mode toggle (Bar/Line/Heatmap/Table)
- Comparison mode switcher
- Searchable and paginated data table
- View options panel (ranking, variance, outliers, trends)

## Data Processing
- **Resolution Support**: Hourly, Daily, Monthly aggregation
- **Time Range**: Configurable multi-period selection
- **Differential Calculations**: Automatic energy consumption differentials
- **Statistics**: Min, max, average, peak, and variation calculations
- **Gap Handling**: Intelligent data interpolation for missing periods

## Localization
All text content is fully localized:
- KPI labels and descriptions
- Chart headings
- Table columns
- Error messages
- Loading states
- Button labels
- Tooltips

**Translation Files**:
- `src/i18n/en.json` - English (comparison.*)
- `src/i18n/fr.json` - French (comparison.*)

## Related Documentation
- [KPI Cards Detailed Explanation](./KPI_CARDS_DETAILED_EXPLANATION.md)
- [Comparison View Documentation](./COMPARISON_VIEW_DOCUMENTATION.md)
- Backend API: `indusmind-backend/docs/api/BACKEND_API_DOCUMENTATION.md`

## Technical Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Charts**: Chart.js
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols
- **i18n**: Custom translation system

## Future Enhancements
- [ ] PDF export
- [ ] Advanced filtering options
- [ ] Custom KPI definitions
- [ ] Anomaly detection alerts
- [ ] Comparison templates
