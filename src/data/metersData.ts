/**
 * Meter Data Re-export (Backward Compatibility Layer)
 *
 * This file re-exports data from the unified mockData.ts
 * New code should import directly from mockData.ts
 * This file is kept for backward compatibility with existing code
 */

// Re-export all interfaces and data from mockData
export {
  // Interfaces
  type DataPoint,
  type TimeSeriesData,
  type KPIValues,
  type MeterMetrics,
  type MeterElement,
  type Meter,

  // Data
  CATEGORIES,
  MOCK_METERS as METERS_DATA, // Re-export MOCK_METERS as METERS_DATA for backward compatibility

  // Helper Functions
  getMetersByCategory,
  getMeterById,
  getElementData,
  getAllCategories
} from './mockData'
