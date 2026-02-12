# Current (Amperage) View

## Overview
Real-time electrical current monitoring interface with multi-period visualization and KPI analysis.

## Implementation Details
- **Status**: ✅ Complete
- **Implementation Date**: February 6, 2026
- **AI-Assisted**: Yes
- **Location**: `src/features/current/`

## Features
- **Multi-Meter Current Monitoring**: Track amperage across multiple meters
- **Multi-Period Support**: Hourly, Daily, and Monthly views
- **Real-Time KPI Cards**:
  - Current Average (A)
  - Peak Current (A)
  - Current Minimum (A)
  - Time of Peak
- **Interactive Charts**:
  - Time series line charts with markers
  - Color-coded meter differentiation
  - Tooltip data on hover
  - Responsive zoom and pan
- **Meter Selection**:
  - Color-coded pill buttons
  - Single-meter focus mode
  - Quick meter switching
- **Lazy Loading**: Charts load on-demand when period tab selected
- **Loading States**: Per-chart skeleton loaders
- **No-Data States**: Clear messaging when telemetry unavailable

## API Integration

### Backend APIs Used
- **Equipment Telemetry API** (`/api/telemetry/...`)
  - Hourly telemetry data
  - Daily telemetry data
  - Monthly telemetry data

### Data Keys
- **Current**: `ThreePhaseA` (three-phase average amperage)
- **Time**: `ts` (timestamp)

### Data Flow
1. User selects meter from pills
2. Tab selection triggers period-specific data fetch
3. API returns time-series current values
4. Chart renders with current (A) on Y-axis, time on X-axis
5. KPIs calculated from raw data

## Components

### Main View
- **File**: `src/features/current/views/CurrentView.vue` (2555 lines)
- **Features**:
  - Three-tab layout (Hourly/Daily/Monthly)
  - KPI card grid
  - Lazy-loaded charts per tab
  - Meter selector modal integration

### Key UI Elements
- **Header**: Title and "Manage Meters" button
- **Meter Pills**: Grid of color-coded meter selection buttons
- **KPI Cards**: 4-card grid showing current statistics
- **Tab Switcher**: Period selection (Hourly/Daily/Monthly)
- **Chart Canvas**: Responsive Chart.js visualization
- **Loading Indicators**: Per-chart spinners
- **Empty State**: Icon + message when no data

## Data Processing
- **Three-Phase Average Calculation**: Averages L1, L2, L3 currents
- **Peak Detection**: Identifies maximum current and timestamp
- **Outlier Filtering**: Removes impossible values (e.g., >10000A)
- **Gap Handling**: Preserves data integrity without artificial interpolation
- **Time Alignment**: Timezone-aware rendering

## Store Integration
- **Meters Store**: Meter selection and color palette
- **API Data Mode**: Configurable mock vs real API
- **Computed KPIs**: Cached calculations for performance

## Localization
Fully localized:
- Page titles
- KPI labels
- Period names
- Error messages
- Loading texts

**Translation Files**:
- `src/i18n/en.json` - English (current.*)
- `src/i18n/fr.json` - French (current.*)

## Related Documentation
- [Equipment View Telemetry Fix](../../EQUIPMENT_VIEW_TELEMETRY_FIX.md)
- Backend API: `indusmind-backend/docs/api/BACKEND_API_DOCUMENTATION.md`

## Technical Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia + reactive refs
- **Charts**: Chart.js with time scale plugin
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols

## Performance Features
- **Lazy Loading**: Charts created only when tab is active
- **Data Caching**: Previously loaded data retained
- **Debounced API Calls**: Prevents rapid re-fetching
- **Efficient Rendering**: Chart.js optimizations for large datasets

## User Experience
- **Responsive Design**: Mobile-friendly grid layouts
- **Dark Mode**: Full theme support
- **Interactive Legend**: Toggle meter visibility
- **Loading Feedback**: Skeletons and spinners
- **Error Handling**: Retry buttons on failures

## Future Enhancements
- [ ] Current alerts and thresholds
- [ ] Historical comparison overlays
- [ ] Export to PDF/CSV
- [ ] Real-time streaming updates
- [ ] Predictive current trends
