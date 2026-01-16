<template>
  <AdminLayout>
    <!-- Page Header with Status Overview -->
    <div class="mb-8">
      <div class="flex flex-col gap-6">
        <!-- Title Section -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
              {{ t('thermal.pageTitle') }}
            </h1>
            <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
              {{ t('thermal.subtitle') }}
            </p>
          </div>

        </div>

        <!-- Sensor Selector Modal -->
        <SensorSelector
          :is-open="showSensorSelector"
          @apply="handleSensorSelection"
          @close="showSensorSelector = false"
        ></SensorSelector>

        <!-- Status Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Active Zones -->
          <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-indigo-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.active') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">{{ statusActiveZones }}<span class="text-lg">/{{ displayedZones.length }}</span></div>
            <div class="text-indigo-100 text-sm mt-1">{{ t('thermal.status.operational') }}</div>
          </div>

          <!-- Average Temperature -->
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-green-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.avgTemp') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">{{ statusAvgTemp }}°C</div>
            <div class="text-green-100 text-sm mt-1">{{ t('thermal.status.currentAverage') }}</div>
          </div>

          <!-- Temperature Range -->
          <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-amber-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.tempRange') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">{{ statusTempRange.min }}—{{ statusTempRange.max }}°C</div>
            <div class="text-amber-100 text-sm mt-1">{{ t('thermal.status.minMax') }}</div>
          </div>

          <!-- System Health -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-purple-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.systemHealth') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">{{ statusSystemHealth }}%</div>
            <div class="text-purple-100 text-sm mt-1">{{ t('thermal.status.withinTargets') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone Control Section -->
    <div class="mb-8">
      <h2 class="mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('thermal.sections.zoneControl') }}
      </h2>

      <!-- Display Controls: compact, cohesive panel -->
      <div class="mb-4 rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
        <!-- Mobile Stack: Controls stacked vertically -->
        <div class="space-y-3 sm:space-y-0">
          <!-- Row 1: Sensor selection - Grid Layout like History View -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
              {{ t('thermal.controls.sensorsLabel') }}
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
              <button
                v-for="z in zones"
                :key="'sel-'+z.id"
                @click="toggleZoneVisibility(z.id)"
                :title="`${z.sensorName || `Z${z.id}`}${z.sensorLabel ? ` - ${z.sensorLabel}` : ''}`"
                :class="[
                  'px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all duration-200 border flex flex-col items-start gap-1 relative overflow-hidden group',
                  visibleZoneIds.includes(z.id)
                    ? 'text-white shadow-md border-indigo-400 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700'
                    : 'border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50/70 dark:hover:bg-gray-700'
                ]"
              >
                <div class="flex items-center gap-1 w-full flex-1 min-w-0">
                  <span v-if="visibleZoneIds.includes(z.id)" class="material-symbols-outlined text-xs flex-shrink-0">check_circle</span>
                  <div class="flex-1 min-w-0">
                    <span class="font-semibold truncate text-left block">{{ z.sensorName || `Z${z.id}` }}</span>
                    <span class="text-[9px] opacity-75 truncate text-left block" :class="visibleZoneIds.includes(z.id) ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'">{{ z.sensorLabel }}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

        <!-- Controls above cards -->
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <label class="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              {{ t('thermal.controls.columns') }}:
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="columnsPerRow"
                type="range"
                min="1"
                max="4"
                class="h-1 w-24 accent-indigo-600"
              />
              <span class="w-7 text-center text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{{ columnsPerRow }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button @click="selectAllZones" class="rounded px-2 sm:px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 whitespace-nowrap">
              {{ t('thermal.controls.selectAll') }}
            </button>
            <button @click="clearZones" class="rounded px-2 sm:px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 whitespace-nowrap">
              {{ t('thermal.controls.clear') }}
            </button>
            <button @click="resetOrder" class="rounded px-2 sm:px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 whitespace-nowrap">
              {{ t('thermal.controls.resetOrder') }}
            </button>
          </div>
        </div>
        <p class="mt-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
          {{ t('thermal.controls.orderHint') }}
        </p>

      <!-- Zone Control Cards Grid - Responsive -->
      <div class="grid gap-3 sm:gap-4" :style="{ gridTemplateColumns: gridColumns }">
        <div
          v-for="zone in displayedZones"
          :key="zone.id"
          :class="[
            'zone-card relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-white p-2.5 sm:p-3 lg:p-5 shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-800',
            zone.power
              ? 'ring-2 ring-green-400 dark:ring-green-600'
              : 'ring-1 ring-gray-200 dark:ring-gray-700',
          ]"
          draggable="true"
          @dragstart="onDragStart(zone.id)"
          @dragover.prevent
          @drop="onDrop(zone.id)"
        >
            <!-- Zone Header with Status -->
            <div class="mb-2 sm:mb-3 lg:mb-4 flex items-start justify-between gap-1.5 sm:gap-2 lg:gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1 sm:gap-2 min-w-0">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xs sm:text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">
                      {{ zone.sensorName || t('thermal.zone', { number: zone.id }) }}
                    </h3>
                    <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {{ zone.sensorLabel }}
                    </p>
                  </div>
                  <button
                    @click="openChartModal(zone.id)"
                    class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                    :title="t('thermal.chart.open')"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 18.5h16" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 15l4-4 3 3 4-6 3 4" />
                      <circle cx="5" cy="15" r="1.1" fill="currentColor" />
                      <circle cx="9" cy="11" r="1.1" fill="currentColor" />
                      <circle cx="12" cy="14" r="1.1" fill="currentColor" />
                      <circle cx="16" cy="8" r="1.1" fill="currentColor" />
                      <circle cx="19" cy="12" r="1.1" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

              <!-- Current Temperature Display -->
              <div
                class="mb-2 sm:mb-3 lg:mb-4 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-3 lg:p-5 shadow-inner dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20"
              >
                <div class="mb-1 sm:mb-1.5 lg:mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  {{ t('thermal.currentTemp') }}
                </div>
                <div class="flex items-baseline gap-1 sm:gap-2">
                  <span class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">21.2</span>
                  <span class="text-base sm:text-lg lg:text-xl font-semibold text-gray-500 dark:text-gray-400">°C</span>
                </div>
              </div>

            <!-- Controls Area with Mode Selection -->
            <div class="flex flex-col">
              <!-- Controls Content (Fixed Height) -->
              <div class="min-h-[140px] sm:min-h-[160px] lg:min-h-[200px] flex items-center mb-3 sm:mb-4 lg:mb-5">
                <!-- Power Toggle Button (Manual Mode Only) -->
                <div v-if="zone.mode === 'manual'" class="w-full flex justify-center">
                  <button
                    @click="togglePower(zone.id)"
                    :class="[
                      'group relative flex h-16 sm:h-20 lg:h-28 w-16 sm:w-20 lg:w-28 flex-col items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95',
                      zone.power
                        ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-green-500/40 hover:shadow-green-500/60'
                        : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-gray-500/40 hover:from-red-400 hover:via-red-500 hover:to-red-600 hover:shadow-red-500/60',
                    ]"
                  >
                    <!-- Power Icon -->
                    <svg class="h-5 sm:h-7 lg:h-10 w-5 sm:w-7 lg:w-10 mb-0.5 sm:mb-0.5 lg:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <!-- Power Label -->
                    <span class="text-xs font-bold uppercase tracking-wider">
                      {{ zone.power ? t('thermal.power.on') : t('thermal.power.off') }}
                    </span>
                    <!-- Glow Effect -->
                    <div
                      :class="[
                        'absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-50',
                        zone.power ? 'bg-green-400' : 'bg-red-400',
                      ]"
                    ></div>
                  </button>
                </div>

                <!-- Temperature Controls (Auto Mode Only) -->
                <div v-if="zone.mode === 'auto'" class="w-full space-y-1.5 sm:space-y-2 lg:space-y-3">
                  <!-- Max Temperature -->
                  <div>
                    <label class="mb-0.5 sm:mb-1 lg:mb-1.5 flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 gap-1">
                      <span class="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <svg class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/>
                        </svg>
                        <span class="hidden sm:inline">{{ t('thermal.maxTemp') }}</span>
                        <span class="sm:hidden">Max</span>
                      </span>
                      <span v-if="zone.maxTemp" class="rounded bg-red-100 px-1 sm:px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400 flex-shrink-0">
                        {{ zone.maxTemp }}°C
                      </span>
                    </label>
                    <div class="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 min-w-0">
                      <input
                        v-model.number="zone.maxTemp"
                        type="number"
                        step="0.5"
                        min="10"
                        max="40"
                        :disabled="zone.mode !== 'auto'"
                        class="min-w-0 flex-1 rounded border-2 border-gray-200 bg-white px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-sm font-medium text-gray-900 transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-900/30"
                      />
                      <div class="flex flex-col gap-0.5 shrink-0">
                        <button
                          @click="adjustTemp(zone.id, 'max', 1)"
                          :disabled="zone.mode !== 'auto'"
                          class="rounded-t border border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30"
                        >
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/>
                          </svg>
                        </button>
                        <button
                          @click="adjustTemp(zone.id, 'max', -1)"
                          :disabled="zone.mode !== 'auto'"
                          class="rounded-b border border-t-0 border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30"
                        >
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Min Temperature -->
                  <div>
                    <label class="mb-0.5 sm:mb-1 lg:mb-1.5 flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 gap-1">
                      <span class="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <svg class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/>
                        </svg>
                        <span class="hidden sm:inline">{{ t('thermal.minTemp') }}</span>
                        <span class="sm:hidden">Min</span>
                      </span>
                      <span v-if="zone.minTemp" class="rounded bg-blue-100 px-1 sm:px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                        {{ zone.minTemp }}°C
                      </span>
                    </label>
                    <div class="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 min-w-0">
                      <input
                        v-model.number="zone.minTemp"
                        type="number"
                        step="0.5"
                        min="10"
                        max="40"
                        :disabled="zone.mode !== 'auto'"
                        class="min-w-0 flex-1 rounded border-2 border-gray-200 bg-white px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-sm font-medium text-gray-900 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
                      />
                      <div class="flex flex-col gap-0.5 shrink-0">
                        <button
                          @click="adjustTemp(zone.id, 'min', 1)"
                          :disabled="zone.mode !== 'auto'"
                          class="rounded-t border border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30"
                        >
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/>
                          </svg>
                        </button>
                        <button
                          @click="adjustTemp(zone.id, 'min', -1)"
                          :disabled="zone.mode !== 'auto'"
                          class="rounded-b border border-t-0 border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30"
                        >
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mode Selection (Fixed Position) -->
              <div class="flex gap-1 sm:gap-1.5 lg:gap-2">
                <button
                  @click="setMode(zone.id, 'manual')"
                  :class="[
                    'group relative flex-1 overflow-hidden rounded-md sm:rounded-lg lg:rounded-xl px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 text-xs font-bold uppercase tracking-wide shadow-md transition-all duration-300',
                    zone.mode === 'manual'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/40'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                  ]"
                >
                  <span class="relative z-10 flex items-center justify-center gap-0.5 sm:gap-1">
                    <svg class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    <span class="hidden sm:inline">{{ t('thermal.manual') }}</span>
                    <span class="sm:hidden">M</span>
                  </span>
                </button>
                <button
                  @click="setMode(zone.id, 'auto')"
                  :class="[
                    'group relative flex-1 overflow-hidden rounded-md sm:rounded-lg lg:rounded-xl px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 text-xs font-bold uppercase tracking-wide shadow-md transition-all duration-300',
                    zone.mode === 'auto'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/40'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                  ]"
                >
                  <span class="relative z-10 flex items-center justify-center gap-0.5 sm:gap-1">
                    <svg class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                    </svg>
                    <span class="hidden sm:inline">{{ t('thermal.auto') }}</span>
                    <span class="sm:hidden">A</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- Status Indicator Bar -->
            <div
              :class="[
                'absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 lg:h-1.5 transition-all duration-300',
                zone.power
                  ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-500/50'
                  : 'bg-gray-200 dark:bg-gray-700',
              ]"
            ></div>
          </div>
        </div>
      </div>

    <!-- Temperature Monitoring Section -->
    <div class="mb-8">
      <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('thermal.sections.monitoring') }}
      </h2>

      <!-- Temperature Charts -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Zone Temperatures Chart -->
          <div
            class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                      {{ t('thermal.charts.zoneTemps.title') }}
                    </h3>
                  </div>
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <!-- Chart Type Toggle -->
                    <div class="flex items-center gap-2">
                      <label class="text-xs font-semibold text-gray-600 dark:text-gray-400">View:</label>
                      <div class="flex gap-1.5 rounded-lg border border-gray-300 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
                        <button
                          @click="chartType = 'line'"
                          :class="[
                            'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                            chartType === 'line'
                              ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                              : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
                          ]">
                          Line
                        </button>
                        <button
                          @click="chartType = 'bar'"
                          :class="[
                            'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                            chartType === 'bar'
                              ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                              : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
                          ]">
                          Bar
                        </button>
                      </div>
                    </div>
                    <!-- Period Selector -->
                    <div class="flex items-center gap-2">
                      <label class="text-xs font-semibold text-gray-600 dark:text-gray-400">Period:</label>
                      <div class="flex gap-2">
                        <button v-for="period in [1, 6, 12, 24]" :key="period"
                          @click="chartPeriod = period as 1 | 6 | 12 | 24"
                          :class="[
                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                            chartPeriod === period
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
                          ]">
                          {{ period }}h
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Chart -->
            <div class="p-6">
              <div class="relative" :class="chartHeightClass">
                <component
                  :is="chartType === 'line' ? LineChart : BarChart"
                  :data="tempChartData"
                  :options="tempChartOptions"
                  class="!h-full !w-full"
                ></component>
              </div>

            </div>
          </div>

          <!-- Min/Max Temperature Chart -->
          <div
            class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 dark:border-gray-700 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ t('thermal.charts.minMax.title') }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ t('thermal.charts.minMax.subtitle') }}
                  </p>
                </div>
                <div class="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/40">
                  <svg class="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Chart -->
            <div class="p-6">
              <div class="relative" :class="chartHeightClass">
                <BarChart :data="minMaxChartData" :options="minMaxChartOptions" class="!h-full !w-full"></BarChart>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Chart Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showChartModal"
          class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="closeChartModal"
          style="margin: 0 !important;"
        >
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative z-[999999]"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {{ chartModalZone?.sensorLabel || chartModalZone?.sensorName || `Zone ${chartModalZone?.id}` }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ t('thermal.chart.subtitle') }}</p>
              </div>
              <button
                @click="closeChartModal"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body with Chart -->
            <div class="flex-1 overflow-auto p-4 sm:p-6">
              <div v-if="chartModalZone" class="h-[400px] sm:h-[500px]">
                <VueApexCharts
                  type="area"
                  :height="'100%'"
                  :options="getChartOptions(chartModalZone)"
                  :series="getChartSeries(chartModalZone)"
                />
              </div>
            </div>

            <!-- Modal Footer with Zone Info -->
            <div class="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div class="flex items-center gap-6">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('thermal.chart.current') }}</div>
                  <div class="text-lg font-bold text-gray-900 dark:text-white">21.2°C</div>
                </div>
                <div>
                  <div class="text-xs text-red-500">{{ t('thermal.chart.maxTarget') }}</div>
                  <div class="text-lg font-bold text-red-600 dark:text-red-400">{{ chartModalZone?.maxTemp }}°C</div>
                </div>
                <div>
                  <div class="text-xs text-blue-500">{{ t('thermal.chart.minTarget') }}</div>
                  <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ chartModalZone?.minTemp }}°C</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="chartModalZone?.power ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                >
                  {{ chartModalZone?.power ? t('thermal.chart.active') : t('thermal.chart.inactive') }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="chartModalZone?.mode === 'auto' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'"
                >
                  {{ chartModalZone?.mode === 'auto' ? t('thermal.auto') : t('thermal.manual') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs'
import { SENSOR_COLOR_PALETTE } from '@/data/mockData'
import type { Sensor } from '@/data/mockData'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import SensorSelector from '@/components/common/SensorSelector.vue'
import VueApexCharts from 'vue3-apexcharts'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const { t } = useI18n()
const sensorsStore = useSensorsStore()

// UI State
const showSensorSelector = ref(false)
const chartModalZoneId = ref<number | null>(null)
const showChartModal = computed(() => chartModalZoneId.value !== null)
const chartModalZone = computed(() =>
  zones.value.find(z => z.id === chartModalZoneId.value)
)

interface Zone {
  id: number
  maxTemp: number | null
  minTemp: number | null
  power: boolean
  mode: 'manual' | 'auto'
  sensorId?: string
  sensorLabel?: string
  sensorName?: string
}
// Selected sensors (from store)
const selectedSensors = computed(() => sensorsStore.selectedSensors)

function handleSensorSelection(sensorIds: string[]) {
  sensorsStore.setSelectedSensors(sensorIds)
  showSensorSelector.value = false
}

// Sensor data used for display (selected if any, otherwise all available)
const thermalSensors = computed(() => {
  const chosen = selectedSensors.value
  if (chosen.length > 0) return chosen
  return sensorsStore.availableSensors
})

const MIN_SENSORS_DISPLAY = 8

// Separate label and name for display
const getSensorLabel = (sensor: Sensor) => sensor.label || sensor.name
const getSensorName = (sensor: Sensor) => sensor.name

// Ensure at least 8 sensors by padding with clones for display-only purposes
const sensorsForDisplay = computed<Sensor[]>(() => {
  const base = thermalSensors.value
  if (base.length === 0) return []
  if (base.length >= MIN_SENSORS_DISPLAY) return base
  const padded = [...base]
  let idx = 0
  while (padded.length < MIN_SENSORS_DISPLAY) {
    const source = base[idx % base.length]
    padded.push({
      ...source,
      id: `virtual-${padded.length + 1}`,
      name: `${source.name}-virt-${padded.length + 1}`,
      label: source.label ?? `Virtual Sensor ${padded.length + 1}`
    })
    idx++
  }
  return padded
})

const zones = ref<Zone[]>([])

const activeZones = computed(() => zones.value.filter((z) => z.power).length)

// Generate synthetic series for a zone (aligns charts with visible cards)
const getZoneSeries = (zone: Zone) => {
  const hours = chartPeriod.value
  const requiredPoints = hours + 1
  const base = ((zone.minTemp ?? 18) + (zone.maxTemp ?? 28)) / 2
  const variation = Math.max(0.6, ((zone.maxTemp ?? 28) - (zone.minTemp ?? 18)) / 6)
  const series: number[] = []
  for (let i = 0; i < requiredPoints; i++) {
    const wave = Math.sin((i / requiredPoints) * Math.PI) * variation
    series.push(Number((base + wave).toFixed(1)))
  }
  return series
}

// Chart data: compute from displayed zones (not padded sensors)
const chartZoneTemps = computed(() => {
  return displayedZones.value.map((zone) => {
    const series = getZoneSeries(zone)
    const value = series[series.length - 1]
    const clamped = Math.max(10, Math.min(35, value))
    return {
      id: zone.id,
      value: clamped,
      height: ((clamped - 10) / (35 - 10)) * 100, // Scale from 10-35°C
    }
  })
})

const avgZoneTemp = computed(() => {
  const temps = chartZoneTemps.value.map((z) => z.value)
  if (temps.length === 0) return '0.0'
  return (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
})

const exteriorTempPoints = computed(() => [
  { value: 16.8, bottom: 60 },
  { value: 15.5, bottom: 50 },
  { value: 14.2, bottom: 40 },
  { value: 14.8, bottom: 45 },
  { value: 16.1, bottom: 55 },
  { value: 17.2, bottom: 65 },
])

const exteriorTempCurrent = computed(() => exteriorTempPoints.value[exteriorTempPoints.value.length - 1]?.value || 17.2)

// Chart ranges (auto-scale with padding)
const tempChartRange = computed(() => {
  const values = tempChartData.value.datasets.flatMap((d: any) => d.data as number[])
  if (!values.length) return { min: 10, max: 30 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.15, 1)
  return {
    min: Math.max(0, Number((min - pad).toFixed(1))),
    max: Number((max + pad).toFixed(1))
  }
})

const minMaxChartRange = computed(() => {
  const mins = displayedZones.value.map((z) => z.minTemp ?? 0)
  const maxs = displayedZones.value.map((z) => z.maxTemp ?? 0)
  const currents = chartZoneTemps.value.map((z) => z.value)
  const values = [...mins, ...maxs, ...currents].filter((v) => typeof v === 'number') as number[]
  if (!values.length) return { min: 0, max: 40 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.15, 1)
  return {
    min: Math.max(0, Number((min - pad).toFixed(1))),
    max: Number((max + pad).toFixed(1))
  }
})

// Period selector for charts
const chartPeriod = ref<1 | 6 | 12 | 24>(24)
const chartType = ref<'line' | 'bar'>('line')
const dataRangeStart = ref(0)
const dataRangeEnd = ref(100)

const updateRangeStart = (val: number) => {
  if (val <= dataRangeEnd.value - 5) {
    dataRangeStart.value = val
  }
}

const updateRangeEnd = (val: number) => {
  if (val >= dataRangeStart.value + 5) {
    dataRangeEnd.value = val
  }
}

const chartTimeLabels = computed(() => {
  const labels: string[] = []
  const hours = chartPeriod.value
  for (let i = hours; i >= 0; i--) {
    const h = (24 - i) % 24
    labels.push(`${h.toString().padStart(2, '0')}:00`)
  }
  return labels
})

// Build temperature series from sensors (hourly if available, otherwise synthetic around avgTemp)
function getSensorSeries(sensor: Sensor): number[] {
  const hours = chartPeriod.value
  const requiredPoints = hours + 1

  const hourly = sensor.timeSeries?.hourly ?? []
  if (hourly.length >= requiredPoints) {
    return hourly.slice(-requiredPoints).map(p => Number(p.value.toFixed(1)))
  }

  const base = sensor.avgTemp ?? 22
  const variation = 0.6
  const series: number[] = []
  for (let i = 0; i < requiredPoints; i++) {
    const wave = Math.sin((i / requiredPoints) * Math.PI) * variation
    series.push(Number((base + wave).toFixed(1)))
  }
  return series
}

// Filter data by range slider
const filterDataByRange = (data: number[]) => {
  const start = Math.floor((dataRangeStart.value / 100) * data.length)
  const end = Math.ceil((dataRangeEnd.value / 100) * data.length)
  return data.slice(start, end)
}

const filteredChartTimeLabels = computed(() => {
  const all = chartTimeLabels.value
  const start = Math.floor((dataRangeStart.value / 100) * all.length)
  const end = Math.ceil((dataRangeEnd.value / 100) * all.length)
  return all.slice(start, end)
})

const tempChartData = computed(() => {
  const series = displayedZones.value.map((zone) => getZoneSeries(zone))
  const filtered = series.map((d) => filterDataByRange(d))
  const labels = filteredChartTimeLabels.value
  const colors = SENSOR_COLOR_PALETTE
  return {
    labels,
    datasets: filtered.map((data, idx) => ({
      label: displayedZones.value[idx]?.sensorLabel || displayedZones.value[idx]?.sensorName || `Z${idx + 1}`,
      data,
      borderColor: colors[idx % colors.length],
      backgroundColor: `${colors[idx % colors.length]}B3`,
      tension: 0.4,
      borderWidth: 2,
      fill: false,
    })),
  }
})

const minMaxChartData = computed(() => ({
  labels: displayedZones.value.map((z) => z.sensorLabel ?? `Z${z.id}`),
  datasets: [
    {
      label: t('thermal.chart.minTarget'),
      data: displayedZones.value.map((z) => z.minTemp ?? 0),
      backgroundColor: 'rgba(59, 130, 246, 0.85)',
      borderColor: '#3b82f6',
      borderWidth: 2,
    },
    {
      label: t('thermal.chart.current'),
      data: chartZoneTemps.value.map((z) => z.value),
      backgroundColor: 'rgba(16, 185, 129, 0.85)',
      borderColor: '#10b981',
      borderWidth: 2,
    },
    {
      label: t('thermal.chart.maxTarget'),
      data: displayedZones.value.map((z) => z.maxTemp ?? 0),
      backgroundColor: 'rgba(239, 68, 68, 0.85)',
      borderColor: '#ef4444',
      borderWidth: 2,
    },
  ],
}))

const chartHeightClass = 'h-[380px] sm:h-[450px] lg:h-[520px]'
const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        font: { size: 12 },
        padding: 12,
        boxWidth: 12,
        boxHeight: 12,
        color: '#6b7280',
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#1e293b',
      borderWidth: 1,
      padding: 10,
      titleColor: '#e2e8f0',
      bodyColor: '#cbd5e1'
    }
  },
  elements: {
    point: {
      radius: 3,
      hoverRadius: 4,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#9ca3af',
        maxRotation: 0
      }
    }
  }
}

