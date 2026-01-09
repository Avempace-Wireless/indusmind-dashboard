# 🗺️ Routing Structure & URLs

## Quick Reference Table

| View | URL | Status | Components |
|------|-----|--------|-----------|
| Dashboard | `/` or `/dashboard` | ✅ Complete | StatCard (x4), ConsumptionChart, PhaseBalance, EventsWidget, EquipmentTable |
| Alerts | `/alerts` | ✅ Complete | AlertFilters, AlertItem, Pagination |
| Equipment | `/equipment` | ⏳ Planned | - |
| History | `/history` | ⏳ Planned | - |
| Reports | `/reports` | ⏳ Planned | - |
| Settings | `/settings` | ⏳ Planned | - |
| Login | `/login` | ℹ️ Legacy | - |

---

## 📊 Dashboard View (`/` and `/dashboard`)

### URL Patterns
```
http://localhost:5173/               → Redirects to /dashboard
http://localhost:5173/dashboard      → Main dashboard view
```

### Route Configuration (router/index.ts)
```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('../views/DashboardView.vue'),
  meta: {
    title: 'Dashboard',
    requiresAuth: true,
  },
}
```

### What You'll See
1. **Sidebar Navigation** - Links to all available views
2. **Top Header** - Live update indicator + dark/light mode toggle
3. **Dashboard Content:**
   - Breadcrumb navigation
   - 4 Stat Cards in grid layout
   - Consumption Chart with time range tabs
   - Phase Balance widget
   - Events/Alerts widget
   - Equipment Table (searchable, paginated)

### Mock Data Included
- Real-time metrics (Power: 2.45 kW, Voltage: 230V, etc.)
- 7 data points on chart (150-160 kWh)
- 3 phase balance readings (L1, L2, L3)
- 3 recent events/alerts
- 5 equipment items in table

---

## 🚨 Alerts View (`/alerts`)

### URL Pattern
```
http://localhost:5173/alerts        → Alerts management view
```

### Route Configuration (router/index.ts)
```typescript
{
  path: '/alerts',
  name: 'Alerts',
  component: () => import('../views/AlertsView.vue'),
  meta: {
    title: 'Alerts',
    requiresAuth: true,
  },
}
```

### What You'll See
1. **Alert Summary** - Counts by severity level:
   - Emergency (red)
   - Critical (red)
   - High (orange)
   - Medium (yellow)
   - Low (green)
   - Informational (blue)

2. **Filter Sidebar** (optional, toggle on/off)
   - Filter by severity levels
   - Filter by equipment
   - Filter by status (all, acknowledged, unacknowledged)
   - Date range filter
   - Search filter

3. **Alert List**
   - Severity indicator with color
   - Alert message
   - Timestamp
   - Equipment location
   - Status (new, acknowledged)

4. **Pagination**
   - 10 alerts per page
   - Previous/Next buttons
   - Current page indicator

### Mock Data Included
- 6 severity levels with different counts
- Sample alerts for each level
- Equipment IDs for filtering
- Acknowledgment status tracking

---

## ⏳ Planned Views

### Equipment View (`/equipment`)
```
Route: /equipment
File: src/views/EquipmentView.vue
Status: Not yet implemented
Planned features:
  - Equipment list with details
  - Real-time status for each device
  - Equipment metrics and health status
  - Control interface
  - Historical data access
```

### History View (`/history`)
```
Route: /history
File: src/views/HistoryView.vue
Status: Not yet implemented
Planned features:
  - Historical data charts
  - Time range selection
  - Data export (CSV, Excel)
  - Trend analysis
  - Comparative periods
```

### Reports View (`/reports`)
```
Route: /reports
File: src/views/ReportsView.vue
Status: Not yet implemented
Planned features:
  - Report generation
  - Compliance reports
  - Performance metrics
  - Export formats (PDF, CSV, Excel)
  - Scheduled reports
```

### Settings View (`/settings`)
```
Route: /settings
File: src/views/SettingsView.vue
Status: Not yet implemented
Planned features:
  - User preferences
  - Alert configuration
  - System settings
  - Profile management
  - API integrations
```

