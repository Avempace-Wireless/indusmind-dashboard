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
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">45.8 kWh</p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">↓ 5.2% vs previous</p>
        </div>
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Peak Consumption</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">5.2 kW</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-1">↑ 2.1% vs previous</p>
        </div>
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Average Power</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">1.9 kW</p>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">No change</p>
        </div>
        <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
          <p class="text-sm text-gray-600 dark:text-gray-400">Estimated Cost</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">$5.49</p>
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
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

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
const granularities = ['Hourly', 'Daily', 'Weekly', 'Monthly']

const datePresets = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 }
]

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
