# Puissance (Power) View

## Overview
Comprehensive power consumption analysis interface with energy KPIs, differential calculations, and multi-resolution time series visualization.

## Implementation Details
- **Status**: ✅ Complete
- **Implementation Date**: February 4, 2026 (with ongoing refinements)
- **AI-Assisted**: Yes
- **Location**: `src/features/puissance/`

## Features
- **Energy KPI Dashboard**:
  - Total Energy (kWh)
  - Average Power (kW)
  - Peak Demand (kW) with timestamp
  - Peak Off-Peak comparison
  - Active Hours count
- **Multi-Period Analysis**:
  - Hourly (last 24 hours)
  - Daily (customizable range)
  - Monthly (last 12 months)
- **Differential Energy Calculation**:
  - Uses `AccumulatedActiveEnergyDelivered` from ThingsBoard
  - Automatic differential computation between consecutive readings
  - Gap-aware processing (preserves data integrity)
- **Interactive Charts**:
  - Bar charts for energy consumption
  - Color-coded by meter
  - Hover tooltips with detailed data
  - Responsive zoom controls
- **Meter Management**:
  - Color-coded meter pills
  - Single-meter selection with visual active state
  - Quick toggle between meters

## API Integration

### Backend APIs Used
- **Telemetry API** (`/api/telemetry/equipment/:deviceUUID`)
  - Hourly telemetry data (raw readings)
  - Daily telemetry data
  - Monthly telemetry data

### Data Keys
- **Energy**: `AccumulatedActiveEnergyDelivered` (cumulative kWh)
- **Power**: `ActivePower` (instantaneous kW)
- **Timestamp**: `ts`

### Data Flow
1. User selects meter from pill grid
2. Component fetches telemetry data for active period
3. Frontend calculates differential energy from accumulated values
4. Outlier filtering and gap handling applied
5. Charts and KPIs rendered
6. Auto-refresh on period change

## Components

### Main View
- **File**: `src/features/puissance/views/PuissanceView.vue`
- **Features**:
  - Responsive three-column layout
  - KPI card grid (5 cards)
  - Period tabs (Hourly/Daily/Monthly)
  - Lazy-loaded charts
  - Loading states and error handling

### Key UI Elements
- **Header**: Title and description
- **Meter Pills**: Grid layout, color-coded selections
- **KPI Cards**: Material Icons + values
- **Tab Switcher**: Period selection with active indicator
- **Chart Canvas**: Chart.js visualization
- **Loading Overlays**: Spinners during data fetch
- **Empty States**: No-data messaging

## Data Processing
- **Differential Energy Calculation**:
  ```
  Energy = Current Reading - Previous Reading
  ```
- **Outlier Filtering**:
  - Negative differentials filtered (meter resets)
  - Unrealistic spikes removed (>10000 kWh)
  - Zero-gap validation
- **Peak Detection**:
  - Finds maximum power value
  - Preserves timestamp for "Time of Peak"
- **Active Hours**:
  - Counts periods with non-zero energy
- **Gap Handling**:
  - Preserves missing data as null (no artificial fill)
  - Chart renders gaps appropriately

## Store Integration
- **Meters Store**: Centralized meter selection and color management
- **API Data Mode**: Toggle between mock and real data

## Localization
Fully localized interface:
- View titles
- KPI labels
- Period names
- Error and loading messages
- Tooltips

**Translation Files**:
- `src/i18n/en.json` - English (puissance.*)
- `src/i18n/fr.json` - French (puissance.*)

## Related Documentation
- [Puissance API Documentation](../../indusmind-backend/PUISSANCE_API.md)
- [Puissance UI Design](../implementation/PUISSANCE-UI-DESIGN.md)
- [Puissance View Enhancement](../implementation/PUISSANCE-VIEW-ENHANCEMENT.md)
- [Puissance API Response Validation](../../PUISSANCE_API_RESPONSE_VALIDATION.md)
- [Puissance KPI Logging Guide](../PUISSANCE_KPI_LOGGING_GUIDE.md)
- [Puissance API Debug Guide](../PUISSANCE_API_DEBUG_GUIDE.md)

## Technical Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Charts**: Chart.js with bar chart plugin
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols
- **Date Handling**: Custom TimeUtils

## Performance Optimizations
- **Differential Calculation on Frontend**: Reduces backend load
- **Lazy Chart Loading**: Charts created only when tab active
- **Data Caching**: Prevents redundant API calls
- **Outlier Filtering**: Efficient client-side processing

## User Experience
- **Responsive Layout**: Mobile and desktop optimized
- **Dark Mode**: Full theme compatibility
- **Loading Feedback**: Skeleton loaders and spinners
- **Error Recovery**: Retry mechanisms
- **Empty States**: Clear "no data" messaging
- **Hover Interactions**: Detailed tooltips on chart hover

## Known Issues & Fixes
- ✅ Feb 4, 2026: Fixed outlier removal logic
- ✅ Feb 4, 2026: Corrected differential calculation for gaps
- ✅ Feb 4, 2026: Preserved telemetry key naming
- ✅ Feb 4, 2026: Updated French translations

## Future Enhancements
- [ ] Cost calculation based on tariff rates
- [ ] Peak/off-peak customizable time windows
- [ ] Export to CSV/PDF
- [ ] Forecasting and trend prediction
- [ ] Comparative analysis (current vs previous period)
- [ ] Alert thresholds configuration
