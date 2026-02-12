# Thermal Management View

## Overview
Real-time thermal monitoring and control interface for temperature sensors and cooling systems with relay control capabilities.

## Implementation Details
- **Status**: ✅ Complete
- **Implementation Date**: February 10, 2026
- **AI-Assisted**: Yes
- **Location**: `src/features/thermal-management/`

## Features
- **Multi-Sensor Monitoring**: Track multiple temperature sensors simultaneously
- **Real-Time Data**: Live temperature readings with auto-refresh
- **Sensor Modes**: Manual and automatic temperature control modes
- **Relay Control**: Direct control of thermal management relays (ON/OFF)
- **Visual Indicators**:
  - Color-coded temperature status (normal, warning, critical)
  - Temperature trend arrows
  - Real-time status badges
- **External Sensors**:
  - Drag-and-drop sensor reordering
  - Individual sensor cards with detailed stats
  - Temperature history charts
- **Dark Mode Support**: Full theme compatibility

## API Integration

### Backend APIs Used
- **Thermal Telemetry API** (`/api/thermal/dashboard`)
  - Real-time sensor data
  - Temperature statistics
  - Sensor status and modes

- **Thermal Chart API** (`/api/thermal/chart`)
  - Historical temperature data
  - Time series visualization
  - Sensor trend analysis

- **Relay Control API** (`/api/thermal/relay/control`)
  - Relay ON/OFF control
  - Status confirmation

### Services
- `src/services/thermalTelemetryAPI.ts`
  - `fetchThermalDashboardData()` - Get all sensor data
  - `updateSensorMode()` - Switch sensor modes

- `src/services/thermalChartAPI.ts`
  - `fetchThermalChartData()` - Historical data
  - `controlThermalRelay()` - Relay commands

### Data Flow
1. Component fetches thermal dashboard data on mount
2. Auto-refresh every configured interval
3. User actions (relay control, mode switch) trigger API calls
4. Real-time updates reflected in UI
5. Error handling with user-friendly messages

## Components

### Main View
- **File**: `src/features/thermal-management/views/ThermalManagementView.vue` (2232 lines)
- **Features**:
  - Responsive grid layout
  - Loading states with spinners
  - Error banners with retry options
  - Real-time status updates

### Key UI Elements
- Sensor overview cards
- Temperature gauge indicators
- Mode toggle buttons (Manual/Auto)
- Relay control buttons
- External sensor grid with drag-drop
- Time series charts per sensor
- Status badges and icons

## Data Processing
- **Temperature Range Validation**: Safety thresholds for warnings
- **Status Calculation**: Automatic status based on temperature
- **Trend Detection**: Increasing/decreasing temperature indicators
- **Time Series**: Historical data aggregation and charting

## Localization
Fully localized interface:
- Sensor labels and descriptions
- Error messages
- Control button labels
- Status indicators
- Loading states

**Translation Files**:
- `src/i18n/en.json` - English (thermal.*)
- `src/i18n/fr.json` - French (thermal.*)

## Related Documentation
- Backend Thermal API: `indusmind-backend/docs/api/THERMAL_API.md`
- [Relay Control Integration](../../RELAY_CONTROL_INTEGRATION.md)

## Technical Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Reactive refs
- **Charts**: Chart.js
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols
- **Drag & Drop**: Vue Draggable

## Safety Features
- Confirmation dialogs for critical actions
- Automatic status indicators (safe/warning/critical)
- Error recovery with retry mechanisms
- Real-time connection status monitoring

## Future Enhancements
- [ ] Sensor alert configuration
- [ ] Temperature threshold customization
- [ ] Historical trend analysis
- [ ] Email/SMS notifications
- [ ] Automated scheduling for relay control
