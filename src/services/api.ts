/**
 * API Service Layer
 * Handles all backend communication for the energy monitoring dashboard
 */

// Base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// ⚡ MVP MODE: Using 100% static/mocked data - NO BACKEND REQUIRED ⚡
const MOCK_DATA_ENABLED = true // Keep TRUE for MVP demo (no backend needed)

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// REAL-TIME DATA SERVICE
// ============================================================================

export const realtimeAPI = {
  /**
   * Get current real-time metrics
   */
  getCurrentMetrics: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockRealTimeMetrics()
    }
    const response = await fetch(`${API_BASE_URL}/realtime/current`)
    return response.json()
  },

  /**
   * Get all meters current status
   */
  getMetersStatus: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockMetersStatus()
    }
    const response = await fetch(`${API_BASE_URL}/realtime/meters`)
    return response.json()
  },

  /**
   * Subscribe to WebSocket for real-time updates
   */
  subscribeToUpdates: (onUpdate: (data: any) => void, onError: (error: any) => void) => {
    if (MOCK_DATA_ENABLED) {
      // Simulate WebSocket with interval
      const interval = setInterval(() => {
        onUpdate(mockRealtimeUpdate())
      }, 15000) // Update every 15 seconds
      return () => clearInterval(interval)
    }

    const ws = new WebSocket(`ws://localhost:3000/ws/realtime`)
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onUpdate(data)
      } catch (error) {
        onError(error)
      }
    }
    ws.onerror = onError
    return () => ws.close()
  },
}

// ============================================================================
// HISTORICAL DATA SERVICE
// ============================================================================

export const historicalAPI = {
  /**
   * Get consumption data for a date range
   */
  getConsumption: async (params: {
    from: string
    to: string
    resolution: '15min' | '1hour' | 'daily' | 'weekly' | 'monthly'
    meterId?: string
  }) => {
    if (MOCK_DATA_ENABLED) {
      return mockHistoricalData(params)
    }
    const query = new URLSearchParams(params as Record<string, string>)
    const response = await fetch(`${API_BASE_URL}/historical/consumption?${query}`)
    return response.json()
  },

  /**
   * Get aggregated data by site or equipment
   */
  getAggregated: async (params: {
    from: string
    to: string
    groupBy: 'site' | 'equipment' | 'meter'
  }) => {
    if (MOCK_DATA_ENABLED) {
      return mockAggregatedData(params)
    }
    const query = new URLSearchParams(params as Record<string, string>)
    const response = await fetch(`${API_BASE_URL}/historical/aggregate?${query}`)
    return response.json()
  },

  /**
   * Export data to CSV/Excel
   */
  exportData: async (params: {
    from: string
    to: string
    format: 'csv' | 'excel'
    meterId?: string
  }) => {
    if (MOCK_DATA_ENABLED) {
      return mockExportData(params)
    }
    const query = new URLSearchParams(params as Record<string, string>)
    const response = await fetch(`${API_BASE_URL}/historical/export?${query}`)
    return response.blob()
  },
}

// ============================================================================
// EQUIPMENT/METERS SERVICE
// ============================================================================

export const equipmentAPI = {
  /**
   * Get all equipment/meters
   */
  getAll: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockEquipmentList()
    }
    const response = await fetch(`${API_BASE_URL}/meters`)
    return response.json()
  },

  /**
   * Get single equipment details
   */
  getById: async (id: string) => {
    if (MOCK_DATA_ENABLED) {
      return mockEquipmentDetail(id)
    }
    const response = await fetch(`${API_BASE_URL}/meters/${id}`)
    return response.json()
  },

  /**
   * Create new equipment
   */
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/meters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  /**
   * Update equipment
   */
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/meters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  /**
   * Delete equipment
   */
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/meters/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },

  /**
   * Get recent readings for equipment
   */
  getReadings: async (id: string, params: { from: string; to: string }) => {
    if (MOCK_DATA_ENABLED) {
      return mockEquipmentReadings(id, params)
    }
    const query = new URLSearchParams(params as Record<string, string>)
    const response = await fetch(`${API_BASE_URL}/meters/${id}/readings?${query}`)
    return response.json()
  },
}

