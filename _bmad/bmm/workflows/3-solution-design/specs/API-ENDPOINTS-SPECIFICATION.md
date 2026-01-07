# API Endpoints Specification

## Overview

This document specifies all API endpoints required for the energy monitoring dashboard MVP. All endpoints follow RESTful conventions.

## Base URL

```
Development: http://localhost:3000/api
Production:  Configure via VITE_API_URL environment variable
```

## Authentication

Currently not implemented (Phase 1). Phase 2 will add JWT token-based authentication.

```
Authorization: Bearer <jwt_token>
```

---

## Real-Time Metrics API

### GET /realtime/current
Get current real-time metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPower": 450.5,
    "voltage": 230.2,
    "frequency": 50.0,
    "powerFactor": 0.98,
    "timestamp": "2024-01-06T14:30:45.123Z"
  }
}
```

### GET /realtime/meters
Get all meters current status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "eq-001",
      "name": "Main Panel",
      "status": "Online",
      "power": 450.5,
      "lastUpdate": "2024-01-06T14:30:45.123Z"
    }
  ]
}
```

### WS /ws/realtime
WebSocket connection for real-time updates

**Message Format:**
```json
{
  "type": "meter:update",
  "data": {
    "meterId": "eq-001",
    "timestamp": "2024-01-06T14:30:45.123Z",
    "power": 450.5,
    "voltage": 230.2,
    "frequency": 50.0
  }
}
```

**Update Frequency:** 15 seconds (configurable)

---

## Equipment/Meters API

### GET /meters
Get all equipment/meters

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (Online, Offline, Maintenance, Alert)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "eq-001",
      "name": "Main Meter",
      "type": "Motor",
      "model": "ABB-123",
      "serial": "SN-12345",
      "location": "Building A",
      "installDate": "2024-01-01T00:00:00Z",
      "status": "Online",
      "specs": {
        "power": 450.5,
        "load": 75,
        "temperature": 42
      }
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20,
  "hasMore": false
}
```

### GET /meters/{id}
Get single equipment details

**Parameters:**
- `id`: Equipment ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "eq-001",
    "name": "Main Meter",
    "type": "Motor",
    "model": "ABB-123",
    "serial": "SN-12345",
    "location": "Building A",
    "installDate": "2024-01-01T00:00:00Z",
    "status": "Online",
    "specs": {
      "power": 450.5,
      "load": 75,
      "temperature": 42,
      "voltage": 230.2,
      "current": 2.5,
      "efficiency": 95.5
    },
    "photoUrl": "https://example.com/photo.jpg",
    "maintenanceHistory": [
      {
        "id": "maint-001",
        "date": "2024-01-01T00:00:00Z",
        "type": "Preventive",
        "description": "Regular maintenance",
        "technician": "John Doe"
      }
    ]
  }
}
```

### POST /meters
Create new equipment

**Request Body:**
```json
{
  "name": "Sub Panel A",
  "type": "Transformer",
  "model": "ABB-456",
  "serial": "SN-67890",
  "location": "Building B",
  "installDate": "2024-01-06T00:00:00Z",
  "status": "Online",
  "specs": {
    "power": 250.0
  }
}
```

**Response:** Same as GET /meters/{id}

### PUT /meters/{id}
Update equipment

**Parameters:**
- `id`: Equipment ID

**Request Body:** (partial update)
```json
{
  "name": "Updated Name",
  "status": "Maintenance",
  "specs": {
    "power": 300.0,
    "load": 80
  }
}
```

**Response:** Same as GET /meters/{id}

### DELETE /meters/{id}
Delete equipment

**Parameters:**
- `id`: Equipment ID

**Response:**
```json
{
  "success": true,
  "data": { "id": "eq-001", "deleted": true }
}
```

### GET /meters/{id}/readings
Get recent readings for equipment

**Parameters:**
- `id`: Equipment ID

**Query Parameters:**
- `from`: Start timestamp (ISO 8601)
- `to`: End timestamp (ISO 8601)
- `limit` (optional): Number of readings (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "equipmentId": "eq-001",
      "timestamp": "2024-01-06T14:30:45.123Z",
      "power": 450.5,
      "consumption": 0.5,
      "powerFactor": 0.98,
      "voltage": 230.2,
      "current": 2.5,
      "temperature": 42,
      "status": "Normal"
    }
  ]
}
```

---

## Alerts API

### GET /alerts
Get alerts with filters

**Query Parameters:**
- `status`: Filter by status (New, Acknowledged, Resolved, Escalated)
- `severity`: Filter by severity (critical, high, medium, low, informational)
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "alert-001",
        "equipmentId": "eq-001",
        "level": "Critical",
        "message": "Power consumption exceeding threshold",
        "description": "Power has exceeded 500 kW for more than 5 minutes",
        "detectedAt": "2024-01-06T14:30:45.123Z",
        "acknowledgedAt": null,
        "acknowledgedBy": null,
        "resolvedAt": null,
        "notes": null,
        "status": "New",
        "threshold": 500,
        "currentValue": 550
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  }
}
```

