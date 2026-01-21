/**
 * Device API Service
 * Handles fetching and filtering devices from backend API
 * Supports PM2200 electrical meters and Indusmind_T_Sensor temperature sensors
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const MOCK_DATA_ENABLED = true // Set to false when real API is ready

/**
 * Device interface matching API response structure
 */
export interface Device {
  id: number
  name: string
  label: string
  deviceUUID: string
  accessToken: string
  assignedToCustomer: boolean
  customerId: number
  createdAt: string
  updatedAt: string
}

/**
 * Normalized meter interface for internal use
 */
export interface Meter {
  id: string
  name: string
  label: string
  deviceUUID: string
  type: 'meter' // All PM2200 are treated as same category
}

/**
 * Normalized sensor interface for internal use
 */
export interface Sensor {
  id: string
  name: string
  label: string
  deviceUUID: string
  type: 'sensor' // Temperature sensor
}

/**
 * Mock devices data (from response_1768381588572.json + additional PM2200 elements)
 */
const MOCK_DEVICES: Device[] = [
  // PM2200 Meters (Main Category)
  {
    id: 8,
    name: "PM2200 - TGBT Principal",
    label: "TGBT Principal",
    deviceUUID: "545ffcb0-ab9c-11f0-a05e-97f672464deb",
    accessToken: "UgPrFSjDhgKUquEwyIB8",
    assignedToCustomer: true,
    customerId: 2,
    createdAt: "2025-10-18T21:03:25.881Z",
    updatedAt: "2025-10-18T21:03:25.881Z"
  },
  {
    id: 3,
    name: "PM2200 - Climatisation Hall",
    label: "Climatisation Hall",
    deviceUUID: "f3f72da0-2f7f-11f0-81a4-050c01ec03ef",
    accessToken: "OYdnyzPDNZvOyeS1uild",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-05-18T19:12:24.369Z",
    updatedAt: "2025-11-03T11:12:16.270Z"
  },
  {
    id: 4,
    name: "PM2200 - Compresseur Zone A",
    label: "Compresseur Zone A",
    deviceUUID: "04f2b660-2f80-11f0-81a4-050c01ec03ef",
    accessToken: "AbaCddzoPbEuQMlfGMy9",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-05-18T19:12:49.107Z",
    updatedAt: "2025-11-03T11:12:16.410Z"
  },
  {
    id: 5,
    name: "PM2200 - TGBT Secondaire",
    label: "TGBT Secondaire",
    deviceUUID: "da5fd130-2f7f-11f0-81a4-050c01ec03ef",
    accessToken: "kMj8u3wYEaBfhzZvQsoY",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-05-18T19:13:15.059Z",
    updatedAt: "2025-11-03T11:12:16.539Z"
  },
  // Additional PM2200 Elements
  {
    id: 9,
    name: "PM2200 - Éclairage Général",
    label: "Éclairage Général",
    deviceUUID: "a1b2c3d0-5f80-11f0-81a4-050c01ec03ef",
    accessToken: "XyZ9wVuTsRqPoNmLkJiH",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-06-15T14:22:10.500Z",
    updatedAt: "2025-11-03T11:12:16.800Z"
  },
  {
    id: 10,
    name: "PM2200 - Compresseur Zone B",
    label: "Compresseur Zone B",
    deviceUUID: "b2c3d4e0-6f81-11f0-81a4-050c01ec03ef",
    accessToken: "AbCdEfGhIjKlMnOpQrSt",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-07-20T09:15:45.123Z",
    updatedAt: "2025-11-03T11:12:16.900Z"
  },
  {
    id: 11,
    name: "PM2200 - CVC Bureaux",
    label: "CVC Bureaux",
    deviceUUID: "c3d4e5f0-7f82-11f0-81a4-050c01ec03ef",
    accessToken: "UvWxYzAbCdEfGhIjKlMn",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-08-10T16:45:22.456Z",
    updatedAt: "2025-11-03T11:12:16.950Z"
  },
  {
    id: 12,
    name: "PM2200 - Ligne Production",
    label: "Ligne Production",
    deviceUUID: "d4e5f6g0-8f83-11f0-81a4-050c01ec03ef",
    accessToken: "OpQrStUvWxYzAbCdEfGh",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-09-05T11:30:55.789Z",
    updatedAt: "2025-11-03T11:12:17.000Z"
  },
  {
    id: 13,
    name: "PM2200 - Zone Stockage",
    label: "Zone Stockage",
    deviceUUID: "e5f6g7h0-9f84-11f0-81a4-050c01ec03ef",
    accessToken: "IjKlMnOpQrStUvWxYzAb",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-09-18T13:20:15.234Z",
    updatedAt: "2025-11-03T11:12:17.050Z"
  },
  {
    id: 14,
    name: "PM2200 - Atelier Mécanique",
    label: "Atelier Mécanique",
    deviceUUID: "f6g7h8i0-af85-11f0-81a4-050c01ec03ef",
    accessToken: "CdEfGhIjKlMnOpQrStUv",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-01T08:15:30.456Z",
    updatedAt: "2025-11-03T11:12:17.100Z"
  },
  {
    id: 15,
    name: "PM2200 - Bâtiment Est",
    label: "Bâtiment Est",
    deviceUUID: "g7h8i9j0-bf86-11f0-81a4-050c01ec03ef",
    accessToken: "WxYzAbCdEfGhIjKlMnOp",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-05T10:30:22.789Z",
    updatedAt: "2025-11-03T11:12:17.150Z"
  },
  {
    id: 16,
    name: "PM2200 - Bâtiment Ouest",
    label: "Bâtiment Ouest",
    deviceUUID: "h8i9j0k0-cf87-11f0-81a4-050c01ec03ef",
    accessToken: "QrStUvWxYzAbCdEfGhIj",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-05T10:35:45.123Z",
    updatedAt: "2025-11-03T11:12:17.200Z"
  },
  {
    id: 17,
    name: "PM2200 - Datacenter",
    label: "Datacenter",
    deviceUUID: "i9j0k1l0-df88-11f0-81a4-050c01ec03ef",
    accessToken: "KlMnOpQrStUvWxYzAbCd",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-08T14:20:18.567Z",
    updatedAt: "2025-11-03T11:12:17.250Z"
  },
  {
    id: 18,
    name: "PM2200 - Parking Sous-Sol",
    label: "Parking Sous-Sol",
    deviceUUID: "j0k1l2m0-ef89-11f0-81a4-050c01ec03ef",
    accessToken: "EfGhIjKlMnOpQrStUvWx",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-12T09:45:33.890Z",
    updatedAt: "2025-11-03T11:12:17.300Z"
  },
  {
    id: 19,
    name: "PM2200 - Cafétéria RDC",
    label: "Cafétéria RDC",
    deviceUUID: "k1l2m3n0-ff90-11f0-81a4-050c01ec03ef",
    accessToken: "YzAbCdEfGhIjKlMnOpQr",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-14T11:10:25.234Z",
    updatedAt: "2025-11-03T11:12:17.350Z"
  },
  {
    id: 20,
    name: "PM2200 - Entrepôt Logistique",
    label: "Entrepôt Logistique",
    deviceUUID: "l2m3n4o0-0f91-11f0-81a4-050c01ec03ef",
    accessToken: "StUvWxYzAbCdEfGhIjKl",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-16T13:55:40.678Z",
    updatedAt: "2025-11-03T11:12:17.400Z"
  },
  {
    id: 21,
    name: "PM2200 - Local Technique",
    label: "Local Technique",
    deviceUUID: "m3n4o5p0-1f92-11f0-81a4-050c01ec03ef",
    accessToken: "MnOpQrStUvWxYzAbCdEf",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-18T15:40:12.345Z",
    updatedAt: "2025-11-03T11:12:17.450Z"
  },
  {
    id: 22,
    name: "PM2200 - Hall Accueil",
    label: "Hall Accueil",
    deviceUUID: "n4o5p6q0-2f93-11f0-81a4-050c01ec03ef",
    accessToken: "GhIjKlMnOpQrStUvWxYz",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-10-20T08:25:55.789Z",
    updatedAt: "2025-11-03T11:12:17.500Z"
  },
  // Temperature Sensors (not PM2200)
  {
    id: 1,
    name: "Indusmind_T_Sensor_95E64C",
    label: "Zone 2",
    deviceUUID: "fc1ce180-3030-11f0-81a4-050c01ec03ef",
    accessToken: "uesmGoF8Kn3OWHYIsaVE",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-05-18T19:11:32.021Z",
    updatedAt: "2025-11-03T11:12:16.005Z"
  },
  {
    id: 2,
    name: "Indusmind_T_Sensor_9527CC",
    label: "Zone 1",
    deviceUUID: "c44ae4c0-2f7f-11f0-81a4-050c01ec03ef",
    accessToken: "01NdZW9LlxH8TNRm8ZDz",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-05-18T19:11:57.663Z",
    updatedAt: "2025-11-03T11:12:16.137Z"
  },
  {
    id: 6,
    name: "Indusmind_T_Sensor_95DC2C",
    label: "Zone 3",
    deviceUUID: "d5054c60-348e-11f0-ba36-29b3a8b296dd",
    accessToken: "C6o7mVoRWXq1h0pdn13L",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-05-19T09:09:06.971Z",
    updatedAt: "2025-11-03T11:12:16.671Z"
  },
  {
    id: 7,
    name: "Indusmind_Controller_A80C6C",
    label: "Indusmind_Controller_A80C6C",
    deviceUUID: "5ddb6820-44a8-11f0-9944-971940e1d7c1",
    accessToken: "aH4S96e7Wzof3LRcljRv",
    assignedToCustomer: true,
    customerId: 1,
    createdAt: "2025-06-11T22:39:40.337Z",
    updatedAt: "2025-11-03T11:12:16.802Z"
  }
]

