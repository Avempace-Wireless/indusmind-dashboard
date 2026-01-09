# Architecture Overview: Indusmind Energy Dashboard

**Sprint 0 Foundation Ready**  
**Date:** January 6, 2026

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (Vue 3 SPA)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Views Layer (Lazy-loaded routes)                                   │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────┐  │
│  │   Login      │  Dashboard   │   Alerts     │ Equipment/Hist   │  │
│  │   (Auth)     │  (FR1-8)     │  (FR9-22)    │ /Reports/Settings│  │
│  └──────────────┴──────────────┴──────────────┴──────────────────┘  │
│                                  ↓                                    │
│  Component Layer                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Sidebar  │  Topbar  │  Metrics  │  Alert List  │  Charts   │   │
│  │  (RBAC)   │ (Theme)  │  (Gauges) │  (Filtering) │ (Chart.js)│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                  ↓                                    │
│  State Management (Pinia)                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Auth │ Dashboard │ Alerts │ Equipment │ History │ KPI │      │  │
│  │ Billing │ Reports │ Users │ Settings │ Global │          │  │
│  │         (11 stores, full TypeScript typing)                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                  ↓                                    │
│  API Integration                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  WebSocket Client  │  REST API Client  │  Composables       │  │
│  │  (pub/sub channels)│  (OAuth auth)     │  (Hooks)           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ (HTTP/WS)
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend APIs (Node.js/Python)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  OAuth 2.0 Service                                                  │
│  POST /api/auth/login           → JWT token, 1-hour expiry          │
│  POST /api/auth/logout          → Invalidate session                │
│  POST /api/auth/refresh         → New token                         │
│                                                                       │
│  Equipment Management API                                           │
│  GET  /api/equipment            → All devices + status              │
│  POST /api/equipment            → Register new device               │
│  PUT  /api/equipment/{id}       → Update device specs               │
│  GET  /api/equipment/{id}/maintenance → Maintenance history         │
│                                                                       │
│  Real-Time Monitoring API                                           │
│  GET  /api/readings?equipment_id=X&from=&to= → Historical data     │
│  WebSocket /ws/dashboard:site_a → Real-time readings (5s updates)  │
│                                                                       │
│  Alert Management API                                               │
│  GET  /api/alerts?status=&level= → Filtered alerts                 │
│  POST /api/alerts/{id}/acknowledge → Mark as acknowledged          │
│  WebSocket /ws/alerts:new       → New critical alerts              │
│                                                                       │
│  Reports & Compliance API                                           │
│  GET  /api/reports/iso50001     → ISO 50001 evidence PDF           │
│  POST /api/kpi/{id}/calculate   → Update EnPI values               │
│  GET  /api/costs/monthly        → Cost tracking data               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Layer (Databases)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  InfluxDB / TimescaleDB                                             │
│  ├─ readings               (1,000 readings/min)                     │
│  │  └─ equipment_id, timestamp, power, consumption, voltage, ...   │
│  ├─ alerts                 (24-month retention)                     │
│  └─ historical_data        (24-month retention, 15-min resolution) │
│                                                                       │
│  PostgreSQL (ISO 50001 Compliance)                                  │
│  ├─ equipment              (Asset registry)                         │
│  ├─ users                  (RBAC: 6 roles)                         │
│  ├─ energy_baselines       (Immutable, versioned)                   │
│  ├─ enpi                   (Custom KPIs)                           │
│  ├─ corrective_actions     (Permanent audit trail)                 │
│  ├─ audit_logs             (Append-only, 12-month retention)       │
│  └─ tariff_info            (Peak/off-peak rates)                   │
│                                                                       │
│  Modbus TCP/RTU Gateway                                             │
│  ├─ Poll 10 concurrent connections                                 │
│  ├─ 5-second timeout with exponential backoff                      │
│  └─ Equipment discovery (new devices available within 60s)         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow: Real-Time Monitoring (FR1-8)

