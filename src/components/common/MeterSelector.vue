<template>
  <!-- Inline Panel (No Modal) -->
  <div
    v-if="isOpen"
    class="bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 border-slate-300 dark:border-slate-600 overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4 bg-slate-50 dark:bg-slate-800/50">
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">
          {{ $t('dashboard.manageMeters') }}
        </h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {{ $t('common.selectUpTo') }}
          <span class="font-semibold">{{ MAX_SELECTABLE_METERS }}</span>
          {{ $t('common.items') }}
          ({{ selectedCount }}/{{ MAX_SELECTABLE_METERS }})
        </p>
      </div>
      <button
        @click="close"
        class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Search Input -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-6">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mb-2"></div>
          <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('common.loading') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 mb-4">
        <p class="text-xs text-red-700 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredMeters.length === 0" class="text-center py-6">
        <span class="material-symbols-outlined text-3xl text-slate-400 mb-2 block">
          info
        </span>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{ $t('common.noResults') }}
        </p>
      </div>

      <!-- Meters List with Pagination -->
      <div v-else>
        <!-- Meters Grid -->
        <div class="space-y-2 mb-4 max-h-64 overflow-y-auto pr-2">
          <div
            v-for="meter in paginatedMeters"
            :key="meter.id"
            @click="toggleMeter(meter.id)"
            class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all"
            :class="[
              isMeterSelected(meter.id)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
            ]"
          >
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="isMeterSelected(meter.id)"
              :disabled="!isMeterSelected(meter.id) && !canSelectMore"
              class="w-3.5 h-3.5 rounded cursor-pointer"
              @click.stop="toggleMeter(meter.id)"
            />

            <!-- Meter Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                {{ meter.name }}
              </p>
              <p class="text-xs text-slate-600 dark:text-slate-400 truncate">
                {{ meter.label }}
              </p>
            </div>

            <!-- Color Indicator (if selected) -->
            <div
              v-if="isMeterSelected(meter.id)"
              class="w-3 h-3 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getMeterColor(meter.id) }"
            ></div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mb-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {{ $t('common.previous') }}
          </button>

          <span class="text-xs text-slate-600 dark:text-slate-400">
            {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
          </span>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {{ $t('common.next') }}
          </button>
        </div>

        <!-- Selection Info -->
        <div class="text-center text-xs text-slate-600 dark:text-slate-400 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          {{ selectedCount }}/{{ MAX_SELECTABLE_METERS }} {{ $t('common.selected') }}
          <span v-if="selectedCount === MAX_SELECTABLE_METERS" class="block mt-1 text-amber-600 dark:text-amber-400">
            {{ $t('common.maxSelectionReached') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex gap-2 border-t border-slate-200 dark:border-slate-700 px-5 py-3 bg-slate-50 dark:bg-slate-800/50">
      <button
        @click="clearSelection"
        class="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        {{ $t('common.clearAll') }}
      </button>
      <button
        @click="apply"
        class="flex-1 px-3 py-2 text-sm rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition"
      >
        {{ $t('common.apply') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMetersStore } from '@/stores/useDeviceMetersStore'
import type { Meter } from '@/services/deviceAPI'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [meterIds: string[]]
}>()

const metersStore = useMetersStore()

// Local state
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Get constant
const MAX_SELECTABLE_METERS = metersStore.MAX_SELECTABLE_METERS

// Fetch meters on mount
const isLoading = computed(() => metersStore.isLoading)
const error = computed(() => metersStore.error)

// Filtered meters based on search
const filteredMeters = computed(() => {
  if (!searchQuery.value.trim()) {
    return metersStore.allMeters
  }

  const query = searchQuery.value.toLowerCase()
  return metersStore.allMeters.filter(meter =>
    meter.name.toLowerCase().includes(query) ||
    meter.label.toLowerCase().includes(query)
  )
})

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredMeters.value.length / itemsPerPage.value)
)

const paginatedMeters = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredMeters.value.slice(start, end)
})

// Selection state
const localSelectedIds = ref<string[]>([...metersStore.selectedMeterIds])

const selectedCount = computed(() => localSelectedIds.value.length)
const canSelectMore = computed(
  () => selectedCount.value < MAX_SELECTABLE_METERS
)

// Methods
function isMeterSelected(meterId: string): boolean {
  return localSelectedIds.value.includes(meterId)
}

function getMeterColor(meterId: string): string {
  return metersStore.getMeterColor(meterId)
}

function toggleMeter(meterId: string) {
  const idx = localSelectedIds.value.indexOf(meterId)
  if (idx > -1) {
    localSelectedIds.value.splice(idx, 1)
  } else if (canSelectMore.value) {
    localSelectedIds.value.push(meterId)
  }
}

function clearSelection() {
  localSelectedIds.value = []
}

function apply() {
  metersStore.setSelectedMeters(localSelectedIds.value)
  emit('apply', localSelectedIds.value)
  close()
}

function close() {
  // Reset to previous state
  localSelectedIds.value = [...metersStore.selectedMeterIds]
  searchQuery.value = ''
  currentPage.value = 1
  emit('close')
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for page changes or filtered results
watch(() => filteredMeters.value.length, () => {
  currentPage.value = 1
})

// Watch for open state and fetch meters if needed
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && metersStore.allMeters.length === 0) {
      await metersStore.fetchMeters()
    }
  }
)
</script>

<style scoped>
/* Smooth animations */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}
</style>
