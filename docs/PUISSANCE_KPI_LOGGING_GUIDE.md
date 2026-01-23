# PuissanceView - Comprehensive KPI Console Logging

## What Has Been Added

I've added **detailed console logging** for each KPI that shows:
1. **API Key** - Which telemetry key is used
2. **API Parameters** - Time range, interval, aggregation function
3. **API Response** - Raw data received from API
4. **Calculation** - How the KPI value is calculated
5. **Final Value** - The computed KPI value

---

## Console Log Output for Each KPI

### 1. **instantaneousPower** (Current Real-Time Power)

```
[Puissance KPI] Fetching instantaneousPower: {
  apiKey: 'ActivePowerTotal',
  parameters: {
    keys: ['ActivePowerTotal'],
    startTs: [now - 5min],
    endTs: [now],
    interval: 60000 (1 minute),
    agg: 'NONE',
    limit: 1
  },
  timeRange: 'Last 5 minutes'
}

[Puissance KPI] instantaneousPower response: {
  dataPoints: 1,
  apiResponse: [
    { ts: 1737334800000, value: 8226.38, key: 'ActivePowerTotal' }
  ]
}

[Puissance KPI] instantaneousPower: {
  apiKey: 'ActivePowerTotal',
  apiParameters: {
    timeRange: 'Last 5 minutes',
    interval: '1 minute',
    aggregation: 'NONE (latest value)',
    limit: 1
  },
  apiResponse: [{ ts: ..., value: 8226.38, key: 'ActivePowerTotal' }],
  calculation: 'latest value from response (sorted by timestamp desc)',
  value: 8226.38,
  unit: 'kW',
  timestamp: '1/22/2026, 3:45:30 PM',
  apiTimestampMs: 1737334800000
}
```

---

### 2. & 3. **peakPowerToday** & **avgPowerToday** (Hourly Data)

```
[Puissance KPI] Fetching peakPowerToday & avgPowerToday: {
  apiKey: 'ActivePowerTotal',
  parameters: {
    keys: ['ActivePowerTotal'],
    startTs: [now - 24h],
    endTs: [now],
    interval: 3600000 (1 hour),
    agg: 'AVG',
    limit: 24
  },
  timeRange: 'Last 24 hours',
  purpose: 'Hourly averages for peak and daily average calculations'
}

[Puissance KPI] hourlyData response: {
  dataPoints: 24,
  apiResponse: [
    { ts: 1737292800000, value: 8156.45, key: 'ActivePowerTotal' },
    { ts: 1737296400000, value: 8234.67, key: 'ActivePowerTotal' },
    ...
    { ts: 1737334800000, value: 8345.22, key: 'ActivePowerTotal' }
  ]
}

[Puissance KPI] peakPowerToday: {
  apiKey: 'ActivePowerTotal',
  apiParameters: {
    timeRange: 'Last 24 hours',
    interval: '1 hour (hourly average)',
    aggregation: 'AVG'
  },
  apiResponse: [8156.45, 8234.67, ..., 8345.22],
  calculation: 'Math.max(8156.45, 8234.67, ..., 8345.22)',
  value: 9450.22,
  unit: 'kW',
  dataPoints: 24
}

[Puissance KPI] avgPowerToday: {
  apiKey: 'ActivePowerTotal',
  apiParameters: {
    timeRange: 'Last 24 hours',
    interval: '1 hour (hourly average)',
    aggregation: 'AVG'
  },
  apiResponse: [8156.45, 8234.67, ..., 8345.22],
  calculation: 'sum([8156.45, 8234.67, ..., 8345.22]) / 24',
  value: 8267.38,
  unit: 'kW',
  dataPoints: 24
}
```

---

### 4. **avgPowerYesterday** (Daily Data)