```
Equipment (Motor/Transformer)
    ↓ Modbus TCP/RTU
    ↓ (power, consumption, voltage, current, temp)
    ↓
Backend Modbus Poller (every 5 seconds)
    ↓ Store in InfluxDB
    ↓ Broadcast to WebSocket channel
    ↓
WebSocket Server: dashboard:site_a
    ↓ (JSON message: {equipment_id, power, consumption, ...})
    ↓
Frontend WebSocket Client (useWebSocket composable)
    ↓ Parse message
    ↓
Pinia dashboardStore.updateMetrics()
    ↓ Reactive update (Vue 3 reactivity)
    ↓
Template re-renders (6 gauges)
    ↓
⚡ < 5s total latency (Equipment → Screen) — **NFR2**
```

---

## 🔔 Data Flow: Alert Detection (FR9-22)

```
Real-time Reading (power=1250W, threshold=1000W)
    ↓
Backend Alert Detection Engine
    ├─ Evaluate against equipment thresholds
    ├─ Classify into 6 levels (Informational → Emergency)
    └─ Timestamp: when anomaly detected
    ↓
Backend Alert Service
    ├─ Log to PostgreSQL audit_logs (immutable)
    ├─ Publish to WebSocket alerts:new
    └─ For Critical/Emergency: trigger SMS via Twilio
    ↓
Frontend WebSocket Client (useWebSocket composable)
    ↓
Pinia alertsStore.addAlert()
    ↓ Reactive update
    ↓
AlertsView.vue: Display + color-code
    ↓
Operator sees alert badge on topbar
    ↓
⚡ < 30s total latency (Anomaly → Notification) — **NFR3**
```

---

## 🗄️ Data Model: Key Entities

### Energy Reading (Time-Series)
```typescript
{
  equipment_id: string
  timestamp: Date              // NTP synchronized ±1s
  power: number                // watts (instantaneous)
  consumption: number          // kWh (accumulated)
  powerFactor: number          // 0-1 (cos φ)
  voltage: number              // volts (3-phase avg)
  current: number              // amps
  temperature?: number         // celsius (optional)
  status: "Normal" | "Warning" | "Critical"
}
```

### Alert
```typescript
{
  id: string
  equipment_id: string
  level: "Informational" | "Low" | "Medium" | "High" | "Critical" | "Emergency"
  message: string
  detectedAt: Date             // When anomaly detected
  acknowledgedAt?: Date        // When operator acknowledged
  status: "New" | "Acknowledged" | "Resolved" | "Escalated"
  threshold?: number           // What threshold was exceeded
  currentValue?: number        // Actual value at detection
}
```

### Equipment
```typescript
{
  id: string
  name: string
  type: "Motor" | "Transformer" | "Compressor" | "Fan" | "Pump" | "Boiler"
  model: string
  serial: string
  location: string
  specs: {
    disjoncteur_rating?: number  // Circuit breaker rating (A)
    motor_power?: number          // Rated power (kW)
    motor_rpm?: number
    // ... domain-specific specs
  }
  maintenanceHistory: MaintenanceRecord[]
}
```

### Energy Baseline (ISO 50001 Cl. 6.3)
```typescript
{
  id: string
  version: number               // Immutable: increment on update
  baselineValue: number         // kWh
  period: "Monthly" | "Yearly"
  startDate: Date
  endDate?: Date
  immutable: boolean            // = true (once set)
  createdAt: Date
}
```

### Corrective Action (ISO 50001 Cl. 10.2)
```typescript
{
  id: string
  issueId: string               // Root cause
  description: string
  assignedTo: string
  targetDate: Date
  status: "Open" | "In Progress" | "Verification" | "Closed"
  completedAt?: Date
  auditTrail: AuditLog[]        // Full traceability
}
```

---

## 🔐 Authentication & Authorization

### OAuth 2.0 Flow (FR63)
```
User Login Page
    ↓
POST /api/auth/login (email, password)
    ↓ (Backend validates, checks MFA if admin/compliance)
    ↓
Response: {token: JWT, user: {id, email, role}}
    ↓
Frontend stores token (sessionStorage for security)
    ↓
Subsequent API calls: Authorization: Bearer {token}
    ↓
Token expiry: 1 hour
    ↓ (On expiry)
POST /api/auth/refresh (refreshToken)
    ↓
New JWT token issued
```

