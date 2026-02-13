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

        <!-- Error Banner (Thermal API) -->
        <div v-if="thermalError"
          class="rounded-lg border-l-4 border-l-red-600 border border-red-200 bg-gradient-to-r from-red-50 to-red-50/50 p-4 shadow-sm dark:border-l-red-500 dark:border-red-900/30 dark:bg-gradient-to-r dark:from-red-950/50 dark:to-red-950/20">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <h3 class="text-sm font-bold text-red-900 dark:text-red-200">
                  {{ t('thermal.error.apiError') }}
                </h3>
                <p class="mt-3 text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  {{ t('thermal.error.checkConnection') }}
                </p>
              </div>
            </div>
            <button @click="thermalError = null" class="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 p-1 rounded-md transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <div v-if="dataMode === 'api'" class="mt-4">
            <button @click="refreshThermalData" :disabled="isFetchingThermal"
              class="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-red-700 dark:hover:bg-red-600">
              <svg v-if="isFetchingThermal" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ t('thermal.error.retry') }}
            </button>
          </div>
        </div>

        <!-- Sensor Selector Modal -->
        <SensorSelector :is-open="showSensorSelector" @apply="handleSensorSelection"
          @close="showSensorSelector = false"></SensorSelector>

        <!-- Loading Banner -->
        <div v-if="isFetchingThermal && zones.length === 0" class="flex flex-col items-center justify-center py-24">
          <div class="text-center">
            <div class="inline-block mb-6">
              <div
                class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-slate-700 border-t-blue-600 dark:border-t-cyan-400">
              </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ $t('thermal.loading') }}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">{{ $t('thermal.loadingDescription') }}</p>
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse"></div>
              <div class="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse"
                style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse"
                style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <!-- Main Content (Hidden during initial load) -->
        <div v-if="!(isFetchingThermal && zones.length === 0)">


        </div>
      </div>

      <!-- Zone Control Section -->
      <div v-if="!(isFetchingThermal && zones.length === 0)" class="mb-6">
        <h2 class="mb-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('thermal.sections.zoneControl') }}
        </h2>

        <!-- Display Controls: compact, cohesive panel -->
        <div
          class="mb-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ t('thermal.controls.displayControls') }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                {{ t('thermal.controls.visible') }} {{ visibleZoneIds.length }} / {{ zones.length }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <div class="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {{ t('thermal.controls.columnsLabel') }}
                </span>
                <input v-model.number="columnsPerRow" type="range" min="1" max="4" class="h-1 w-20 accent-indigo-600" />
                <span class="w-6 text-center text-[10px] font-bold text-slate-900 dark:text-white">{{ columnsPerRow }}</span>
              </div>
              <button @click="selectAllZones"
                class="rounded-md border border-indigo-200 bg-indigo-50 px-2 sm:px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-200 dark:hover:bg-indigo-900/30 whitespace-nowrap">
                {{ t('thermal.controls.selectAll') }}
              </button>
              <button @click="clearZones"
                class="rounded-md border border-slate-200 bg-white px-2 sm:px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap">
                {{ t('thermal.controls.clear') }}
              </button>
              <button @click="resetOrder"
                class="rounded-md border border-slate-200 bg-white px-2 sm:px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap">
                {{ t('thermal.controls.resetOrder') }}
              </button>
            </div>
          </div>

          <div class="mt-3 grid gap-3 lg:grid-cols-2">
            <div v-if="zones.filter((z) => z.minTemp !== null && z.maxTemp !== null && z.mode !== null).length > 0"
              class="rounded-lg border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-900/10">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
                  {{ t('thermal.controls.controllableZones') }}
                </span>
                <span class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {{ zones.filter((z) => z.minTemp !== null && z.maxTemp !== null && z.mode !== null).length }}
                </span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
                <button v-for="z in zones.filter((zone) => zone.minTemp !== null && zone.maxTemp !== null && zone.mode !== null)" :key="'sel-' + z.id" @click="toggleZoneVisibility(z.id)"
                  :title="`${z.sensorName || `Z${z.id}`}${z.sensorLabel ? ` - ${z.sensorLabel}` : ''}`" :class="[
                    'px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all duration-200 border flex flex-col items-start gap-1 relative overflow-hidden group',
                    visibleZoneIds.includes(z.id)
                      ? 'text-white shadow-sm border-indigo-400 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700'
                      : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50/70 dark:hover:bg-slate-800'
                  ]">
                  <div class="flex items-center gap-1 w-full flex-1 min-w-0">
                    <span v-if="visibleZoneIds.includes(z.id)"
                      class="material-symbols-outlined text-xs flex-shrink-0">check_circle</span>
                    <div class="flex-1 min-w-0">
                      <span class="font-semibold truncate text-left block">{{ z.sensorName || `Z${z.id}` }}</span>
                      <span class="text-[9px] opacity-75 truncate text-left block"
                        :class="visibleZoneIds.includes(z.id) ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'">{{
                        z.sensorLabel }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div v-if="zones.filter((z) => z.minTemp === null || z.maxTemp === null || z.mode === null).length > 0"
              class="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/60">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {{ t('thermal.controls.externalSensors') }}
                </span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ zones.filter((z) => z.minTemp === null || z.maxTemp === null || z.mode === null).length }}
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button v-for="z in zones.filter((zone) => zone.minTemp === null || zone.maxTemp === null || zone.mode === null)" :key="'sel-ext-' + z.id" @click="toggleZoneVisibility(z.id)"
                  :title="`${z.sensorName || `Z${z.id}`}${z.sensorLabel ? ` - ${z.sensorLabel}` : ''}`" :class="[
                    'px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all duration-200 border flex flex-col items-start gap-1 relative overflow-hidden group',
                    visibleZoneIds.includes(z.id)
                      ? 'text-white shadow-sm border-slate-400 bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-600 dark:to-slate-700'
                      : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800'
                  ]">
                  <div class="flex items-center gap-1 w-full flex-1 min-w-0">
                    <span v-if="visibleZoneIds.includes(z.id)"
                      class="material-symbols-outlined text-xs flex-shrink-0">check_circle</span>
                    <div class="flex-1 min-w-0">
                      <span class="font-semibold text-left block break-words">{{ z.sensorName || `Z${z.id}` }}</span>
                      <span class="text-[9px] opacity-75 text-left block break-words"
                        :class="visibleZoneIds.includes(z.id) ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'">{{
                        z.sensorLabel }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Unified Zone Cards Grid - All sensors combined with visual differentiation -->
        <div
          class="grid gap-3 sm:gap-4"
          :style="{ gridTemplateColumns: gridColumns }">
          <div
            v-for="zone in displayedZones"
            :key="zone.id"
            :class="[
            'zone-card overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm transition-all duration-200',
            draggingId === zone.id ? 'opacity-50 cursor-grabbing' : 'hover:shadow-lg cursor-grab',
            dragOverId === zone.id ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950' : '',
            zone.minTemp === null || zone.maxTemp === null || zone.mode === null
              ? 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700'
              : 'bg-indigo-50/20 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-700/60',
          ]"
            draggable="true"
            @dragstart="onDragStart(zone.id)"
            @dragenter="onDragEnter(zone.id)"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop(zone.id)"
            @dragend="onDragEnd">
            <!-- Zone Header with Status and Chart Block -->
            <div class="mb-4 sm:mb-5 lg:mb-6 flex items-start justify-between gap-3">
              <!-- Zone Info Block -->
              <div class="flex-1 min-w-0">
                <h3 class="text-xs sm:text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">
                  {{ zone.sensorLabel }}
                </h3>
                <p class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 truncate"
                  :title="zone.sensorName">
                  {{ zone.sensorName || t('thermal.zone', { number: zone.id }) }}
                </p>

                <!-- Status Badge -->
                <div class="mt-2 flex flex-wrap items-center gap-1.5">
                  <span v-if="zone.minTemp === null || zone.maxTemp === null || zone.mode === null" class="inline-flex items-center gap-1 rounded-full border-2 border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                    {{ t('thermal.chart.external') }}
                  </span>
                  <span :class="[
                    'inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-semibold whitespace-nowrap',
                    zone.powerStatus === false
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  ]">
                    <svg
                      :class="['w-2 h-2 sm:w-2.5 sm:h-2.5', zone.powerStatus === false ? 'text-red-500' : 'text-green-500']"
                      fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                    <span class="hidden sm:inline">{{ zone.powerStatus === false ? t('thermal.chart.inactive') :
                      t('thermal.chart.active') }}</span>
                    <span class="sm:hidden">{{ zone.powerStatus === false ? t('thermal.chart.inactive') :
                      t('thermal.chart.active') }}</span>
                  </span>
                </div>
              </div>

              <!-- Chart Icon Block -->
              <div class="flex flex-col items-center gap-2">
                <button @click="openChartModal(zone)"
                  class="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                  :title="t('thermal.chart.open')">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <!-- Current Temperature Display -->
            <div
              :class="[
                'mb-2 sm:mb-3 lg:mb-4 rounded-md sm:rounded-lg lg:rounded-xl border p-2 sm:p-3 lg:p-5 shadow-inner',
                zone.minTemp === null || zone.maxTemp === null || zone.mode === null
                  ? 'border-slate-200 bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/50'
                  : 'border-indigo-200 bg-indigo-100/40 dark:border-indigo-700/50 dark:bg-indigo-900/30'
              ]">
              <div class="mb-1 sm:mb-1.5 lg:mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {{ t('thermal.currentTemp') }}
              </div>
              <div class="flex items-baseline gap-1 sm:gap-2">
                <span
                  class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">{{
                    zone.currentTemp !== null ? zone.currentTemp.toFixed(1) : '--' }}</span>
                <span class="text-base sm:text-lg lg:text-xl font-semibold text-gray-500 dark:text-gray-400">°C</span>
              </div>
            </div>

            <!-- External Zones: 24h Temperature Sparkline -->
            <div
              v-if="zone.minTemp === null || zone.maxTemp === null || zone.mode === null"
              class="mt-2 sm:mt-3 lg:mt-4 rounded-md sm:rounded-lg border border-slate-200 bg-white/80 p-2 shadow-inner dark:border-slate-700 dark:bg-slate-900/60">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">24h</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500">Trend</span>
              </div>
              <div v-if="hasMiniChartData(zone)">
                <VueApexCharts
                  type="area"
                  height="240"
                  :options="getMiniChartOptions(zone)"
                  :series="getMiniChartSeries(zone)" />
              </div>
              <div v-else class="h-[240px] flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">
                No data
              </div>
            </div>

            <!-- Controls Area: Only show for controllable zones -->
            <div v-if="zone.minTemp !== null && zone.maxTemp !== null && zone.mode !== null" class="flex flex-col">
              <!-- Controls Content (Fixed Height) -->
              <div class="min-h-[140px] sm:min-h-[160px] lg:min-h-[200px] flex items-center justify-center mb-3 sm:mb-4 lg:mb-5">
                <!-- No Data Message (Missing Critical Fields) -->
                <div v-if="hasNoData(zone)" class="text-lg sm:text-xl font-semibold text-gray-500 dark:text-gray-400">
                  N/A
                </div>

                <!-- Power Toggle Button (Manual Mode Only) -->
                <div v-else-if="zone.mode === 'manuel' && zone.powerStatus !== null" class="w-full flex justify-center">
                  <button @click="togglePower(zone.id)" :disabled="isControllingRelay[zone.sensorId || '']" :class="[
                    'group relative flex h-16 sm:h-20 lg:h-28 w-16 sm:w-20 lg:w-28 flex-col items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                    zone.power
                      ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-green-500/40 hover:shadow-green-500/60'
                      : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 shadow-gray-500/40 hover:from-red-400 hover:via-red-500 hover:to-red-600 hover:shadow-red-500/60',
                  ]">
                    <!-- Power Icon or Loading Spinner -->
                    <svg v-if="!isControllingRelay[zone.sensorId || '']"
                      class="h-5 sm:h-7 lg:h-10 w-5 sm:w-7 lg:w-10 mb-0.5 sm:mb-0.5 lg:mb-1" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <svg v-else class="h-5 sm:h-7 lg:h-10 w-5 sm:w-7 lg:w-10 mb-0.5 sm:mb-0.5 lg:mb-1 animate-spin"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    <!-- Power Label -->
                    <span class="text-xs font-bold uppercase tracking-wider">
                      {{ isControllingRelay[zone.sensorId || ''] ? t('common.wait') : (zone.power ?
                        t('thermal.power.on') : t('thermal.power.off')) }}
                    </span>
                    <!-- Glow Effect -->
                    <div :class="[
                      'absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-50',
                      zone.power ? 'bg-green-400' : 'bg-red-400',
                    ]"></div>
                  </button>

                  <!-- Relay Error Message -->
                  <div v-if="relayError" class="absolute -bottom-8 left-0 right-0 text-center">
                    <p class="text-xs font-semibold text-red-600 dark:text-red-400 whitespace-normal">
                      {{ relayError }}
                    </p>
                  </div>
                </div>

                <!-- Temperature Controls (Auto Mode Only) -->
                <div v-else-if="zone.mode === 'auto'" class="w-full space-y-1.5 sm:space-y-2 lg:space-y-3">
                  <!-- Max Temperature -->
                  <div>
                    <label
                      class="mb-0.5 sm:mb-1 lg:mb-1.5 flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 gap-1">
                      <span class="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <svg class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 text-red-500 flex-shrink-0"
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                        </svg>
                        <span class="hidden sm:inline">{{ t('thermal.maxTemp') }}</span>
                        <span class="sm:hidden">Max</span>
                      </span>
                      <span v-if="zone.maxTemp"
                        class="rounded bg-red-100 px-1 sm:px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400 flex-shrink-0">
                        {{ zone.maxTemp }}°C
                      </span>
                    </label>
                    <div class="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 min-w-0">
                      <input v-model.number="zone.maxTemp" type="number" step="0.5" min="10" max="40"
                        :disabled="zone.mode !== 'auto'"
                        class="min-w-0 flex-1 rounded border-2 border-gray-200 bg-white px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-sm font-medium text-gray-900 transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-900/30" />
                      <div class="flex flex-col gap-0.5 shrink-0">
                        <button @click="adjustTemp(zone.id, 'max', 1)" :disabled="zone.mode !== 'auto'"
                          class="rounded-t border border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30">
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button @click="adjustTemp(zone.id, 'max', -1)" :disabled="zone.mode !== 'auto'"
                          class="rounded-b border border-t-0 border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30">
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Min Temperature -->
                  <div>
                    <label
                      class="mb-0.5 sm:mb-1 lg:mb-1.5 flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300 gap-1">
                      <span class="flex items-center gap-0.5 sm:gap-1 min-w-0">
                        <svg class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 text-blue-500 flex-shrink-0"
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                        </svg>
                        <span class="hidden sm:inline">{{ t('thermal.minTemp') }}</span>
                        <span class="sm:hidden">Min</span>
                      </span>
                      <span v-if="zone.minTemp"
                        class="rounded bg-blue-100 px-1 sm:px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">
                        {{ zone.minTemp }}°C
                      </span>
                    </label>
                    <div class="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5 min-w-0">
                      <input v-model.number="zone.minTemp" type="number" step="0.5" min="10" max="40"
                        :disabled="zone.mode !== 'auto'"
                        class="min-w-0 flex-1 rounded border-2 border-gray-200 bg-white px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-sm font-medium text-gray-900 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/30" />
                      <div class="flex flex-col gap-0.5 shrink-0">
                        <button @click="adjustTemp(zone.id, 'min', 1)" :disabled="zone.mode !== 'auto'"
                          class="rounded-t border border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30">
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button @click="adjustTemp(zone.id, 'min', -1)" :disabled="zone.mode !== 'auto'"
                          class="rounded-b border border-t-0 border-gray-300 bg-white p-0.5 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30">
                          <svg class="h-2 sm:h-2.5 lg:h-3 w-2 sm:w-2.5 lg:w-3" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mode Selection (Fixed Position) -->
              <div class="flex gap-1 sm:gap-1.5 lg:gap-2">
                <button @click="setMode(zone.id, 'manuel')" :disabled="isUpdatingMode[zone.id]" :class="[
                  'group relative flex-1 overflow-hidden rounded-md sm:rounded-lg lg:rounded-xl px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 text-xs font-bold uppercase tracking-wide shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
                  zone.mode === 'manuel'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/40'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                ]">
                  <span class="relative z-10 flex items-center justify-center gap-0.5 sm:gap-1">
                    <svg v-if="isUpdatingMode[zone.id]" class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span class="hidden sm:inline">{{ isUpdatingMode[zone.id] ? t('thermal.mode.updating') : t('thermal.manuel') }}</span>
                    <span class="sm:hidden">{{ isUpdatingMode[zone.id] ? '...' : 'M' }}</span>
                  </span>
                </button>
                <button @click="setMode(zone.id, 'auto')" :disabled="isUpdatingMode[zone.id]" :class="[
                  'group relative flex-1 overflow-hidden rounded-md sm:rounded-lg lg:rounded-xl px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 lg:py-3 text-xs font-bold uppercase tracking-wide shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
                  zone.mode === 'auto'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/40'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                ]">
                  <span class="relative z-10 flex items-center justify-center gap-0.5 sm:gap-1">
                    <svg v-if="isUpdatingMode[zone.id]" class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="h-2.5 sm:h-3 lg:h-3 w-2.5 sm:w-3 lg:w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clip-rule="evenodd" />
                    </svg>
                    <span class="hidden sm:inline">{{ isUpdatingMode[zone.id] ? t('thermal.mode.updating') : t('thermal.auto') }}</span>
                    <span class="sm:hidden">{{ isUpdatingMode[zone.id] ? '...' : 'A' }}</span>
                  </span>
                </button>
              </div>

              <!-- Mode Update Error Message -->
              <transition name="fade">
                <div v-if="modeUpdateError[zone.id]" class="mt-2">
                  <div v-if="modeUpdateError[zone.id]?.includes('Network') || modeUpdateError[zone.id]?.includes('fetch') || modeUpdateError[zone.id]?.includes('ECONNREFUSED')"
                    class="rounded-md bg-orange-50 p-2 dark:bg-orange-900/20">
                    <div class="flex items-start gap-1.5">
                      <svg class="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                      <div>
                        <p class="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200">{{ t('thermal.error.network') }}</p>
                        <p class="text-xs text-orange-700 dark:text-orange-300 mt-1">{{ t('thermal.error.checkConnection') }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs sm:text-sm text-red-700 dark:text-red-300">
                    <div class="flex items-start gap-1.5">
                      <svg class="h-3.5 w-3.5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clip-rule="evenodd" />
                      </svg>
                      <span>{{ modeUpdateError[zone.id] }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Status Indicator Bar -->
            <div :class="[
              'absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 lg:h-2 transition-all duration-300',
              zone.minTemp === null || zone.maxTemp === null || zone.mode === null
                ? zone.power
                  ? 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 shadow-lg shadow-slate-500/50'
                  : 'bg-slate-200 dark:bg-slate-700'
                : zone.power
                  ? 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/50'
                  : 'bg-indigo-200 dark:bg-indigo-800'
            ]"></div>
          </div>
        </div>

          </div>

          <!-- Temperature Monitoring Section -->
          <div v-if="!(isFetchingThermal && zones.length === 0)" class="mb-6">

            <!-- Temperature Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Zone Temperatures Chart -->
              <div
                class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white shadow-sm dark:bg-slate-900 transition-shadow duration-300 flex flex-col">
                <div
                  class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                  <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {{ t('thermal.charts.zoneTemps.title') }}
                  </h3>
                </div>

                <!-- Unified Chart -->
                <div
                  class="flex-1 p-3 sm:p-4 flex flex-col bg-white dark:bg-slate-900 min-h-[480px]">
                  <div v-if="isFetchingChartData" class="flex items-center justify-center flex-1">
                    <div class="text-center">
                      <div
                        class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-300 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400 mb-2">
                      </div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
                    </div>
                  </div>
                  <div v-else class="w-full" style="height: 500px;">
                    <VueApexCharts :key="`chart-${chartDataMap.size}`" type="area" height="500"
                      :options="getAllSensorsChartOptions()" :series="getAllSensorsChartSeries()" />
                  </div>
                </div>
              </div>

              <!-- External Temperature Chart -->
              <div
                class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white shadow-sm dark:bg-slate-900 transition-shadow duration-300 flex flex-col">
                <div
                  class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                  <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {{ t('thermal.charts.exteriorTemp.title') }}
                  </h3>
                </div>

                <!-- Chart -->
                <div
                  class="flex-1 p-3 sm:p-4 flex flex-col bg-white dark:bg-slate-900 min-h-[480px]">
                  <div v-if="isFetchingChartData" class="flex items-center justify-center flex-1">
                    <div class="text-center">
                      <div
                        class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-300 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400 mb-2">
                      </div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
                    </div>
                  </div>
                  <div v-else class="w-full" style="height: 500px;">
                    <VueApexCharts :key="`external-chart-${chartDataMap.size}`" type="area" height="500"
                      :options="getExternalSensorsChartOptions()" :series="getExternalSensorsChartSeries()" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        <!-- End Main Content -->

        <!-- Chart Modal -->
        <Teleport to="body">
          <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div v-if="showChartModal"
              class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
              @click.self="closeChartModal" style="margin: 0 !important;">
              <div
                class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative z-[999999]"
                @click.stop v-if="chartModalZone">
                <!-- Modal Header -->
                <div
                  class="flex items-center justify-between p-2 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {{ chartModalZone.sensorLabel || chartModalZone.sensorName || `Zone ${chartModalZone.id}` }}
                    </h3>
                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 truncate">{{
                      t('thermal.chart.subtitle') }}</p>
                  </div>
                  <button @click="closeChartModal"
                    class="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
                    <svg class="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Modal Body with Chart -->
                <div class="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
                  <div v-if="chartModalZone" class="h-[250px] sm:h-[350px] md:h-[500px]">
                    <VueApexCharts type="area" :height="'100%'" :options="getChartOptions(chartModalZone!)"
                      :series="getChartSeries(chartModalZone!)" />
                  </div>
                </div>

                <!-- Modal Footer with Zone Info -->
                <div
                  class="flex items-center justify-between p-2 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-wrap gap-2 sm:gap-4 flex-shrink-0">
                  <div class="flex items-center gap-6">
                    <div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('thermal.chart.current') }}</div>
                      <div class="text-lg font-bold text-gray-900 dark:text-white">{{ chartModalZone.currentTemp !== null ?
                        chartModalZone.currentTemp.toFixed(1) : '--' }}°C</div>
                    </div>
                    <div>
                      <div class="text-xs text-red-500">{{ t('thermal.chart.maxTarget') }}</div>
                      <div class="text-lg font-bold text-red-600 dark:text-red-400">{{ chartModalZone.maxTemp }}°C</div>
                    </div>
                    <div>
                      <div class="text-xs text-blue-500">{{ t('thermal.chart.minTarget') }}</div>
                      <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ chartModalZone.minTemp }}°C</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      :class="chartModalZone.power ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'">
                      {{ chartModalZone.power ? t('thermal.chart.active') : t('thermal.chart.inactive') }}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                      :class="chartModalZone.mode === 'auto' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                      {{ chartModalZone.mode === 'auto' ? t('thermal.auto') : t('thermal.manuel') }}
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSensorsStore } from '@/features/thermal-management/store/useSensorsStore'
import { dataMode } from '@/config/dataMode'
import { fetchThermalDashboardData, updateSensorMode } from '@/services/thermalTelemetryAPI'
import { fetchThermalChartData, type SensorChartData, controlThermalRelay } from '@/services/thermalChartAPI'
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

