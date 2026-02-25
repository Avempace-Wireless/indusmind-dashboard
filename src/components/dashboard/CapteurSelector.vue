<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click="handleBackdropClick"
      class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div class="min-h-full flex items-center justify-center pt-20 pb-4 sm:py-20 lg:py-24 px-4 lg:pl-[calc(16rem+1rem)]">
        <!-- Modal Container -->
        <div
          @click.stop
          class="relative w-full max-w-2xl max-h-[calc(100dvh-6rem)] sm:max-h-[calc(100vh-10rem)] flex flex-col rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
        >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-900/60 rounded-t-lg sm:rounded-t-xl">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="material-symbols-outlined text-slate-500 dark:text-slate-300 text-xl sm:text-2xl">thermostat</span>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{{ $t('capteur.selector.title') }}</h2>
          </div>
          <button
            @click="close"
            class="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            :aria-label="$t('common.close')"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="px-4 sm:px-6 py-4 sm:py-5 flex-1 overflow-y-auto custom-scrollbar">
          <!-- Selection Status + Actions -->
          <div class="mb-4 flex flex-col gap-3">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                v-model="query"
                type="search"
                :placeholder="$t('capteur.selector.search')"
                class="flex-1 h-9 sm:h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                :aria-label="$t('capteur.selector.search')"
              />
              <div class="flex gap-2">
                <button
                  @click="selectAll"
                  :disabled="!canSelectMore && selectedCount < MAX_SELECTABLE_SENSORS"
                  class="flex-1 sm:flex-none h-9 sm:h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {{ $t('capteur.selector.selectAll') }}
                </button>
                <button
                  v-if="selectedCount > 0"
                  @click="clearAll"
                  class="flex-1 sm:flex-none h-9 sm:h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  {{ $t('capteur.selector.deselectAll') }}
                </button>
              </div>
            </div>
            <div class="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700">
              <p class="text-xs text-slate-700 dark:text-slate-300">
                {{ selectedCount }}/{{ totalCount }} {{ $t('capteur.selector.selected', { count: totalCount }) }}
              </p>
              <!-- Max Selection Warning -->
              <div v-if="selectedCount === MAX_SELECTABLE_SENSORS" class="mt-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2">
                <p class="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">info</span>
                  {{ $t('capteur.selector.maxSelectionWarning') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Capteur Checkboxes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="capteur in filteredCapteurs"
              :key="capteur.id"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                isSelected(capteur.id)
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              <input
                type="checkbox"
                :id="`capteur-${capteur.id}`"
                :checked="isSelected(capteur.id)"
                :disabled="!canSelectMore && !isSelected(capteur.id)"
                @change="toggleCapteur(capteur.id)"
                :class="[
                  'h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700',
                  (!canSelectMore && !isSelected(capteur.id)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                ]"
              />
              <label
                :for="`capteur-${capteur.id}`"
                class="flex flex-col cursor-pointer flex-1"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ capteur.label || capteur.name }}</span>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-900">
                    {{ $t('capteur.selector.typeSensor') }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-slate-600 dark:text-slate-400">
                    <span v-if="capteur.zone" class="font-mono">{{ capteur.zone }}</span>
                    <span v-else class="font-mono">{{ capteur.name }}</span>
                  </span>
                </div>
              </label>
              <div v-if="isSelected(capteur.id)" class="flex items-center">
                <span class="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">check_circle</span>
              </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="w-full sm:w-auto px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span class="flex items-center justify-center gap-1">
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                  <span>{{ $t('common.previous') }}</span>
                </span>
              </button>

              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-600 dark:text-slate-400">
                  {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
                </span>
                <select
                  v-model.number="itemsPerPage"
                  class="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                >
                  <option :value="4">4</option>
                  <option :value="6">6</option>
                  <option :value="8">8</option>
                  <option :value="10">10</option>
                </select>
                <span class="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">/ {{ $t('common.page') }}</span>
              </div>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="w-full sm:w-auto px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span class="flex items-center justify-center gap-1">
                  <span>{{ $t('common.next') }}</span>
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              </button>
            </div>
          </div>

          <!-- Empty State (no data) -->
          <div
            v-if="totalCount === 0"
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-4xl mb-2">thermostat</span>
            <p class="text-slate-600 dark:text-slate-400 text-sm font-medium">{{ $t('capteur.selector.noResults') }}</p>
          </div>

          <!-- Empty State (filter) -->
          <div
            v-else-if="filteredCapteurs.length === 0"
            class="flex flex-col items-center justify-center py-10 text-center"
          >
            <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-4xl mb-2">filter_alt_off</span>
            <p class="text-slate-600 dark:text-slate-400 text-sm">{{ $t('capteur.selector.noResults') }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex flex-row gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-5 bg-slate-50 dark:bg-slate-900/60 rounded-b-lg sm:rounded-b-xl">
          <button
            @click="cancel"
            class="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span class="flex items-center justify-center gap-1 sm:gap-2">
              <span class="material-symbols-outlined text-base sm:text-lg">close</span>
              <span class="hidden xs:inline">{{ $t('common.cancel') }}</span>
            </span>
          </button>
          <button
            @click="apply"
            :disabled="selectedCount === 0"
            class="flex-1 rounded-lg bg-slate-900 dark:bg-slate-100 px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-slate-900 hover:bg-black/80 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span class="flex items-center justify-center gap-1 sm:gap-2">
              <span class="material-symbols-outlined text-base sm:text-lg">check</span>
              <span>{{ $t('common.save') }} ({{ selectedCount }})</span>
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, unref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Sensor } from '@/data/mockData'

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  isOpen: boolean
  allCapteurs: Sensor[]
  selectedIds: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
})