const tempChartOptions = computed(() => ({
  ...chartBaseOptions,
  layout: {
    padding: { top: 8, bottom: 8, left: 0, right: 0 }
  },
  scales: {
    ...chartBaseOptions.scales,
    y: {
      beginAtZero: false,
      suggestedMin: tempChartRange.value.min,
      suggestedMax: tempChartRange.value.max,
      ticks: {
        color: '#9ca3af',
        callback: (value: number | string) => `${value}°C`,
        padding: 8
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
        drawBorder: false
      }
    }
  }
}))

const minMaxChartOptions = computed(() => ({
  ...chartBaseOptions,
  layout: {
    padding: { top: 8, bottom: 8, left: 0, right: 0 }
  },
  scales: {
    ...chartBaseOptions.scales,
    y: {
      beginAtZero: false,
      suggestedMin: minMaxChartRange.value.min,
      suggestedMax: minMaxChartRange.value.max,
      ticks: {
        color: '#9ca3af',
        callback: (value: number | string) => `${value}°C`,
        padding: 8
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
        drawBorder: false
      }
    }
  }
}))

// Display controls
const columnsPerRow = ref(4)
const visibleZoneIds = ref<number[]>([])
const zonesOrder = ref<number[]>([])

// Real-time aggregated status from displayed zones
const statusActiveZones = computed(() => displayedZones.value.filter((z) => z.power).length)

