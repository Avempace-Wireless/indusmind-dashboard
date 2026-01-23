# API Keys Verification Guide for PuissanceView

## Problem Statement
KPI cards in PuissanceView are displaying incorrectly. This guide helps identify what API keys are actually being used and how data is being processed.

## How to Verify

### Step 1: Open Browser Console
1. Open PuissanceView in your browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Check API Response Keys
Look for logs starting with `[useTelemetryDynamic]`. You should see entries like:

```
[useTelemetryDynamic] ✓ KEY VERIFICATION "ActivePowerTotal":
{
  keyExists: true,
  keyDataType: "object",
  keyDataLength: 24,
  keyDataSample: [
    { ts: 1737331200000, value: 8226.38 },
    { ts: 1737334800000, value: 8345.67 },
    { ts: 1737338400000, value: 8456.12 }
  ],
  allAvailableKeys: ["ActivePowerTotal"]
}
```

**Critical checks:**
- ✅ `keyExists: true` - The requested key is in the API response
- ✅ `keyDataLength > 0` - There is actual data for this key
- ⚠️ `keyExists: false` - Key not found in API response → **PROBLEM**

### Step 3: Check What Keys are Available

If you see `keyExists: false`, look at the console line above it for:
```
allAvailableKeys: ["ActivePowerTotal", "SomeOtherKey", ...]
```

This shows what keys are actually available from the API. If the keys don't match what we're requesting, we need to update the code.

### Step 4: Check Data Filtering

Look for logs starting with `[Puissance]` like:

```
[Puissance] Raw hourly data (before filtering):
{
  totalPoints: 24,
  uniqueKeys: ["ActivePowerTotal"],  // ✅ Should see ActivePowerTotal here
  firstFewPoints: [...],
  allPoints: [...]
}

[Puissance] Hourly data AFTER filtering for ActivePowerTotal:
{
  pointsAfterFilter: 24,  // ✅ Should have data after filter
  pointsRemoved: 0,
  filteredData: [...]
}
```

**What to look for:**
- ✅ `uniqueKeys` includes `"ActivePowerTotal"` - The key is being fetched
- ✅ `pointsAfterFilter > 0` - Data passed the filter
- ⚠️ `pointsAfterFilter: 0` after `totalPoints: 24` - Data is being filtered OUT
- ⚠️ `uniqueKeys: ["SomeOtherKey"]` - Wrong key is being received

### Step 5: Check KPI Calculations

Look for logs starting with `[Puissance KPI]` like:

```
[Puissance KPI] instantaneousPower: {
  key: "ActivePowerTotal",
  value: 8226.38,
  unit: "kW",
  timestamp: "1/22/2026, 3:45:30 PM",
  apiTimestampMs: 1737334800000
}
```

This shows that:
- Data was found with key `ActivePowerTotal`
- Value is `8226.38` kW
- It came from a specific timestamp

### Step 6: Check Summary Log

At the very end, you should see:

```
[Puissance KPIs Summary] All metrics for meter-1: {
  instantaneousPower: { value: 8226.38, unit: 'kW', source: 'Latest ActivePowerTotal value' },
  peakPowerToday: { value: 9450.2, unit: 'kW', source: 'Maximum of hourly ActivePowerTotal values', dataPoints: 24 },
  avgPowerToday: { value: 8156.45, unit: 'kW', source: 'Average of hourly values', dataPoints: 24 },
  ...
}
```

If any of these values are `null`, it means data wasn't found for that KPI.

## Common Issues & Solutions

### Issue 1: `keyExists: false` for ActivePowerTotal

**Symptom:**
```
keyExists: false
allAvailableKeys: ["SomethingElse"]
```

**Solution:**
The API is returning a different key name than expected. Check what key name is shown in `allAvailableKeys` and update the fetch requests accordingly.

**Code Location:**
- [PuissanceView.vue - fetchMeterTelemetryData](../src/features/puissance/views/PuissanceView.vue#L640) (around line 640)
- Change `keys: ['ActivePowerTotal']` to the correct key name

### Issue 2: Data Being Filtered Out

**Symptom:**
```
Raw hourly data (before filtering):
{
  totalPoints: 24,
  uniqueKeys: ["ActivePowerTotal"]
}

Hourly data AFTER filtering:
{
  pointsAfterFilter: 0,  // ⚠️ All data removed!
  pointsRemoved: 24
}
```

**Solution:**
The data array structure is different. The filter `d.key === 'ActivePowerTotal'` is not matching.

**Debug Steps:**
1. Look at `firstFewPoints` in the raw data log
2. Check what the actual structure is:
   - Is it `{ key: "...", ts: ..., value: ... }` format? ✅ Filter should work
   - Is it something else? ⚠️ Modify the filter

**Code Location:**
- [PuissanceView.vue - transformMeterData](../src/features/puissance/views/PuissanceView.vue#L920)
- Modify the filter condition as needed

### Issue 3: KPI Values are null

**Symptom:**
```
[Puissance KPIs Summary] All metrics for meter-1: {
  instantaneousPower: { value: null, ... },  // ⚠️ No value
  peakPowerToday: { value: null, ... },
  ...
}
```

**Solution:**
One of three reasons:
1. No data was returned from API for this time range
2. Data structure is unexpected
3. Calculation is failing silently

**Debug Steps:**
1. Check the raw data logs to see if points exist
2. Look for calculation logs (e.g., `[Puissance] Hourly values:`)
3. Verify the arrays have data before calculations

## API Response Structure Reference

**Current Expected Format (from useTelemetryDynamic):**

```typescript
// After transformation, data points look like:
[
  { ts: 1737331200000, value: 8226.38, key: "ActivePowerTotal" },
  { ts: 1737334800000, value: 8345.67, key: "ActivePowerTotal" },
  { ts: 1737338400000, value: 8456.12, key: "ActivePowerTotal" }
]
```

**Raw API Response (before transformation):**

```json
{
  "data": {
    "ActivePowerTotal": [
      { "ts": 1737331200000, "value": "8226.38" },
      { "ts": 1737334800000, "value": "8345.67" },
      { "ts": 1737338400000, "value": "8456.12" }
    ]
  }
}
```

## Debugging Steps Checklist

- [ ] Open browser console (F12)
- [ ] Navigate to PuissanceView
- [ ] Check `[useTelemetryDynamic]` logs for `keyExists: true`
- [ ] Check `[Puissance]` logs for data before/after filtering
- [ ] Check `pointsAfterFilter > 0` for all time periods
- [ ] Check `[Puissance KPI]` logs for calculated values
- [ ] Check `[Puissance KPIs Summary]` for all values being non-null
- [ ] Compare with DashboardView logs to see if they use different keys

## Files to Check

If the logs reveal different key names being used:

1. **[telemetryConfig.ts](../src/config/telemetryConfig.ts)** - Defines available keys
2. **[PuissanceView.vue](../src/features/puissance/views/PuissanceView.vue#L640)** - Requests specific keys
3. **[useTelemetryDynamic.ts](../src/composables/useTelemetryDynamic.ts#L155)** - Transforms API response
4. **[TELEMETRY_API_USAGE.md](./TELEMETRY_API_USAGE.md)** - API documentation

## Next Steps

After identifying the issue:

1. **If wrong key name:** Update `fetchMeterTelemetryData` to request the correct key
2. **If data is filtered out:** Update the filter condition in `transformMeterData`
3. **If calculation is wrong:** Review the calculation logic in `transformMeterData`

Please share the console logs showing what keys are available, and we can fix the integration!
