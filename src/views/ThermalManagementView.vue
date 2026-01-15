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
          <!-- Manage Sensors Button -->
          <button
            @click="showSensorSelector = true"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 transition"
          >
            <span class="material-symbols-outlined">settings</span>
            Manage Sensors
          </button>
        </div>

        <!-- Sensor Selector Modal -->
        <SensorSelector
          :is-open="showSensorSelector"
          @apply="handleSensorSelection"
          @close="showSensorSelector = false"
        ></SensorSelector>

        <!-- Status Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-blue-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.active') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">{{ activeZones }}/6</div>
            <div class="text-blue-100 text-sm mt-1">{{ t('thermal.status.operational') }}</div>
          </div>

          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-green-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.avgTemp') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">21.5°C</div>
            <div class="text-green-100 text-sm mt-1">{{ t('thermal.status.currentAverage') }}</div>
          </div>

          <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-amber-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.energy') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">87%</div>
            <div class="text-amber-100 text-sm mt-1">{{ t('thermal.status.efficiency') }}</div>
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <div class="text-purple-100 text-sm font-semibold uppercase tracking-wide">{{ t('thermal.status.systemStatus') }}</div>
              <div class="bg-white/20 rounded-full p-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                </svg>
              </div>
            </div>
            <div class="text-4xl font-bold">{{ t('thermal.power.on') }}</div>
            <div class="text-purple-100 text-sm mt-1">{{ t('thermal.status.allSystems') }}</div>
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
          <!-- Row 1: Columns slider (visible on all sizes) -->
          <div class="flex items-center justify-between gap-2 sm:gap-3">
            <label class="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              {{ t('thermal.controls.columns') }}:
            </label>
            <div class="flex items-center gap-2 sm:gap-3">
              <input
                v-model.number="columnsPerRow"
                type="range"
                min="1"
                max="6"
                class="h-1 w-16 sm:w-24 accent-indigo-600"
              />
              <span class="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{{ columnsPerRow }}</span>
            </div>
          </div>

          <!-- Row 2: Action buttons (top right on desktop, full width on mobile) -->
          <div class="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
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

          <!-- Row 3: Zone selection checkboxes (horizontal scroll on mobile) -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
              {{ t('thermal.controls.zones') }}:
            </label>
            <div class="flex flex-wrap gap-1.5 overflow-x-auto pb-2">
              <label v-for="z in zones" :key="'sel-'+z.id" class="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-2 sm:px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex-shrink-0">
                <input
                  type="checkbox"
                  class="h-3 w-3 accent-indigo-600"
                  :value="z.id"
                  v-model="visibleZoneIds"
                />
                Z{{ z.id }}
              </label>
            </div>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {{ t('thermal.controls.orderHint') }}
        </p>
      </div>

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
                  <h3 class="text-xs sm:text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">
                    {{ t('thermal.zone', { number: zone.id }) }}
                  </h3>
                  <span
                    :class="[
                      'inline-flex h-1.5 sm:h-2 lg:h-2.5 w-1.5 sm:w-2 lg:w-2.5 animate-pulse rounded-full shadow-lg flex-shrink-0',
                      zone.power ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-400',
                    ]"
                  ></span>
                </div>
                <p class="mt-0.5 sm:mt-1 lg:mt-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {{ zone.power ? t('thermal.status.operational') : t('thermal.status.standby') }}
                </p>
              </div>
              <!-- Zone Number Badge -->
              <div
                :class="[
                  'flex h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 items-center justify-center rounded-md sm:rounded-lg lg:rounded-xl text-xs sm:text-base lg:text-lg font-bold shadow-md flex-shrink-0',
                  zone.power
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700',
                ]"
              >
                {{ zone.id }}
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

            <!-- Temperature Controls -->
            <div class="space-y-1.5 sm:space-y-2 lg:space-y-3">
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

            <!-- Power Toggle Button -->
            <div class="my-2.5 sm:my-3 lg:my-6 flex justify-center">
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

            <!-- Mode Selection -->
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
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {{ t('thermal.charts.zoneTemps.subtitle') }}
                    </p>
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
              <component
                :is="chartType === 'line' ? LineChart : BarChart"
                :data="tempChartData"
                :options="chartOptions"
                style="height: 300px;"
              ></component>

              <!-- Data Range Slider (Below X-axis) -->
              <div class="mt-2">
                <div class="relative h-6">
                  <!-- Background track -->
                  <div class="absolute top-2 h-2 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <!-- Active track -->
                  <div class="absolute top-2 h-2 rounded-full bg-indigo-600"
                    :style="{ left: `${dataRangeStart}%`, right: `${100 - dataRangeEnd}%` }">
                  </div>
                  <!-- Start slider -->
                  <input
                    v-model.number="dataRangeStart"
                    type="range"
                    min="0"
                    max="100"
                    @input="updateRangeStart((($event as Event).target as HTMLInputElement).value as unknown as number)"
                    class="pointer-events-none absolute top-0 h-6 w-full appearance-none accent-indigo-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md"
                  />
                  <!-- End slider -->
                  <input
                    v-model.number="dataRangeEnd"
                    type="range"
                    min="0"
                    max="100"
                    @input="updateRangeEnd((($event as Event).target as HTMLInputElement).value as unknown as number)"
                    class="pointer-events-none absolute top-0 h-6 w-full appearance-none accent-indigo-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md"
                  />
                </div>
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
              <BarChart :data="minMaxChartData" :options="chartOptions" style="height: 300px;"></BarChart>
            </div>
          </div>
        </div>
      </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import SensorSelector from '@/components/common/SensorSelector.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const { t } = useI18n()
