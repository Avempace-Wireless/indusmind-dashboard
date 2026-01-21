# Implementation Phase 1 - Quick Start Guide

## 🚀 Running the Application

### Development Mode
```bash
cd a:\indusmind-dashboard
npm run dev
```
Access at: `http://localhost:5174`

### Production Build
```bash
npm run build
npm run preview
```

## 📊 Architecture Overview

### Real-Time Data Flow
```
Browser Application
    ↓
useRealtimeData() Composable
    ├→ initializeRealtimeData()
    ├→ dashboardStore.loadInitialMetrics()
    ├→ equipmentStore.loadEquipment()
    ├→ alertsStore.loadAlerts()
    └→ dashboardStore.initializeRealtimeUpdates()
        └→ realtimeAPI.subscribeToUpdates()
            └→ Mock data by default (change MOCK_DATA_ENABLED)
```

### Store Hierarchy
```
Pinia Stores (Global State)
├── useDashboardStore (Real-time metrics)
├── useEquipmentStore (Equipment inventory)
├── useAlertsStore (Alert management)
├── useReportsStore (Report generation)
├── useSettingsStore (Configuration)
└── ... 6 other stores
```

## 🔧 Key Implementation Details

### 1. API Service Layer
**Location:** `src/services/api.ts`

**Key Functions:**
```typescript
// Real-time data
realtimeAPI.getCurrentMetrics()
realtimeAPI.subscribeToUpdates(onUpdate, onError)

// Equipment
equipmentAPI.getAll()
equipmentAPI.create(data)
equipmentAPI.update(id, data)

// Alerts
alertsAPI.getAlerts(params)
alertsAPI.acknowledge(id, userId)

// Historical
historicalAPI.getConsumption(params)
historicalAPI.exportData(params)
```

**Mock Data Toggle:**
```typescript
// In src/services/api.ts, line 8
const MOCK_DATA_ENABLED = true  // Set to false for real API
```

### 2. Dashboard Store Integration
**Location:** `src/stores/useDashboardStore.ts`

**Usage in Components:**
```typescript
import { useDashboardStore } from '@/stores/useDashboardStore'

const store = useDashboardStore()

// Read state
console.log(store.metrics)
console.log(store.currentPower)
console.log(store.isConnected)

// Call actions
await store.loadInitialMetrics()
store.initializeRealtimeUpdates()
store.stopRealtimeUpdates()
```

### 3. Real-Time Data Composable
**Location:** `src/composables/useRealtimeData.ts`

**Usage in Vue Components:**
```typescript
import { useRealtimeData } from '@/composables/useRealtimeData'

const {
  initializeRealtimeData,
  stopRealtimeData,
  connectionStatus,
  dashboardStore,
  equipmentStore,
  alertsStore,
} = useRealtimeData()

// In onMounted
await initializeRealtimeData()

// In onUnmounted
stopRealtimeData()
```

## 📝 Modifying Mock Data

### Change Mock Data Generators
**File:** `src/services/api.ts` (lines 660+)

**Functions to Modify:**
- `mockRealTimeMetrics()` - Current power/voltage/frequency
- `mockRealtimeUpdate()` - Streaming updates
- `mockHistoricalData(params)` - Historical consumption
- `mockEquipmentList()` - Equipment inventory
- `mockAlertsList(params)` - Alert messages
- `mockEquipmentReadings(id, params)` - Equipment readings

**Example:**
```typescript
function mockRealTimeMetrics() {
  return {
    success: true,
    data: {
      currentPower: 450.5,  // Change this value
      voltage: 230.2,
      frequency: 50.0,
      powerFactor: 0.98,
      timestamp: new Date().toISOString(),
    },
  }
}
```

## 🔗 Connecting to Real Backend

### Step 1: Disable Mock Data
```typescript
// src/services/api.ts, line 8
const MOCK_DATA_ENABLED = false
```

### Step 2: Set API URL
```env
# .env or .env.local
VITE_API_URL=http://your-api.com/api
```

### Step 3: Update API Endpoints
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
```

### Step 4: Ensure Backend Compatibility

**Expected Endpoints:**
```
GET  /api/realtime/current
GET  /api/realtime/meters
WS   ws://localhost:3000/ws/realtime

GET  /api/meters
GET  /api/meters/{id}
POST /api/meters
PUT  /api/meters/{id}
DELETE /api/meters/{id}

GET  /api/alerts
PUT  /api/alerts/{id}/acknowledge
GET  /api/alerts/rules

