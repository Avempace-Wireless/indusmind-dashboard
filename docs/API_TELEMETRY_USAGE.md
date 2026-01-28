# API Telemetry Usage Guide

## Overview

This document describes how the IndusMind Dashboard fetches real-time telemetry data from the ThingsBoard API and the various parameters available for data retrieval.

---

## Table of Contents

- [Data Flow Architecture](#data-flow-architecture)
- [Telemetry Composable](#telemetry-composable)
- [Available API Methods](#available-api-methods)
- [Telemetry Keys](#telemetry-keys)
- [Data Modes](#data-modes)
- [Implementation Examples](#implementation-examples)
- [Troubleshooting](#troubleshooting)

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DashboardView.vue                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  1. onMounted: fetchTelemetryData()                │     │
│  │  2. Filters compteurs with deviceUUID              │     │
│  │  3. Calls useTelemetry composable methods          │     │
│  └───────────────────┬────────────────────────────────┘     │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              useTelemetry Composable                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  • fetchCurrentValue(deviceUUID, key)              │     │
│  │  • fetchInstantaneous(deviceUUID, keys)            │     │
│  │  • fetchTodayHourly(deviceUUID, keys)              │     │
│  │  • fetchChartData(deviceUUID, keys, startTs, ...)  │     │
│  └───────────────────┬────────────────────────────────┘     │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  ThingsBoard REST API                        │
│  /api/plugins/telemetry/DEVICE/{deviceId}/values/timeseries │
│  Parameters:                                                 │
│  • keys: telemetry keys to fetch                            │
│  • startTs: start timestamp (milliseconds)                  │
│  • endTs: end timestamp (milliseconds)                      │
│  • interval: aggregation interval (milliseconds)            │
│  • agg: aggregation function (AVG, MIN, MAX, SUM, COUNT)    │
│  • limit: max number of data points                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Response Processing                         │
│  1. Parse JSON response                                      │
│  2. Transform to chart-compatible format                     │
│  3. Cache in telemetryCache Map                              │
│  4. Merge with enrichedCompteurs                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              UI Components Display Data                      │
│  • CompteurWidget: Shows instantaneous/today/yesterday       │
│  • UnifiedChart: Renders Chart.js visualizations            │
│  • Equipment Table: Displays current meter status           │
└─────────────────────────────────────────────────────────────┘
```

---

## Telemetry Composable

Location: `src/composables/useTelemetry.ts`

The `useTelemetry` composable provides a centralized interface for fetching telemetry data from the ThingsBoard API.

### Exported Functions

#### 1. **fetchCurrentValue()**
Fetches the most recent single value for a telemetry key.

**Signature:**
```typescript
fetchCurrentValue(
  deviceUUID: string,
  key: string
): Promise<number>
```

**Parameters:**
- `deviceUUID`: Device identifier from ThingsBoard
- `key`: Telemetry key name (e.g., 'ActivePowerTotal', 'AccumulatedActiveEnergyDelivered')

**Returns:** The latest numeric value

**Example:**
```typescript
const currentPower = await fetchCurrentValue('device-uuid-123', 'ActivePowerTotal')
console.log(`Current power: ${currentPower} kW`)
```

---

#### 2. **fetchInstantaneous()**
Fetches recent readings over a short time window (last hour, 5-minute intervals).

**Signature:**
```typescript
fetchInstantaneous(
  deviceUUID: string,
  keys: string[]
): Promise<Array<{ ts: number; value: number; key: string }>>
```

**Parameters:**
- `deviceUUID`: Device identifier
- `keys`: Array of telemetry key names

**Time Range:** Last 1 hour
**Interval:** 5 minutes (300,000 ms)
**Aggregation:** AVG

**Returns:** Array of timestamped readings

**Example:**
```typescript
const readings = await fetchInstantaneous('device-uuid-123', ['ActivePowerTotal'])
// Returns: [
//   { ts: 1705932000000, value: 45.2, key: 'ActivePowerTotal' },
//   { ts: 1705932300000, value: 46.1, key: 'ActivePowerTotal' },
//   ...
// ]
```

---

#### 3. **fetchTodayHourly()**
Fetches hourly aggregated data for the current day (midnight to now).

**Signature:**
```typescript
fetchTodayHourly(
  deviceUUID: string,
  keys: string[]
): Promise<Array<{ ts: number; value: number; key: string }>>
```

**Parameters:**
- `deviceUUID`: Device identifier
- `keys`: Array of telemetry key names

**Time Range:** Today from 00:00:00 to current time
**Interval:** 1 hour (3,600,000 ms)
**Aggregation:** SUM (for energy delta keys)

**Returns:** Array of hourly aggregated readings

**Example:**
```typescript
const hourlyData = await fetchTodayHourly('device-uuid-123', ['deltaHourEnergyConsumtion'])
// Returns hourly energy consumption for today
```

---

#### 4. **fetchChartData()**
Generic method for fetching telemetry data with custom parameters.

**Signature:**
```typescript
fetchChartData(
  deviceUUID: string,
  keys: string[],
  startTs: number,
  endTs: number,
  interval: number,
  agg: 'AVG' | 'MIN' | 'MAX' | 'SUM' | 'COUNT' | 'NONE' = 'AVG'
): Promise<Array<{ ts: number; value: number; key: string }>>
```

**Parameters:**
- `deviceUUID`: Device identifier
- `keys`: Array of telemetry key names
- `startTs`: Start timestamp in milliseconds (Unix epoch)
- `endTs`: End timestamp in milliseconds
- `interval`: Aggregation interval in milliseconds
- `agg`: Aggregation function

**Aggregation Functions:**
- **AVG**: Average value over interval
- **MIN**: Minimum value over interval
- **MAX**: Maximum value over interval
- **SUM**: Sum of values over interval
- **COUNT**: Count of data points
- **NONE**: No aggregation, raw values

**Example:**
```typescript
// Fetch last 7 days with daily aggregation
const weekData = await fetchChartData(
  'device-uuid-123',
  ['ActivePowerTotal'],
  Date.now() - 7 * 24 * 60 * 60 * 1000,  // 7 days ago
  Date.now(),
  24 * 60 * 60 * 1000,  // 24 hours interval
  'AVG'
)
```

---

## Telemetry Keys

Available telemetry keys from ThingsBoard PM2200 meters:

### 1. Primary Energy & Power Keys

| Key | Description | Unit | Type | Example Value |
|-----|-------------|------|------|---------------|
| `AccumulatedActiveEnergyDelivered` | Total cumulative energy delivered | kWh | Cumulative | 961195.118 |
| `ActivePowerTotal` | Total active power (3-phase sum) | kW | Instantaneous | 8226.38 |

### 2. Delta Energy Keys (Consumption over Time Periods)

These keys represent energy consumed during specific time windows:

| Key | Description | Unit | Period | Example Value |
|-----|-------------|------|--------|---------------|
| `deltaDayEnergyConsumtion` | Energy consumed since midnight | kWh | Daily | 67472.135 |
| `dailyEnergyDelta` | Daily energy delta (alias) | kWh | Daily | 67472.135 |
| `deltaHourEnergyConsumtion` | Energy consumed in last hour | kWh | Hourly | 2785.637 |
| `hourlyEnergyDelta` | Hourly energy delta (alias) | kWh | Hourly | 2785.637 |
| `deltaHalfHourEnergyConsumtion` | Energy consumed in last 30 minutes | kWh | 30 min | 1403.761 |
| `quarterHourEnergyDelta` | Energy consumed in last 15 minutes | kWh | 15 min | 704.509 |
| `deltaFiveMinutesEnergyConsumtion` | Energy consumed in last 5 minutes | kWh | 5 min | 246.626 |

### 3. Last Period Energy Baseline Keys

Reference energy values at the start of each period (used to calculate deltas):

| Key | Description | Unit | Notes |
|-----|-------------|------|-------|
| `lastDayEnergy` | Energy reading at midnight | kWh | Start of current day |
| `lastHourEnergy` | Energy reading at start of hour | kWh | Start of current hour |
| `lastHalfHourEnergy` | Energy reading 30 min ago | kWh | Start of half-hour period |
| `lastQuarterHourEnergy` | Energy reading 15 min ago | kWh | Start of quarter-hour period |
| `lastFiveMinutesEnergy` | Energy reading 5 min ago | kWh | Start of 5-min period |

### 4. Timestamp Keys

Unix timestamps (milliseconds) marking when baseline energy readings were recorded:

| Key | Description | Example Value |
|-----|-------------|---------------|
| `lastDayEnergyTs` | Timestamp of midnight reading | 1768006800000 |
| `lastHourEnergyTs` | Timestamp of hour start reading | 1768046400000 |
| `lastHalfHourEnergyTs` | Timestamp of half-hour start | 1768048200000 |
| `lastQuarterHourEnergyTs` | Timestamp of quarter-hour start | 1034 |
| `lastFiveMinutesEnergyTs` | Timestamp of 5-min period start | 1768048800000 |

### 5. Shared Values (Multi-Meter Aggregation)

Used for aggregating data across multiple meters:

| Key | Description | Unit | Notes |
|-----|-------------|------|-------|
| `shared_lastDayEnergy` | Shared daily baseline | kWh | For aggregation |
| `shared_lastDayEnergyTs` | Shared daily timestamp | ms | Unix timestamp |
| `shared_lastHourEnergy` | Shared hourly baseline | kWh | For aggregation |
| `shared_lastHourEnergyTs` | Shared hourly timestamp | ms | Unix timestamp |
| `shared_lastHalfHourEnergy` | Shared half-hour baseline | kWh | For aggregation |
| `shared_lastHalfHourEnergyTs` | Shared half-hour timestamp | ms | Unix timestamp |
| `shared_lastFiveMinutesEnergy` | Shared 5-min baseline | kWh | For aggregation |
| `shared_lastFiveMinutesEnergyTs` | Shared 5-min timestamp | ms | Unix timestamp |

### 6. Electrical Measurements

| Key | Description | Unit | Type | Example Value |
|-----|-------------|------|------|---------------|
| `Current_Avg` | Average current across 3 phases | A | Instantaneous | 179.389 |
| `VoltageL_L_Avg` | Average line-to-line voltage | V | Instantaneous | 675.49 |
| `VoltageL_N_Avg` | Average line-to-neutral voltage | V | Instantaneous | 386.802 |
| `Frequency` | Grid frequency | Hz | Instantaneous | 149.194 |

### 7. Device Metadata

| Key | Description | Type | Example Value |
|-----|-------------|------|---------------|
| `deviceUUID` | Unique device identifier | String | PM2200-TGBT-Indusmind |
| `Time` | Timestamp of reading | ISO 8601 | 2025-10-19T17:52:13.583Z |

### 8. Legacy/Per-Phase Keys (if available)

| Key | Description | Unit | Type |
|-----|-------------|------|------|
| `ActivePowerPhase1` | Active power on phase L1 | kW | Instantaneous |
| `ActivePowerPhase2` | Active power on phase L2 | kW | Instantaneous |
| `ActivePowerPhase3` | Active power on phase L3 | kW | Instantaneous |
| `VoltagePhase1` | Voltage on phase L1 | V | Instantaneous |
| `VoltagePhase2` | Voltage on phase L2 | V | Instantaneous |
| `VoltagePhase3` | Voltage on phase L3 | V | Instantaneous |
| `CurrentPhase1` | Current on phase L1 | A | Instantaneous |
| `CurrentPhase2` | Current on phase L2 | A | Instantaneous |
| `CurrentPhase3` | Current on phase L3 | A | Instantaneous |
| `PowerFactor` | Power factor (cos φ) | - | Instantaneous |

### 9. Temperature Keys (if temperature sensors present)

| Key | Description | Unit | Type |
|-----|-------------|------|------|
| `temperature` | Ambient temperature | °C | Instantaneous |

---

## Data Modes

The dashboard supports three data modes configured via `VITE_DATA_MODE` environment variable:

### 1. **API Mode** (`VITE_DATA_MODE=api`)
- Fetches data exclusively from ThingsBoard API
- Shows "No data available" if API is unreachable
- Best for production environments

### 2. **Mock Mode** (`VITE_DATA_MODE=mock`)
- Uses only mock/simulated data
- No API calls made
- Best for development/testing without backend

### 3. **Hybrid Mode** (`VITE_DATA_MODE=hybrid`) ✅ DEFAULT
- Attempts to fetch from API first
- Falls back to mock data if API fails
- Shows warning banner when using fallback
- Best for development with optional API access

**Configuration:**
```typescript
// src/config/dataMode.ts
export const dataMode: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) || 'hybrid'

// Check if API should be used
export const useApiData = (): boolean => {
  return dataMode === 'api' || dataMode === 'hybrid'
}

// Check if only API data (no fallback)
export const useApiOnly = (): boolean => {
  return dataMode === 'api'
}
```

---

## Implementation Examples

### Example 1: Fetching Data in DashboardView

```typescript
// DashboardView.vue
async function fetchTelemetryData() {
  const compteursWithUUID = selectedCompteurs.value.filter(c => c.deviceUUID)
  
  if (compteursWithUUID.length === 0) {
    telemetryFetchStatus.value = 'no-devices'
    return
  }

  telemetryFetchStatus.value = 'loading'
  
  try {
    const promises = compteursWithUUID.map(async (compteur) => {
      // Fetch current power
      const currentPower = await fetchCurrentValue(
        compteur.deviceUUID!, 
        'ActivePowerTotal'
      )

      // Fetch today's total energy
      const todayEnergy = await fetchCurrentValue(
        compteur.deviceUUID!, 
        'AccumulatedActiveEnergyDelivered'
      )

      // Fetch instantaneous readings (last hour)
      const instantReadings = await fetchInstantaneous(
        compteur.deviceUUID!, 
        ['ActivePowerTotal']
      )

      // Fetch hourly readings (today)
      const todayReadings = await fetchTodayHourly(
        compteur.deviceUUID!, 
        ['deltaHourEnergyConsumtion']
      )

      return {
        id: compteur.id,
        currentPower,
        todayEnergy,
        yesterdayEnergy: 0,
        instantReadings,
        todayReadings,
      }
    })

    const results = await Promise.all(promises)

    // Cache results
    results.forEach(result => {
      telemetryCache.value.set(result.id, result)
    })

    telemetryFetchStatus.value = 'success'
  } catch (error) {
    console.error('Failed to fetch telemetry:', error)
    telemetryFetchStatus.value = 'failed'
  }
}
```

### Example 2: Enriching Compteurs with Telemetry Data

```typescript
// Merge telemetry data with base compteur data
const enrichedCompteurs = computed(() => {
  return selectedCompteurs.value.map(compteur => {
    const telemetryData = telemetryCache.value.get(compteur.id)
    
    if (telemetryData) {
      return {
        ...compteur,
        instantaneous: telemetryData.currentPower || compteur.instantaneous,
        today: telemetryData.todayEnergy || compteur.today,
        yesterday: telemetryData.yesterdayEnergy || compteur.yesterday,
        instantReadings: telemetryData.instantReadings || [],
        todayReadings: telemetryData.todayReadings || [],
      }
    }
    
    return compteur  // Fallback to original data
  })
})
```

### Example 3: Chart Data with Custom Time Range

```typescript
// Fetch last 30 days with daily aggregation
const startDate = new Date()
startDate.setDate(startDate.getDate() - 30)

const chartData = await fetchChartData(
  deviceUUID,
  ['AccumulatedActiveEnergyDelivered'],
  startDate.getTime(),
  Date.now(),
  24 * 60 * 60 * 1000,  // Daily interval
  'AVG'
)

// Transform for Chart.js
const labels = chartData.map(d => new Date(d.ts).toLocaleDateString())
const values = chartData.map(d => d.value)
```

---

## Response Structure

### API Response Format

```typescript
// ThingsBoard API returns:
{
  "ActivePowerTotal": [
    {
      "ts": 1705932000000,
      "value": "45.2"
    },
    {
      "ts": 1705932300000,
      "value": "46.1"
    }
  ]
}
```

### Transformed Format

```typescript
// useTelemetry transforms to:
[
  { ts: 1705932000000, value: 45.2, key: 'ActivePowerTotal' },
  { ts: 1705932300000, value: 46.1, key: 'ActivePowerTotal' }
]
```

---

## Error Handling

### API Errors

The telemetry composable handles various error scenarios:

```typescript
try {
  const data = await fetchCurrentValue(deviceUUID, key)
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Device not found')
  } else if (error.response?.status === 401) {
    console.error('Authentication required')
  } else {
    console.error('Network error:', error)
  }
  
  // Fallback to mock data in hybrid mode
  if (useHybridMode()) {
    return mockCompteurData.instantaneous
  }
}
```

### Status Indicators

Dashboard displays telemetry fetch status:

- **Loading**: Blue banner with spinner
- **Success**: Green banner with checkmark
- **Failed**: Amber banner with retry button
- **No Devices**: Gray info banner

---

## Performance Considerations

### Caching Strategy

```typescript
// Cache telemetry data to avoid redundant API calls
const telemetryCache = ref<Map<string, any>>(new Map())

// Watch for selection changes
watch(selectedCompteurs, async (newCompteurs) => {
  if (newCompteurs.length > 0) {
    await fetchTelemetryData()  // Refresh cache
  }
}, { deep: true })
```

### Batching Requests

All device telemetry is fetched in parallel:

```typescript
const promises = devices.map(device => fetchTelemetryForDevice(device))
const results = await Promise.all(promises)
```

### Interval Management

```typescript
// Recommended intervals by use case
const INTERVALS = {
  REAL_TIME: 60 * 1000,        // 1 minute
  INSTANTANEOUS: 5 * 60 * 1000, // 5 minutes
  HOURLY: 60 * 60 * 1000,       // 1 hour
  DAILY: 24 * 60 * 60 * 1000,   // 1 day
}
```

---

## Troubleshooting

### Common Issues

#### 1. "No data available" in widgets

**Cause:** Device doesn't have `deviceUUID` configured or API mode is enabled without valid API

**Solution:**
```typescript
// Check if device has UUID
console.log('Device UUID:', compteur.deviceUUID)

// Switch to hybrid mode for development
// .env.local
VITE_DATA_MODE=hybrid
```

#### 2. Empty chart displays

**Cause:** Time range has no data or wrong aggregation

**Solution:**
```typescript
// Check data range
const data = await fetchChartData(...)
console.log('Data points:', data.length)

// Try different aggregation
fetchChartData(..., 'AVG')  // Instead of 'SUM'
```

#### 3. Authentication errors

**Cause:** Missing or expired ThingsBoard token

**Solution:**
```typescript
// Check auth token in headers
// src/composables/useTelemetry.ts
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Debug Logging

Enable detailed logging:

```typescript
// In DashboardView.vue
console.log('[DashboardView] Fetching telemetry for', compteursWithUUID.length, 'devices')
console.log('[DashboardView] Telemetry fetched:', {
  currentPower,
  todayEnergy,
  instantReadingsCount: instantReadings.length,
  todayReadingsCount: todayReadings.length,
})
```

---

## API Rate Limits

ThingsBoard API has rate limits:

- **Default:** 100 requests per second per tenant
- **Burst:** 200 requests

**Best Practices:**
- Cache aggressively
- Batch requests when possible
- Use appropriate intervals (don't over-poll)
- Implement retry with exponential backoff

---

## Environment Variables

```bash
# .env.local
VITE_DATA_MODE=hybrid              # api | mock | hybrid
VITE_THINGSBOARD_URL=http://...    # ThingsBoard server URL
VITE_API_TIMEOUT=30000             # API timeout in ms
```

---

## Temperature Sensor Telemetry Structure

### Overview
Temperature sensors (T_Sensor) use the following telemetry keys for real-time monitoring:

### Standard Telemetry Keys

| Key | Type | Description | Example |
|-----|------|-------------|---------|
| `Temperature` | number | Current temperature reading in °C | `51.1` |
| `Humidity` | number | Current humidity percentage | `2.5` |
| `DewPoint` | number | Dew point temperature in °C | `57.6` |
| `RawSht3xData` | JSON | Raw sensor data object | `{"Temperature":51.1,"Humidity":2.5,"DewPoint":57.6}` |
| `Time` | ISO 8601 | Last update timestamp | `2026-01-28T08:46:49.613Z` |

### Additional Metadata Keys (from ThingsBoard)

| Key | Type | Description |
|-----|------|-------------|
| `active` | boolean | Whether sensor is actively reporting |
| `label` | string | Display label for sensor (e.g., "Zone 1") |
| `powerStatus` | boolean | Power supply status |
| `displayName` | string | UI display name |
| `hideAutoMode` | boolean | Hide auto mode toggle in UI |
| `delay` | number | Data fetch delay in milliseconds |

### Example Telemetry Response

```json
{
  "Temperature": [
    {
      "ts": 1674906409613,
      "value": "51.1"
    }
  ],
  "Humidity": [
    {
      "ts": 1674906409613,
      "value": "2.5"
    }
  ],
  "DewPoint": [
    {
      "ts": 1674906409613,
      "value": "57.6"
    }
  ],
  "RawSht3xData": [
    {
      "ts": 1674906409613,
      "value": "{\"Temperature\":51.1,\"Humidity\":2.5,\"DewPoint\":57.6}"
    }
  ],
  "Time": [
    {
      "ts": 1674906409613,
      "value": "2026-01-28T08:46:49.613Z"
    }
  ]
}
```

### Usage in Thermal Management View

**Endpoint:** `GET /api/devices/{deviceId}/telemetry`

**Parameters:**
```typescript
{
  keys: ['Temperature', 'Humidity', 'DewPoint', 'RawSht3xData'],
  startTs: timestamp,
  endTs: timestamp,
  interval: 3600000,  // 1 hour
  agg: 'AVG',
  limit: 168  // 7 days of hourly data
}
```

**Used by:**
- Temperature reading display
- Historical temperature charts (line/bar)
- Min/Max temperature tracking
- Humidity and dew point calculations

---

## Related Files

- **Composable:** `src/composables/useTelemetry.ts`
- **Configuration:** `src/config/dataMode.ts`
- **Dashboard:** `src/features/dashboard/views/DashboardView.vue`
- **Thermal Management:** `src/features/thermal-management/views/ThermalManagementView.vue`
- **Thermal Store:** `src/features/thermal-management/store/useSensorsStore.ts`
- **Widget:** `src/components/dashboard/CompteurWidget.vue`
- **Chart:** `src/components/dashboard/UnifiedChart.vue`

---

## Additional Resources

- [ThingsBoard REST API Documentation](https://thingsboard.io/docs/reference/rest-api/)
- [Project Telemetry Guide](./TELEMETRY_INTEGRATION_GUIDE.md)
- [Data Mode Configuration](../src/config/dataMode.ts)

---

**Last Updated:** January 22, 2026
**Version:** 1.0.0
