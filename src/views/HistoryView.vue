<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Historical Data</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and analyze historical energy consumption
          </p>
        </div>
        <button class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition flex items-center gap-2">
          <span class="material-symbols-outlined">download</span>
          Export Data
        </button>
      </div>

      <!-- Select Meters Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5 border-2 border-slate-300 dark:border-slate-600">
        <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
          {{ $t('compteur.selector.title') }}
        </h3>

        <!-- Category Cards with Icons Below -->
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="category in meterCategories"
            :key="category"
            @click="selectedCategory = selectedCategory === category ? null : category"
            :class="[
              'px-2 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2',
              selectedCategory === category
                ? 'text-white shadow-lg border-transparent'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
            :style="selectedCategory === category ? {
              background: `linear-gradient(135deg, ${getCategoryColor(category)} 0%, ${adjustBrightness(getCategoryColor(category), -15)} 100%)`
            } : {}"
            :title="$t('common.filter') + ': ' + category"
          >
            <!-- Category Icon -->
            <span class="material-symbols-outlined text-xl">{{ getCategoryIcon(category) }}</span>
            <!-- Category Label -->
            <span class="text-xs font-medium text-center leading-tight">{{ $t(getCategoryTranslationKey(category)) }}</span>
          </button>
        </div>
      </div>

      <!-- Time Range Selector -->
      <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">From Date</label>
            <input
              v-model="dateFrom"
              type="date"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-[#111722] border border-gray-300 dark:border-[#2a3649] rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">To Date</label>
            <input
              v-model="dateTo"
              type="date"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-[#111722] border border-gray-300 dark:border-[#2a3649] rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div class="flex items-end gap-2">
            <button
              v-for="preset in datePresets"
              :key="preset.label"
              @click="applyPreset(preset)"
              class="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#324467] text-gray-900 dark:text-white rounded-lg transition"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Compare with Previous Period -->
      <div class="flex items-center gap-2">
        <input
          v-model="compareWithPrevious"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-300"
        />
        <label class="text-sm font-medium text-gray-900 dark:text-white">Compare with previous period</label>
      </div>

      <!-- Summary Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Consumption</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ categoryStats.total }} kWh</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">↓ 5.2% vs previous</p>
        </div>
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Peak Consumption</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ categoryStats.peak }} kW</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-1">↑ 2.1% vs previous</p>
        </div>
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Average Power</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{{ categoryStats.avg }} kW</p>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">No change</p>
        </div>
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">${{ categoryStats.cost }}</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">↓ 4.8% savings</p>
        </div>
      </div>

      <!-- Historical Chart -->
      <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Consumption Trend</h2>
          <div class="flex gap-2">
            <button
              v-for="granularity in granularities"
              :key="granularity"
              @click="selectedGranularity = granularity"
              :class="[
                'px-3 py-1 rounded text-xs font-medium transition',
                selectedGranularity === granularity
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-[#232f48] text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              {{ granularity }}
            </button>
          </div>
        </div>
        <div class="h-80 bg-gray-50 dark:bg-[#111722] rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
          Chart visualization would be rendered here using Chart.js or similar library
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white dark:bg-[#1c2534] rounded-xl border border-gray-200 dark:border-[#2a3649] overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-[#2a3649]">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Detailed Data</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-[#111722] border-b border-gray-200 dark:border-[#2a3649]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Time</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Power (kW)</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Voltage (V)</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Temperature (°C)</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-[#2a3649]">
              <tr v-for="(data, index) in historicalData" :key="index" class="hover:bg-gray-50 dark:hover:bg-[#232f48] transition">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ data.date }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ data.time }}</td>
                <td class="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{{ data.power }}</td>
                <td class="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{{ data.voltage }}</td>
                <td class="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{{ data.temperature }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    {{ data.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="p-4 border-t border-gray-200 dark:border-[#2a3649] flex items-center justify-between bg-gray-50 dark:bg-[#111722]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Showing 1-10 of 156 records</p>
          <div class="flex gap-2">
            <button class="px-3 py-2 text-sm border border-gray-300 dark:border-[#2a3649] rounded hover:bg-gray-100 dark:hover:bg-[#232f48]">Previous</button>
            <button class="px-3 py-2 text-sm bg-primary-500 text-white rounded">1</button>
            <button class="px-3 py-2 text-sm border border-gray-300 dark:border-[#2a3649] rounded hover:bg-gray-100 dark:hover:bg-[#232f48]">2</button>
            <button class="px-3 py-2 text-sm border border-gray-300 dark:border-[#2a3649] rounded hover:bg-gray-100 dark:hover:bg-[#232f48]">Next</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const metersStore = useMetersStore()

interface HistoricalRecord {
  date: string
  time: string
  power: string
  voltage: string
  temperature: string
  status: string
}

const dateFrom = ref('')
const dateTo = ref('')
const compareWithPrevious = ref(false)
const selectedGranularity = ref('Hourly')
const selectedCategory = ref<string | null>('TGBT')
const granularities = ['Hourly', 'Daily', 'Weekly', 'Monthly']

const datePresets = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 }
]

