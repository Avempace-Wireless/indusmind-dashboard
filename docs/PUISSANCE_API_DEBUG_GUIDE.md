# PuissanceView API Key Verification - Summary

## What I've Done

I've added **comprehensive console logging** to trace the exact flow of API keys from request to KPI display. This will help identify why KPI cards are displaying incorrectly.

## Files Modified

### 1. **useTelemetryDynamic.ts** (Composable that fetches API data)
Added detailed logging to show:
- Which keys are being requested
- What keys are actually in the API response
- Whether each key has data
- Data structure and sample values

**Key Logs:**
```
[useTelemetryDynamic] ✓ KEY VERIFICATION "ActivePowerTotal":
{
  keyExists: true/false,  ← CRITICAL: Is the key in the response?
  keyDataLength: 24,      ← CRITICAL: How many data points?
  allAvailableKeys: [...] ← CRITICAL: What other keys are available?
}
```

### 2. **PuissanceView.vue** - fetchMeterTelemetryData function
Added logging that shows:
- Total data points being fetched
- Timestamps and values for each request

### 3. **PuissanceView.vue** - transformMeterData function
Added detailed logging for each time period:

#### Instantaneous Power:
```
[Puissance] Raw instantaneous data:
{
  totalPoints: X,
  allPoints: [...]  ← See actual data structure
}

[Puissance KPI] instantaneousPower:
{
  key: "ActivePowerTotal",
  value: 8226.38,
  timestamp: "..."
}
```

#### Hourly Data:
```
[Puissance] Raw hourly data (before filtering):
{
  totalPoints: 24,
  uniqueKeys: ["ActivePowerTotal"],  ← What keys are in the data?
  firstFewPoints: [...],
  allPoints: [...]
}

[Puissance] Hourly data AFTER filtering for ActivePowerTotal:
{
  pointsAfterFilter: 24,  ← Did the filter work?
  pointsRemoved: 0,       ← Was any data removed?
  filteredData: [...]     ← Final data used for KPI
}
```

#### Daily Data:
```
[Puissance] Raw daily data (before filtering): { ... }
[Puissance] Daily data AFTER filtering for ActivePowerTotal: { ... }
```

#### Monthly Data:
```
[Puissance] Raw monthly data (before filtering): { ... }
[Puissance] Monthly data AFTER filtering for ActivePowerTotal: { ... }
```

#### KPI Summary:
```
[Puissance KPIs Summary] All metrics for meter-1:
{
  instantaneousPower: { value: 8226.38, unit: 'kW', source: '...' },
  peakPowerToday: { value: 9450.2, unit: 'kW', source: '...', dataPoints: 24 },
  avgPowerToday: { value: 8156.45, unit: 'kW', source: '...', dataPoints: 24 },
  avgPowerYesterday: { value: 7920.33, unit: 'kW', source: '...', dataPoints: 30 },
  avgPowerThisMonth: { value: 8089.2, unit: 'kW', source: '...', dataPoints: 12 },
  avgPowerLastMonth: { value: 7856.1, unit: 'kW', source: '...', dataPoints: 12 }
}
```

## How to Use This

### Step 1: Open PuissanceView
1. Open your browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Navigate to PuissanceView
- Open PuissanceView dashboard
- Make sure API mode is enabled (`VITE_DATA_MODE=api` in your .env)
- Ensure a meter with deviceUUID is selected

### Step 3: Check the Logs

**Critical checks in order:**

1. **API Response has the right keys?**
   ```
   Look for: [useTelemetryDynamic] ✓ KEY VERIFICATION "ActivePowerTotal"
   Check: keyExists: true/false
   If false: Check allAvailableKeys to see what's actually available
   ```

2. **Data filtering working?**
   ```
   Look for: [Puissance] Hourly data AFTER filtering for ActivePowerTotal
   Check: pointsAfterFilter > 0 (means data passed the filter)
   If 0: Data is being filtered out (wrong key name or structure)
   ```

3. **KPIs calculated?**
   ```
   Look for: [Puissance KPI] instantaneousPower
   Check: value is a number, not null/undefined
   If null: No data available for this time period
   ```

4. **Final check:**
   ```
   Look for: [Puissance KPIs Summary] All metrics for meter-1
   Check: All 6 KPIs have values (not null)
   If some are null: That time period has no data
   ```

## Possible Issues This Will Help Identify

### Issue A: Wrong API Key
**Symptom:**
```
allAvailableKeys: ["SomeOtherKey", "AnotherKey"]  ← ActivePowerTotal not here
```
**Fix:** Update the key name in fetchMeterTelemetryData function

### Issue B: Data Structure Mismatch
**Symptom:**
```
Raw hourly data: totalPoints: 24
After filtering: pointsAfterFilter: 0  ← All data removed!
```
**Fix:** Check the actual data structure in `firstFewPoints` and update filter accordingly

### Issue C: No Data for Time Period
**Symptom:**
```
keyDataLength: 0  ← No data at all
```
**Fix:** Check that deviceUUID is configured correctly for the meter

## Expected vs Actual

### Expected Data Flow
```
API Request: { keys: ['ActivePowerTotal'], ... }
    ↓
API Response: { "ActivePowerTotal": [{ ts, value }, ...] }
    ↓
Transform to: [{ ts, value, key: "ActivePowerTotal" }, ...]
    ↓
Filter: [{ ... } (24 items)]
    ↓
Calculate KPI: avgPowerToday = sum / 24
```

### If Incorrect Display
One of these is failing:
1. API request using wrong key → Check useTelemetryDynamic logs
2. API response structure wrong → Check useTelemetryDynamic logs
3. Transform not working → Check allAvailableKeys
4. Filter removing all data → Check pointsAfterFilter
5. Calculation failing → Check KPI calculation logs

## Files to Share for Debugging

Once you open the console and see the logs, please share:
1. Screenshot of `[useTelemetryDynamic] ✓ KEY VERIFICATION` section
2. Screenshot of `[Puissance] Raw hourly data` section
3. Screenshot of `[Puissance KPIs Summary]` section

This will help identify exactly where the incorrect display is coming from!

## Quick Testing Steps

```
1. Open browser DevTools (F12 → Console)
2. Navigate to PuissanceView
3. Scroll through the console logs
4. Look for first [useTelemetryDynamic] ✓ KEY VERIFICATION log
   - If keyExists: false → API key name is wrong
   - If keyDataLength: 0 → No data for this meter
5. Look for [Puissance KPIs Summary]
   - If any value is null → That KPI has no data
   - If values are "NaN" → Calculation error
```

## Architecture Reminder

The flow is:
```
PuissanceView requests 4 time periods
    ↓ (each calls fetchMeterTelemetryData)
useTelemetryDynamic.fetchTelemetry()
    ↓ (calls backend /telemetry endpoint)
Backend /telemetry/:deviceUUID/timeseries
    ↓ (proxies to ThingsBoard)
ThingsBoard API returns data
    ↓ (backend returns)
useTelemetryDynamic transforms response
    ↓ (flat array with 'key' field)
transformMeterData filters by key
    ↓ (filters to ActivePowerTotal only)
KPI calculations
    ↓
Display in KPI cards
```

If you see incorrect display, the logs will show exactly which step is failing!