const statusTempRange = computed(() => {
  if (displayedZones.value.length === 0) return { min: '--', max: '--' }
  const temps = displayedZones.value
    .map((z, idx) => chartZoneTemps.value[idx]?.value ?? 22)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return { min: min.toFixed(1), max: max.toFixed(1) }
})

const statusAvgTemp = computed(() => {
  if (displayedZones.value.length === 0) return '--'
  const temps = displayedZones.value
    .map((z, idx) => chartZoneTemps.value[idx]?.value ?? 22)
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length
  return avg.toFixed(1)
})

const statusSystemHealth = computed(() => {
  if (displayedZones.value.length === 0) return 0
  const healthy = displayedZones.value.filter((z) => {
    const idx = zones.value.findIndex(zone => zone.id === z.id)
    const temp = chartZoneTemps.value[idx]?.value ?? 22
    return temp >= (z.minTemp ?? 18) && temp <= (z.maxTemp ?? 28)
  }).length
  return Math.round((healthy / displayedZones.value.length) * 100)
})

const displayedZones = computed(() =>
  zonesOrder.value
    .filter((id) => visibleZoneIds.value.includes(id))
    .map((id) => zones.value.find((z) => z.id === id))
    .filter((z): z is Zone => Boolean(z))
)

// Calculate optimal columns based on number of displayed zones
const autoColumnsPerRow = computed(() => {
  const count = displayedZones.value.length
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 8) return 3
  return 4
})

