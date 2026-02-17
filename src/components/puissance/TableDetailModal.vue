<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 dark:bg-black/70 z-[100000] backdrop-blur-sm"
        @click="closeModal"
      />
    </Transition>

    <!-- Modal -->
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100001] flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
          <!-- Header -->
          <div class="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ tableTitle }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ meterName }}</p>
            </div>
            <button
              @click="closeModal"
              class="ml-4 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition text-gray-600 dark:text-gray-400"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Toolbar -->
          <div class="px-8 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div class="flex flex-col md:flex-row md:items-center gap-4">
              <!-- Search -->
              <div class="flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('tableDetailModal.searchPlaceholder')"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <!-- Period Tabs -->
              <div class="flex gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                <button
                  v-for="period in ['hourly', 'daily', 'monthly'] as const"
                  :key="period"
                  @click="activePeriod = period"
                  :class="[
                    'px-3 py-2 rounded-md font-medium text-sm transition',
                    activePeriod === period
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  ]"
                >
                  {{ t(`tableDetailModal.${period}`) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-slate-800 sticky top-0">
                  <tr class="border-b border-gray-200 dark:border-slate-700">
                    <th
                      v-for="col in columns"
                      :key="col.key"
                      @click="toggleSort(col.key)"
                      class="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition select-none"
                    >
                      <div class="flex items-center gap-2">
                        {{ col.label }}
                        <span v-if="sortBy === col.key" class="text-xs font-bold text-gray-500 dark:text-gray-400">
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
                    <td v-for="col in columns" :key="col.key" class="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      <div class="flex items-center gap-2">
                        <!-- Icon for date/time columns -->
                        <span v-if="col.format === 'date'" class="material-symbols-outlined text-sm text-blue-500 dark:text-blue-400 flex-shrink-0">calendar_today</span>
                        <span v-else-if="col.format === 'time'" class="material-symbols-outlined text-sm text-purple-500 dark:text-purple-400 flex-shrink-0">schedule</span>
                        <!-- Formatted value -->
                        <span>
                          {{ formatCell(row[col.key], col.format) }}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredData.length === 0" class="text-center py-16 px-6">
              <p class="text-gray-500 dark:text-gray-400">{{ t('tableDetailModal.noDataFound') }}</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="px-8 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('tableDetailModal.showing') }} <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> {{ t('tableDetailModal.to') }} <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredData.length) }}</span> {{ t('tableDetailModal.of') }} <span class="font-semibold">{{ filteredData.length }}</span>
              </p>
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  {{ t('common.previous') }}
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
                  {{ t('common.next') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-4 border-t border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex justify-between items-center gap-3">
            <div class="flex gap-2">
              <button
                @click="exportToCSV"
                class="px-3 py-2 rounded-lg border border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center gap-2"
                title="Export CSV"
              >
                <span class="material-symbols-outlined text-lg">description</span>
                <span class="text-sm">CSV</span>
              </button>
              <button
                @click="exportToExcel"
                class="px-3 py-2 rounded-lg border border-green-500 dark:border-green-600 text-green-700 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition flex items-center gap-2"
                title="Export Excel"
              >
                <span class="material-symbols-outlined text-lg">table_chart</span>
                <span class="text-sm">Excel</span>
              </button>
              <button
                @click="exportToPDF"
                class="px-3 py-2 rounded-lg border border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                title="Export  PDF"
              >
                <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
                <span class="text-sm">PDF</span>
              </button>
            </div>
            <button
              @click="closeModal"
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg transition"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface TableColumn {
  key: string
  label: string
  format?: 'date' | 'time' | 'datetime' | 'number' | 'default'
}

interface Props {
  isOpen: boolean
  tableTitle: string
  meterName: string
  hourlyData: Record<string, any>[]
  dailyData: Record<string, any>[]
  monthlyData: Record<string, any>[]
  initialPeriod?: 'hourly' | 'daily' | 'monthly'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const searchQuery = ref('')
const activePeriod = ref<'hourly' | 'daily' | 'monthly'>(props.initialPeriod || 'hourly')
const currentPage = ref(1)
const sortBy = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const itemsPerPage = 15

// Watch for prop changes and update active period when modal opens
watch(() => props.initialPeriod, (newPeriod) => {
  if (newPeriod) {
    activePeriod.value = newPeriod
    currentPage.value = 1 // Reset to first page
  }
}, { immediate: true })

// Reset when modal opens to ensure correct initial period display
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.initialPeriod) {
    activePeriod.value = props.initialPeriod
    currentPage.value = 1
    searchQuery.value = ''
  }
})

const closeModal = () => {
  emit('close')
}

const currentData = computed(() => {
  switch (activePeriod.value) {
    case 'daily':
      return props.dailyData
    case 'monthly':
      return props.monthlyData
    default:
      return props.hourlyData
  }
})

// Dynamic columns based on active period
const columns = computed<TableColumn[]>(() => {
  const timestampFormat = activePeriod.value === 'hourly' ? 'time' : 'date'

  return [
    {
      key: 'timestamp',
      label: t('puissance.tables.columns.timestamp'),
      format: timestampFormat
    },
    {
      key: 'power',
      label: t('puissance.tables.columns.power'),
      format: 'number'
    },
  ]
})

const filteredData = computed(() => {
  let result = [...currentData.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query)
      )
    )
  }

  // Sort
  if (sortBy.value) {
    result.sort((a, b) => {
      const aVal = a[sortBy.value!]
      const bVal = b[sortBy.value!]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(start, start + itemsPerPage)
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

  // Helper to format date as DD/MM/YYYY (more user-friendly for daily data)
  const formatDate = (date: Date): string => {
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${day}/${month}/${year}` // European format: DD/MM/YYYY
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

const exportToCSV = () => {
  // Helper to escape CSV values properly
  const escapeCSV = (value: string): string => {
    const str = value ?? ''
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Generate CSV
  const headers = columns.value.map((c) => escapeCSV(c.label)).join(',')
  const rows = filteredData.value.map((row) =>
    columns.value.map((col) => escapeCSV(formatCell(row[col.key], col.format))).join(',')
  )
  const csv = [headers, ...rows].join('\r\n')

  // Add UTF-8 BOM
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csv

  // Download CSV file
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${props.tableTitle}-${activePeriod.value}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

const exportToExcel = () => {
  // Generate Excel XML (SpreadsheetML format)
  const escapeXML = (str: string): string => {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // Build Excel XML
  let excelXML = `<?xml version="1.0" encoding="UTF-8"?>\n`
  excelXML += `<?mso-application progid="Excel.Sheet"?>\n`
  excelXML += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`
  excelXML += `  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`
  excelXML += `  <Worksheet ss:Name="${escapeXML(activePeriod.value)}">\n`
  excelXML += `    <Table>\n`

  // Header row
  excelXML += `      <Row>\n`
  columns.value.forEach(col => {
    excelXML += `        <Cell><Data ss:Type="String">${escapeXML(col.label)}</Data></Cell>\n`
  })
  excelXML += `      </Row>\n`

  // Data rows
  filteredData.value.forEach(row => {
    excelXML += `      <Row>\n`
    columns.value.forEach(col => {
      const value = formatCell(row[col.key], col.format)
      const type = col.format === 'number' ? 'Number' : 'String'
      excelXML += `        <Cell><Data ss:Type="${type}">${escapeXML(value)}</Data></Cell>\n`
    })
    excelXML += `      </Row>\n`
  })

  excelXML += `    </Table>\n`
  excelXML += `  </Worksheet>\n`
  excelXML += `</Workbook>`

  // Download Excel file
  const blob = new Blob([excelXML], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${props.tableTitle}-${activePeriod.value}.xls`
  link.click()
  URL.revokeObjectURL(link.href)
}

const exportToPDF = () => {
  // Create a printable HTML document
  const printWindow = window.open('', '', 'width=800,height=600')
  if (!printWindow) return

  const tableHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${props.tableTitle}</title>
      <style>
        @media print {
          @page { margin: 1cm; }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #1f2937;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 8px;
          color: #111827;
        }
        .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .info {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 20px;
          font-size: 11px;
          color: #9ca3af;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>${props.tableTitle}</h1>
      <div class="subtitle">${props.meterName}</div>
      <div class="info">Period: ${activePeriod.value.toUpperCase()} | Generated: ${new Date().toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            ${columns.value.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filteredData.value.map(row => `
            <tr>
              ${columns.value.map(col => `<td>${formatCell(row[col.key], col.format)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        ${filteredData.value.length} records | Exported from Indusmind Dashboard
      </div>
    </body>
    </html>
  `

  printWindow.document.write(tableHTML)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print()
    // Close window after printing (user can cancel)
    printWindow.onafterprint = () => printWindow.close()
  }
}
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
