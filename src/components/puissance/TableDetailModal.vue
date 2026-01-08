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
                  placeholder="Search records..."
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
                  {{ period.charAt(0).toUpperCase() + period.slice(1) }}
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
                      {{ formatCell(row[col.key], col.format) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-if="filteredData.length === 0" class="text-center py-16 px-6">
              <p class="text-gray-500 dark:text-gray-400">No data matching your search</p>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="px-8 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Showing <span class="font-semibold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-semibold">{{ Math.min(currentPage * itemsPerPage, filteredData.length) }}</span> of <span class="font-semibold">{{ filteredData.length }}</span>
              </p>
              <div class="flex items-center justify-center gap-2">
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

          <!-- Footer -->
          <div class="px-8 py-4 border-t border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex justify-end gap-3">
            <button
              @click="exportTable"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span class="material-symbols-outlined inline mr-2 text-lg align-text-bottom">download</span>
              Export CSV
            </button>
            <button
              @click="closeModal"
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TableColumn {
  key: string
  label: string
  format?: 'date' | 'number' | 'time' | 'default'
}

interface Props {
  isOpen: boolean
  tableTitle: string
  meterName: string
  columns: TableColumn[]
  hourlyData: Record<string, any>[]
  dailyData: Record<string, any>[]
  monthlyData: Record<string, any>[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const searchQuery = ref('')
const activePeriod = ref<'hourly' | 'daily' | 'monthly'>('hourly')
const currentPage = ref(1)
const sortBy = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const itemsPerPage = 15

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
  if (format === 'date') {
    return new Date(value).toLocaleDateString()
  }
  if (format === 'time') {
    return new Date(value).toLocaleTimeString()
  }
  if (format === 'number') {
    return Number(value).toFixed(1)
  }
  return String(value)
}

const exportTable = () => {
  // Generate CSV
  const headers = props.columns.map((c) => c.label).join(',')
  const rows = filteredData.value.map((row) =>
    props.columns.map((col) => formatCell(row[col.key], col.format)).join(',')
  )
  const csv = [headers, ...rows].join('\n')

  // Download
  const link = document.createElement('a')
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  link.download = `${props.tableTitle}-${activePeriod.value}.csv`
  link.click()
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