### PUT /alerts/{id}/acknowledge
Acknowledge alert

**Parameters:**
- `id`: Alert ID

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "status": "Acknowledged",
    "acknowledgedAt": "2024-01-06T14:31:45.123Z",
    "acknowledgedBy": "user-123"
  }
}
```

### GET /alerts/rules
Get alert rules

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule-001",
      "name": "High Power Alert",
      "condition": "power > 500",
      "severity": "high",
      "enabled": true,
      "notificationChannels": ["email", "sms", "push"],
      "escalationTime": 1800000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /alerts/rules
Create alert rule

**Request Body:**
```json
{
  "name": "Very High Power Alert",
  "condition": "power > 600",
  "severity": "critical",
  "notificationChannels": ["email", "sms"],
  "escalationTime": 3600000
}
```

**Response:** Same as GET /alerts/rules item

### PUT /alerts/rules/{id}
Update alert rule

**Parameters:**
- `id`: Rule ID

**Request Body:** (partial update)
```json
{
  "enabled": false
}
```

**Response:** Same as GET /alerts/rules item

### DELETE /alerts/rules/{id}
Delete alert rule

**Parameters:**
- `id`: Rule ID

**Response:**
```json
{
  "success": true,
  "data": { "id": "rule-001", "deleted": true }
}
```

---

## Historical Data API

### GET /historical/consumption
Get consumption data for date range

**Query Parameters:**
- `from`: Start timestamp (ISO 8601) **[Required]**
- `to`: End timestamp (ISO 8601) **[Required]**
- `resolution`: '15min' | '1hour' | 'daily' | 'weekly' | 'monthly'
- `meterId` (optional): Filter by equipment ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-06T13:00:00Z",
      "meterId": "eq-001",
      "power": 450.5,
      "consumption": 0.5,
      "cost": 0.125
    }
  ]
}
```

### GET /historical/aggregate
Get aggregated data by site or equipment

**Query Parameters:**
- `from`: Start timestamp (ISO 8601) **[Required]**
- `to`: End timestamp (ISO 8601) **[Required]**
- `groupBy`: 'site' | 'equipment' | 'meter'

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1500.0,
    "average": 62.5,
    "peak": 450.5,
    "min": 0.0,
    "breakdown": [
      {
        "name": "eq-001",
        "value": 500.0,
        "percentage": 33.3
      }
    ]
  }
}
```

### GET /historical/export
Export consumption data

**Query Parameters:**
- `from`: Start timestamp (ISO 8601) **[Required]**
- `to`: End timestamp (ISO 8601) **[Required]**
- `format`: 'csv' | 'excel'
- `meterId` (optional): Filter by equipment ID

**Response:** Binary file (CSV or Excel)
```
Content-Type: text/csv (or application/vnd.ms-excel)
Content-Disposition: attachment; filename="consumption-export.csv"
```

---

## Reports API

### GET /reports
Get list of reports

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `status` (optional): Draft, Generated, Sent, Failed
- `templateId` (optional): Filter by template

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "report-001",
      "templateId": "daily",
      "name": "Daily Consumption Report",
      "status": "Generated",
      "from": "2024-01-05T00:00:00Z",
      "to": "2024-01-06T00:00:00Z",
      "generatedAt": "2024-01-06T01:00:00Z",
      "fileUrl": "https://example.com/reports/report-001.pdf"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20,
  "hasMore": false
}
```

### POST /reports/generate
Generate new report

**Request Body:**
```json
{
  "templateId": "daily",
  "from": "2024-01-06T00:00:00Z",
  "to": "2024-01-06T23:59:59Z",
  "format": "pdf",
  "filters": {
    "equipmentIds": ["eq-001", "eq-002"],
    "includeAlerts": true,
    "includeCost": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "report-001",
    "status": "Generating",
    "estimatedTime": 30,
    "fileUrl": null
  }
}
```

### GET /reports/{id}/download
Download report file

**Parameters:**
- `id`: Report ID

**Response:** Binary file (PDF, Excel, or CSV)