// Sync slider to auto-columns when zones change, but allow manual override
watch(autoColumnsPerRow, (newAuto) => {
  columnsPerRow.value = newAuto
})

// Responsive grid layout - uses slider value (auto-synced or manually adjusted)
const gridColumns = computed(() => {
  const col = Math.max(1, Math.min(columnsPerRow.value, 4))
  return `repeat(${col}, minmax(0, 1fr))`
})

const draggingId = ref<number | null>(null)
const onDragStart = (id: number) => {
  draggingId.value = id
}
const onDrop = (targetId: number) => {
  if (draggingId.value === null) return
  const from = zonesOrder.value.indexOf(draggingId.value)
  const to = zonesOrder.value.indexOf(targetId)
  if (from === -1 || to === -1 || from === to) {
    draggingId.value = null
    return
  }
  const newOrder = [...zonesOrder.value]
  const [moved] = newOrder.splice(from, 1)
  newOrder.splice(to, 0, moved)
  zonesOrder.value = newOrder
  draggingId.value = null
}

const selectAllZones = () => {
  visibleZoneIds.value = zones.value.map((z) => z.id)
}
const clearZones = () => {
  visibleZoneIds.value = []
}
const resetOrder = () => {
  zonesOrder.value = zones.value.map((z) => z.id)
}
const toggleZoneVisibility = (zoneId: number) => {
  const index = visibleZoneIds.value.indexOf(zoneId)
  if (index > -1) {
    visibleZoneIds.value.splice(index, 1)
  } else {
    visibleZoneIds.value.push(zoneId)
  }
}