---

## 🔐 Authentication

### Login View (`/login`)
```
Route: /login
File: src/views/LoginView.vue
Status: Legacy (from template)
Meta: requiresAuth: false
```

### Route Guards
Routes with `requiresAuth: true` require authentication:
- Dashboard ✅
- Alerts ✅
- Equipment ⏳
- History ⏳
- Reports ⏳
- Settings ⏳

Routes with `requiresAuth: false`:
- Login ✅

---

## 🏗️ Navigation Structure

### Sidebar Menu Items
```
Dashboard
├─ Icon: home
└─ Route: /dashboard

Alerts
├─ Icon: notifications
└─ Route: /alerts

Equipment
├─ Icon: settings
└─ Route: /equipment (planned)

History
├─ Icon: history
└─ Route: /history (planned)

Reports
├─ Icon: analytics
└─ Route: /reports (planned)

Settings
├─ Icon: tune
└─ Route: /settings (planned)
```

### Breadcrumb Navigation (Dashboard View)
```
Dashboard > Dashboard
Energy Management System > Consumption Overview
```

---

## 🔄 Route Transitions & Navigation

### Navigation Flow
```
Login View
    ↓
Dashboard View (default on auth)
    ├─ → Alerts View
    ├─ → Equipment View (planned)
    ├─ → History View (planned)
    ├─ → Reports View (planned)
    └─ → Settings View (planned)
```

### URL Examples (All Valid)
```
http://localhost:5173/
http://localhost:5173/dashboard
http://localhost:5173/alerts
http://localhost:5173/equipment
http://localhost:5173/history
http://localhost:5173/reports
http://localhost:5173/settings
http://localhost:5173/login
```

---

## 📱 URL Behavior by Device

### Desktop (1024px+)
- Full sidebar always visible
- Clean URL bar shows current route
- Sidebar links highlight active route

### Tablet (641px-1023px)
- Sidebar visible but collapsed
- Hover to expand sidebar
- URLs work normally

### Mobile (320px-640px)
- Sidebar in hamburger menu
- Tap hamburger to open menu
- URLs work with mobile menu

---

## 🧪 Testing Routes

### Quick Navigation Test
1. Open http://localhost:5173/dashboard
2. Click "Alerts" in sidebar → http://localhost:5173/alerts
3. Click "Dashboard" in sidebar → http://localhost:5173/dashboard
4. Verify URL changes match sidebar navigation

### Direct URL Access
1. Open http://localhost:5173/alerts directly
2. Should load alerts view immediately
3. Sidebar should highlight "Alerts" as active

### Browser Back Button
1. Navigate from Dashboard to Alerts
2. Click browser back button
3. Should return to Dashboard with correct URL

### Browser Forward Button
1. Go back to Dashboard
2. Click forward button
3. Should return to Alerts with correct URL

---

## 📊 View Statistics

```
Total Routes:           11
Implemented Routes:      2 (Dashboard, Alerts)
Planned Routes:          4 (Equipment, History, Reports, Settings)
Legacy Routes:           5 (Ecommerce, Analytics, Marketing, etc.)

Development URLs:
- Local:  http://localhost:5173
- Network: http://[your-ip]:5173

Production URLs:
- Will be defined during deployment
```

---

## 🎯 Summary

### What's Working Now
✅ `/dashboard` - Full dashboard with all components
✅ `/alerts` - Alert management system
✅ `/login` - Legacy login view

### What's Planned
⏳ `/equipment` - Equipment monitoring
⏳ `/history` - Historical data analysis
⏳ `/reports` - Report generation
⏳ `/settings` - System configuration

### Navigation Features
✅ Sidebar menu with active route highlighting
✅ Breadcrumb navigation on Dashboard
✅ Dark/Light mode toggle in header
✅ Responsive mobile hamburger menu
✅ URL routing with Vue Router
✅ Browser history support (back/forward)

---

**Last Updated:** January 6, 2026
**Framework:** Vue 3 + Vue Router v4
**Build Tool:** Vite 6.0