// Thermal API state
const isFetchingThermal = ref(true)
const thermalError = ref<string | null>(null)

// Chart data state
const isFetchingChartData = ref(false)
const chartDataMap = ref<Map<string, SensorChartData['data']>>(new Map())

// Relay control state
const isControllingRelay = ref<Record<string, boolean>>({})
const relayError = ref<string | null>(null)

// Mode update state
const isUpdatingMode = ref<Record<number, boolean>>({})
const modeUpdateError = ref<Record<number, string | null>>({})

// UI State
const showSensorSelector = ref(false)
const chartModalZoneId = ref<number | null>(null)
const showChartModal = computed(() => chartModalZoneId.value !== null)
const chartModalZone = computed(() => {
  const zone = zones.value.find(z => z.id === chartModalZoneId.value)
  return zone || undefined
})

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobileViewport = computed(() => viewportWidth.value < 640)

const handleResize = () => {
  if (typeof window === 'undefined') return
  viewportWidth.value = window.innerWidth
}

onMounted(() => {
  if (typeof window === 'undefined') return
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', handleResize)
})

interface Zone {
  id: number
  currentTemp: number | null     // Actual temperature from API
  maxTemp: number | null
  minTemp: number | null
  active: boolean | null         // Sensor operational status from API
  power: boolean
  mode: 'manuel' | 'auto' | null
  powerStatus: boolean | null    // Sensor active/inactive status from API
  sensorId?: string
  sensorLabel?: string
  sensorName?: string
  humidity?: number | null        // Optional humidity for future use
  dewPoint?: number | null        // Optional dew point for calculations
  relay?: string | null           // Zone assignment from API
  controllerUUID?: string | null  // Controller managing this sensor
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

// Separate label and name for display
const getSensorLabel = (sensor: Sensor) => sensor.label || sensor.name
const getSensorName = (sensor: Sensor) => sensor.name

// Check if a zone has missing essential data
const hasNoData = (zone: Zone): boolean => {
  return zone.powerStatus === null || zone.active === null || zone.minTemp === null || zone.maxTemp === null || zone.mode === null
}

// Display only real sensors from API (no padding)
const sensorsForDisplay = computed<Sensor[]>(() => {
  return thermalSensors.value
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
    // Use actual current temperature from API
    const value = zone.currentTemp ?? 0
    return {
      id: zone.id,
      value: value,
      height: ((Math.max(10, Math.min(35, value)) - 10) / (35 - 10)) * 100, // Scale from 10-35°C
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
      data: displayedZones.value.map((z) => z.currentTemp ?? 0),
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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 10,
      titleColor: '#1f2937',
      bodyColor: '#374151'
    },
    datalabels: {
      display: false
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

// Thermal summary from API
const thermalSummary = ref<{
  totalSensors: number
  activeSensors: number
  averageTemperature: number
  minTemperature: number
  maxTemperature: number
} | null>(null)

// Real-time aggregated status from displayed zones or API summary
const statusActiveZones = computed(() => {
  // Count sensors with powerStatus === true (actual active sensors)
  return zones.value.filter((z) => z.powerStatus === true).length
})

const statusTempRange = computed(() => {
  if (thermalSummary.value) {
    return {
      min: thermalSummary.value.minTemperature.toFixed(1),
      max: thermalSummary.value.maxTemperature.toFixed(1)
    }
  }
  if (displayedZones.value.length === 0) return { min: '--', max: '--' }
  const temps = displayedZones.value
    .map((z) => z.currentTemp)
    .filter((t): t is number => t !== null)

  if (temps.length === 0) return { min: '--', max: '--' }
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  return { min: min.toFixed(1), max: max.toFixed(1) }
})

const statusAvgTemp = computed(() => {
  if (thermalSummary.value) return thermalSummary.value.averageTemperature.toFixed(1)
  if (displayedZones.value.length === 0) return '--'
  const temps = displayedZones.value
    .map((z) => z.currentTemp)
    .filter((t): t is number => t !== null)

  if (temps.length === 0) return '--'
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length
  return avg.toFixed(1)
})

const statusSystemHealth = computed(() => {
  if (displayedZones.value.length === 0) return 0
  const healthy = displayedZones.value.filter((z) => {
    const currentTemp = z.currentTemp
    if (currentTemp === null) return false
    return currentTemp >= (z.minTemp ?? 18) && currentTemp <= (z.maxTemp ?? 28)
  }).length
  return Math.round((healthy / displayedZones.value.length) * 100)
})

const statusOverTemperature = computed(() => {
  const zones_to_check = displayedZones.value.length > 0 ? displayedZones.value : zones.value
  if (zones_to_check.length === 0) return 0
  return zones_to_check.filter((z) => {
    const currentTemp = z.currentTemp
    if (currentTemp === null) return false
    return currentTemp > (z.maxTemp ?? 28)
  }).length
})

const displayedZones = computed(() => {
  // Respect zonesOrder for drag-and-drop functionality
  const filtered = zonesOrder.value
    .filter((id) => visibleZoneIds.value.includes(id))
    .map((id) => zones.value.find((z) => z.id === id))
    .filter((z): z is Zone => Boolean(z))

  return filtered
})

// Calculate optimal columns so rows stay even (prefer divisible by 4, then 3)
const autoColumnsPerRow = computed(() => {
  const count = displayedZones.value.length
  if (count <= 1) return 1

  // Prefer perfect fits for 4 or 3 columns before falling back
  const preferred = [4, 3]
  for (const cols of preferred) {
    if (count >= cols && count % cols === 0) return cols
  }

  // Evaluate options to minimize empty cells and excessive rows; break ties with wider grids
  const candidates = [4, 3, 2]
  let best = { cols: 2, score: Number.MAX_SAFE_INTEGER }

  for (const cols of candidates) {
    const rows = Math.ceil(count / cols)
    const emptyCells = rows * cols - count
    const score = rows * 2 + emptyCells // prioritize fewer rows, then fewer empty slots

    if (score < best.score || (score === best.score && cols > best.cols)) {
      best = { cols, score }
    }
  }

  return Math.min(Math.max(best.cols, 1), 4)
})

// Sync slider to auto-columns when zones change, but allow manuel override
watch(autoColumnsPerRow, (newAuto) => {
  columnsPerRow.value = newAuto
})

// Responsive grid layout - uses slider value (auto-synced or manually adjusted)
const gridColumns = computed(() => {
  const col = Math.max(1, Math.min(columnsPerRow.value, 4))
  return `repeat(${col}, minmax(0, 1fr))`
})

const draggingId = ref<number | null>(null)
const dragOverId = ref<number | null>(null)

const onDragStart = (id: number) => {
  draggingId.value = id
}

const onDragEnter = (id: number) => {
  if (draggingId.value !== null && draggingId.value !== id) {
    dragOverId.value = id
  }
}

const onDragLeave = () => {
  dragOverId.value = null
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

const onDrop = (targetId: number) => {
  if (draggingId.value === null || draggingId.value === targetId) {
    draggingId.value = null
    dragOverId.value = null
    return
  }

  const from = zonesOrder.value.indexOf(draggingId.value)
  const to = zonesOrder.value.indexOf(targetId)
  if (from === -1 || to === -1) {
    draggingId.value = null
    dragOverId.value = null
    return
  }

  const newOrder = [...zonesOrder.value]
  const [moved] = newOrder.splice(from, 1)
  newOrder.splice(to, 0, moved)
  zonesOrder.value = newOrder
  draggingId.value = null
  dragOverId.value = null
}

const onDragEnd = () => {
  draggingId.value = null
  dragOverId.value = null
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

const togglePower = async (zoneId: number) => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (!zone || !zone.sensorId) return

  try {
    // Set loading state
    isControllingRelay.value[zone.sensorId] = true
    relayError.value = null

    // Determine action based on current power state
    const action = zone.power ? 'stop' : 'start'

    // Call relay control API
    const result = await controlThermalRelay(zone.sensorId, action)

    if (result.success) {
      // Update local state on success
      zone.power = !zone.power
      console.log(`[ThermalView] Relay control ${action} successful for zone ${zone.sensorLabel}`)
    } else {
      // Show error message
      relayError.value = result.message || `Failed to ${action} relay`
      console.error(`[ThermalView] Relay control error:`, result.message)
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    relayError.value = errorMsg
    console.error(`[ThermalView] Relay control failed:`, errorMsg)
  } finally {
    // Clear loading state
    if (zone.sensorId) {
      isControllingRelay.value[zone.sensorId] = false
    }
  }
}

const openChartModal = (zone: Zone) => {
  chartModalZoneId.value = zone.id
}
const closeChartModal = () => {
  chartModalZoneId.value = null
}

// Unified chart functions for all sensors (controllable zones only)
const getAllSensorsChartOptions = () => {
  // Filter out external sensors - only show controllable zones
  const controllableZones = displayedZones.value.filter(
    (zone) => zone.minTemp !== null && zone.maxTemp !== null && zone.mode !== null
  )

  // Get all data from controllable sensors to calculate ranges
  const allDataPoints: number[] = []
  controllableZones.forEach(zone => {
    if (zone.sensorId) {
      const chartData = chartDataMap.value.get(zone.sensorId)
      if (chartData) {
        allDataPoints.push(...chartData.map((p: any) => p.value))
      }
    }
  })

  // Get x-axis labels from first controllable sensor (all should have same timestamps)
  const firstZone = controllableZones.find(z => z.sensorId && chartDataMap.value.has(z.sensorId))
  const firstChartData = firstZone?.sensorId ? chartDataMap.value.get(firstZone.sensorId) : null
  const xLabels = firstChartData?.map((p: any) => p.readableDate) || []

  console.log(`[Chart Options] xLabels count: ${xLabels.length}`)
  console.log(`[Chart Options] allDataPoints count: ${allDataPoints.length}`)
  console.log(`[Chart Options] Controllable zones: ${controllableZones.length}`)
  console.log(`[Chart Options] chartDataMap size: ${chartDataMap.value.size}`)
  if (firstChartData) {
    console.log(`[Chart Options] First sensor data sample:`, firstChartData.slice(0, 3))
  }

  const minValue = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 20
  const maxValue = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 30
  const padding = (maxValue - minValue) * 0.15

  return {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: {
        show: false
      },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 150
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    dataLabels: { enabled: false },
    markers: {
      size: 3,
      strokeColors: '#fff',
      strokeWidth: 1,
      hover: { size: 5 }
    },
    xaxis: {
      categories: xLabels,
      labels: {
        style: { fontSize: isMobileViewport.value ? '9px' : '11px', colors: '#9ca3af' },
        rotate: isMobileViewport.value ? -60 : -45,
        trim: true,
        formatter: (value: string, _timestamp: number, opts: { i?: number }) => {
          if (!isMobileViewport.value) return value
          const step = Math.max(1, Math.ceil(xLabels.length / 4))
          const index = typeof opts?.i === 'number' ? opts.i : xLabels.indexOf(value)
          if (index % step !== 0) return ''
          return value ? value.toString().slice(0, 5) : ''
        }
      },
      tickAmount: isMobileViewport.value ? 4 : 8,
      axisBorder: { show: true, color: '#e5e7eb' },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: '#9ca3af' },
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : ''
      },
      min: Math.max(0, minValue - padding),
      max: maxValue + padding
    },
    grid: {
      show: true,
      borderColor: 'rgba(229, 231, 235, 0.3)',
      strokeDashArray: 0,
      xaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'light',
      x: { format: 'HH:mm' },
      y: {
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : 'N/A'
      }
    },
    legend: {
      show: true,
      position: 'top',
      fontFamily: 'inherit',
      offsetY: 0,
      horizontalAlign: 'center',
      labels: {
        colors: '#6b7280',
        useSeriesColors: true,
        fontSize: '12px'
      },
      markers: {
        width: 12,
        height: 12,
        radius: 2
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    }
  }
}

const getAllSensorsChartSeries = () => {
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

  // Filter out external sensors - only show controllable zones
  const controllableZones = displayedZones.value.filter(
    (zone) => zone.minTemp !== null && zone.maxTemp !== null && zone.mode !== null
  )

  const series = controllableZones.map((zone, idx) => {
    const sensorId = zone.sensorId
    const chartData = sensorId ? chartDataMap.value.get(sensorId) : null

    if (chartData && chartData.length > 0) {
      console.log(`[Chart Series] ${zone.sensorLabel}: ${chartData.length} data points, values: ${chartData.map((p: any) => p.value).join(', ')}`)
      return {
        name: zone.sensorLabel || zone.sensorName || `Zone ${zone.id}`,
        data: chartData.map((point: any) => point.value),
        color: COLORS[idx % COLORS.length]
      }
    }

    // Fallback to synthetic data
    console.log(`[Chart Series] Using synthetic data for ${zone.sensorLabel}`)
    const baseTemp = zone.currentTemp ?? 21.2
    const syntheticData = generate24HData(zone.id, baseTemp)
    return {
      name: zone.sensorLabel || zone.sensorName || `Zone ${zone.id}`,
      data: syntheticData,
      color: COLORS[idx % COLORS.length]
    }
  })

  console.log(`[Chart Series] Generated ${series.length} series with ${series.map(s => s.data.length).join(', ')} data points each`)
  return series
}

// External sensors chart functions (right chart)
const getExternalSensorsChartOptions = () => {
  // Get only external zones
  const externalZones = displayedZones.value.filter(
    (zone) => zone.minTemp === null || zone.maxTemp === null || zone.mode === null
  )

  // Collect all data points for calculating ranges
  const allDataPoints: number[] = []
  const firstChartData = externalZones.length > 0 && externalZones[0].sensorId
    ? chartDataMap.value.get(externalZones[0].sensorId)
    : null
  const xLabels = firstChartData?.map((p: any) => p.readableDate) || []

  externalZones.forEach((zone) => {
    const sensorId = zone.sensorId
    const chartData = sensorId ? chartDataMap.value.get(sensorId) : null
    if (chartData && chartData.length > 0) {
      const values = chartData.map((p: any) => p.value)
      allDataPoints.push(...values)
    }
  })

  const minValue = allDataPoints.length > 0 ? Math.min(...allDataPoints) : 20
  const maxValue = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 30
  const padding = (maxValue - minValue) * 0.15

  return {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: {
        show: false
      },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 150
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    dataLabels: { enabled: false },
    markers: {
      size: 3,
      strokeColors: '#fff',
      strokeWidth: 1,
      hover: { size: 5 }
    },
    xaxis: {
      categories: xLabels,
      labels: {
        style: { fontSize: isMobileViewport.value ? '9px' : '11px', colors: '#9ca3af' },
        rotate: isMobileViewport.value ? -60 : -45,
        trim: true,
        formatter: (value: string, _timestamp: number, opts: { i?: number }) => {
          if (!isMobileViewport.value) return value
          const step = Math.max(1, Math.ceil(xLabels.length / 4))
          const index = typeof opts?.i === 'number' ? opts.i : xLabels.indexOf(value)
          if (index % step !== 0) return ''
          return value ? value.toString().slice(0, 5) : ''
        }
      },
      tickAmount: isMobileViewport.value ? 4 : 8,
      axisBorder: { show: true, color: '#e5e7eb' },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: '#9ca3af' },
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : ''
      },
      min: Math.max(0, minValue - padding),
      max: maxValue + padding
    },
    grid: {
      show: true,
      borderColor: 'rgba(229, 231, 235, 0.3)',
      strokeDashArray: 0,
      xaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'light',
      x: { format: 'HH:mm' },
      y: {
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : 'N/A'
      }
    },
    legend: {
      show: true,
      position: 'top',
      fontFamily: 'inherit',
      offsetY: 0,
      horizontalAlign: 'center',
      labels: {
        colors: '#6b7280',
        useSeriesColors: true,
        fontSize: '12px'
      },
      markers: {
        width: 12,
        height: 12,
        radius: 2
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    }
  }
}

const getExternalSensorsChartSeries = () => {
  const COLORS = ['#64748b', '#94a3b8', '#475569', '#cbd5e1', '#1e293b', '#334155']

  // Filter only external zones
  const externalZones = displayedZones.value.filter(
    (zone) => zone.minTemp === null || zone.maxTemp === null || zone.mode === null
  )

  const series = externalZones.map((zone, idx) => {
    const sensorId = zone.sensorId
    const chartData = sensorId ? chartDataMap.value.get(sensorId) : null

    if (chartData && chartData.length > 0) {
      console.log(`[External Chart Series] ${zone.sensorLabel}: ${chartData.length} data points`)
      return {
        name: zone.sensorLabel || zone.sensorName || `External ${zone.id}`,
        data: chartData.map((point: any) => point.value),
        color: COLORS[idx % COLORS.length]
      }
    }

    // Fallback to synthetic data
    console.log(`[External Chart Series] Using synthetic data for ${zone.sensorLabel}`)
    const baseTemp = zone.currentTemp ?? 21.2
    const syntheticData = generate24HData(zone.id, baseTemp)
    return {
      name: zone.sensorLabel || zone.sensorName || `External ${zone.id}`,
      data: syntheticData,
      color: COLORS[idx % COLORS.length]
    }
  })

  console.log(`[External Chart Series] Generated ${series.length} series for external sensors`)
  return series
}

// Single zone chart functions for modal
const getChartOptions = (zone: Zone) => {
  const chartData = zone.sensorId ? chartDataMap.value.get(zone.sensorId) : null

  // Get data points for calculating ranges
  const dataPoints = chartData?.map((p: any) => p.value) || []
  const minValue = dataPoints.length > 0 ? Math.min(...dataPoints) : 20
  const maxValue = dataPoints.length > 0 ? Math.max(...dataPoints) : 30
  const padding = (maxValue - minValue) * 0.15

  return {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: { show: true }
    },
    colors: ['#3b82f6'],
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
        stops: [20, 100, 100, 100]
      }
    },
    dataLabels: { enabled: false },
    markers: {
      size: 4,
      colors: ['#3b82f6'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: { size: 6 }
    },
    xaxis: {
      categories: chartData?.map((p: any) => p.readableDate) || [],
      labels: {
        style: { fontSize: '12px', colors: '#9ca3af' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: '#9ca3af' },
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : ''
      },
      min: Math.max(0, minValue - padding),
      max: maxValue + padding
    },
    grid: {
      show: true,
      borderColor: 'rgba(148, 163, 184, 0.2)',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } }
    },
    tooltip: {
      theme: 'light',
      x: {
        format: 'HH:mm'
      },
      y: {
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : 'N/A',
        title: {
          formatter: () => 'Temperature'
        }
      },
      style: {
        fontSize: '12px',
        fontFamily: 'inherit'
      }
    }
  }
}

