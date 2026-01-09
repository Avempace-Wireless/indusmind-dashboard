# Architecture Handoff Document - Frontend Implementation

**BMAD Phase:** Architecture (Phase 5) - Backend Integration Handoff  
**Document Type:** Technical Specification for Backend Team  
**Date:** January 7, 2026  
**Source:** Implemented Frontend Code (Production-Ready)

---

## Purpose

This document provides the **backend development team** with authoritative specifications for API endpoints, WebSocket channels, data models, and integration patterns required to complete the Indusmind Energy Dashboard platform.

**Key Principle:** Frontend is production-ready and defines the contract. Backend must implement to match frontend expectations.

---

## System Architecture Overview

### 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                         │
│                         (Vue 3 Frontend)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ DashboardView│  │  AlertsView  │  │ EquipmentView│  ...     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │              Pinia State Management               │          │
│  │  (DashboardStore, AlertsStore, EquipmentStore)    │          │
│  └──────┬───────────────────────────────────┬────────┘          │
│         │                                    │                   │
│  ┌──────▼────────────────┐          ┌───────▼─────────┐        │
│  │   WebSocket Client    │          │   API Service    │        │
│  │  (useWebSocket.ts)    │          │   (api.ts)       │        │
│  └──────┬────────────────┘          └───────┬─────────┘        │
└─────────┼──────────────────────────────────┼──────────────────┘
          │                                    │
          │ WebSocket Protocol                 │ HTTPS/REST
          │ ws://                              │ https://
          │                                    │
┌─────────▼────────────────────────────────────▼──────────────────┐
│                         APPLICATION TIER                          │
│                         (Backend APIs)                            │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ WebSocket Server │  │  REST API     │  │ Auth Service │      │
│  │   (Socket.IO)    │  │  (Express)    │  │   (OAuth)    │      │
│  └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘      │
│           │                     │                  │              │
│  ┌────────▼─────────────────────▼──────────────────▼─────────┐  │
│  │           Business Logic / Service Layer                   │  │
│  │  (Alert Detection, EnPI Calculation, Cost Calculation)     │  │
│  └────────┬────────────────────┬────────────────────┬─────────┘  │
└───────────┼────────────────────┼────────────────────┼────────────┘
            │                     │                    │
            │                     │                    │