const adjustTemp = (zoneId: number, type: 'max' | 'min', delta: number) => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (!zone) return
  const bounds = { min: 10, max: 40 }
  if (type === 'max' && zone.maxTemp !== null) {
    zone.maxTemp = clamp(zone.maxTemp + delta, bounds.min, bounds.max)
    if (zone.minTemp !== null && zone.maxTemp < zone.minTemp) {
      zone.minTemp = zone.maxTemp - 1
    }
  } else if (type === 'min' && zone.minTemp !== null) {
    zone.minTemp = clamp(zone.minTemp + delta, bounds.min, bounds.max)
    if (zone.maxTemp !== null && zone.minTemp > zone.maxTemp) {
      zone.maxTemp = zone.minTemp + 1
    }
  }
}

// Generate 24h temperature history data for a zone
const generate24HData = (zoneId: number, currentTemp: number) => {
  const data: [number, number][] = []
  const now = new Date().getTime()

  // Generate data points for last 24 hours (every 30 minutes = 48 points)
  for (let i = 48; i >= 0; i--) {
    const timestamp = now - (i * 30 * 60 * 1000)
    // Create realistic temperature variation around current temp
    const hourOfDay = new Date(timestamp).getHours()
    // Simulate daily temperature pattern (cooler at night, warmer during day)
    const dailyPattern = Math.sin((hourOfDay - 6) * Math.PI / 12) * 1.5
    const randomVariation = (Math.random() - 0.5) * 0.8
    const temp = Number((currentTemp + dailyPattern + randomVariation).toFixed(1))
    data.push([timestamp, temp])
  }

  return data
}