```
[Puissance KPI] Fetching avgPowerYesterday: {
  apiKey: 'ActivePowerTotal',
  parameters: {
    keys: ['ActivePowerTotal'],
    startTs: [now - 30d],
    endTs: [now],
    interval: 86400000 (1 day),
    agg: 'AVG',
    limit: 30
  },
  timeRange: 'Last 30 days',
  purpose: 'Daily averages (yesterday is second-to-last point)'
}

[Puissance KPI] dailyData response: {
  dataPoints: 30,
  apiResponse: [
    { ts: 1735363200000, value: 7923.45, key: 'ActivePowerTotal' },
    { ts: 1735449600000, value: 8034.22, key: 'ActivePowerTotal' },
    ...
    { ts: 1737334800000, value: 8267.38, key: 'ActivePowerTotal' }
  ]
}

[Puissance KPI] avgPowerYesterday: {
  apiKey: 'ActivePowerTotal',
  apiParameters: {
    timeRange: 'Last 30 days',
    interval: '1 day (daily average)',
    aggregation: 'AVG'
  },
  apiResponse: [7923.45, 8034.22, ..., 8267.38],
  calculation: 'dailyValues[28] (second-to-last day)',
  value: 8156.45,
  unit: 'kW',
  dataPoints: 30,
  note: 'Index 28 of 30 days'
}
```

---

### 5. & 6. **avgPowerThisMonth** & **avgPowerLastMonth** (Monthly Data)

```
[Puissance KPI] Fetching avgPowerThisMonth & avgPowerLastMonth: {
  apiKey: 'ActivePowerTotal',
  parameters: {
    keys: ['ActivePowerTotal'],
    startTs: [now - 365d],
    endTs: [now],
    interval: 2592000000 (30 days),
    agg: 'AVG',
    limit: 12
  },
  timeRange: 'Last 365 days (12 months)',
  purpose: 'Monthly averages (this month = last, last month = second-to-last)'
}

[Puissance KPI] monthlyData response: {
  dataPoints: 12,
  apiResponse: [
    { ts: 1704067200000, value: 7934.56, key: 'ActivePowerTotal' },
    { ts: 1706745600000, value: 8012.34, key: 'ActivePowerTotal' },
    ...
    { ts: 1735363200000, value: 8289.45, key: 'ActivePowerTotal' }
  ]
}

[Puissance KPI] avgPowerThisMonth: {
  apiKey: 'ActivePowerTotal',
  apiParameters: {
    timeRange: 'Last 365 days (12 months)',
    interval: '30 days (monthly average)',
    aggregation: 'AVG'
  },
  apiResponse: [7934.56, 8012.34, ..., 8289.45],
  calculation: 'monthlyValues[11] (last month in array)',
  value: 8289.45,
  unit: 'kW',
  dataPoints: 12,
  timestamp: '1/22/2026, 3:45:30 PM'
}

[Puissance KPI] avgPowerLastMonth: {
  apiKey: 'ActivePowerTotal',
  apiParameters: {
    timeRange: 'Last 365 days (12 months)',
    interval: '30 days (monthly average)',
    aggregation: 'AVG'
  },
  apiResponse: [7934.56, 8012.34, ..., 8289.45],
  calculation: 'monthlyValues[10] (second-to-last month)',
  value: 8145.67,
  unit: 'kW',
  dataPoints: 12,
  timestamp: '12/22/2025, 3:45:30 PM'
}
```

---

## How to Use This Logging

### Step 1: Open Browser Console
```
1. Open PuissanceView
2. Press F12 (Developer Tools)
3. Go to "Console" tab
```

### Step 2: Look for Logs

**During data fetch (before transformation):**
```
[Puissance KPI] Fetching instantaneousPower: { ... }
[Puissance KPI] instantaneousPower response: { ... }

[Puissance KPI] Fetching peakPowerToday & avgPowerToday: { ... }
[Puissance KPI] hourlyData response: { ... }

[Puissance KPI] Fetching avgPowerYesterday: { ... }
[Puissance KPI] dailyData response: { ... }

[Puissance KPI] Fetching avgPowerThisMonth & avgPowerLastMonth: { ... }
[Puissance KPI] monthlyData response: { ... }
```

**During KPI calculation (transformation):**
```
[Puissance KPI] instantaneousPower: {
  apiKey: 'ActivePowerTotal',
  apiParameters: { ... },
  apiResponse: [ ... ],
  calculation: '...',
  value: 8226.38,
  unit: 'kW',
  ...
}

[Puissance KPI] peakPowerToday: {
  apiKey: 'ActivePowerTotal',
  apiParameters: { ... },
  apiResponse: [...],
  calculation: 'Math.max(...)',
  value: 9450.22,
  ...
}

[Puissance KPI] avgPowerToday: { ... }

[Puissance KPI] avgPowerYesterday: {
  apiKey: 'ActivePowerTotal',
  apiParameters: { ... },
  apiResponse: [...],
  calculation: 'dailyValues[28]',
  value: 8156.45,
  ...
}

[Puissance KPI] avgPowerThisMonth: { ... }

[Puissance KPI] avgPowerLastMonth: { ... }
```