### RBAC: 6 Roles (FR67)
```
┌─────────────────┬──────────────┬──────────────┬──────────────────┐
│ Role            │ Dashboard    │ Alerts       │ Admin Features   │
├─────────────────┼──────────────┼──────────────┼──────────────────┤
│ Operator        │ View metrics │ Ack alerts   │ —                │
│ Engineer        │ + Root cause │ + Analysis   │ —                │
│ Manager         │ + KPIs       │ + Escalate   │ View audit logs  │
│ Admin           │ Full access  │ Full access  │ User management  │
│ Maintenance     │ Equipment    │ Maintenance  │ —                │
│ ComplianceOff.  │ Reports      │ Audit trails │ Generate reports │
└─────────────────┴──────────────┴──────────────┴──────────────────┘

Frontend: RBAC enforced at route + component level (nice UX)
Backend: RBAC enforced at API endpoint level (security)
```

---

## 🔌 WebSocket Channels (Real-Time < 5s)

```
Channel: dashboard:site_a
├─ Updates every 5 seconds
├─ Payload: {
│    equipment_id: string,
│    power: number,
│    consumption: number,
│    powerFactor: number,
│    voltage: number,
│    cost_hour: number,
│    timestamp: ISO 8601
│  }
└─ Subscribers: All logged-in operators on this site

Channel: alerts:new
├─ Immediate publish on critical/emergency alert
├─ Payload: {
│    id: string,
│    level: AlertLevel,
│    equipment_id: string,
│    message: string,
│    timestamp: ISO 8601
│  }
└─ Subscribers: All ops + engineers + managers

Channel: global:all_sites  (Phase 2)
├─ Multi-site consolidated metrics
├─ Subscribers: Managers + compliance officers
└─ Update frequency: 30 seconds
```

---

## 📈 Performance Optimization Strategies

### Frontend (Vue 3 SPA)

| Target | Strategy | NFR |
|--------|----------|-----|
| **Initial Load <2.5s** | Code-splitting by route, tree-shaking Chart.js | NFR1 |
| **Real-Time <5s** | WebSocket client, Pinia reactivity, virtual scroll | NFR2 |
| **Alert <30s** | Backend detection + push via WebSocket | NFR3 |
| **Bundle <300KB** | Gzip compression, CSS purge, lazy imports | NFR57 |
| **Route chunks <50KB** | Dynamic imports, top-level await | NFR58 |

### Backend (Node.js/Python)

| Target | Strategy | NFR |
|--------|----------|-----|
| **API <200ms** | Caching, DB query optimization, connection pooling | NFR7 |
| **Modbus polling <5s** | Non-blocking I/O, circuit breakers, auto-retry | NFR37 |
| **Historical <3s** | InfluxDB time-series indexing, pre-aggregation | NFR4 |
| **99.5% uptime** | Auto-scaling, health checks, failover | NFR27 |

---

## 🚀 Deployment Architecture

```
Development  →  Staging  →  Production
   :5173          Azure        Azure
  (Vite)        (Staging)     (Live)
   HMR          HTTPS         HTTPS + WAF
               SSL cert       99.5% SLA
                             Auto-backup
                             Monitoring
```

---

## 📚 Sprint 0-1 Critical Path

```
Sprint 0: Foundation (Jan 6-17)
├─ Frontend: ✅ Vue 3 + Pinia bootstrapped
├─ Backend: OAuth API + Modbus integration
└─ Together: WebSocket handshake test

Sprint 1: Real-Time Monitoring (Jan 20-31)
├─ Frontend: Dashboard with 6 gauges + <5s refresh
├─ Backend: Modbus polling + InfluxDB storage
└─ QA: Latency testing, mock data validation
```

---

**Architecture Ready for Development** ✅

Next step: Backend team implements OAuth + Modbus integration.

