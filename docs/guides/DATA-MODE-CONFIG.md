# Data Mode Configuration

Control whether the application uses real API data, mock data, or a hybrid approach.

## Environment Variable

Set `VITE_DATA_MODE` in your `.env` file:

```env
# Options: "api", "mock", "hybrid"
VITE_DATA_MODE=hybrid
```

## Modes

### `api` - Production Mode
- Uses **only real API** responses
- Throws errors if API fails
- No fallback to mock data
- Best for production environments

```env
VITE_DATA_MODE=api
```

### `mock` - Development Mode
- Uses **only mock data**
- No API calls are made
- Useful for offline development
- Useful for UI/UX testing without backend

```env
VITE_DATA_MODE=mock
```

### `hybrid` - Default Mode (Recommended)
- Tries **API first**
- Falls back to **mock data** if API fails
- Best for development when some APIs are ready
- Allows progressive migration from mock to real data

```env
VITE_DATA_MODE=hybrid
```

## Usage Patterns

### Pattern 1: Simple Check

```typescript
import { useMockData, useApiData } from '@/config/dataMode'

if (useMockData()) {
  return mockDevices
}

return await apiClient.get('/devices')
```

### Pattern 2: Using Helper (Recommended)

```typescript
import { fetchWithFallback } from '@/utils/dataFetch'
import { mockDevices } from '@/data/mockDevices'

const devices = await fetchWithFallback(
  () => apiClient.get('/devices'),
  () => mockDevices,
  { logErrors: true }
)
```

### Pattern 3: In Composables

```typescript
import { fetchWithFallback } from '@/utils/dataFetch'
import { mockTelemetry } from '@/data/mockTelemetry'

export function useTelemetry() {
  const data = ref(null)
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    
    data.value = await fetchWithFallback(
      () => apiClient.get('/telemetry'),
      () => mockTelemetry
    )
    
    loading.value = false
  }

  return { data, loading, fetch }
}
```

### Pattern 4: Selective Mock/API

```typescript
import { useApiData } from '@/config/dataMode'

// Mix API and mock data
const dashboardData = {
  // API is ready for devices
  devices: useApiData() 
    ? await apiClient.get('/devices') 
    : mockDevices,
  
  // API not ready for analytics yet
  analytics: mockAnalytics,
  
  // Use hybrid for telemetry
  telemetry: await fetchWithFallback(
    () => apiClient.get('/telemetry'),
    () => mockTelemetry
  )
}
```

## Helper Functions

### `useMockData()`
Returns `true` if mock mode is enabled.

```typescript
if (useMockData()) {
  console.log('Using mock data only')
}
```

### `useApiData()`
Returns `true` if API should be used (api or hybrid mode).

```typescript
if (useApiData()) {
  console.log('API calls will be attempted')
}
```

### `useHybridMode()`
Returns `true` if hybrid mode is enabled.

```typescript
if (useHybridMode()) {
  console.log('Will fallback to mock if API fails')
}
```

### `useApiOnly()`
Returns `true` if only API mode is enabled (no fallback).

```typescript
if (useApiOnly()) {
  console.log('No fallback - API only')
}
```

## Example: Real-World Composable

```typescript
import { ref } from 'vue'
import { fetchWithFallback } from '@/utils/dataFetch'
import { apiClient } from '@/utils/api'
import { mockDevices } from '@/data/mockDevices'

export function useDevices() {
  const devices = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchDevices() {
    loading.value = true
    error.value = null

    try {
      devices.value = await fetchWithFallback(
        // Try real API
        () => apiClient.get('/customer/devices'),
        // Fallback to mock
        () => mockDevices,
        // Log errors in dev
        { logErrors: import.meta.env.DEV }
      )
    } catch (err) {
      error.value = err
      // In api-only mode, this will throw
      // In hybrid mode, mock fallback already happened
    } finally {
      loading.value = false
    }
  }

  return { devices, loading, error, fetchDevices }
}
```

## Migration Strategy

1. **Start with `mock` mode** - Build UI with mock data
2. **Switch to `hybrid` mode** - Test API integration with fallback
3. **Move to `api` mode** - Production deployment with real API only

## Benefits

✅ **No code changes** - Switch modes via environment variable only  
✅ **Progressive migration** - Move from mock to real API gradually  
✅ **Offline development** - Work without backend  
✅ **Testing flexibility** - Test different scenarios easily  
✅ **Production ready** - API-only mode for production  

## See Also

- [dataMode.ts](../config/dataMode.ts) - Configuration
- [dataFetch.ts](../utils/dataFetch.ts) - Helper utilities
- [dataModeUsage.example.ts](../examples/dataModeUsage.example.ts) - Usage examples