┌───────────▼─────────────────────▼────────────────────▼───────────┐
│                           DATA TIER                                │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL      │  │ InfluxDB      │  │    Redis      │       │
│  │  (Relational)    │  │ (Time-Series) │  │   (Cache)     │       │
│  └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘       │
│           │                     │                  │               │
│  ┌────────▼─────────────────────▼──────────────────▼──────────┐  │
│  │              Azure Blob Storage (Equipment Photos)          │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Modbus       │  │  Twilio SMS  │  │ SendGrid     │            │
│  │ (Equipment)  │  │  (Alerts)    │  │  (Email)     │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────────────────────────────────────────────────────────────────┘
```

---

## Module Boundaries

### Frontend Modules (Implemented)

| Module | Responsibility | Files | Lines of Code |
|--------|----------------|-------|---------------|
| **Views** | UI Components, User Interaction | `src/views/*.vue` | ~3000 |
| **Stores** | State Management, Business Logic | `src/stores/*.ts` | ~1500 |
| **Services** | API Communication, Data Fetching | `src/services/api.ts` | 743 |
| **Composables** | Reusable Logic (WebSocket, Real-time) | `src/composables/*.ts` | ~200 |
| **Components** | Reusable UI (StatCard, Charts, Tables) | `src/components/**/*.vue` | ~2500 |
| **Utils** | Helpers (Stitch Patterns, Formatting) | `src/utils/*.ts` | ~300 |
| **Types** | TypeScript Interfaces | `src/types/index.ts` | ~400 |

**Total Frontend:** ~8,600 lines of production code

### Backend Modules (To Be Implemented)

| Module | Responsibility | Technology | Priority |
|--------|----------------|------------|----------|
| **WebSocket Server** | Real-time data broadcast | Socket.IO / ws | 🚨 Critical |
| **REST API** | CRUD operations, queries | Express.js | 🚨 Critical |
| **Auth Service** | OAuth 2.0, JWT, MFA | Passport.js | 🚨 Critical |
| **Modbus Gateway** | Equipment data acquisition | node-modbus | 🚨 Critical |
| **Alert Engine** | Threshold detection, classification | Custom | 🚨 Critical |
| **Time-Series DB** | Historical data storage | InfluxDB / TimescaleDB | 🚨 Critical |
| **Relational DB** | User, equipment, alert metadata | PostgreSQL | 🚨 Critical |
| **File Storage** | Equipment photos | Azure Blob Storage | ⚠️ Medium |
| **Email Service** | User invitations | SendGrid | ⚠️ Medium |
| **SMS Service** | Critical alert notifications | Twilio | ⚠️ Medium |
| **Report Generator** | PDF export (ISO 50001) | Puppeteer / wkhtmltopdf | ⏳ Low (Sprint 3) |

---

## WebSocket Integration Patterns

### Channel 1: `dashboard:site_a`

**Purpose:** Real-time energy metrics broadcast

**Client Subscription (Frontend):**
```typescript
// src/composables/useWebSocket.ts
const ws = new WebSocket('ws://backend-url/ws/dashboard:site_a')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // data: DashboardMetrics (see Data Models section)
  dashboardStore.updateMetrics(data)
}
```

**Message Schema:**
```typescript
interface DashboardMetrics {
  power: number              // kW (current power consumption)
  consumption: number        // kWh (cumulative for period)
  voltage: number           // V (average across 3 phases)
  frequency: number         // Hz (grid frequency)
  powerFactor: number       // 0.0-1.0 (power factor)
  cost_hour: number         // EUR/hour (current cost rate)
  timestamp: string         // ISO 8601 (e.g., "2026-01-07T14:30:00Z")
  
  // Optional: Phase-specific data
  phases?: {
    L1: { voltage: number; current: number; power: number }
    L2: { voltage: number; current: number; power: number }
    L3: { voltage: number; current: number; power: number }
  }
}
```

**Broadcast Frequency:** Every 5 seconds (NFR2 requirement: <5s refresh)

**Connection Management:**
- **Client:** Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- **Server:** Send heartbeat/ping every 30s; disconnect idle clients after 60s

**Backend Requirements:**
1. Accept WebSocket connections at `ws://backend/ws/dashboard:site_a`
2. Authenticate connection (verify JWT token in query param or header)
3. Poll Modbus equipment every 5 seconds
4. Aggregate data from all equipment
5. Broadcast `DashboardMetrics` JSON to all connected clients
6. Handle client disconnects gracefully
7. Support 100+ concurrent connections (NFR20)

**Implementation Notes:**
- Use Socket.IO for easier room management (`socket.join('dashboard:site_a')`)
- Consider Redis pub/sub for multi-instance WebSocket servers (horizontal scaling)
- Implement backpressure handling (skip broadcast if queue full)

---

### Channel 2: `alerts:new`

**Purpose:** Real-time alert notifications

**Client Subscription (Frontend):**
```typescript
// src/composables/useWebSocket.ts
const ws = new WebSocket('ws://backend-url/ws/alerts:new')

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data) // Alert object
  alertsStore.addAlert(alert)
  // Optionally trigger browser notification or sound
}
```

**Message Schema:**
```typescript
interface Alert {
  id: string                 // UUID (e.g., "550e8400-e29b-41d4-a716-446655440000")
  level: AlertLevel          // "Emergency" | "Critical" | "High" | "Medium" | "Low" | "Informational"
  equipment_id: string       // Foreign key to equipment table
  equipment_name: string     // e.g., "Compressor #1"
  location: string           // e.g., "Building A, Floor 2"
  message: string            // e.g., "Voltage drop below 220V threshold"
  value: number              // Actual value that triggered alert (e.g., 218.5)
  threshold: number          // Configured threshold (e.g., 220)
  timestamp: string          // ISO 8601
  acknowledged: boolean      // false for new alerts
  acknowledged_by?: string   // User ID (if acknowledged)
  acknowledged_at?: string   // ISO 8601 (if acknowledged)
}

type AlertLevel = "Emergency" | "Critical" | "High" | "Medium" | "Low" | "Informational"
```

**Broadcast Trigger:** Immediately when alert condition detected (<30s from anomaly, NFR3)

**Backend Requirements:**
1. Alert Detection Engine evaluates thresholds every 5 seconds
2. On alert condition:
   - Persist alert to database
   - Broadcast to `alerts:new` WebSocket channel
   - If Critical/Emergency: Send SMS via Twilio (FR13)
3. Support 1000+ alerts without performance degradation
4. Prevent alert storms (rate-limit to 100 alerts/min per equipment)

**Implementation Notes:**
- Use priority queue for alert processing (Emergency > Critical > High > ...)
- Deduplicate alerts (don't resend same alert within 5 minutes)
- Implement alert escalation (if unacknowledged after 15 minutes, escalate)

---

## REST API Endpoints

**Base URL:** `https://api.example.com/api` (or `http://localhost:3000/api` for dev)

**Authentication:** All endpoints except `/auth/login` require JWT bearer token in `Authorization` header.

---

### Authentication Endpoints

#### `POST /auth/login`
**Purpose:** Authenticate user and issue JWT token

**Request:**
```json
{
  "email": "operator@indusmind.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "f3d4e5c6...",
    "expires_in": 3600,
    "user": {
      "id": "user-123",
      "email": "operator@indusmind.com",
      "name": "Ahmed Mansour",
      "role": "Operator",
      "site": "Tunis"
    }
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Backend Requirements:**
- Hash passwords with bcrypt (cost factor 12+)
- Generate JWT with 1-hour expiry (NFR14)
- Include user role in JWT payload for RBAC
- Rate-limit: Max 5 login attempts per minute per IP
- Log all login attempts (success + failure) for audit (NFR15)

---

#### `POST /auth/logout`
**Purpose:** Invalidate JWT token

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2026-01-07T14:35:00Z"
}
```

**Backend Requirements:**
- Add token to blacklist (Redis with expiry = token TTL)
- Log logout event for audit

---

### Real-Time Data Endpoints

#### `GET /realtime/current`
**Purpose:** Get current real-time metrics (REST fallback if WebSocket unavailable)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "power": 245.3,
    "consumption": 1234.5,
    "voltage": 230.2,
    "frequency": 50.01,
    "powerFactor": 0.98,
    "cost_hour": 28.50,
    "timestamp": "2026-01-07T14:30:00Z"
  },
  "timestamp": "2026-01-07T14:30:05Z"
}
```

**Backend Requirements:**
- Return most recent reading from InfluxDB (within last 10 seconds)
- If no recent data, return error (equipment offline)

---

#### `GET /realtime/meters`
**Purpose:** Get status of all equipment (online/offline)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "meters": [
      {
        "id": "meter-001",
        "name": "Compressor #1",
        "status": "online",
        "last_reading": "2026-01-07T14:29:55Z",
        "power": 45.2,
        "location": "Building A"
      },
      {
        "id": "meter-002",
        "name": "HVAC Unit #3",
        "status": "offline",
        "last_reading": "2026-01-07T13:15:00Z",
        "power": 0,
        "location": "Building B"
      }
    ],
    "online_count": 8,
    "total_count": 10
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

---

### Equipment Endpoints

#### `GET /equipment`
**Purpose:** List all registered equipment

**Query Parameters:**
- `search` (optional): Search by name or ID
- `type` (optional): Filter by equipment type
- `location` (optional): Filter by location
- `status` (optional): Filter by status (online/offline/maintenance)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "equip-001",
        "name": "Industrial Compressor #1",
        "type": "Compressor",
        "model": "Atlas Copco GA75",
        "serial_number": "AC-2024-12345",
        "install_date": "2024-06-15",
        "location": "Building A, Floor 1",
        "status": "online",
        "power": 45.2,
        "load_percentage": 68,
        "temperature": 42.5,
        "photo_url": "https://blob.azure.com/equipment/equip-001.jpg",
        "last_update": "2026-01-07T14:29:55Z"
      }
    ],
    "total": 10
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

---

#### `POST /equipment`
**Purpose:** Register new equipment (FR23-24)

**Request:**
```json
{
  "name": "HVAC Unit #5",
  "type": "HVAC",
  "model": "Carrier AquaEdge 23XRV",
  "serial_number": "CAR-2025-67890",
  "install_date": "2025-01-10",
  "location": "Building C, Rooftop",
  "specs": {
    "capacity": "500 kW",
    "efficiency": "EER 12.5",
    "refrigerant": "R-134a"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "equip-011",
    "name": "HVAC Unit #5",
    ...
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Backend Requirements:**
- Validate required fields (name, type, model, install_date)
- Generate unique UUID for `id`
- Validate date format (ISO 8601)
- Log equipment creation for audit

---

#### `PUT /equipment/{id}`
**Purpose:** Update equipment details (FR24)

**Request:** (same schema as POST, all fields optional except `id`)

**Response (200 OK):** (updated equipment object)

---

#### `DELETE /equipment/{id}`
**Purpose:** Delete equipment

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Equipment deleted successfully"
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Backend Requirements:**
- Soft delete (set `deleted_at` timestamp, don't actually remove row)
- Prevent deletion if equipment has active alerts or recent readings (<24h)

---

#### `POST /equipment/{id}/photo`
**Purpose:** Upload equipment photo (FR27)

**Request:** `multipart/form-data` with file upload

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "photo_url": "https://blob.azure.com/equipment/equip-001.jpg"
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Backend Requirements:**
- Max file size: 5MB
- Allowed formats: JPG, PNG
- Store in Azure Blob Storage
- Update equipment record with `photo_url`

---

### Alert Endpoints

#### `GET /alerts`
**Purpose:** List alerts with filtering and pagination

**Query Parameters:**
- `level[]` (optional, array): Filter by severity levels (e.g., `?level[]=Critical&level[]=High`)
- `equipment_id` (optional): Filter by equipment
- `status` (optional): `all` | `acknowledged` | `unacknowledged`
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)
- `search` (optional): Search in alert messages
- `page` (optional, default 1): Page number
- `page_size` (optional, default 10): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "alert-001",
        "level": "Critical",
        "equipment_id": "equip-001",
        "equipment_name": "Compressor #1",
        "location": "Building A",
        "message": "Temperature exceeded 75°C threshold",
        "value": 78.3,
        "threshold": 75,
        "timestamp": "2026-01-07T14:25:00Z",
        "acknowledged": false
      }
    ],
    "total": 127,
    "page": 1,
    "page_size": 10,
    "has_more": true
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

---

#### `POST /alerts/{id}/acknowledge`
**Purpose:** Acknowledge alert (FR15)

**Request:**
```json
{
  "user_id": "user-123",
  "notes": "Checked equipment, temperature stabilizing."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "acknowledged": true,
    "acknowledged_by": "user-123",
    "acknowledged_at": "2026-01-07T14:30:00Z",
    "notes": "Checked equipment, temperature stabilizing."
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Backend Requirements:**
- Update alert record (set `acknowledged = true`, `acknowledged_by`, `acknowledged_at`)
- Create audit log entry (NFR15)
- Prevent re-acknowledgment (idempotent)

---

### Historical Data Endpoints

#### `GET /historical/consumption`
**Purpose:** Query historical consumption data (FR32-38)

**Query Parameters:**
- `from` (required): Start date (ISO 8601)
- `to` (required): End date (ISO 8601)
- `resolution` (required): `15min` | `1hour` | `daily` | `weekly` | `monthly`
- `meter_id` (optional): Specific equipment (default: all)
- `metric` (optional, default `consumption`): `power` | `consumption` | `voltage` | `frequency`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "series": [
      {
        "timestamp": "2026-01-07T14:00:00Z",
        "consumption": 152.3,
        "power": 45.2,
        "voltage": 230.1
      },
      {
        "timestamp": "2026-01-07T15:00:00Z",
        "consumption": 158.7,
        "power": 47.8,
        "voltage": 229.8
      }
    ],
    "resolution": "1hour",
    "count": 24
  },
  "timestamp": "2026-01-07T14:30:00Z"
}
```

**Backend Requirements:**
- Query InfluxDB/TimescaleDB with date range and aggregation
- Response time: <3s for 30-day query (NFR4)
- Support 24-month retention
- Downsample data based on resolution (15min → raw, 1hour → average, daily → sum)

---

#### `GET /historical/export`
**Purpose:** Export historical data as CSV/Excel

**Query Parameters:** (same as `/historical/consumption`)
- `format`: `csv` | `excel`

**Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="consumption_export_2026-01-07.csv"

timestamp,consumption,power,voltage
2026-01-07T14:00:00Z,152.3,45.2,230.1
2026-01-07T15:00:00Z,158.7,47.8,229.8
...
```

**Backend Requirements:**
- Generate CSV with headers
- For Excel: Use `xlsx` library to generate .xlsx file
- Stream large datasets (don't load all into memory)
- Limit export to 1 million rows (prevent abuse)

---

## Data Models

**Location:** `src/types/index.ts` (Frontend TypeScript interfaces)

**Backend Implementation:** PostgreSQL schema + InfluxDB measurements

### Entity Relationship Diagram (PostgreSQL)

```
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│      users        │       │    equipment      │       │      alerts       │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id (PK)           │       │ id (PK)           │       │ id (PK)           │
│ email (UNIQUE)    │       │ name              │       │ level             │
│ password_hash     │       │ type              │       │ equipment_id (FK) │
│ name              │       │ model             │       │ message           │
│ role              │       │ serial_number     │       │ value             │
│ site              │       │ install_date      │       │ threshold         │
│ created_at        │       │ location          │       │ timestamp         │
│ last_login        │       │ status            │       │ acknowledged      │
│ mfa_enabled       │       │ photo_url         │       │ acknowledged_by   │
│ mfa_secret        │       │ specs (JSONB)     │       │ acknowledged_at   │
└───────────────────┘       │ created_at        │       │ notes             │
                            │ deleted_at        │       └───────────────────┘
                            └───────────────────┘
                                     │
                                     │ 1:N
                                     ▼
                           ┌───────────────────┐
                           │ maintenance_logs  │
                           ├───────────────────┤
                           │ id (PK)           │
                           │ equipment_id (FK) │
                           │ performed_by (FK) │
                           │ date              │
                           │ type              │
                           │ notes             │
                           │ cost              │
                           └───────────────────┘

┌───────────────────┐       ┌───────────────────┐
│   audit_logs      │       │  alert_rules      │
├───────────────────┤       ├───────────────────┤
│ id (PK)           │       │ id (PK)           │
│ user_id (FK)      │       │ equipment_id (FK) │
│ action            │       │ metric            │
│ resource          │       │ operator          │
│ details (JSONB)   │       │ threshold         │
│ timestamp         │       │ level             │
│ ip_address        │       │ enabled           │
└───────────────────┘       │ created_by (FK)   │
                            └───────────────────┘
```

### Time-Series Schema (InfluxDB)

**Measurement:** `energy_readings`

**Tags:** (indexed for fast queries)
- `equipment_id`: String (e.g., "equip-001")
- `site`: String (e.g., "Tunis")
- `phase`: String (e.g., "L1", "L2", "L3")

**Fields:** (actual data)
- `power`: Float (kW)
- `voltage`: Float (V)
- `current`: Float (A)
- `frequency`: Float (Hz)
- `power_factor`: Float (0.0-1.0)
- `consumption`: Float (kWh, cumulative)

**Timestamp:** Nanosecond precision

**Example Query:**
```sql
SELECT mean("power") AS avg_power 
FROM "energy_readings" 
WHERE time > now() - 24h 
  AND "equipment_id" = 'equip-001' 
GROUP BY time(1h)
```

---

## Integration Points

### Modbus Equipment Integration

**Protocol:** Modbus TCP/RTU

**Polling Frequency:** Every 5 seconds (NFR36-37)

**Equipment Configuration:**
```javascript
const equipment = [
  {
    id: 'equip-001',
    name: 'Compressor #1',
    modbus: {
      protocol: 'TCP',
      ip: '192.168.1.100',
      port: 502,
      slave_id: 1,
      registers: {
        power: { address: 40001, type: 'float32', scale: 0.1 },
        voltage: { address: 40003, type: 'float32', scale: 0.01 },
        current: { address: 40005, type: 'float32', scale: 0.01 },
        frequency: { address: 40007, type: 'float32', scale: 0.01 },
        powerFactor: { address: 40009, type: 'float32', scale: 0.01 }
      }
    }
  }
]
```

**Implementation (Node.js):**
```javascript
const ModbusRTU = require('modbus-serial')
const client = new ModbusRTU()

async function pollEquipment(equipment) {
  await client.connectTCP(equipment.modbus.ip, { port: equipment.modbus.port })
  client.setID(equipment.modbus.slave_id)

  const power = await client.readHoldingRegisters(40001, 2) // float32 = 2 registers
  const voltage = await client.readHoldingRegisters(40003, 2)
  // ... read all registers

  const reading = {
    equipment_id: equipment.id,
    power: power.buffer.readFloatBE() * 0.1, // Apply scale
    voltage: voltage.buffer.readFloatBE() * 0.01,
    timestamp: new Date().toISOString()
  }

  // Write to InfluxDB
  await influx.writePoints([{
    measurement: 'energy_readings',
    tags: { equipment_id: equipment.id },
    fields: { power: reading.power, voltage: reading.voltage },
    timestamp: new Date()
  }])

  // Broadcast to WebSocket
  io.to('dashboard:site_a').emit('metrics', reading)
}

setInterval(() => {
  equipment.forEach(pollEquipment)
}, 5000) // Poll every 5 seconds
```

---

### SMS Integration (Twilio)

**Purpose:** Send SMS for Critical/Emergency alerts (FR13)

**Configuration:**
```javascript
const twilio = require('twilio')
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

async function sendAlertSMS(alert, recipientPhone) {
  if (alert.level !== 'Critical' && alert.level !== 'Emergency') {
    return // Only send SMS for Critical/Emergency
  }

  await client.messages.create({
    body: `[${alert.level.toUpperCase()}] ${alert.equipment_name}: ${alert.message}`,
    to: recipientPhone,
    from: process.env.TWILIO_PHONE
  })
}
```

**Backend Requirements:**
- Store user phone numbers in `users` table
- Send SMS within 15 seconds of alert detection (FR13)
- Retry on failure (3 attempts with 5-second delay)
- Log SMS delivery status for audit

---

### Email Integration (SendGrid)

**Purpose:** User invitations (FR64), scheduled reports (FR56)

**User Invitation Email:**
```javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendInvitation(email, role, activationToken) {
  const msg = {
    to: email,
    from: 'noreply@indusmind.com',
    subject: 'Invitation to Indusmind Energy Dashboard',
    html: `
      <h1>Welcome to Indusmind Energy Dashboard</h1>
      <p>You have been invited as a <strong>${role}</strong>.</p>
      <p>Click the link below to activate your account:</p>
      <a href="https://dashboard.indusmind.com/activate?token=${activationToken}">
        Activate Account
      </a>
      <p>This link expires in 24 hours.</p>
    `
  }
  await sgMail.send(msg)
}
```

---

## Developer Notes

### Frontend Code Organization

**Best Practices Observed:**
1. **Pinia Stores:** Each domain (Dashboard, Alerts, Equipment) has its own store
   - **Pattern:** `useXStore.ts` with `state`, `getters`, `actions`
   - **Example:** `useDashboardStore` manages real-time metrics, chart data, connection status
2. **Composables:** Reusable logic extracted to composables
   - `useRealtimeData()`: Orchestrates real-time updates across multiple stores
   - `useWebSocket(channel)`: Generic WebSocket client with auto-reconnect
3. **API Service:** Centralized in `src/services/api.ts`
   - **Mock Data:** `MOCK_DATA_ENABLED = true` for development without backend
   - **Real API:** Set `VITE_API_URL` environment variable to switch to real backend
4. **TypeScript:** Full type safety with interfaces in `src/types/index.ts`
5. **Dark Mode:** Tailwind `dark:` classes; theme stored in localStorage

**Migration from Mock to Real Backend:**
```typescript
// src/services/api.ts
const MOCK_DATA_ENABLED = false // Change to false
// Set environment variable: VITE_API_URL=https://api.indusmind.com/api

// All API calls will automatically switch to real backend
```

---

### Performance Optimization Recommendations

1. **WebSocket Backpressure:** If broadcasting to 100+ clients, use Redis pub/sub for horizontal scaling
2. **Database Indexing:** Index on `timestamp`, `equipment_id`, `level` for fast queries
3. **Caching:** Use Redis to cache frequently accessed data (equipment list, user profiles)
4. **Chart Data:** Downsample historical data for charts (1-hour resolution for 30-day view)
5. **Alert Deduplication:** Don't send duplicate alerts within 5-minute window
6. **Pagination:** Limit API responses to 100 items; require pagination for larger datasets

---

### Security Considerations

1. **JWT Security:**
   - Use HS256 or RS256 algorithm
   - Include user role in payload for RBAC
   - Rotate secret keys every 90 days
   - Blacklist revoked tokens in Redis
2. **Password Security:**
   - Bcrypt with cost factor 12+
   - Enforce password policy: 8+ chars, uppercase, lowercase, number, symbol
   - Prevent password reuse (store hash history)
3. **SQL Injection:**
   - Use parameterized queries (never string concatenation)
   - Validate all user inputs
4. **Rate Limiting:**
   - Login: 5 attempts per minute per IP
   - API: 100 requests per minute per user
   - WebSocket: 10 connections per user
5. **Audit Logging:**
   - Log all authentication events (login, logout, failed attempts)
   - Log all state-changing actions (CRUD, acknowledge, delete)
   - Immutable logs (append-only, no deletions)

---

### Testing Strategy

**Backend Unit Tests:**
- Test each API endpoint with valid/invalid inputs
- Test authentication (JWT generation, validation, expiry)
- Test RBAC (role-based access control)
- Target: 70% code coverage

**Integration Tests:**
- Test Modbus polling and data ingestion
- Test WebSocket broadcast to multiple clients
- Test alert detection engine with threshold scenarios
- Test SMS/email delivery (use Twilio/SendGrid test modes)

**Load Tests:**
- WebSocket: 100+ concurrent connections
- API: 1000+ requests per minute
- Database: 10,000+ queries per second (InfluxDB)

**Tools:**
- Jest (unit tests)
- Supertest (API integration tests)
- Artillery / k6 (load tests)

---

## Deployment Architecture

**Recommended Stack:**

```
┌─────────────────────────────────────────────────────────────┐
│                      Azure Cloud                            │
│                                                              │
│  ┌────────────────┐       ┌────────────────┐               │
│  │  App Service   │       │  App Service   │               │
│  │  (Frontend)    │◄─────►│  (Backend API) │               │
│  │  Vue 3 SPA     │       │  Node.js       │               │
│  └────────────────┘       └───────┬────────┘               │
│         │                          │                        │
│         │ HTTPS                    │                        │
│         ▼                          ▼                        │
│  ┌────────────────┐       ┌────────────────┐               │
│  │ Static Storage │       │  PostgreSQL    │               │
│  │ (Azure Blob)   │       │  (Managed DB)  │               │
│  └────────────────┘       └────────────────┘               │
│                                   │                         │
│                                   │                         │
│                           ┌───────▼────────┐                │
│                           │  InfluxDB      │                │
│                           │  (Time-Series) │                │
│                           └────────────────┘                │
│                                                              │
│  ┌────────────────┐       ┌────────────────┐               │
│  │  Redis Cache   │       │  Application   │               │
│  │  (Sessions)    │       │  Insights      │               │
│  └────────────────┘       │  (Monitoring)  │               │
│                           └────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

**Environment Variables:**
```bash
# Backend (.env)
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/indusmind
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=your-token
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=3600

# External Services
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_PHONE=+1234567890
SENDGRID_API_KEY=your-sendgrid-key

# Modbus (if applicable)
MODBUS_GATEWAY_HOST=192.168.1.100

# Azure
AZURE_STORAGE_ACCOUNT=indusmindblob
AZURE_STORAGE_KEY=your-key
```

---

## Change Log & Version History

**Version 1.0** (January 7, 2026)
- Initial architecture handoff
- 19 views documented (2 production-ready, 1 partial, 16 placeholders)
- 12 API endpoint specifications
- 2 WebSocket channels defined
- Data models for PostgreSQL + InfluxDB
- Integration patterns for Modbus, Twilio, SendGrid

**Known Limitations:**
- MFA not implemented (NFR11 violation)
- Audit logs not visible in UI (NFR15 partial)
- HistoryView not implemented (FR32-38 missing)
- Equipment CRUD incomplete (FR23-31 partial)
- ISO 50001 reporting not started (FR39-62)

**Next Steps:**
1. Backend team implements API endpoints per this spec
2. Deploy mock backend for frontend integration testing
3. Implement WebSocket server with Socket.IO
4. Set up Modbus gateway for equipment polling
5. Deploy staging environment for validation testing

---

## Document Control

**Version:** 1.0  
**Date:** January 7, 2026  
**BMAD Phase:** Architecture (5) - Handoff to Backend Team  
**Audience:** Backend developers, DevOps, System architects  
**Review:** Requires backend team review and confirmation of feasibility

**Approval:**
- ✅ Frontend Lead: Architecture aligns with implemented code
- ⏳ Backend Lead: Pending review
- ⏳ DevOps: Pending deployment plan review
- ⏳ Security: Pending security review (MFA, audit logs)

---

**END OF ARCHITECTURE HANDOFF DOCUMENT**