// Chart configuration for zone temperature history
const getChartOptions = (zone: Zone) => {
  return {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
      animations: { enabled: true, speed: 800 }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    colors: ['#2196F3'],
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        format: 'HH:mm',
        style: {
          fontSize: '9px',
          colors: '#9CA3AF'
        },
        rotate: 0
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val ? val.toFixed(1) + '°' : '',
        style: {
          fontSize: '9px',
          colors: '#9CA3AF'
        }
      },
      min: (zone.minTemp ?? 18) - 3,
      max: (zone.maxTemp ?? 28) + 3
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 3,
      padding: { top: 0, right: 10, bottom: 0, left: 0 },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      x: {
        format: 'dd MMM HH:mm'
      },
      y: {
        formatter: (val: number) => val.toFixed(1) + '°C'
      }
    },
    annotations: {
      yaxis: [
        {
          y: zone.maxTemp,
          borderColor: '#EF4444',
          strokeDashArray: 4,
          opacity: 0.5,
          label: {
            text: `${t('thermal.chart.annotationMax')} ${zone.maxTemp}°C`,
            position: 'left',
            style: {
              fontSize: '9px',
              color: '#fff',
              background: '#EF4444',
              padding: { left: 4, right: 4, top: 2, bottom: 2 }
            }
          }
        },
        {
          y: zone.minTemp,
          borderColor: '#3B82F6',
          strokeDashArray: 4,
          opacity: 0.5,
          label: {
            text: `${t('thermal.chart.annotationMin')} ${zone.minTemp}°C`,
            position: 'left',
            style: {
              fontSize: '9px',
              color: '#fff',
              background: '#3B82F6',
              padding: { left: 4, right: 4, top: 2, bottom: 2 }
            }
          }
        }
      ]
    }
  }
}

