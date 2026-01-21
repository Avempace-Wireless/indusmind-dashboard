# ThingsBoard Telemetry API - Correct Usage Guide

## Overview
This document explains the correct parameters and usage patterns for the ThingsBoard telemetry integration.

## API Flow

```
Frontend Component (DashboardView.vue)
  ↓
useTelemetry Composable
  ↓
telemetryAPI.ts (fetchDeviceTelemetry)
  ↓
Backend: GET /telemetry/:deviceUUID/timeseries
  ↓
ThingsBoard Portal (https://portal.indusmind.net)
```

## Required Setup

### 1. Compteur Interface Must Include deviceUUID
```typescript
export interface Compteur {
  id: string
  name: string
  deviceUUID?: string // ✅ REQUIRED for telemetry fetching
  category: 'PM2200' | 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  // ... other fields
}
```

### 2. Device-to-Compteur Mapping
The `mapMeterToCompteur` function in `deviceAPI.ts` must include:
```typescript
function mapMeterToCompteur(meter: Meter): Compteur {
  return {
    id: meter.id,
    name: meter.name,
    deviceUUID: meter.deviceUUID, // ✅ Map from Device.deviceUUID
    // ... other fields
  }
}
```

### 3. Frontend API Call Example
```typescript
import { useTelemetry } from '@/composables/useTelemetry'

const { fetchInstantaneous, fetchTodayHourly, fetchCurrentValue } = useTelemetry()

// Fetch current power (latest value)
const currentPower = await fetchCurrentValue(
  deviceUUID,  // e.g., "545ffcb0-ab9c-11f0-a05e-97f672464deb"
  'ActivePowerTotal'
)

// Fetch last hour with 5-minute intervals
const instantReadings = await fetchInstantaneous(
  deviceUUID,
  ['ActivePowerTotal', 'Current_Avg']
)

// Fetch today's hourly energy data
const todayReadings = await fetchTodayHourly(
  deviceUUID,
  ['ActiveEnergyTotal']
)
```

## API Parameters (Backend Endpoint)

### GET /telemetry/:deviceUUID/timeseries

**Path Parameters:**
- `deviceUUID` (required): Device UUID from ThingsBoard (e.g., `545ffcb0-ab9c-11f0-a05e-97f672464deb`)

**Query Parameters:**
- `keys` (required): Comma-separated telemetry keys
  - Valid keys: `ActivePowerTotal`, `ActiveEnergyTotal`, `Current_Avg`, `Voltage_Avg`, `PowerFactor_Avg`, `Frequency_Avg`, etc.
- `startTs` (required): Start timestamp in milliseconds UTC (e.g., `1737331200000`)
- `endTs` (required): End timestamp in milliseconds UTC (e.g., `1737417600000`)
- `interval` (optional): Aggregation interval in milliseconds (e.g., `3600000` for 1 hour)
- `agg` (optional): Aggregation function
  - Options: `NONE`, `AVG`, `MIN`, `MAX`, `SUM`
  - Use `AVG` for power/voltage/current
  - Use `SUM` for energy
  - Use `NONE` for latest value (with limit=1)
- `orderBy` (optional): `ASC` or `DESC`
- `limit` (optional): Max data points (when `agg=NONE`)

**Example Request:**
```
GET http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal,Current_Avg&startTs=1737331200000&endTs=1737417600000&interval=3600000&agg=AVG
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "ActivePowerTotal": [
      { "ts": 1737331200000, "value": 1234.56 },
      { "ts": 1737334800000, "value": 1245.67 }
    ],
    "Current_Avg": [
      { "ts": 1737331200000, "value": 12.34 },
      { "ts": 1737334800000, "value": 12.45 }
    ]
  },
  "device": {
    "uuid": "545ffcb0-ab9c-11f0-a05e-97f672464deb",
    "name": "PM2200 - TGBT Principal",
    "accessToken": "aBcDeFgHiJkLmNoPqRsT"
  },
  "meta": {
    "entityType": "DEVICE",
    "entityId": "545ffcb0-ab9c-11f0-a05e-97f672464deb",
    "keys": ["ActivePowerTotal", "Current_Avg"],
    "startTs": 1737331200000,
    "endTs": 1737417600000,
    "interval": 3600000,
    "agg": "AVG"
  }
}
```

## Example Response

Example for:

```
GET http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal,Current_Avg&startTs=1767290809000&endTs=1768846009000&interval=3600000&agg=AVG
```

```json
{
  "success": true,
  "data": {
    "ActivePowerTotal": [
      { "ts": 1767782209000, "value": "7351.105555984556" },
      { "ts": 1767785809000, "value": "7455.467904899137" },
      { "ts": 1767789409000, "value": "7411.684034482763" }
      // ... truncated for brevity ...
    ],
    "Current_Avg": [
      { "ts": 1767782209000, "value": "141.7988687258689" },
      { "ts": 1767785809000, "value": "152.61732853025967" },
      { "ts": 1767789409000, "value": "152.5570201149425" }
      // ... truncated for brevity ...
    ]
  },
  "device": {
    "uuid": "545ffcb0-ab9c-11f0-a05e-97f672464deb",
    "name": "PM2200-TGBT-Indusmind",
    "accessToken": "UgPrFSjDhgKUquEwyIB8"
  },
  "meta": {
    "entityType": "DEVICE",
    "entityId": "545ffcb0-ab9c-11f0-a05e-97f672464deb",
    "keys": ["ActivePowerTotal", "Current_Avg"],
    "startTs": 1767290809000,
    "endTs": 1768846009000,
    "interval": 3600000,
    "agg": "AVG",
    "orderBy": "default"
  }
}
```

