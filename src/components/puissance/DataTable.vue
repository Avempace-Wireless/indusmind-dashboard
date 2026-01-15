<template>
  <div class="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
      <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ title }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ realtimeLabel }}</p>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 sticky top-0">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              @click="toggleSort(column.key)"
            >
              <div class="flex items-center gap-2 select-none">
                {{ column.label }}
                <span v-if="sortBy === column.key" class="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
                <span v-else class="text-xs text-gray-400 dark:text-gray-500 opacity-50">↕</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in paginatedData"
            :key="idx"
            class="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <td v-for="column in columns" :key="column.key" class="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
              <div class="flex items-center gap-2">
                <!-- Icon for date/time columns -->
                <span v-if="column.format === 'date' || column.format === 'datetime'" class="material-symbols-outlined text-sm text-blue-500 dark:text-blue-400 flex-shrink-0">calendar_today</span>
                <span v-else-if="column.format === 'time'" class="material-symbols-outlined text-sm text-purple-500 dark:text-purple-400 flex-shrink-0">schedule</span>
                <!-- Formatted value with tooltip showing original timestamp -->
                <span :title="`Original: ${row[column.key]}`" class="cursor-help">
                  {{ formatCell(row[column.key], column.format) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredData.length === 0" class="text-center py-16 px-6">
      <p class="text-gray-500 dark:text-gray-400 text-base">No data available</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
      <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Showing <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredData.length) }}</span> of <span class="font-semibold">{{ filteredData.length }}</span>
      </p>
      <div class="flex items-center justify-between gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          Previous
        </button>
        <div class="flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="typeof page === 'number' && (currentPage = page)"
            :disabled="page === '...'"
            :class="[
              'min-w-10 px-3 py-2 rounded-lg border font-medium transition',
              typeof page === 'number' && currentPage === page
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-md'
                : page === '...'
                ? 'border-transparent text-gray-500 dark:text-gray-400 cursor-default hover:bg-transparent'
                : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            ]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface TableColumn {
  key: string
  label: string
  format?: 'date' | 'time' | 'datetime' | 'number' | 'default'
}

interface Props {
  title: string
  realtimeLabel: string
  columns: TableColumn[]
  data: Record<string, any>[]
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
})

const currentPage = ref(1)
const sortBy = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const filteredData = computed(() => {
  let sorted = [...props.data]

  if (sortBy.value) {
    sorted.sort((a, b) => {
      const aVal = a[sortBy.value!]
      const bVal = b[sortBy.value!]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return sorted
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / props.itemsPerPage))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  return filteredData.value.slice(start, start + props.itemsPerPage)
})

const visiblePages = computed(() => {
  const pages: (string | number)[] = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)

  let start = Math.max(1, currentPage.value - halfVisible)
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages.value) {
    if (end < totalPages.value - 1) pages.push('...')
    pages.push(totalPages.value)
  }

  return pages
})

const toggleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

const formatCell = (value: any, format?: string): string => {
  // Helper to parse ISO 8601 timestamps safely
  const parseDate = (val: any): Date | null => {
    try {
      // Handle null/undefined
      if (!val) return null

      // Handle ISO 8601 format: 2026-01-14T23:00:00.000Z
      if (typeof val === 'string' && val.includes('T')) {
        const date = new Date(val)
        // Verify it's a valid date
        if (!isNaN(date.getTime())) {
          return date
        }
        return null
      }

      // Handle numeric timestamps (milliseconds since epoch)
      if (typeof val === 'number' && val > 0) {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          return date
        }
        return null
      }

      // Handle date strings or other formats
      if (typeof val === 'string') {
        const date = new Date(val)
        if (!isNaN(date.getTime())) {
          return date
        }
      }

      return null
    } catch {
      return null
    }
  }

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return ''
    }
  }

  // Helper to format time as HH:MM:SS
  const formatTime = (date: Date): string => {
    try {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    } catch {
      return ''
    }
  }

  // Always try to parse ISO timestamps first
  const parsedDate = parseDate(value)

  if (format === 'date') {
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      return formatDate(parsedDate)
    }
    return value ? String(value) : '—'
  }

  if (format === 'time') {
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      return formatTime(parsedDate)
    }
    return value ? String(value) : '—'
  }

  if (format === 'datetime') {
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      return `${formatDate(parsedDate)} ${formatTime(parsedDate)}`
    }
    return value ? String(value) : '—'
  }

  if (format === 'number') {
    const num = Number(value)
    if (!isNaN(num) && isFinite(num)) {
      return num.toFixed(2).replace(/\.?0+$/, '')
    }
    return value ? String(value) : '—'
  }

  // Default format - if it looks like an ISO timestamp, format it as datetime
  if (parsedDate && !isNaN(parsedDate.getTime()) && typeof value === 'string' && value.includes('T')) {
    return `${formatDate(parsedDate)} ${formatTime(parsedDate)}`
  }

  return value ? String(value) : '—'
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