const getChartSeries = (zone: Zone) => {
  const sensorId = zone.sensorId
  const chartData = sensorId ? chartDataMap.value.get(sensorId) : null

  if (chartData && chartData.length > 0) {
    return [
      {
        name: t('thermal.chart.temperature'),
        data: chartData.map((point: any) => point.value),
      }
    ]
  }

  const currentTemp = zone.currentTemp ?? 21.2
  return [
    {
      name: t('thermal.chart.temperature'),
      data: generate24HData(zone.id, currentTemp)
    }
  ]
}

const getMiniChartSeries = (zone: Zone) => {
  const sensorId = zone.sensorId
  const chartData = sensorId ? chartDataMap.value.get(sensorId) : null
  if (!chartData || chartData.length === 0) {
    return []
  }

  return [
    {
      name: '24h',
      data: chartData.map((point: any) => point.value)
    }
  ]
}

const hasMiniChartData = (zone: Zone) => {
  const sensorId = zone.sensorId
  const chartData = sensorId ? chartDataMap.value.get(sensorId) : null
  return Boolean(chartData && chartData.length > 0)
}

const getMiniChartOptions = (zone: Zone) => {
  const sensorId = zone.sensorId
  const chartData = sensorId ? chartDataMap.value.get(sensorId) : null
  const dataPoints = chartData?.map((p: any) => p.value) || []
  const xLabels = chartData?.map((p: any) => p.readableDate) || []
  const minValue = dataPoints.length > 0 ? Math.min(...dataPoints) : 20
  const maxValue = dataPoints.length > 0 ? Math.max(...dataPoints) : 30
  const padding = Math.max((maxValue - minValue) * 0.15, 1)

  return {
    chart: {
      type: 'area',
      sparkline: { enabled: false },
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 }
    },
    colors: ['#4f46e5'],
    stroke: {
      curve: 'smooth',
      width: 2.5
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.9,
        opacityFrom: 0.4,
        opacityTo: 0.08,
        stops: [0, 70, 100]
      }
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: 'HH:mm' },
      y: {
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(1)}°C` : 'N/A'
      }
    },
    xaxis: {
      categories: xLabels,
      labels: {
        show: true,
        style: { fontSize: '10px', colors: '#94a3b8' },
        rotate: 0,
        formatter: (value: string) => value?.slice(0, 5) ?? ''
      },
      tickAmount: 5,
      tickPlacement: 'between',
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        show: true,
        style: { fontSize: '10px', colors: '#94a3b8' },
        formatter: (value: number | undefined) => value !== undefined ? `${value.toFixed(0)}` : ''
      },
      min: Math.max(0, minValue - padding),
      max: maxValue + padding
    },
    grid: {
      show: true,
      borderColor: 'rgba(148, 163, 184, 0.25)',
      strokeDashArray: 3
    }
  }
}

const setMode = async (zoneId: number, mode: 'manuel' | 'auto') => {
  const zone = zones.value.find((z) => z.id === zoneId)
  if (zone && zone.sensorId) {
    // Set loading state
    isUpdatingMode.value[zoneId] = true
    modeUpdateError.value[zoneId] = null

    try {
      // Call the API to update mode on the backend
      const result = await updateSensorMode(zone.sensorId, mode)

      if (result.success) {
        // Update local state only if API call succeeds
        zone.mode = mode
        console.log(`[ThermalView] Mode updated to '${mode}' for zone ${zone.sensorLabel}`)
      } else {
        console.error(`[ThermalView] Failed to update mode: ${result.message}`)
        // Build comprehensive error message
        const errorMessage = buildErrorMessage(result.message, 'mode_update')
        modeUpdateError.value[zoneId] = errorMessage
        // Clear error after 5 seconds
        setTimeout(() => {
          modeUpdateError.value[zoneId] = null
        }, 5000)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[ThermalView] Error updating mode:`, error)
      // Build comprehensive error message
      const errorMessage = buildErrorMessage(errorMsg, 'network')
      modeUpdateError.value[zoneId] = errorMessage
      // Clear error after 5 seconds
      setTimeout(() => {
        modeUpdateError.value[zoneId] = null
      }, 5000)
    } finally {
      // Clear loading state
      isUpdatingMode.value[zoneId] = false
    }
  }
}