const getChartSeries = (zone: Zone) => {
  const currentTemp = 21.2 // Using the same temp as display
  return [
    {
      name: t('thermal.chart.temperature'),
      data: generate24HData(zone.id, currentTemp)
    }
  ]
}

const togglePower = (zoneId: number) => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (zone) {
    zone.power = !zone.power
  }
}

const openChartModal = (zoneId: number) => {
  chartModalZoneId.value = zoneId
}

const closeChartModal = () => {
  chartModalZoneId.value = null
}

const setMode = (zoneId: number, mode: 'manual' | 'auto') => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (zone) {
    zone.mode = mode
  }
}

// Build zones based on sensors (ensure at least 8)
function buildZonesFromSensors(sensors: Sensor[]) {
  const base = sensors.length > 0 ? sensors : [{
    id: 'fallback',
    name: 'Fallback Sensor',
    label: 'Fallback',
    deviceUUID: 'fallback',
    accessToken: 'fallback',
    zone: 'Fallback',
    minTemp: 18,
    maxTemp: 28,
    avgTemp: 22,
    readings: [],
    timeSeries: { hourly: [], daily: [], monthly: [] },
    assignedToCustomer: false,
    customerId: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Sensor]

  const targetCount = Math.max(base.length, MIN_SENSORS_DISPLAY)
  const built: Zone[] = []

  for (let i = 0; i < targetCount; i++) {
    const sensor = base[i % base.length]
    const avg = sensor.avgTemp ?? 22
    const max = sensor.maxTemp ?? Math.round((avg + 2) * 10) / 10
    const min = sensor.minTemp ?? Math.round((avg - 2) * 10) / 10

    built.push({
      id: i + 1,
      maxTemp: max,
      minTemp: min,
      power: i % 3 !== 2, // Every third zone is off (grey/red)
      mode: 'auto',
      sensorId: sensor.id,
      sensorLabel: getSensorLabel(sensor),
      sensorName: getSensorName(sensor),
    })
  }

  zones.value = built
  visibleZoneIds.value = built.map((z) => z.id)
  zonesOrder.value = built.map((z) => z.id)
}

onMounted(async () => {
  await sensorsStore.fetchSensors()
  buildZonesFromSensors(sensorsForDisplay.value)
})

const sensorDisplayKey = computed(() => sensorsForDisplay.value.map((s) => s.id).join('|'))

watch(
  () => sensorDisplayKey.value,
  (newKey) => {
    const zoneKey = zones.value.map((z) => z.sensorId ?? `zone-${z.id}`).join('|')
    if (zoneKey !== newKey) {
      buildZonesFromSensors(sensorsForDisplay.value)
    }
  }
)

// Validation helper
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
</script>

<style scoped>
/* Zone cards grid - controlled by columnsPerRow slider via inline style */
/* Mobile responsive override */
@media (max-width: 639px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
/* Desktop (1024px+): uses the columnsPerRow slider value from inline style */
</style>