// ============================================================================
// ALERTS SERVICE
// ============================================================================

export const alertsAPI = {
  /**
   * Get alerts with filters
   */
  getAlerts: async (params: {
    status?: 'active' | 'acknowledged' | 'resolved'
    severity?: 'critical' | 'high' | 'medium' | 'low'
    from?: string
    to?: string
    page?: number
    pageSize?: number
  }) => {
    if (MOCK_DATA_ENABLED) {
      return mockAlertsList(params)
    }
    const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
    const response = await fetch(`${API_BASE_URL}/alerts?${query}`)
    return response.json()
  },

  /**
   * Acknowledge alert
   */
  acknowledge: async (id: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    return response.json()
  },

  /**
   * Get alert rules
   */
  getRules: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockAlertRules()
    }
    const response = await fetch(`${API_BASE_URL}/alerts/rules`)
    return response.json()
  },

  /**
   * Create alert rule
   */
  createRule: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/alerts/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  /**
   * Update alert rule
   */
  updateRule: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/alerts/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  /**
   * Delete alert rule
   */
  deleteRule: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/alerts/rules/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export const reportsAPI = {
  /**
   * Get list of reports
   */
  getList: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockReportsList()
    }
    const response = await fetch(`${API_BASE_URL}/reports`)
    return response.json()
  },

  /**
   * Generate new report
   */
  generate: async (data: {
    templateId: string
    from: string
    to: string
    format: 'pdf' | 'excel' | 'csv'
    filters?: Record<string, any>
  }) => {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  /**
   * Download report
   */
  download: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/download`)
    return response.blob()
  },

  /**
   * Get report templates
   */
  getTemplates: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockReportTemplates()
    }
    const response = await fetch(`${API_BASE_URL}/reports/templates`)
    return response.json()
  },

  /**
   * Schedule report
   */
  scheduleReport: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/reports/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export const settingsAPI = {
  /**
   * Get tariff settings
   */
  getTariff: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockTariffSettings()
    }
    const response = await fetch(`${API_BASE_URL}/settings/tariff`)
    return response.json()
  },

  /**
   * Update tariff settings
   */
  updateTariff: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/settings/tariff`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  /**
   * Get system settings
   */
  getSystem: async () => {
    if (MOCK_DATA_ENABLED) {
      return mockSystemSettings()
    }
    const response = await fetch(`${API_BASE_URL}/settings/system`)
    return response.json()
  },

  /**
   * Update system settings
   */
  updateSystem: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/settings/system`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },
}

// ============================================================================
// MOCK DATA GENERATORS - Realistic Static Data for MVP Demo
// ============================================================================

function mockRealTimeMetrics() {
  const baselinePower = 420
  const variation = Math.random() * 60 - 30 // ±30 kW variation
  return {
    success: true,
    data: {
      currentPower: baselinePower + variation,
      voltage: 229.5 + Math.random() * 2 - 1, // 228.5-230.5V
      frequency: 49.98 + Math.random() * 0.04, // 49.98-50.02 Hz
      powerFactor: 0.96 + Math.random() * 0.04, // 0.96-1.0
      timestamp: new Date().toISOString(),
    },
  }
}

function mockMetersStatus() {
  const equipment = [
    { id: 'eq-001', name: 'Panneau Principal', base: 450, variance: 50 },
    { id: 'eq-002', name: 'Sous-Panneau A', base: 180, variance: 30 },
    { id: 'eq-003', name: 'Sous-Panneau B', base: 270, variance: 40 },
    { id: 'eq-004', name: 'Ligne Production', base: 320, variance: 60 },
    { id: 'eq-005', name: 'HVAC Centrale', base: 125, variance: 25 },
  ]

  return {
    success: true,
    data: equipment.map((eq, idx) => ({
      id: eq.id,
      name: eq.name,
      status: idx === 4 ? 'offline' : 'online', // One offline for demo
      power: idx === 4 ? 0 : eq.base + Math.random() * eq.variance - eq.variance / 2,
      lastUpdate: new Date(Date.now() - idx * 5000), // Staggered updates
    })),
  }
}

function mockRealtimeUpdate() {
  const variation = Math.random() * 50 - 25
  return {
    type: 'meter:update',
    data: {
      meterId: 'eq-001',
      timestamp: new Date().toISOString(),
      power: 450 + variation,
      voltage: 229.5 + Math.random() * 2 - 1,
      frequency: 50.0 + Math.random() * 0.05 - 0.025,
    },
  }
}

function mockHistoricalData(params: any) {
  const hours = 24
  const points = []
  const now = new Date()

  // Generate realistic daily consumption pattern
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = time.getHours()

    // Peak hours 8-18, low at night
    let basePower = 300
    if (hour >= 6 && hour < 22) {
      basePower = 400 + Math.random() * 100
    } else {
      basePower = 150 + Math.random() * 50
    }

    points.push({
      timestamp: time.toISOString(),
      power: basePower,
      energy: basePower * 0.001, // kWh
      voltage: 229.5 + Math.random() * 2 - 1,
      frequency: 50.0,
    })
  }
  return { success: true, data: points }
}

function mockAggregatedData(params: any) {
  return {
    success: true,
    data: {
      total: 12500.5,
      average: 520.8,
      peak: 650.2,
      min: 120.0,
      breakdown: [
        { name: 'Panneau Principal', value: 5200, percentage: 41.6 },
        { name: 'Sous-Panneau A', value: 2800, percentage: 22.4 },
        { name: 'Sous-Panneau B', value: 3100, percentage: 24.8 },
        { name: 'Ligne Production', value: 1400, percentage: 11.2 },
      ]
    }
  }
}

function mockExportData(params: any) {
  const csv = 'timestamp,power,voltage,frequency\n' +
    '2024-01-06 10:00,450.5,230.2,50.0\n' +
    '2024-01-06 11:00,468.2,229.8,50.01\n' +
    '2024-01-06 12:00,492.1,230.1,49.99\n'
  return new Blob([csv], { type: 'text/csv' })
}

function mockEquipmentList() {
  const statuses = ['Online', 'Online', 'Online', 'Offline', 'Maintenance']
  const equipment = [
    { id: 'eq-001', name: 'Compteur Principal', type: 'Motor', power: 450.5, load: 75, temp: 42 },
    { id: 'eq-002', name: 'Sous-compteur A', type: 'Transformer', power: 180.2, load: 60, temp: 35 },
    { id: 'eq-003', name: 'Sous-compteur B', type: 'Compressor', power: 270.8, load: 82, temp: 48 },
    { id: 'eq-004', name: 'Ligne Production', type: 'Motor', power: 0, load: 0, temp: 28 },
    { id: 'eq-005', name: 'HVAC Principal', type: 'Fan', power: 125.4, load: 45, temp: 38 },
  ]

  return {
    success: true,
    data: equipment.map((eq, idx) => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      model: `ABB-${1000 + idx}`,
      serial: `SN-${10000 + idx}`,
      location: `Zone ${String.fromCharCode(65 + idx)}`,
      installDate: new Date(2023, idx, 1),
      status: statuses[idx],
      specs: {
        power: eq.power,
        load: eq.load,
        temperature: eq.temp,
        voltage: 230,
        current: eq.power / 230,
      },
      photoUrl: null,
      lastUpdate: new Date(),
    })),
  }
}

function mockEquipmentDetail(id: string) {
  return {
    success: true,
    data: {
      id,
      name: `Équipement ${id}`,
      type: 'Motor',
      model: `ABB-1000`,
      serial: `SN-${id}`,
      location: 'Zone A',
      installDate: new Date(2023, 0, 1),
      status: 'Online',
      specs: {
        power: 450.5,
        load: 75,
        temperature: 42,
        voltage: 230,
        current: 1.96,
        efficiency: 95.5,
      },
      maintenanceHistory: [
        {
          id: 'maint-001',
          equipmentId: id,
          date: new Date(2024, 0, 1),
          type: 'Preventive',
          description: 'Maintenance préventive régulière',
          technician: 'Jean Dupont',
        },
      ],
    },
  }
}

function mockEquipmentReadings(id: string, params: any) {
  return { success: true, data: [] }
}

function mockAlertsList(params: any) {
  const alerts = [
    {
      id: 'alert-001',
      equipmentId: 'eq-001',
      level: 'High',
      message: 'alerts.messages.highConsumption',
      description: 'alerts.descriptions.highConsumption',
      detectedAt: new Date(Date.now() - 2 * 60000),
      status: 'New',
      threshold: 500,
      currentValue: 550,
    },
    {
      id: 'alert-002',
      equipmentId: 'eq-003',
      level: 'Critical',
      message: 'alerts.messages.criticalTemperature',
      description: 'alerts.descriptions.criticalTemperature',
      detectedAt: new Date(Date.now() - 15 * 60000),
      status: 'Acknowledged',
      acknowledgedAt: new Date(Date.now() - 10 * 60000),
      acknowledgedBy: 'user-123',
      threshold: 50,
      currentValue: 52,
    },
    {
      id: 'alert-003',
      equipmentId: 'eq-004',
      level: 'Medium',
      message: 'alerts.messages.equipmentOffline',
      description: 'alerts.descriptions.equipmentOffline',
      detectedAt: new Date(Date.now() - 60 * 60000),
      status: 'New',
    },
    {
      id: 'alert-004',
      equipmentId: 'eq-002',
      level: 'Low',
      message: 'alerts.messages.lowPowerFactor',
      description: 'alerts.descriptions.lowPowerFactor',
      detectedAt: new Date(Date.now() - 120 * 60000),
      status: 'Resolved',
      resolvedAt: new Date(Date.now() - 30 * 60000),
    },
  ]

  return {
    success: true,
    data: {
      items: alerts,
      total: alerts.length,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      hasMore: false,
    },
  }
}

function mockAlertRules() {
  return {
    success: true,
    data: [
      {
        id: 'rule-001',
        name: 'Alerte puissance élevée',
        condition: 'power > 500',
        severity: 'high',
        enabled: true,
        notificationChannels: ['email', 'sms'],
      },
      {
        id: 'rule-002',
        name: 'Température critique',
        condition: 'temperature > 50',
        severity: 'critical',
        enabled: true,
        notificationChannels: ['email', 'sms', 'push'],
      },
      {
        id: 'rule-003',
        name: 'Équipement hors ligne',
        condition: 'status == offline',
        severity: 'medium',
        enabled: true,
        notificationChannels: ['email'],
      },
    ],
  }
}

function mockReportsList() {
  return {
    success: true,
    data: [
      {
        id: 'report-001',
        templateId: 'daily',
        name: 'Rapport quotidien - 06/01/2026',
        status: 'Generated',
        from: new Date(2026, 0, 5).toISOString(),
        to: new Date(2026, 0, 6).toISOString(),
        generatedAt: new Date(2026, 0, 6, 1, 0).toISOString(),
        fileUrl: '#',
      },
    ],
  }
}

function mockReportTemplates() {
  return {
    success: true,
    data: [
      { id: 'daily', name: 'Rapport de consommation quotidien', supportedFormats: ['pdf', 'excel'] },
      { id: 'monthly', name: 'Résumé mensuel', supportedFormats: ['pdf', 'excel'] },
      { id: 'iso50001', name: 'Rapport de conformité ISO 50001', supportedFormats: ['pdf'] },
      { id: 'cost-analysis', name: 'Analyse des coûts énergétiques', supportedFormats: ['excel', 'csv'] },
      { id: 'kpi-dashboard', name: 'Tableau de bord KPI', supportedFormats: ['pdf'] },
    ],
  }
}

function mockTariffSettings() {
  return {
    success: true,
    data: {
      peakRate: 0.25,
      offPeakRate: 0.15,
      peakHours: { start: '06:00', end: '22:00' },
      currency: 'TND',
      timezone: 'UTC+1',
      lastUpdated: new Date(2026, 0, 1).toISOString(),
    },
  }
}

function mockSystemSettings() {
  return {
    success: true,
    data: {
      companyName: 'Indusmind Energy',
      timezone: 'UTC+1',
      dateFormat: 'DD/MM/YYYY',
      theme: 'dark',
      language: 'fr',
      mailingAddress: '123 Avenue Habib Bourguiba, Tunis',
      supportEmail: 'support@indusmind.tn',
      supportPhone: '+216-12-345-678',
    },
  }
}