// Build comprehensive error message based on error type
const buildErrorMessage = (error: string, type: string): string => {
  // Network errors
  if (error.includes('Network') || error.includes('fetch') || error.includes('ECONNREFUSED') || error.includes('ERR_NETWORK')) {
    return `${t('thermal.error.network')} • ${t('thermal.error.checkConnection')}`
  }

  // API validation errors (400)
  if (error.includes('400') || error.includes('Invalid') || error.includes('validation')) {
    return `${t('thermal.error.invalidRequest')} • ${t('thermal.error.tryAgain')}`
  }

  // Unauthorized (401)
  if (error.includes('401') || error.includes('Unauthorized') || error.includes('token')) {
    return `${t('thermal.error.unauthorized')} • ${t('thermal.error.loginRequired')}`
  }

  // Forbidden (403)
  if (error.includes('403') || error.includes('Forbidden') || error.includes('permission')) {
    return `${t('thermal.error.forbidden')} • ${t('thermal.error.noPermission')}`
  }

  // Server errors (500)
  if (error.includes('500') || error.includes('Server') || error.includes('Internal')) {
    return `${t('thermal.error.serverError')} • ${t('thermal.error.tryLater')}`
  }

  // Timeout errors
  if (error.includes('timeout') || error.includes('Timeout')) {
    return `${t('thermal.error.timeout')} • ${t('thermal.error.tryAgain')}`
  }

  // Default: show generic error with original message
  return `${t('thermal.error.updateFailed')} • ${error.substring(0, 50)}`
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

  // Build zones only for real sensors (no padding)
  const built: Zone[] = []

  for (let i = 0; i < base.length; i++) {
    const sensor = base[i]
    const avg = sensor.avgTemp ?? 22
    const max = sensor.maxTemp ?? Math.round((avg + 2) * 10) / 10
    const min = sensor.minTemp ?? Math.round((avg - 2) * 10) / 10

    built.push({
      id: i + 1,
      currentTemp: avg,  // Use avgTemp as current temperature for mock data
      maxTemp: max,
      minTemp: min,
      active: i % 3 !== 2,  // Mock sensor active status
      power: i % 3 !== 2, // Every third zone is off (grey/red)
      mode: sensor.mode || 'auto',  // Use mode from sensor data or default to 'auto'
      powerStatus: i % 3 !== 2,  // Mock sensor status (active by default)
      sensorId: sensor.id,
      sensorLabel: getSensorLabel(sensor),
      sensorName: getSensorName(sensor),
    })
  }

  // Sort zones alphabetically: controllable first (alphabetically), then external (alphabetically)
  const sorted = built.sort((a, b) => {
    const aIsExternal = a.minTemp === null || a.maxTemp === null || a.mode === null
    const bIsExternal = b.minTemp === null || b.maxTemp === null || b.mode === null

    // First, separate by type (controllable vs external)
    if (aIsExternal !== bIsExternal) {
      return aIsExternal ? 1 : -1
    }

    // Within the same type, sort alphabetically by label or name
    const aName = (a.sensorLabel || a.sensorName || `Zone ${a.id}`).toLowerCase()
    const bName = (b.sensorLabel || b.sensorName || `Zone ${b.id}`).toLowerCase()
    return aName.localeCompare(bName)
  })

  zones.value = sorted
  visibleZoneIds.value = sorted.map((z) => z.id)
  zonesOrder.value = sorted.map((z) => z.id)
}