### GET /reports/templates
Get available report templates

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "daily",
      "name": "Daily Consumption Report",
      "description": "Daily energy consumption summary",
      "supportedFormats": ["pdf", "excel", "csv"],
      "schedule": "daily"
    },
    {
      "id": "monthly",
      "name": "Monthly Summary Report",
      "description": "Monthly cost and consumption analysis",
      "supportedFormats": ["pdf", "excel"],
      "schedule": "monthly"
    },
    {
      "id": "iso50001",
      "name": "ISO 50001 Compliance Report",
      "description": "Energy management compliance report",
      "supportedFormats": ["pdf"],
      "schedule": "quarterly"
    }
  ]
}
```

### POST /reports/schedule
Schedule report generation

**Request Body:**
```json
{
  "templateId": "daily",
  "schedule": "daily",
  "time": "01:00",
  "format": "pdf",
  "recipients": ["admin@example.com", "manager@example.com"],
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "schedule-001",
    "templateId": "daily",
    "schedule": "daily",
    "nextRun": "2024-01-07T01:00:00Z"
  }
}
```

---

## Settings API

### GET /settings/tariff
Get tariff configuration

**Response:**
```json
{
  "success": true,
  "data": {
    "peakRate": 0.25,
    "offPeakRate": 0.15,
    "peakHours": {
      "start": "06:00",
      "end": "22:00"
    },
    "currency": "TND",
    "timezone": "UTC+1",
    "lastUpdated": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /settings/tariff
Update tariff settings

**Request Body:**
```json
{
  "peakRate": 0.28,
  "offPeakRate": 0.18,
  "peakHours": {
    "start": "07:00",
    "end": "21:00"
  }
}
```

**Response:** Same as GET /settings/tariff

### GET /settings/system
Get system configuration

**Response:**
```json
{
  "success": true,
  "data": {
    "companyName": "Energy Company",
    "timezone": "UTC+1",
    "dateFormat": "DD/MM/YYYY",
    "theme": "dark",
    "language": "fr",
    "mailingAddress": "123 Main St, Tunis",
    "supportEmail": "support@example.com",
    "supportPhone": "+216-12-345-678"
  }
}
```

### PUT /settings/system
Update system settings

**Request Body:**
```json
{
  "companyName": "New Company Name",
  "theme": "light",
  "language": "en"
}
```

**Response:** Same as GET /settings/system

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-06T14:30:45.123Z"
}
```

### HTTP Status Codes
- `200`: OK
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error
- `503`: Service Unavailable

### Example Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid query parameters",
  "details": {
    "from": "ISO 8601 timestamp required",
    "to": "ISO 8601 timestamp required"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Equipment not found",
  "code": "EQUIPMENT_NOT_FOUND"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Database connection failed",
  "timestamp": "2024-01-06T14:30:45.123Z"
}
```

---

## Rate Limiting

**Recommended Limits:**
- Real-time updates: 1 request per 15 seconds
- Regular API calls: 100 requests per minute
- Report generation: 10 per hour
- Alert rules: 10 modifications per hour

---

## Data Types

### Status Types
```typescript
EquipmentStatus = 'Online' | 'Offline' | 'Maintenance' | 'Alert'
AlertLevel = 'Informational' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency'
AlertStatus = 'New' | 'Acknowledged' | 'Resolved' | 'Escalated'
ReportStatus = 'Draft' | 'Generating' | 'Generated' | 'Sent' | 'Failed'
```

### Common Fields
```typescript
timestamp: ISO 8601 string
id: UUID or alphanumeric string
power: Number (watts)
consumption: Number (kWh)
voltage: Number (volts)
current: Number (amps)
frequency: Number (Hz)
temperature: Number (Celsius)
cost: Number (currency)
```

---

## Implementation Checklist

To implement this API specification:

- [ ] Set up Express.js or similar API framework
- [ ] Implement 10 endpoints (realtime, equipment, alerts)
- [ ] Add 5+ report endpoints
- [ ] Add 4 settings endpoints
- [ ] Implement WebSocket for real-time updates
- [ ] Add database schema (PostgreSQL recommended)
- [ ] Add authentication/authorization
- [ ] Implement error handling
- [ ] Add input validation
- [ ] Add logging and monitoring
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Set up CI/CD pipeline
- [ ] Load testing and optimization
- [ ] Security audit (SQL injection, XSS, etc.)
- [ ] Add rate limiting
- [ ] Document deployment process

---

**API Specification Version:** 1.0
**Last Updated:** 2024-01-06
**Status:** Ready for Implementation
