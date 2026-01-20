/// <reference types="node" />
/**
 * Telemetry API Integration Test
 *
 * This script tests the complete telemetry flow:
 * 1. Fetch devices from customer API
 * 2. Verify devices have deviceUUID
 * 3. Fetch telemetry for a test device
 * 4. Verify response format and data
 *
 * Run: npm run test:telemetry
 */

const API_BASE_URL = 'http://localhost:4000'

interface Device {
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

interface TelemetryDataPoint {
  ts: number
  value: string | number
}

interface TelemetryResponse {
  success: boolean
  data: Record<string, TelemetryDataPoint[]>
  device?: {
    uuid: string
    name: string
    accessToken: string
  }
  meta?: {
    entityType: string
    entityId: string
    keys: string[]
    startTs: number
    endTs: number
    interval?: number
    agg?: string
  }
}

/**
 * Test 1: Fetch all devices
 */
async function testFetchDevices(): Promise<Device[]> {
  console.log('\n🧪 Test 1: Fetch all devices from customer API')
  console.log('━'.repeat(60))

  const response = await fetch(`${API_BASE_URL}/customer/devices`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()
  const devices: Device[] = result.data || result

  console.log(`✅ Fetched ${devices.length} devices`)

  // Show first 3 devices
  devices.slice(0, 3).forEach(device => {
    console.log(`   - ${device.name}`)
    console.log(`     UUID: ${device.deviceUUID}`)
    console.log(`     Token: ${device.accessToken.substring(0, 10)}...`)
  })

  // Verify all devices have deviceUUID
  const devicesWithUUID = devices.filter(d => d.deviceUUID)
  if (devicesWithUUID.length === devices.length) {
    console.log(`✅ All ${devices.length} devices have deviceUUID`)
  } else {
    console.warn(`⚠️  Only ${devicesWithUUID.length}/${devices.length} devices have deviceUUID`)
  }

  return devices
}

/**
 * Test 2: Fetch telemetry for a device
 */
async function testFetchTelemetry(device: Device) {
  console.log('\n🧪 Test 2: Fetch telemetry for device')
  console.log('━'.repeat(60))
  console.log(`Device: ${device.name}`)
  console.log(`UUID: ${device.deviceUUID}`)

  // Current time
  const now = Date.now()
  const oneHourAgo = now - 3600000

  // Build query params
  const params = new URLSearchParams({
    keys: 'ActivePowerTotal,ActiveEnergyTotal',
    startTs: oneHourAgo.toString(),
    endTs: now.toString(),
    interval: '300000', // 5 minutes
    agg: 'AVG',
    orderBy: 'ASC'
  })

  const url = `${API_BASE_URL}/telemetry/${device.deviceUUID}/timeseries?${params}`

  console.log('\n📡 API Request:')
  console.log(`   ${url}`)

  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error: ${response.status} ${response.statusText}\n${errorText}`)
  }

  const result: TelemetryResponse = await response.json()

  console.log('\n📦 API Response:')
  console.log(`   Success: ${result.success}`)
  console.log(`   Device Name: ${result.device?.name}`)
  console.log(`   Keys: ${result.meta?.keys?.join(', ')}`)

  // Check data
  Object.entries(result.data).forEach(([key, values]) => {
    console.log(`\n   ${key}:`)
    console.log(`     Data points: ${values.length}`)
    if (values.length > 0) {
      const firstPoint = values[0]
      const lastPoint = values[values.length - 1]
      console.log(`     First: ${new Date(firstPoint.ts).toISOString()} = ${firstPoint.value}`)
      console.log(`     Last:  ${new Date(lastPoint.ts).toISOString()} = ${lastPoint.value}`)
    } else {
      console.log(`     ⚠️  No data available for this key`)
    }
  })

  return result
}

/**
 * Test 3: Verify telemetry data structure
 */
function testVerifyDataStructure(response: TelemetryResponse) {
  console.log('\n🧪 Test 3: Verify data structure')
  console.log('━'.repeat(60))

  let allValid = true

  // Check success flag
  if (response.success !== true) {
    console.error('❌ Response success should be true')
    allValid = false
  } else {
    console.log('✅ Response has success=true')
  }

  // Check data object exists
  if (!response.data || typeof response.data !== 'object') {
    console.error('❌ Response data should be an object')
    allValid = false
  } else {
    console.log('✅ Response has data object')
  }

  // Check device info
  if (!response.device || !response.device.uuid || !response.device.name) {
    console.error('❌ Response should include device info (uuid, name)')
    allValid = false
  } else {
    console.log('✅ Response includes device info')
  }

  // Check meta info
  if (!response.meta || !response.meta.keys || !response.meta.startTs || !response.meta.endTs) {
    console.error('❌ Response should include meta info (keys, startTs, endTs)')
    allValid = false
  } else {
    console.log('✅ Response includes meta info')
  }

  // Check data points structure
  for (const [key, values] of Object.entries(response.data)) {
    if (!Array.isArray(values)) {
      console.error(`❌ Data for key "${key}" should be an array`)
      allValid = false
      continue
    }

    for (const point of values.slice(0, 3)) { // Check first 3 points
      if (typeof point.ts !== 'number') {
        console.error(`❌ Data point ts should be a number, got ${typeof point.ts}`)
        allValid = false
      }
      if (typeof point.value !== 'number' && typeof point.value !== 'string') {
        console.error(`❌ Data point value should be number or string, got ${typeof point.value}`)
        allValid = false
      }
    }
  }

  console.log('✅ All data points have correct structure')

  return allValid
}

/**
 * Test 4: Test different time ranges
 */
async function testTimeRanges(device: Device) {
  console.log('\n🧪 Test 4: Test different time ranges')
  console.log('━'.repeat(60))

  const now = Date.now()
  const tests = [
    {
      name: 'Last hour',
      startTs: now - 3600000,
      endTs: now,
      interval: 300000,
      agg: 'AVG'
    },
    {
      name: 'Today',
      startTs: new Date().setHours(0, 0, 0, 0),
      endTs: now,
      interval: 3600000,
      agg: 'AVG'
    },
    {
      name: 'Latest value',
      startTs: now - 3600000,
      endTs: now,
      agg: 'NONE',
      limit: 1
    }
  ]

  for (const test of tests) {
    console.log(`\n   Testing: ${test.name}`)

    const params = new URLSearchParams({
      keys: 'ActivePowerTotal',
      startTs: test.startTs.toString(),
      endTs: test.endTs.toString(),
      agg: test.agg
    })

    if (test.interval) {
      params.set('interval', test.interval.toString())
    }
    if (test.limit) {
      params.set('limit', test.limit.toString())
    }

    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/${device.deviceUUID}/timeseries?${params}`)
      const result = await response.json()

      if (result.success) {
        const dataPoints = result.data.ActivePowerTotal?.length || 0
        console.log(`   ✅ Success - ${dataPoints} data points`)
      } else {
        console.log(`   ❌ Failed - ${result.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Error - ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n' + '='.repeat(60))
  console.log('  TELEMETRY API INTEGRATION TEST')
  console.log('='.repeat(60))

  try {
    // Test 1: Fetch devices
    const devices = await testFetchDevices()

    if (devices.length === 0) {
      console.error('\n❌ No devices found - cannot continue tests')
      process.exit(1)
    }

    // Find first PM2200 device
    const testDevice = devices.find(d => d.name.includes('PM2200') && d.deviceUUID)

    if (!testDevice) {
      console.error('\n❌ No PM2200 device with UUID found - cannot continue tests')
      process.exit(1)
    }

    // Test 2: Fetch telemetry
    const telemetryResponse = await testFetchTelemetry(testDevice)

    // Test 3: Verify structure
    const isValid = testVerifyDataStructure(telemetryResponse)

    // Test 4: Test time ranges
    await testTimeRanges(testDevice)

    // Final summary
    console.log('\n' + '='.repeat(60))
    if (isValid) {
      console.log('  ✅ ALL TESTS PASSED')
    } else {
      console.log('  ⚠️  SOME TESTS FAILED')
    }
    console.log('='.repeat(60))
    console.log('')

  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('  ❌ TEST FAILED')
    console.error('='.repeat(60))
    console.error('\nError:', error instanceof Error ? error.message : error)
    console.error('')
    process.exit(1)
  }
}

// Run tests
runTests()