GET  /api/historical/consumption
GET  /api/historical/aggregate
GET  /api/historical/export

GET  /api/reports
POST /api/reports/generate
GET  /api/reports/templates

GET  /api/settings/tariff
GET  /api/settings/system
```

## 🧪 Testing Real-Time Updates

### In Browser Console:
```javascript
// Get current metrics
const store = JSON.parse(localStorage.getItem('dashboard'))
console.log(store.metrics)

// Check connection status
console.log('Connected:', store.isConnected)

// View recent readings
console.log('Readings:', store.readings.slice(0, 5))
```

### Vue DevTools:
1. Open in browser: `Alt+Shift+D` or `http://localhost:5174/__devtools__/`
2. Go to "Pinia" tab
3. Expand `dashboard` store
4. Watch `metrics`, `readings`, `isConnected` change in real-time

## 🎯 Next Steps After Phase 1

### Phase 2 (Estimated 2-3 hours)
1. **Install Charts Library**
   ```bash
   npm install apexcharts
   ```
   Then create consuming chart components

2. **Implement Export**
   - CSV export from equipment/alerts tables
   - Excel export with formatting
   - PDF export for reports

3. **Complete Settings**
   - Tariff form with persist to localStorage
   - User profile edit
   - Alert rule configuration

4. **Add Report Generation**
   - Report template selection
   - Date range picker
   - Download functionality

### Phase 3 (After Backend Ready)
1. Switch to real API
2. Implement authentication
3. Add email/SMS notifications
4. Real WebSocket integration
5. Advanced filtering and search

## 🐛 Debugging Tips

### Enable Verbose Logging
Add to `src/services/api.ts`:
```typescript
const DEBUG = true  // At top of file

// Then use in functions:
if (DEBUG) console.log('Fetching metrics...')
```

### Check Store State
```typescript
// In any component
import { useDashboardStore } from '@/stores/useDashboardStore'
const store = useDashboardStore()
console.log('Dashboard store:', store.$state)
```

### Monitor WebSocket
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3000/ws/realtime')
ws.onmessage = (event) => console.log('WS:', JSON.parse(event.data))
```

## 📦 Deployed Artifacts

**Build Directory:** `dist/`

**Key Files:**
- `dist/index.html` - Entry point
- `dist/assets/DashboardView-*.js` - Dashboard (173 KB)
- `dist/assets/index-*.js` - Main bundle (741 KB)
- `dist/assets/index-*.css` - Styles (212 KB)

**Size Analysis:**
```
Total: 741 KB minified (220 KB gzipped)
├─ Vendor: 450 KB (Vue, libraries)
├─ Components: 200 KB
└─ Styles: 91 KB
```

## 📞 Support & Troubleshooting

### Issue: Port 5173 in use
```bash
# Change port
npm run dev -- --port 5175
```

### Issue: Module not found errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Issue: Mock data not working
```typescript
// Check MOCK_DATA_ENABLED in src/services/api.ts
// Should be: const MOCK_DATA_ENABLED = true
```

### Issue: Store state not updating
```typescript
// Ensure you're using actions, not mutating directly
store.updateMetrics(newData)  // ✅ Correct
store.metrics.value = data    // ❌ Wrong
```

## 📚 File Reference

**Core Implementation:**
- `src/services/api.ts` - API service layer (620 lines)
- `src/composables/useRealtimeData.ts` - Real-time orchestration
- `src/stores/useDashboardStore.ts` - Dashboard state
- `src/stores/useEquipmentStore.ts` - Equipment state
- `src/stores/useAlertsStore.ts` - Alerts state
- `src/views/DashboardView.vue` - Dashboard UI

**Documentation:**
- `IMPLEMENTATION-PHASE-1.md` - Detailed implementation guide
- `COMPETITOR-DASHBOARD-ANALYSIS.md` - Requirements analysis
- `DARK-MODE-TESTING-GUIDE.md` - Theme testing

## ✅ Verification Checklist

Before moving to Phase 2:
- [ ] Dev server runs without errors
- [ ] Dashboard loads with data
- [ ] Real-time status indicator shows connection
- [ ] Stats cards update with values
- [ ] Equipment table populated
- [ ] Alerts display on dashboard
- [ ] Dark mode toggle works
- [ ] Build succeeds (0 errors)
- [ ] TypeScript compilation clean

All items checked? ✅ **Phase 1 is complete and ready for Phase 2!**