/**
 * Fetch all devices from API
 * Falls back to mock data in development
 */
async function fetchAllDevices(): Promise<Device[]> {
  if (MOCK_DATA_ENABLED) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return MOCK_DEVICES
  }

  try {
    const response = await fetch(`${API_BASE_URL}/devices`)
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    // Fallback to mock data on error
    return MOCK_DEVICES
  }
}

/**
 * Filter and normalize PM2200 electrical meters
 * Rules:
 * - device.name must contain "PM2200" (e.g., "PM2200 - TGBT")
 * - All treated as same category (no grouping by TGBT, Compresseurs, etc.)
 */
export function filterMeters(devices: Device[]): Meter[] {
  return devices
    .filter(device => device.name.includes('PM2200'))
    .map(device => ({
      id: String(device.id),
      name: device.name,
      label: device.label,
      deviceUUID: device.deviceUUID,
      type: 'meter'
    }))
}

/**
 * Filter and normalize Indusmind temperature sensors
 * Rules:
 * - device.name must start with "Indusmind_T_Sensor"
 * - Exclude controllers and other devices
 */
export function filterSensors(devices: Device[]): Sensor[] {
  return devices
    .filter(device => device.name.startsWith('Indusmind_T_Sensor'))
    .map(device => ({
      id: String(device.id),
      name: device.name,
      label: device.label,
      deviceUUID: device.deviceUUID,
      type: 'sensor'
    }))
}