// Get unique meter categories
const meterCategories = computed(() => {
  const categories = Array.from(new Set(metersStore.allMeters.map(m => m.category)))
  // Order: TGBT, Compresseurs, Clim, Éclairage
  const order = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage']
  return categories.sort((a, b) => order.indexOf(a) - order.indexOf(b)).slice(0, 4)
})

// Filter meters by selected category
const filteredMeters = computed(() => {
  if (!selectedCategory.value) return metersStore.allMeters
  return metersStore.allMeters.filter(m => m.category === selectedCategory.value)
})

// Category-based statistics
const categoryStats = computed(() => {
  const stats: Record<string, { total: number; peak: number; avg: number; cost: number }> = {
    'TGBT': { total: 125.8, peak: 15.2, avg: 5.2, cost: 15.10 },
    'Compresseurs': { total: 85.4, peak: 8.5, avg: 3.6, cost: 10.25 },
    'Clim': { total: 65.2, peak: 6.8, avg: 2.7, cost: 7.83 },
    'Éclairage': { total: 45.8, peak: 5.2, avg: 1.9, cost: 5.49 }
  }
  return stats[selectedCategory.value || 'TGBT'] || stats['TGBT']
})

/**
 * Get color for category
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'TGBT': '#ef4444',
    'Compresseurs': '#22c55e',
    'Clim': '#3b82f6',
    'Éclairage': '#f59e0b',
    'Eclairage': '#f59e0b',
  }
  return colors[category] || '#6b7280'
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'TGBT': 'bolt',
    'Compresseurs': 'air',
    'Clim': 'ac_unit',
    'Éclairage': 'light_mode',
    'Eclairage': 'light_mode',
  }
  return icons[category] || 'electric_meter'
}

/**
 * Get translation key for category
 */
function getCategoryTranslationKey(category: string): string {
  const keys: Record<string, string> = {
    'TGBT': 'categories.tgbt',
    'Compresseurs': 'categories.compressors',
    'Clim': 'categories.cooling',
    'Éclairage': 'categories.lighting',
    'Eclairage': 'categories.lighting'
  }
  return keys[category] || category
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#'
  const col = usePound ? color.slice(1) : color
  const num = parseInt(col, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return (usePound ? '#' : '') + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

const historicalData: HistoricalRecord[] = [
  { date: '2026-01-06', time: '14:00', power: '2.45', voltage: '230', temperature: '38', status: 'Normal' },
  { date: '2026-01-06', time: '13:00', power: '2.38', voltage: '229', temperature: '37', status: 'Normal' },
  { date: '2026-01-06', time: '12:00', power: '2.52', voltage: '231', temperature: '39', status: 'Normal' },
  { date: '2026-01-05', time: '23:00', power: '1.85', voltage: '228', temperature: '35', status: 'Normal' },
  { date: '2026-01-05', time: '22:00', power: '1.92', voltage: '229', temperature: '36', status: 'Normal' },
  { date: '2026-01-05', time: '21:00', power: '2.15', voltage: '230', temperature: '37', status: 'Normal' },
  { date: '2026-01-05', time: '20:00', power: '2.38', voltage: '230', temperature: '38', status: 'Normal' },
  { date: '2026-01-05', time: '19:00', power: '2.65', voltage: '231', temperature: '39', status: 'Normal' },
  { date: '2026-01-05', time: '18:00', power: '3.12', voltage: '232', temperature: '42', status: 'Normal' },
  { date: '2026-01-05', time: '17:00', power: '2.95', voltage: '231', temperature: '40', status: 'Normal' }
]

function applyPreset(preset: any) {
  const today = new Date()
  const from = new Date(today)
  from.setDate(from.getDate() - preset.days)

  dateFrom.value = from.toISOString().split('T')[0]
  dateTo.value = today.toISOString().split('T')[0]
}

// Initialize with last 7 days
applyPreset(datePresets[0])
</script>