/**
 * Build zones from thermal API response
 * Creates zones from real backend thermal sensor data
 * Uses actual temperature and dew point values for smart min/max targeting
 */
function buildZonesFromThermalAPI(thermalData: any) {
  if (!thermalData?.sensors || thermalData.sensors.length === 0) {
    console.warn('[ThermalView] No sensors in thermal API response')
    buildZonesFromSensors([])
    return
  }

  // Store API summary data for status cards
  if (thermalData.summary) {
    thermalSummary.value = {
      totalSensors: thermalData.summary.totalSensors,
      activeSensors: thermalData.summary.activeSensors,
      averageTemperature: thermalData.summary.averageTemperature,
      minTemperature: thermalData.summary.minTemperature,
      maxTemperature: thermalData.summary.maxTemperature,
    }
  }

  const built: Zone[] = []
  const sensors = thermalData.sensors

  for (let i = 0; i < sensors.length; i++) {
    const sensor = sensors[i]

    // Current temperature from sensor reading
    const currentTemp = sensor.temperature ?? 22

    // Use API min/max if available, fallback to dew point-based calculation
    let minTemp = sensor.minTemp
    let maxTemp = sensor.maxTemp

    // Fallback: Calculate from dew point if API values not available
    if (minTemp === null || minTemp === undefined) {
      const dewPoint = sensor.dewPoint ?? (currentTemp - 3)
      minTemp = Math.max(
        Math.round((dewPoint || currentTemp - 2) * 10) / 10,
        10  // Absolute minimum 10°C
      )
    }

    if (maxTemp === null || maxTemp === undefined) {
      maxTemp = Math.round((currentTemp + 3) * 10) / 10
    }

    // Map mode: "manuel" → "manuel", preserve null if no mode configured
    let mode: 'manuel' | 'auto' | null = null
    if (sensor.mode === 'manuel' || sensor.mode === 'manual') {
      mode = 'manuel'  // Normalize both spellings to 'manuel'
    } else if (sensor.mode === 'auto') {
      mode = 'auto'
    }
    // If sensor.mode is null or undefined, mode stays null

    console.log(`[ThermalView] Zone ${i + 1} (${sensor.name}): API mode='${sensor.mode}' → normalized mode='${mode}'`)

    built.push({
      id: i + 1,
      currentTemp: currentTemp,  // Store actual temperature from API
      maxTemp: Number(maxTemp),  // Use API maxTemp or calculated
      minTemp: Number(minTemp),  // Use API minTemp or calculated
      active: sensor.active ?? null,  // Store sensor operational status from API
      power: sensor.powerStatus !== false,
      mode: mode,  // Use API mode, properly mapped
      powerStatus: sensor.powerStatus,  // Store sensor active/inactive status
      sensorId: sensor.deviceUUID,
      sensorLabel: sensor.displayName || sensor.label || sensor.name,
      sensorName: sensor.name,
      humidity: sensor.humidity,
      dewPoint: sensor.dewPoint,
      relay: sensor.relay,  // Zone assignment
      controllerUUID: sensor.controllerUUID,  // Controller info
    })
  }

  // Sort zones alphabetically: controllable first (alphabetically), then external (alphabetically)
  const sorted = built.sort((a, b) => {
    const aIsExternal = a.minTemp === null || a.maxTemp === null || a.mode === null
    const bIsExternal = b.minTemp === null || b.maxTemp === null || b.mode === null

    // First, separate by type (controllable vs external)
    if (aIsExternal !== bIsExternal) {
      return aIsExternal ? 1 : -1
    }

    // Within the same type, sort alphabetically by label or name
    const aName = (a.sensorLabel || a.sensorName || `Zone ${a.id}`).toLowerCase()
    const bName = (b.sensorLabel || b.sensorName || `Zone ${b.id}`).toLowerCase()
    return aName.localeCompare(bName)
  })

  zones.value = sorted
  visibleZoneIds.value = sorted.map((z) => z.id)
  zonesOrder.value = sorted.map((z) => z.id)

  console.log(`[ThermalView] Built ${built.length} zones from thermal API. Summary: ${thermalSummary.value?.totalSensors} total, ${thermalSummary.value?.activeSensors} active, Avg: ${thermalSummary.value?.averageTemperature}°C`)
}