/**
 * Get all PM2200 electrical meters
 */
export async function getAllMeters(): Promise<Meter[]> {
  const devices = await fetchAllDevices()
  return filterMeters(devices)
}

/**
 * Get all temperature sensors
 */
export async function getAllSensors(): Promise<Sensor[]> {
  const devices = await fetchAllDevices()
  return filterSensors(devices)
}

/**
 * Get both meters and sensors in single call
 */
export async function getAllDevices(): Promise<{
  meters: Meter[]
  sensors: Sensor[]
}> {
  const devices = await fetchAllDevices()
  return {
    meters: filterMeters(devices),
    sensors: filterSensors(devices)
  }
}

/**
 * Get meter by ID
 */
export async function getMeterById(id: string): Promise<Meter | null> {
  const meters = await getAllMeters()
  return meters.find(m => m.id === id) || null
}

/**
 * Get sensor by ID
 */
export async function getSensorById(id: string): Promise<Sensor | null> {
  const sensors = await getAllSensors()
  return sensors.find(s => s.id === id) || null
}

/**
 * Search meters by name or label
 */
export async function searchMeters(query: string): Promise<Meter[]> {
  const meters = await getAllMeters()
  const lowerQuery = query.toLowerCase()
  return meters.filter(meter =>
    meter.name.toLowerCase().includes(lowerQuery) ||
    meter.label.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Search sensors by name or label
 */
export async function searchSensors(query: string): Promise<Sensor[]> {
  const sensors = await getAllSensors()
  const lowerQuery = query.toLowerCase()
  return sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(lowerQuery) ||
    sensor.label.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Compteur interface for CompteurSelector compatibility
 */
export interface Compteur {
  id: string
  name: string
  deviceUUID?: string // ThingsBoard device UUID for telemetry API
  accessToken?: string // Device access token
  category: 'PM2200' | 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  subtitle: string
  color: 'red' | 'green' | 'blue' | 'yellow'
  instantaneous: number
  today: number
  yesterday: number
  linkedEquipment: string[]
  translationKey?: string
}

/**
 * Map meter ID to color for dashboard card variety
 * Different meters get different colors for better visual distinction
 */
function mapMeterIdToColor(id: string): Compteur['color'] {
  const colors: Compteur['color'][] = ['red', 'blue', 'green', 'yellow']
  const numId = parseInt(id, 10)
  return colors[numId % colors.length]
}

/**
 * Map Meter to Compteur format for CompteurSelector
 * All PM2200 meters belong to same category (PM2200)
 */
function mapMeterToCompteur(meter: Meter): Compteur {
  const color = mapMeterIdToColor(meter.id)

  return {
    id: meter.id,
    name: meter.name, // Use full device name as display (e.g., "PM2200 - TGBT Principal")
    deviceUUID: meter.deviceUUID, // ThingsBoard device UUID for telemetry API
    category: 'PM2200', // All PM2200 are same category
    subtitle: meter.label, // Use label as subtitle (e.g., "TGBT Principal", "Climatisation Hall")
    color, // Color varies by meter ID for dashboard cards
    // Mock real-time data - replace with actual telemetry when available
    instantaneous: Math.random() * 5000 + 1000,
    today: Math.random() * 3000 + 500,
    yesterday: Math.random() * 3000 + 500,
    linkedEquipment: [],
  }
}

/**
 * Get all PM2200 meters as Compteurs for dashboard
 */
export async function getAllCompteursFromPM2200(): Promise<Compteur[]> {
  const meters = await getAllMeters()
  return meters.map(mapMeterToCompteur)
}

/**
 * Get all compteurs from Indusmind customer devices API
 * Fetches from server API and converts to Compteur format
 */
export async function getAllCompteursFromCustomerDevices(): Promise<Compteur[]> {
  try {
    const customerDevices = await getAllIndusmindCustomerDevices()
    const meters = filterMeters(customerDevices)
    return meters.map(mapMeterToCompteur)
  } catch (error) {
    console.error('Failed to fetch compteurs from customer devices:', error)
    return []
  }
}

/**
 * Fetch all Indusmind customer devices from local server API
 * Server will proxy the request to external Indusmind API
 * Endpoint: GET /customer/devices
 */
export async function getAllIndusmindCustomerDevices(): Promise<Device[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Failed to fetch Indusmind customer devices:', error)
    throw error
  }
}
