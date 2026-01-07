<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Reports & Compliance</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate and download energy reports
          </p>
        </div>
        <button class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition flex items-center gap-2">
          <span class="material-symbols-outlined">add</span>
          Generate Report
        </button>
      </div>

      <!-- Report Type Selector -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="type in reportTypes"
          :key="type.id"
          @click="selectedReportType = type.id"
          :class="[
            'p-4 rounded-xl border-2 cursor-pointer transition-all',
            selectedReportType === type.id
              ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500 dark:border-primary-400'
              : 'bg-white dark:bg-[#1c2534] border-gray-200 dark:border-[#2a3649] hover:border-primary-300 dark:hover:border-primary-500/50'
          ]"
        >
          <span :class="['material-symbols-outlined text-3xl', type.color]">{{ type.icon }}</span>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-2">{{ type.label }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ type.description }}</p>
        </div>
      </div>

      <!-- Report Generator -->
      <div class="bg-white dark:bg-[#1c2534] rounded-xl p-6 border border-gray-200 dark:border-[#2a3649]">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Configure Report</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">From Date</label>
            <input
              v-model="reportFrom"
              type="date"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-[#111722] border border-gray-300 dark:border-[#2a3649] rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">To Date</label>
            <input
              v-model="reportTo"
              type="date"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-[#111722] border border-gray-300 dark:border-[#2a3649] rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Export Format</label>
            <select class="w-full px-4 py-2 bg-gray-50 dark:bg-[#111722] border border-gray-300 dark:border-[#2a3649] rounded-lg text-gray-900 dark:text-white">
              <option>PDF</option>
              <option>CSV</option>
              <option>Excel</option>
              <option>JSON</option>
            </select>
          </div>
        </div>
        <button class="mt-4 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition">
          Generate & Download
        </button>
      </div>

      <!-- Recent Reports -->
      <div class="bg-white dark:bg-[#1c2534] rounded-xl border border-gray-200 dark:border-[#2a3649] overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-[#2a3649]">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Recent Reports</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-[#111722] border-b border-gray-200 dark:border-[#2a3649]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Report Type</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Period</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Generated</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Format</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-[#2a3649]">
              <tr v-for="report in recentReports" :key="report.id" class="hover:bg-gray-50 dark:hover:bg-[#232f48] transition">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ report.type }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ report.period }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ report.generated }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {{ report.format }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button class="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium">Download</button>
                    <button class="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

interface Report {
  id: string
  type: string
  period: string
  generated: string
  format: string
}

const selectedReportType = ref('daily')
const reportFrom = ref('')
const reportTo = ref('')

const reportTypes = [
  {
    id: 'daily',
    label: 'Daily Report',
    description: 'Daily consumption summary',
    icon: 'event_day',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'weekly',
    label: 'Weekly Report',
    description: 'Week-by-week analysis',
    icon: 'calendar_month',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'monthly',
    label: 'Monthly Report',
    description: 'Full month analysis',
    icon: 'calendar_today',
    color: 'text-orange-600 dark:text-orange-400'
  },
  {
    id: 'compliance',
    label: 'Compliance Report',
    description: 'Regulatory compliance check',
    icon: 'verified_user',
    color: 'text-red-600 dark:text-red-400'
  }
]

const recentReports: Report[] = [
  {
    id: '1',
    type: 'Daily Report',
    period: '2026-01-06',
    generated: '2 hours ago',
    format: 'PDF'
  },
  {
    id: '2',
    type: 'Weekly Report',
    period: 'Week 1, Jan 2026',
    generated: 'Jan 5, 2026',
    format: 'Excel'
  },
  {
    id: '3',
    type: 'Monthly Report',
    period: 'December 2025',
    generated: 'Jan 1, 2026',
    format: 'PDF'
  },
  {
    id: '4',
    type: 'Compliance Report',
    period: '2025',
    generated: 'Dec 31, 2025',
    format: 'PDF'
  }
]

// Initialize with today and 30 days ago
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

reportFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
reportTo.value = today.toISOString().split('T')[0]
</script>