---

## What Each Log Shows

| Field | Purpose | Example |
|-------|---------|---------|
| `apiKey` | Telemetry key requested from API | `ActivePowerTotal` |
| `apiParameters` | Full parameters sent to API | `{ keys, startTs, endTs, interval, agg, limit }` |
| `timeRange` | Human-readable time range | `Last 24 hours` |
| `purpose` | Why this data is being fetched | `Hourly averages for peak and daily calculations` |
| `apiResponse` | Raw data array received | `[{ ts, value, key }, ...]` |
| `dataPoints` | Number of points in response | `24` |
| `calculation` | How KPI value is computed | `Math.max(...)` or `average(...)` |
| `value` | Final computed KPI value | `8226.38` |
| `unit` | Unit of measurement | `kW` |
| `timestamp` | When the data point was recorded | `1/22/2026, 3:45:30 PM` |

---

## Debugging with These Logs

### To verify API parameters are correct:
```
Check: apiParameters section
- timeRange: Should match the KPI time period
- interval: Should be appropriate for the time range
- aggregation: Should be NONE for latest, AVG/MAX for comparisons
```

### To verify API response:
```
Check: apiResponse array
- Should have multiple data points (except instantaneous which has 1)
- All values should be numbers
- All timestamps should be recent
```

### To verify calculation:
```
Check: calculation field
- Should show the formula used
- Compare with the value to ensure math is correct
```

### To verify final value:
```
Check: value and unit fields
- Value should be reasonable for power (typically 1000-10000 kW)
- Unit should always be 'kW'
- Should not be null or NaN
```

---

## Example Full Debug Session

```javascript
// In browser console, you'll see:

[Puissance KPI] Fetching instantaneousPower: {
  apiKey: 'ActivePowerTotal',
  parameters: { keys: ['ActivePowerTotal'], ... },
  timeRange: 'Last 5 minutes'
}

[Puissance KPI] instantaneousPower response: {
  dataPoints: 1,
  apiResponse: [{ ts: 1737334800000, value: 8226.38, ... }]
}

[Puissance KPI] instantaneousPower: {
  apiKey: 'ActivePowerTotal',
  apiParameters: { timeRange: 'Last 5 minutes', ... },
  apiResponse: [{ ts: 1737334800000, value: 8226.38, ... }],
  calculation: 'latest value from response (sorted by timestamp desc)',
  value: 8226.38,
  unit: 'kW',
  timestamp: '1/22/2026, 3:45:30 PM'
}

// This tells you:
// ✅ API key is correct: ActivePowerTotal
// ✅ API returned data: 1 point
// ✅ Value is reasonable: 8226.38 kW
// ✅ Calculation is simple: took latest value
// ✅ Timestamp is valid: recent date/time
```

---

## What to Share for Debugging

If something is wrong, copy and share:

1. The `apiKey` field - confirms which key is being used
2. The `apiParameters` section - confirms what was requested
3. The `apiResponse` array - confirms what data was returned
4. The `calculation` field - confirms how it was processed
5. The final `value` - confirms the result

Example:
```
[Puissance KPI] peakPowerToday: {
  apiKey: 'ActivePowerTotal',
  apiResponse: [8156.45, 8234.67, 8300.00, ..., 8345.22],
  calculation: 'Math.max(...)',
  value: 9450.22  // ← This seems wrong, max of those values should be 8345.22
}
```

This log immediately shows the bug!

---

## Files Modified

- `src/features/puissance/views/PuissanceView.vue`
  - `fetchMeterTelemetryData()` - Added logs for each API request
  - `transformMeterData()` - Added logs for each KPI calculation

---

## Next Steps

1. Open PuissanceView in browser
2. Open console (F12)
3. Navigate to see KPI cards
4. Check console for logs
5. Verify:
   - Each KPI has a log with all parameters, response, and value
   - All values are numbers (not null/NaN)
   - API keys match the documentation
   - Calculations match the displayed values
