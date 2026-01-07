// User & Auth Types
export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  lastLogin?: Date
}

export type Role = 'Operator' | 'Engineer' | 'Manager' | 'Admin' | 'Maintenance' | 'ComplianceOfficer'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Equipment & Monitoring Types
export interface Equipment {
  id: string
  name: string
  type: EquipmentType
  model: string
  serial: string
  location: string
  installDate: Date
  status: EquipmentStatus
  specs?: Record<string, any>
  photoUrl?: string
  maintenanceHistory?: MaintenanceRecord[]
}

export type EquipmentType =
  | 'Motor'
  | 'Transformer'
  | 'Compressor'
  | 'Fan'
  | 'Pump'
  | 'Boiler'
  | 'Other'
export type EquipmentStatus = 'Online' | 'Offline' | 'Maintenance' | 'Alert'

export interface MaintenanceRecord {
  id: string
  equipmentId: string
  date: Date
  type: 'Preventive' | 'Corrective'
  description: string
  technician: string
  notes?: string
}

// Real-Time Monitoring Types
export interface EnergyReading {
  equipmentId: string
  timestamp: Date
  power: number // watts
  consumption: number // kWh
  powerFactor: number // 0-1
  voltage: number // volts
  current: number // amps
  temperature?: number // celsius
  status: 'Normal' | 'Warning' | 'Critical'
}

export interface DashboardMetrics {
  totalPower: number
  totalConsumption: number
  averagePowerFactor: number
  costPerHour: number
  operationalStatus: 'Healthy' | 'Warning' | 'Critical'
  lastUpdated: Date
}

// Alert Types
export type AlertLevel = 'Informational' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency'
export type AlertStatus = 'New' | 'Acknowledged' | 'Resolved' | 'Escalated'

export interface Alert {
  id: string
  equipmentId: string
  level: AlertLevel
  message: string
  description?: string
  detectedAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedAt?: Date
  notes?: string
  status: AlertStatus
  threshold?: number
  currentValue?: number
}

// ISO 50001 & Compliance Types
export interface EnergyBaseline {
  id: string
  version: number
  baselineValue: number // kWh
  period: 'Monthly' | 'Yearly'
  startDate: Date
  endDate?: Date
  createdAt: Date
  immutable: boolean
}

export interface EnPI {
  id: string
  name: string
  formula: string
  unit: string
  targetValue: number
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  lastCalculation?: Date
  currentValue?: number
  trend?: number // % change
}

export interface CorrectiveAction {
  id: string
  issueId: string
  description: string
  root: string
  assignedTo: string
  targetDate: Date
  status: 'Open' | 'In Progress' | 'Verification' | 'Closed'
  completedAt?: Date
  verificationNotes?: string
  auditTrail: AuditLog[]
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  timestamp: Date
  changes?: Record<string, { old: any; new: any }>
  ipAddress: string
}

// Cost & Billing Types
export interface CostRecord {
  id: string
  date: Date
  consumption: number
  tariff: TariffInfo
  totalCost: number
  costPerUnit: number
}

export interface TariffInfo {
  peakRate: number
  offPeakRate: number
  peakHours: string
  currency: string
}

// WebSocket Types
export type WebSocketChannel =
  | 'dashboard:site_a'
  | 'dashboard:site_b'
  | 'alerts:new'
  | 'alerts:all'
  | 'global:all_sites'

export interface WebSocketMessage<T = any> {
  channel: WebSocketChannel
  data: T
  timestamp: Date
}

// Pagination & API Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}