const sensorsStore = useSensorsStore()

// UI State
const showSensorSelector = ref(false)

// Selected sensors
const selectedSensors = computed(() => sensorsStore.selectedSensors)

function handleSensorSelection(sensorIds: string[]) {
  sensorsStore.setSelectedSensors(sensorIds)
  showSensorSelector.value = false
}

interface Zone {
  id: number
  maxTemp: number | null
  minTemp: number | null
  power: boolean
  mode: 'manual' | 'auto'
}

const zones = ref<Zone[]>([
  { id: 1, maxTemp: 22, minTemp: 19, power: true, mode: 'manual' },
  { id: 2, maxTemp: 24, minTemp: 21, power: true, mode: 'manual' },
  { id: 3, maxTemp: 24, minTemp: 21, power: false, mode: 'manual' },
  { id: 4, maxTemp: 24, minTemp: 21, power: true, mode: 'manual' },
  { id: 5, maxTemp: null, minTemp: null, power: false, mode: 'manual' },
  { id: 6, maxTemp: null, minTemp: null, power: false, mode: 'manual' },
])

const activeZones = computed(() => zones.value.filter((z) => z.power).length)

// Chart data: compute from zones
const chartZoneTemps = computed(() => {
  const temps = [21.2, 23.2, 20.1, 22.8, 19.5, 21.5] // Static realistic values per zone
  return zones.value.map((z, i) => ({
    id: z.id,
    value: temps[i],
    height: ((temps[i] - 16) / (24 - 16)) * 100, // Scale from 16-24°C range
  }))
})

const avgZoneTemp = computed(() => {
  const temps = chartZoneTemps.value.map((z) => z.value)
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

// Generate realistic temp data for selected period
const generateTempData = () => {
  const baseTemps = [21.2, 23.2, 20.1, 22.8, 19.5, 21.5]
  const hours = chartPeriod.value
  const data: number[][] = Array(6).fill(null).map(() => [])
  for (let i = 0; i <= hours; i++) {
    baseTemps.forEach((base, idx) => {
      const variation = Math.sin((i / hours) * Math.PI) * 0.5
      data[idx].push(Number((base + variation).toFixed(1)))
    })
  }
  return data
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
  const rawData = generateTempData()
  const filtered = rawData.map((d) => filterDataByRange(d))
  return {
    labels: filteredChartTimeLabels.value,
    datasets: [
      { label: 'Z1', data: filtered[0], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.7)', tension: 0.4, borderWidth: 2 },
      { label: 'Z2', data: filtered[1], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.7)', tension: 0.4, borderWidth: 2 },
      { label: 'Z3', data: filtered[2], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.7)', tension: 0.4, borderWidth: 2 },
      { label: 'Z4', data: filtered[3], borderColor: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.7)', tension: 0.4, borderWidth: 2 },
      { label: 'Z5', data: filtered[4], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.7)', tension: 0.4, borderWidth: 2 },
      { label: 'Z6', data: filtered[5], borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.7)', tension: 0.4, borderWidth: 2 },
    ],
  }
})

const minMaxChartData = computed(() => ({
  labels: zones.value.map((z) => `Z${z.id}`),
  datasets: [
    {
      label: 'Min Temp',
      data: zones.value.map((z) => z.minTemp ?? 0),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
    },
    {
      label: 'Current',
      data: [21.2, 23.2, 20.1, 22.8, 19.5, 21.5],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: '#10b981',
      borderWidth: 2,
    },
    {
      label: 'Max Temp',
      data: zones.value.map((z) => z.maxTemp ?? 0),
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: '#ef4444',
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      min: 10,
      max: 30,
      ticks: {
        callback: (value: number | string) => `${value}°C`
      }
    },
  },
}

// Display controls
const columnsPerRow = ref(4)
const visibleZoneIds = ref<number[]>(zones.value.map((z) => z.id))
const zonesOrder = ref<number[]>(zones.value.map((z) => z.id))

// Responsive grid layout
// Mobile: 1 column (always, with small cards)
// Tablet: 2 columns (max, medium cards)
// Desktop: user-controlled via columnsPerRow slider (full-size cards)
const gridColumns = computed(() => {
  // Use the columnsPerRow slider value directly
  return `repeat(${columnsPerRow.value}, minmax(0, 1fr))`
})

const displayedZones = computed(() =>
  zonesOrder.value
    .filter((id) => visibleZoneIds.value.includes(id))
    .map((id) => zones.value.find((z) => z.id === id)!)
    .filter(Boolean)
)

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

const togglePower = (zoneId: number) => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (zone) {
    zone.power = !zone.power
  }
}

const setMode = (zoneId: number, mode: 'manual' | 'auto') => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (zone) {
    zone.mode = mode
  }
}

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