## Time Range Helpers

The `useTelemetry` composable provides helper functions that automatically calculate correct timestamps:

```typescript
// Last hour (5-min intervals)
fetchInstantaneous(deviceUUID, ['ActivePowerTotal'])
// Calls API with: startTs=now-3600000, endTs=now, interval=300000, agg=AVG

// Today's data (hourly intervals)
fetchTodayHourly(deviceUUID, ['ActiveEnergyTotal'])
// Calls API with: startTs=startOfToday, endTs=now, interval=3600000, agg=AVG

// Yesterday's data (hourly intervals)
fetchYesterdayHourly(deviceUUID, ['ActiveEnergyTotal'])
// Calls API with: startTs=startOfYesterday, endTs=endOfYesterday, interval=3600000, agg=AVG

// Current value (latest single reading)
fetchCurrentValue(deviceUUID, 'ActivePowerTotal')
// Calls API with: startTs=now-3600000, endTs=now, agg=NONE, limit=1
```

## Common Telemetry Keys

```typescript
export const TELEMETRY_KEYS = {
  POWER: ['ActivePowerTotal'],
  ENERGY: ['ActiveEnergyTotal'],
  CURRENT: ['Current_Avg'],
  VOLTAGE: ['Voltage_Avg'],
  POWER_FACTOR: ['PowerFactor_Avg'],
  FREQUENCY: ['Frequency_Avg'],
}
```

## Troubleshooting Checklist

### ✅ Frontend Checks
1. **Compteur has deviceUUID:**
   ```typescript
   console.log(selectedCompteurs.value.map(c => ({
     id: c.id,
     name: c.name,
     deviceUUID: c.deviceUUID  // Should NOT be undefined
   })))
   ```

2. **API calls are being made:**
   ```typescript
   // Check browser DevTools → Network tab
   // Should see requests like:
   // GET /telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=...
   ```

3. **Correct telemetry keys:**
   - Use `ActivePowerTotal` not `activePower`
   - Use `ActiveEnergyTotal` not `energy`
   - Keys are case-sensitive

### ✅ Backend Checks
1. **ThingsBoard credentials configured:**
   ```bash
   THINGSBOARD_BASE_URL=https://portal.indusmind.net
   THINGSBOARD_USERNAME=your-username
   THINGSBOARD_PASSWORD=your-password
   ```

2. **Device exists in ThingsBoard:**
   ```
   GET http://localhost:4000/telemetry/devices
   ```

3. **Backend logs show requests:**
   ```
   [TelemetryRouter] Device found: PM2200 - TGBT Principal
   [TelemetryRouter] Timeseries request: device=PM2200 - TGBT Principal keys=1 range=3600000ms agg=AVG
   ```

### ✅ Data Availability
1. **Correct time range:**
   - Use recent timestamps (last 24 hours)
   - Timestamps must be in milliseconds UTC
   - `startTs` must be less than `endTs`

2. **Device has data for those keys:**
   - Not all devices report all telemetry keys
   - Check ThingsBoard portal to see what keys are available

3. **Aggregation matches data frequency:**
   - If device reports every 5 minutes, use `interval=300000` (5 min)
   - Don't use `interval=1000` (1 second) if device only reports every 5 minutes

## Example Integration in DashboardView

```typescript
// 1. Import composable
import { useTelemetry } from '@/composables/useTelemetry'

// 2. Setup composable
const { fetchCurrentValue, fetchInstantaneous, fetchTodayHourly } = useTelemetry()

// 3. Filter compteurs with deviceUUID
const compteursWithUUID = selectedCompteurs.value.filter(c => c.deviceUUID)

// 4. Fetch telemetry for each device
for (const compteur of compteursWithUUID) {
  const currentPower = await fetchCurrentValue(compteur.deviceUUID!, 'ActivePowerTotal')
  const todayEnergy = await fetchCurrentValue(compteur.deviceUUID!, 'ActiveEnergyTotal')
  const instantReadings = await fetchInstantaneous(compteur.deviceUUID!, ['ActivePowerTotal'])

  // 5. Use the data
  console.log(`${compteur.name}: ${currentPower.value} kW`)
}
```

## Performance Tips

1. **Batch parallel requests:**
   ```typescript
   const promises = compteurs.map(c => fetchCurrentValue(c.deviceUUID!, 'ActivePowerTotal'))
   const results = await Promise.all(promises)
   ```

2. **Cache telemetry data:**
   ```typescript
   const telemetryCache = ref(new Map())
   telemetryCache.value.set(compteurId, telemetryData)
   ```

3. **Auto-refresh at appropriate intervals:**
   ```typescript
   // Refresh every 30 seconds (not every second)
   setInterval(fetchTelemetryData, 30000)
   ```

4. **Only fetch for visible compteurs:**
   ```typescript
   const visibleCompteurs = selectedCompteurs.value.filter(c => c.deviceUUID)
   ```

## Testing

Run the backend server and frontend dev server:

```bash
# Backend (from indusmind-backend/)
npm run dev

# Frontend (from indusmind-dashboard/)
npm run dev
```

Open browser DevTools → Network tab and verify:
- API calls are made to `/telemetry/:deviceUUID/timeseries`
- Parameters include correct `keys`, `startTs`, `endTs`, `interval`, `agg`
- Responses have `success: true` and `data` with telemetry values

Check browser Console for logs:
```
[DashboardView] Fetching telemetry for 3 devices
[DashboardView] Calling fetchCurrentValue for 545ffcb0-ab9c-11f0-a05e-97f672464deb
[DashboardView] Telemetry fetched for PM2200 - TGBT Principal: {...}
```
