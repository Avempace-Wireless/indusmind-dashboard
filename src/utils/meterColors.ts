/**
 * Shared color palette for meters across dashboard
 * Used in both CompteurWidget cards and UnifiedChart
 */

export interface ColorConfig {
  hex: string        // Hex color for charts
  border: string     // Border color
  tailwind: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'teal' | 'orange' | 'cyan' | 'violet' | 'lime' | 'rose' | 'indigo' | 'amber' | 'emerald'
}

/**
 * Distinct color palette for up to 50+ different meters
 * Matches colors between dashboard cards and chart visualizations
 */
export const METER_COLORS: ColorConfig[] = [
  { hex: '#ef4444', border: '#dc2626', tailwind: 'red' },       // Red
  { hex: '#3b82f6', border: '#2563eb', tailwind: 'blue' },      // Blue
  { hex: '#10b981', border: '#059669', tailwind: 'green' },     // Green
  { hex: '#f59e0b', border: '#d97706', tailwind: 'amber' },     // Amber
  { hex: '#8b5cf6', border: '#7c3aed', tailwind: 'purple' },    // Purple
  { hex: '#ec4899', border: '#db2777', tailwind: 'pink' },      // Pink
  { hex: '#14b8a6', border: '#0d9488', tailwind: 'teal' },      // Teal
  { hex: '#f97316', border: '#ea580c', tailwind: 'orange' },    // Orange
  { hex: '#06b6d4', border: '#0891b2', tailwind: 'cyan' },      // Cyan
  { hex: '#a855f7', border: '#9333ea', tailwind: 'violet' },    // Violet
  { hex: '#84cc16', border: '#65a30d', tailwind: 'lime' },      // Lime
  { hex: '#f43f5e', border: '#e11d48', tailwind: 'rose' },      // Rose
  { hex: '#6366f1', border: '#4f46e5', tailwind: 'indigo' },    // Indigo
  { hex: '#eab308', border: '#ca8a04', tailwind: 'yellow' },    // Yellow
  { hex: '#22c55e', border: '#16a34a', tailwind: 'emerald' },   // Emerald
  { hex: '#fb923c', border: '#f97316', tailwind: 'orange' },    // Orange-light
  { hex: '#a78bfa', border: '#8b5cf6', tailwind: 'purple' },    // Purple-light
  { hex: '#34d399', border: '#10b981', tailwind: 'green' },     // Green-light
  { hex: '#fbbf24', border: '#f59e0b', tailwind: 'amber' },     // Amber-light
  { hex: '#60a5fa', border: '#3b82f6', tailwind: 'blue' },      // Blue-light
  // Extended palette for more unique colors
  { hex: '#dc2626', border: '#b91c1c', tailwind: 'red' },       // Red-dark
  { hex: '#2563eb', border: '#1d4ed8', tailwind: 'blue' },      // Blue-dark
  { hex: '#059669', border: '#047857', tailwind: 'green' },     // Green-dark
  { hex: '#d97706', border: '#b45309', tailwind: 'amber' },     // Amber-dark
  { hex: '#7c3aed', border: '#6d28d9', tailwind: 'violet' },    // Violet-dark
  { hex: '#db2777', border: '#be185d', tailwind: 'pink' },      // Pink-dark
  { hex: '#0d9488', border: '#0f766e', tailwind: 'teal' },      // Teal-dark
  { hex: '#ea580c', border: '#c2410c', tailwind: 'orange' },    // Orange-dark
  { hex: '#0891b2', border: '#0e7490', tailwind: 'cyan' },      // Cyan-dark
  { hex: '#9333ea', border: '#7e22ce', tailwind: 'purple' },    // Purple-dark
  { hex: '#65a30d', border: '#4d7c0f', tailwind: 'lime' },      // Lime-dark
  { hex: '#e11d48', border: '#be123c', tailwind: 'rose' },      // Rose-dark
  { hex: '#4f46e5', border: '#4338ca', tailwind: 'indigo' },    // Indigo-dark
  { hex: '#ca8a04', border: '#a16207', tailwind: 'yellow' },    // Yellow-dark
  { hex: '#16a34a', border: '#15803d', tailwind: 'emerald' },   // Emerald-dark
  { hex: '#fca5a5', border: '#f87171', tailwind: 'red' },       // Red-lighter
  { hex: '#93c5fd', border: '#60a5fa', tailwind: 'blue' },      // Blue-lighter
  { hex: '#6ee7b7', border: '#34d399', tailwind: 'green' },     // Green-lighter
  { hex: '#fcd34d', border: '#fbbf24', tailwind: 'amber' },     // Amber-lighter
  { hex: '#c4b5fd', border: '#a78bfa', tailwind: 'purple' },    // Purple-lighter
  { hex: '#f9a8d4', border: '#f472b6', tailwind: 'pink' },      // Pink-lighter
  { hex: '#5eead4', border: '#2dd4bf', tailwind: 'teal' },      // Teal-lighter
  { hex: '#fdba74', border: '#fb923c', tailwind: 'orange' },    // Orange-lighter
  { hex: '#67e8f9', border: '#22d3ee', tailwind: 'cyan' },      // Cyan-lighter
  { hex: '#ddd6fe', border: '#c4b5fd', tailwind: 'violet' },    // Violet-lighter
  { hex: '#bef264', border: '#a3e635', tailwind: 'lime' },      // Lime-lighter
  { hex: '#fda4af', border: '#fb7185', tailwind: 'rose' },      // Rose-lighter
  { hex: '#a5b4fc', border: '#818cf8', tailwind: 'indigo' },    // Indigo-lighter
  { hex: '#fde047', border: '#facc15', tailwind: 'yellow' },    // Yellow-lighter
  { hex: '#86efac', border: '#4ade80', tailwind: 'emerald' }    // Emerald-lighter
]

/**
 * Get color configuration for a meter by index
 * @param index - The index of the meter in the selection array
 * @returns Color configuration object
 */
export function getMeterColorByIndex(index: number): ColorConfig {
  return METER_COLORS[index % METER_COLORS.length]
}

/**
 * Get color configuration for a meter by ID
 * Uses meter ID for consistent coloring across sessions
 * @param meterId - The unique identifier of the meter
 * @returns Color configuration object
 */
export function getMeterColorById(meterId: string): ColorConfig {
  const numId = parseInt(meterId, 10)
  return METER_COLORS[numId % METER_COLORS.length]
}

/**
 * Get color configuration for a meter by name/label
 * Falls back to index-based color if no named match exists
 */
export function getMeterColorByName(name: string | undefined, fallbackIndex: number = 0): ColorConfig {
  if (!name) {
    return getMeterColorByIndex(fallbackIndex)
  }

  const normalized = normalizeMeterName(name)

  if (normalized.includes('tgbt')) {
    return METER_COLORS[0] // Red
  }

  if (normalized.includes('climatisation') || normalized.includes('clim')) {
    return METER_COLORS[1] // Blue
  }

  if (normalized.includes('compressor') || normalized.includes('compresseur')) {
    return METER_COLORS[2] // Green
  }

  return getMeterColorByIndex(fallbackIndex)
}

/**
 * Normalize meter name for matching (case-insensitive, strip accents)
 */
function normalizeMeterName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Get display order rank for known meters
 * Lower rank means earlier in lists
 */
export function getMeterOrderRank(name: string | undefined): number {
  if (!name) return 99

  const normalized = normalizeMeterName(name)

  if (normalized.includes('tgbt')) return 0
  if (normalized.includes('climatisation') || normalized.includes('clim')) return 1
  if (normalized.includes('compressor') || normalized.includes('compresseur')) return 2

  return 99
}
