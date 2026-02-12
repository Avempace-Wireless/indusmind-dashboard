# Features Index

This directory contains detailed documentation for each major feature/view in the IndusMind Energy Dashboard.

## Quick Reference

| Feature | Status | AI-Assisted | Last Updated | File |
|---------|--------|-------------|--------------|------|
| **Comparison View** | ✅ Complete | Yes | Feb 12, 2026 | [COMPARISON_VIEW.md](./COMPARISON_VIEW.md) |
| **Thermal Management** | ✅ Complete | Yes | Feb 10, 2026 | [THERMAL_MANAGEMENT_VIEW.md](./THERMAL_MANAGEMENT_VIEW.md) |
| **Energy Historical** | ✅ Complete | Yes | Feb 9, 2026 | [ENERGY_HISTORICAL_VIEW.md](./ENERGY_HISTORICAL_VIEW.md) |
| **Current View** | ✅ Complete | Yes | Feb 6, 2026 | [CURRENT_VIEW.md](./CURRENT_VIEW.md) |
| **Puissance View** | ✅ Complete | Yes | Feb 4, 2026 | [PUISSANCE_VIEW.md](./PUISSANCE_VIEW.md) |
| **Dashboard Overview** | ✅ Complete | Yes | Feb 6, 2026 | [DASHBOARD_VIEW.md](./DASHBOARD_VIEW.md) |
| **Global Meters View** | ✅ Complete | Mixed | Jan 2026 | [GLOBAL_METERS_VIEW_IMPLEMENTATION_COMPLETE.md](./GLOBAL_METERS_VIEW_IMPLEMENTATION_COMPLETE.md) |

---

## Feature Summaries

### [Comparison View](./COMPARISON_VIEW.md)
Multi-meter energy comparison with advanced visualization (bar/line/heatmap/table), KPI analysis, and localized UI.

**Key APIs**: Comparison API (`/api/telemetry/comparison/all`)  
**Features**: Multi-period selection, chart types, CSV export, ranking, variance analysis

---

### [Thermal Management View](./THERMAL_MANAGEMENT_VIEW.md)
Real-time temperature monitoring with relay control for cooling systems.

**Key APIs**: Thermal Telemetry API, Thermal Chart API, Relay Control API  
**Features**: Multi-sensor tracking, automatic/manual modes, relay ON/OFF control, drag-drop sensors

---

### [Energy Historical View](./ENERGY_HISTORICAL_VIEW.md)
Historical energy consumption analysis with flexible date ranges and resolution control.

**Key APIs**: Telemetry Historical API  
**Features**: Calendar date picker, hourly/daily/monthly views, chart/table modes, multi-meter

---

### [Current View](./CURRENT_VIEW.md)
Real-time electrical current (amperage) monitoring across multiple periods.

**Key APIs**: Equipment Telemetry API  
**Features**: ThreePhaseA current, KPI cards (avg/peak/min), hourly/daily/monthly charts, lazy loading

---

### [Puissance View](./PUISSANCE_VIEW.md)
Power consumption analysis with differential energy calculations and KPI dashboard.

**Key APIs**: Telemetry API (`AccumulatedActiveEnergyDelivered`)  
**Features**: Differential energy, peak demand detection, active hours, hourly/daily/monthly periods

---

### [Dashboard Overview](./DASHBOARD_VIEW.md)
Main dashboard providing real-time overview of all meters with quick-access KPIs.

**Key APIs**: Device API, Equipment Telemetry API  
**Features**: Meter grid, live status indicators, quick KPIs, navigation shortcuts

---

### [Global Meters View](./GLOBAL_METERS_VIEW_IMPLEMENTATION_COMPLETE.md)
Comprehensive global meters management with detailed analytics and comparison tools.

**Key APIs**: Multiple telemetry endpoints  
**Features**: Global meter overview, detailed analytics, batch operations

---

## Development Patterns

All feature views follow these common patterns:

### Architecture
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia stores for shared state
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Material Symbols
- **i18n**: Custom translation system (en/fr)

### Common Features
- ✅ Responsive layouts (mobile/tablet/desktop)
- ✅ Dark mode support
- ✅ Loading states with skeletons/spinners
- ✅ Error handling with retry mechanisms
- ✅ Localized UI (English/French)
- ✅ Empty states with clear messaging
- ✅ Color-coded meter differentiation

### API Integration
- RESTful backend APIs
- Batch requests for multi-meter operations
- Error handling and retry logic
- Loading state management
- Data caching where appropriate

### User Experience
- Intuitive navigation
- Real-time feedback
- Accessible controls
- Consistent design language
- Performance optimizations

---

## Related Documentation

### Backend API
- [Backend API Documentation](../../../indusmind-backend/docs/api/BACKEND_API_DOCUMENTATION.md)
- [API Reference](../../../indusmind-backend/docs/api/API_REFERENCE.md)
- [ThingsBoard API Reference](../../../indusmind-backend/docs/api/THINGSBOARD_API_REFERENCE.md)

### Frontend Architecture
- [Architecture Spec](../architecture/ARCHITECTURE-SPEC.md)
- [Implementation Architecture Guide](../architecture/IMPLEMENTATION-ARCHITECTURE-GUIDE.md)

### Guides
- [Quick Start Guide](../guides/QUICK-START-GUIDE.md)
- [Implementation Guide](../guides/POWER-HISTORY-VIEWS-IMPLEMENTATION-GUIDE.md)

---

## Contributing

When adding new features, please:

1. Create a new feature documentation file in this directory
2. Follow the established template structure
3. Update this index file with the new feature
4. Include:
   - Implementation status and date
   - AI-assistance indicator
   - API integrations used
   - Key features list
   - Related documentation links
