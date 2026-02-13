# Dashboard Overview

## Overview
Main energy monitoring dashboard providing real-time overview of all meters with quick-access KPIs and status indicators.

## Implementation Details
- **Status**: ✅ Complete
- **Implementation Date**: February 6, 2026
- **AI-Assisted**: Yes
- **Location**: `src/features/dashboard/`

## Features
- **Real-Time Meter Grid**:
  - All PM2200 meters displayed
  - Live status indicators
  - Color-coded health status
- **Quick KPIs Per Meter**:
  - Current Power (kW)
  - Total Energy (kWh)
  - Current (A)
  - Voltage (V)
- **Meter Selection**:
  - "Manage Meters" modal for selection
  - Quick-access favorite meters
- **Navigation Shortcuts**:
  - Quick links to detailed views
  - Meter-specific deep links
- **Status Monitoring**:
  - Online/Offline indicators
  - Last update timestamps
  - Connection health badges

## API Integration

### Backend APIs Used
- **Device API** (`/api/devices`)
  - `getAllIndusmindCustomerDevices()` - Fetch all PM2200 meters
  
- **Equipment Telemetry API** (`/api/telemetry/equipment/:deviceUUID`)
  - Real-time telemetry for each meter
  - Latest power, energy, current, voltage readings

### Data Flow
1. Dashboard loads all customer devices (PM2200 meters)
2. For each meter, fetches latest telemetry snapshot
3. KPI cards populated with latest values
4. Status indicators updated based on connection health
5. Periodic refresh to maintain real-time data

## Components

### Main View
- **File**: `src/features/dashboard/views/DashboardView.vue`
- **Features**:
  - Responsive grid layout
  - Meter card components
  - Loading skeletons
  - Error handling

### Key UI Elements
- **Header**: Dashboard title and description
- **Meter Grid**: Responsive card layout (2-4 columns)
- **Meter Cards**:
  - Meter name and ID
  - Status badge (online/offline/warning)
  - KPI mini-grid (power, energy, current, voltage)
  - "View Details" button
- **Manage Meters Button**: Opens selection modal
- **Refresh Indicator**: Auto-refresh status

## Data Processing
- **Latest Value Extraction**: Pulls most recent telemetry point per meter
- **Status Calculation**: Based on last update timestamp
- **Unit Conversion**: Automatic kW/kWh/A/V formatting
- **Differential Energy**: Uses accumulated energy for total kWh

## Store Integration
- **Meters Store**: Centralized meter selection and metadata
- **Device API Cache**: Reduces redundant device list calls

## Localization
Dashboard text fully localized:
- Page title and subtitle
- KPI labels
- Status indicators
- Button labels

**Translation Files**:
- `src/i18n/en.json` - English (dashboard.*)
- `src/i18n/fr.json` - French (dashboard.*)

## Related Documentation
- [Global Meters View](./GLOBAL_METERS_VIEW.md)
- [Equipment View Telemetry Fix](../../EQUIPMENT_VIEW_TELEMETRY_FIX.md)

## Technical Stack
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **API Calls**: Axios-based services
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols

## Performance Features
- **Lazy KPI Loading**: Cards load data incrementally
- **API Batching**: Multiple telemetry calls optimized
- **Caching**: Device list cached to reduce API load
- **Debounced Refresh**: Prevents excessive polling

## User Experience
- **Responsive Design**: Mobile, tablet, desktop layouts
- **Dark Mode**: Full theme support
- **Loading States**: Per-card skeletons
- **Error Handling**: Graceful degradation on API failures
- **Quick Navigation**: Direct links to detail views

## Future Enhancements
- [ ] Dashboard customization (drag-drop cards)
- [ ] Meter grouping and favorites
- [ ] Alert notifications on dashboard
- [ ] Real-time WebSocket updates
- [ ] Historical mini-charts on cards
