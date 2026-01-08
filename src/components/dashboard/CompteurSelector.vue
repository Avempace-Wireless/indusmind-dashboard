<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click="handleBackdropClick"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <!-- Modal Container -->
      <div
        @click.stop
        class="relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5 bg-slate-50 dark:bg-slate-900/60 rounded-t-xl">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-slate-500 dark:text-slate-300 text-2xl">electrical_services</span>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ $t('compteur.selector.title') }}</h2>
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
        <div class="px-6 py-5 max-h-[32rem] overflow-y-auto custom-scrollbar">
          <!-- Selection Status + Actions -->
          <div class="mb-4 flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <input
                v-model="query"
                type="search"
                :placeholder="$t('compteur.selector.search')"
                class="flex-1 h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
                :aria-label="$t('compteur.selector.search')"
              />
              <button
                @click="selectAll"
                class="h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {{ $t('compteur.selector.selectAll') }}
              </button>
              <button
                v-if="selectedCount > 0"
                @click="clearAll"
                class="h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {{ $t('compteur.selector.deselectAll') }}
              </button>
            </div>
            <div class="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700">
              <p class="text-xs text-slate-700 dark:text-slate-300">
                {{ selectedCount }} {{ $t('compteur.selector.selected', { count: totalCount }) }}
              </p>
            </div>
          </div>

          <!-- Compteur Checkboxes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="compteur in filteredCompteurs"
              :key="compteur.id"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                isSelected(compteur.id)
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              <input
                type="checkbox"
                :id="`compteur-${compteur.id}`"
                :checked="isSelected(compteur.id)"
                @change="toggleCompteur(compteur.id)"
                class="h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 cursor-pointer"
              />
              <label
                :for="`compteur-${compteur.id}`"
                class="flex flex-col cursor-pointer flex-1"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ compteur.name }}</span>
                  <span :class="[
                    'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
                    getCategoryBadgeClass(compteur.color)
                  ]">
                    {{ compteur.category }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-slate-600 dark:text-slate-400">
                    <span class="font-mono">{{ formatValue(compteur.instantaneous) }} {{ $t('common.unit.kw') }}</span>
                    <span class="mx-1">·</span>
                    <span>{{ getTranslatedSubtitle(compteur.subtitle) }}</span>
                  </span>
                </div>
              </label>
              <div v-if="isSelected(compteur.id)" class="flex items-center">
                <span class="material-symbols-outlined text-slate-600 dark:text-slate-300 text-xl">check_circle</span>
              </div>
            </div>
          </div>

          <!-- Empty State (no data) -->
          <div
            v-if="totalCount === 0"
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-5xl mb-3">
              electrical_meter
            </span>
            <p class="text-slate-600 dark:text-slate-400 text-sm font-medium">{{ $t('compteur.selector.noResults') }}</p>
          </div>

          <!-- Empty State (filter) -->
          <div
            v-else-if="filteredCompteurs.length === 0"
            class="flex flex-col items-center justify-center py-10 text-center"
          >
            <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-4xl mb-2">filter_alt_off</span>
            <p class="text-slate-600 dark:text-slate-400 text-sm">{{ $t('compteur.selector.noResults') }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-5 bg-slate-50 dark:bg-slate-900/60 rounded-b-xl">
          <button
            @click="cancel"
            class="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span class="flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">close</span>
              {{ $t('common.cancel') }}
            </span>
          </button>
          <button
            @click="apply"
            :disabled="selectedCount === 0"
            class="flex-1 rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-900 hover:bg-black/80 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span class="flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">check</span>
              {{ $t('common.save') }} ({{ selectedCount }})
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Compteur } from '@/composables/useCompteurSelection'

// ============================================================================
// PROPS & EMITS
// ============================================================================

interface Props {
  isOpen: boolean
  allCompteurs: Compteur[]
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
// STATE
// ============================================================================

/**
 * Local copy of selected IDs (user can modify without committing)
 * Allows cancel to revert changes
 */
const localSelectedIds = ref<string[]>([...props.selectedIds])
const query = ref('')

// ============================================================================
// COMPUTED
// ============================================================================

const selectedCount = computed(() => localSelectedIds.value.length)
const totalCount = computed(() => props.allCompteurs.length)

const subtitleMap: Record<string, string> = {
  'Compresseurs industriels': 'equipment.compressorsIndustrial',
  'Climatisation générale': 'equipment.climGeneral',
  'Climatisation bureaux': 'equipment.climOffices',
  'Éclairage général': 'equipment.lightingGeneral',
  'Compresseur secondaire': 'equipment.compressorSecondary',
}

const getTranslatedSubtitle = (subtitle: string): string => {
  const key = subtitleMap[subtitle]
  return key ? t(key) : subtitle
}

const filteredCompteurs = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.allCompteurs
  return props.allCompteurs.filter((c) => c.name.toLowerCase().includes(q))
})

// ============================================================================
// METHODS
// ============================================================================

/**
 * Check if a compteur is currently selected
 */
function isSelected(compteurId: string): boolean {
  return localSelectedIds.value.includes(compteurId)
}

/**
 * Toggle a compteur's selection
 */
function toggleCompteur(compteurId: string) {
  const index = localSelectedIds.value.indexOf(compteurId)
  if (index > -1) {
    // Deselect
    localSelectedIds.value.splice(index, 1)
  } else {
    // Select
    localSelectedIds.value.push(compteurId)
  }
}

/**
 * Select all filtered compteurs
 */
function selectAll() {
  const ids = filteredCompteurs.value.map((c) => c.id)
  localSelectedIds.value = Array.from(new Set([...localSelectedIds.value, ...ids]))
}

/**
 * Apply selection and close modal
 */
function apply() {
  if (localSelectedIds.value.length > 0) {
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
 * Format value for display
 */
function formatValue(value: number): string {
  return value.toFixed(1)
}

/**
 * Clear all selections
 */
function clearAll() {
  localSelectedIds.value = []
}

/**
 * Get category badge class based on color
 */
function getCategoryBadgeClass(color: 'red' | 'green' | 'blue' | 'yellow'): string {
  const classes = {
    red: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900',
    green: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-900',
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-900',
    yellow: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-900',
  }
  return classes[color] || classes.blue
}

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sync local state when props change
 */
watch(
  () => props.selectedIds,
  (newIds) => {
    localSelectedIds.value = [...newIds]
  }
)

/**
 * Reset local state when modal opens
 */
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      localSelectedIds.value = [...props.selectedIds]
    }
  }
)
</script>

<style scoped>
/* Smooth transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease-in-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Checkbox styling */
input[type='checkbox'] {
  accent-color: #135bec;
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
