# Energy Historical View

## Overview
Historical energy consumption analysis interface with advanced date selection and multi-meter comparison capabilities.

## Implementation Details
- **Status**: ✅ Complete
- **Implementation Date**: February 9, 2026
- **AI-Assisted**: Yes
- **Location**: `src/features/energy-history/`

## Features
- **Historical Data Analysis**: View energy consumption trends over time
- **Multi-Meter Support**: Compare multiple meters simultaneously
- **Flexible Date Selection**:
  - Calendar-based date picker
  - Preset ranges (7 days, 30 days, 90 days, 1 year)
  - Custom date range selection
- **Resolution Control**: Hourly, Daily, or Monthly aggregation
- **Dual View Modes**:
  - **Chart View**: Interactive time series visualization
  - **Table View**: Detailed tabular data with pagination
- **Meter Management**:
  - Color-coded meter pills
  - Toggle meter visibility
  - Active meter indication
- **No Export Buttons**: Streamlined UI (export removed per Feb 9, 2026 update)

## API Integration

### Backend APIs Used
- **Telemetry Historical API** (`/api/telemetry/historical`)
  - Time-ranged energy data
  - Multi-meter batch requests
  - Resolution-based aggregation (hourly/daily/monthly)

- **Equipment Telemetry API**
  - Meter metadata and configurations
  - Device UUID mappings

### Services
- Shared telemetry services via equipment/telemetry APIs
- Batch data fetching for optimal performance

### Data Flow
1. User selects meters and date range
2. Aggregation level selected (hourly/daily/monthly)
3. Component batches API requests for active meters
4. Backend returns time-series data with differential energy
5. Chart or table renders based on view mode

## Components

### Main View
- **File**: `src/features/energy-history/views/EnergyHistorical.vue` (1799 lines)
- **Features**:
  - Responsive layout (70% chart, 30% controls)
  - Loading states with skeleton loaders
  - Error handling with retry
  - Dark mode compatible

### Key UI Elements
- Meter selection pills (grid layout, color-coded)
- Date range quick selectors
- Month navigation controls
- Calendar grid with date selection
- Aggregation level buttons (H/D/M shortcuts)
- Chart/Table view toggle
- Loading spinners and no-data states

## Data Processing
- **Differential Energy**: Calculated from accumulated active energy delivery
- **Gap Handling**: Intelligent interpolation for missing data points
- **Time Alignment**: Timezone-aware time series rendering
- **Outlier Filtering**: Automatic removal of unrealistic values
- **Resolution Adaptation**: Data resampling based on selected aggregation level

## Store Integration
- **Meters Store**: `src/stores/useMetersStore.ts`
  - Meter selection persistence
  - Color assignment
  - Meter metadata

## Localization
All UI text fully localized:
- View titles and subtitles
- Date labels and presets
- Aggregation level names
- Error messages
- Loading states
- Table headers

**Translation Files**:
- `src/i18n/en.json` - English (energyHistory.*)
- `src/i18n/fr.json` - French (energyHistory.*)

## Related Documentation
- [Energy History Implementation](../../ENERGY_HISTORY_IMPLEMENTATION.md)
- [Energy History Testing Guide](../../ENERGY_HISTORY_TESTING_GUIDE.md)
- [Energy History Integration Status](../../ENERGY_HISTORY_INTEGRATION_STATUS.md)
- [Energy History Date Handling Details](../../ENERGY_HISTORY_DATE_HANDLING_DETAILS.md)

## Technical Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Charts**: Chart.js with time scale
- **Styling**: Tailwind CSS
- **Date Handling**: Native JS Date + custom TimeUtils
- **Icons**: Material Symbols

## Performance Optimizations
- **Batch API Calls**: Multiple meters fetched in parallel
- **Lazy Loading**: Data loaded on-demand per view
- **Caching**: Previously loaded data cached in component
- **Debounced Updates**: Prevent excessive re-renders

## User Experience
- **Empty States**: Clear messaging when no data available
- **Loading Indicators**: Per-section spinners
- **Error Recovery**: Retry buttons on failures
- **Responsive**: Mobile-friendly layout adaptations

## Future Enhancements
- [ ] Comparison baseline overlays
- [ ] Forecast predictions
- [ ] Anomaly highlighting
- [ ] Data download (CSV/Excel)
- [ ] Custom date presets