const emit = defineEmits<{
  'update:selected': [ids: string[]]
  'close': []
  'apply': [ids: string[]]
}>()

// ============================================================================
// COMPOSABLES
// ============================================================================

const { t } = useI18n()

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_SELECTABLE_SENSORS = 8

// ============================================================================
// STATE
// ============================================================================

/**
 * Local copy of selected IDs (user can modify without committing)
 * Allows cancel to revert changes
 */
const localSelectedIds = ref<string[]>([...props.selectedIds])
const query = ref('')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(6)

// ============================================================================
// COMPUTED
// ============================================================================

const selectedCount = computed(() => localSelectedIds.value.length)
const totalCount = computed(() => props.allCapteurs.length)
const canSelectMore = computed(() => selectedCount.value < MAX_SELECTABLE_SENSORS)

const allFilteredCapteurs = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.allCapteurs
  return props.allCapteurs.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    (c.label?.toLowerCase() ?? '').includes(q) ||
    (c.zone?.toLowerCase() ?? '').includes(q)
  )
})

const totalPages = computed(() =>
  Math.ceil(allFilteredCapteurs.value.length / itemsPerPage.value)
)

const filteredCapteurs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allFilteredCapteurs.value.slice(start, end)
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Check if a capteur is currently selected
 */
function isSelected(capteurId: string): boolean {
  return localSelectedIds.value.includes(capteurId)
}

/**
 * Toggle a capteur's selection (enforce max 8)
 */
function toggleCapteur(capteurId: string) {
  const index = localSelectedIds.value.indexOf(capteurId)
  if (index > -1) {
    // Deselect
    localSelectedIds.value.splice(index, 1)
  } else if (canSelectMore.value) {
    // Select only if under max
    localSelectedIds.value.push(capteurId)
  }
}

/**
 * Select all filtered capteurs (up to max 8) across all pages
 */
function selectAll() {
  const ids = allFilteredCapteurs.value.map((c) => c.id)
  localSelectedIds.value = ids.slice(0, MAX_SELECTABLE_SENSORS)
}

/**
 * Apply selection and close modal
 */
function apply() {
  if (localSelectedIds.value.length > 0 && localSelectedIds.value.length <= MAX_SELECTABLE_SENSORS) {
    emit('apply', localSelectedIds.value)
    emit('update:selected', localSelectedIds.value)
    close()
  }
}

/**
 * Cancel selection (revert to original)
 */
function cancel() {
  localSelectedIds.value = [...props.selectedIds]
  close()
}

/**
 * Close modal
 */
function close() {
  emit('close')
}

/**
 * Handle backdrop click (close modal)
 */
function handleBackdropClick() {
  cancel()
}

/**
 * Clear all selections
 */
function clearAll() {
  localSelectedIds.value = []
}

/**
 * Navigate to next page
 */
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

/**
 * Navigate to previous page
 */
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sync local state when props change (with deep watch for arrays)
 */
watch(
  () => props.selectedIds,
  (newIds) => {
    const ids = unref(newIds)
    if (Array.isArray(ids)) {
      localSelectedIds.value = [...ids]
    }
  },
  { deep: true, immediate: false }
)

/**
 * Reset local state when modal opens
 */
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      const ids = unref(props.selectedIds)
      localSelectedIds.value = Array.isArray(ids) ? [...ids] : []
      currentPage.value = 1
      query.value = ''
    }
  }
)

/**
 * Reset to page 1 when search query or items per page changes
 */
watch([query, itemsPerPage], () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* Checkbox styling */
input[type='checkbox'] {
  accent-color: #7c3aed;
}

/* Custom scrollbar for modal content */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

:is(.dark .custom-scrollbar)::-webkit-scrollbar-thumb {
  background: #324467;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

:is(.dark .custom-scrollbar)::-webkit-scrollbar-thumb:hover {
  background: #4a5a7f;
}
</style>