/**
 * Refresh thermal data from API
 */
async function refreshThermalData() {
  try {
    isFetchingThermal.value = true
    thermalError.value = null

    console.log('[ThermalView] Manually refreshing thermal data from API')
    const thermalData = await fetchThermalDashboardData(false)

    if (thermalData.status === 'success' && thermalData.sensors.length > 0) {
      console.log(`[ThermalView] Successfully refreshed ${thermalData.sensors.length} sensors from thermal API`)
      buildZonesFromThermalAPI(thermalData)
      // Load chart data after thermal data is refreshed
      await loadChartData()
    } else {
      thermalError.value = thermalData.message || 'Failed to fetch thermal data from API'
      console.warn('[ThermalView] Thermal API returned no data:', thermalError.value)
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[ThermalView] Error refreshing thermal data:', errorMsg)
    thermalError.value = errorMsg
  } finally {
    isFetchingThermal.value = false
  }
}

/**
 * Load aggregated temperature chart data for all displayed zones
 * Uses 12-hour window with 2-minute intervals
 */
async function loadChartData() {
  try {
    isFetchingChartData.value = true
    console.log('[ThermalView] Loading temperature chart data...')

    // Get sensor IDs from displayed zones
    const sensorIds = displayedZones.value
      .map((z) => z.sensorId)
      .filter((id): id is string => !!id)

    if (sensorIds.length === 0) {
      console.warn('[ThermalView] No sensor IDs available for chart data')
      return
    }

    // Fetch aggregated chart data
    const chartResponse = await fetchThermalChartData(sensorIds)

    if (chartResponse.success && chartResponse.data.sensors.length > 0) {
      console.log(
        `[ThermalView] Successfully loaded chart data for ${chartResponse.data.sensors.length} sensors`
      )

      // Store chart data in map for quick lookup
      chartDataMap.value.clear()
      chartResponse.data.sensors.forEach((sensor) => {
        const dataCount = sensor.data.length
        console.log(`[ThermalView] Sensor ${sensor.sensorLabel}: ${dataCount} data points`)
        console.log(`[ThermalView] Data range: ${sensor.data[0]?.readableDate} to ${sensor.data[dataCount - 1]?.readableDate}`)
        chartDataMap.value.set(sensor.deviceUUID, sensor.data)
      })

      console.log('[ThermalView] Chart data ready for visualization')
      console.log('[ThermalView] Chart map size:', chartDataMap.value.size)
    } else {
      console.warn('[ThermalView] No chart data returned from API')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn(`[ThermalView] Failed to load chart data: ${errorMsg}`)
    // Don't treat chart data failure as critical - charts can use synthetic data
  } finally {
    isFetchingChartData.value = false
  }
}

onMounted(async () => {
  try {
    // Always fetch sensor list from device API
    await sensorsStore.fetchSensors()

    // If data mode is API, fetch thermal data from backend
    if (dataMode === 'api') {
      isFetchingThermal.value = true
      thermalError.value = null

      console.log('[ThermalView] Data mode is API, fetching thermal data from backend')
      const thermalData = await fetchThermalDashboardData(false)

      if (thermalData.status === 'success' && thermalData.sensors.length > 0) {
        console.log(`[ThermalView] Successfully fetched ${thermalData.sensors.length} sensors from thermal API`)
        // Build zones from API response
        buildZonesFromThermalAPI(thermalData)

        // Fetch chart data for all sensors
        await loadChartData()
      } else {
        console.warn('[ThermalView] Thermal API returned no data, falling back to mock data')
        thermalError.value = thermalData.message || 'Failed to fetch thermal data from API'
        buildZonesFromSensors(sensorsForDisplay.value)
      }
    } else {
      // Use mock data from sensors store
      console.log('[ThermalView] Data mode is', dataMode, ', using sensor store data')
      buildZonesFromSensors(sensorsForDisplay.value)
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[ThermalView] Error during initialization:', errorMsg)
    thermalError.value = errorMsg
    buildZonesFromSensors(sensorsForDisplay.value)
  } finally {
    isFetchingThermal.value = false
  }
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
