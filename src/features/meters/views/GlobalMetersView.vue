<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-0 px-1 py-1 global-meters-view lg:min-h-[calc(100vh-125px)]">
      <div class="border-b border-slate-200 dark:border-border-dark pb-2 lg:pb-1 flex-shrink-0">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-slate-900 dark:text-white text-2xl lg:text-xl font-bold tracking-tight">{{ $t('globalMeters.pageTitle') }}</h1>
          <div class="flex flex-wrap items-center gap-2 xs:gap-3">
            <!-- Energy / Temperature Toggle Switch -->
            <div class="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 p-0.5 shadow-sm">
              <button
                @click="viewMode = 'energy'"
                :class="[
                  'flex items-center gap-1.5 rounded-md px-2 py-1.5 xs:px-3 text-xs xs:text-sm font-medium transition-all duration-200',
                  viewMode === 'energy'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                ]"
              >
                <span class="material-symbols-outlined text-base">bolt</span>
                <span class="hidden xs:inline">{{ $t('dashboard.viewMode.energy') }}</span>
              </button>
              <button
                @click="viewMode = 'temperature'"
                :class="[
                  'flex items-center gap-1.5 rounded-md px-2 py-1.5 xs:px-3 text-xs xs:text-sm font-medium transition-all duration-200',
                  viewMode === 'temperature'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                ]"
              >
                <span class="material-symbols-outlined text-base">thermostat</span>
                <span class="hidden xs:inline">{{ $t('dashboard.viewMode.temperature') }}</span>
              </button>
            </div>

            <!-- Context-sensitive manage button -->
            <button
              v-if="viewMode === 'energy'"
              @click="showCompteurSelector = true"
              class="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-2 py-1.5 xs:px-3 xs:py-2 text-xs xs:text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              <span class="material-symbols-outlined text-base">tune</span>
              <span class="whitespace-nowrap">{{ $t('dashboard.manageMeters') }}</span>
            </button>
            <button
              v-else
              @click="showCapteurSelector = true"
              class="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-2 py-1.5 xs:px-3 xs:py-2 text-xs xs:text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              <span class="material-symbols-outlined text-base">sensors</span>
              <span class="whitespace-nowrap">{{ $t('globalMeters.manageSensors') }}</span>
            </button>
          </div>
        </div>

      </div>

      <!-- CompteurSelector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="availableCompteurs"
        :selected-ids="selectedCompteurIds"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- CapteurSelector Modal -->
      <CapteurSelector
        :is-open="showCapteurSelector"
        :all-capteurs="sensorsStore.availableSensors"
        :selected-ids="sensorsStore.selectedSensorIds"
        @close="showCapteurSelector = false"
        @apply="handleCapteurSelection"
      />

      <!-- Main Content: Full responsive layout -->
      <div v-if="selectedCompteurs.length === 0" class="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 p-12 text-center">
        <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl mb-4">
          dashboard
        </span>
        <p class="text-gray-900 dark:text-white text-lg font-semibold mb-2">{{ $t('dashboard.noMetersSelected.title') }}</p>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-6">{{ $t('dashboard.noMetersSelected.description') }}</p>
        <button
          @click="showCompteurSelector = true"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-bold text-white transition-colors shadow-lg"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          {{ $t('dashboard.noMetersSelected.action') }}
        </button>
      </div>

      <!-- ===== ENERGY VIEW ===== -->
      <!-- Content Grid: 2/3 (Left - Cards) + 1/3 (Right - Charts) - Responsive -->
      <div v-if="viewMode === 'energy'" class="grid grid-cols-1 lg:grid-cols-3 gap-1 overflow-hidden pb-2 lg:flex-1 lg:min-h-0 h-auto">
        <!-- Left Panel: Meter Cards (2/3 width on lg, full width below lg) -->
        <div class="col-span-1 lg:col-span-2 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 min-h-0 lg:overflow-y-auto">
          <!-- Deterministic Grid: Adapts based on meter count -->
          <div class="grid gap-1 md:gap-2 flex-1 min-h-0 p-0.5 md:p-1 auto-rows-fr" :style="getMetersGridStyle()">
            <div
              v-for="(compteur, index) in enrichedCompteurs"
              :key="compteur.id"
              class="rounded-xl bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all overflow-hidden relative border-2 flex flex-col"
              :style="{
                borderColor: getChartColor(index, compteur.name),
                boxShadow: `0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 2px ${getChartColor(index, compteur.name)}15`,
                ...getCardGridSpan(index, enrichedCompteurs.length)
              }"
            >
              <!-- Top accent line -->
              <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: getChartColor(index, compteur.name) }"></div>

              <!-- Card Header with color accent and custom tooltip -->
              <div :class="[
                'px-4 py-1.5 flex-shrink-0 border-b-2 relative group/header flex items-start justify-between gap-2 overflow-hidden',
                `border-${getMeterColorTailwind(index, compteur.name)}-400 dark:border-${getMeterColorTailwind(index, compteur.name)}-500`
              ]" :style="{ backgroundColor: `${getChartColor(index, compteur.name)}08` }">
                <div class="flex-1 min-w-0 overflow-hidden">
                  <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight break-words pt-1" :title="compteur.name">
                    {{ compteur.name }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-500 leading-tight mt-1">{{ compteur.subtitle || $t('globalMeters.energyMeter') }}</p>
                </div>
                <span :class="[
                  'inline-flex h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2',
                  compteur.status === 'online'
                    ? 'bg-green-500 animate-pulse shadow-[0_0_3px_rgba(34,197,94,0.5)]'
                    : 'bg-red-500 shadow-[0_0_3px_rgba(239,68,68,0.5)]'
                ]"></span>


                <!-- Custom Tooltip -->
                <div class="absolute bottom-full left-1/2 mb-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-md whitespace-nowrap z-50 opacity-0 invisible group-hover/header:opacity-100 group-hover/header:visible transition-all duration-150 shadow-lg" style="transform: translateX(-50%);">
                  {{ compteur.name }}
                  <!-- Tooltip arrow -->
                  <div class="absolute top-full left-1/2 w-0 h-0" style="transform: translateX(-50%); border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgb(15, 23, 42);"></div>
                </div>
              </div>

              <!-- Card Content - Responsive Height -->
              <div class="px-0.5 md:px-1 py-0 flex-1 flex flex-col justify-center gap-0 min-h-0">
                <!-- Instantaneous Power -->
                <div class="text-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-0 border border-slate-200 dark:border-slate-700 flex-1 flex flex-col justify-center items-center">
                  <div>
                    <span class="font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">
                      {{ $t('globalMeters.instantaneousPower') }}
                    </span>
                  </div>
                  <div class="flex items-baseline justify-center gap-0.5 mt-0.25">
                    <template v-if="isLoadingAPI && compteur.instantaneous === undefined">
                      <span class="kpi-shimmer rounded-lg" style="height: clamp(20px, 5vmin, 45px); width: 80px; animation-delay: 0.1s;"></span>
                    </template>
                    <template v-else-if="compteur.instantaneous === undefined">
                      <!-- No value -->
                    </template>
                    <template v-else>
                      <span class="font-extrabold leading-none" :style="{ fontSize: 'clamp(20px, 5vmin, 45px)', color: getChartColor(index, compteur.name) }">
                        {{ formatValue(compteur.instantaneous) }}
                      </span>
                    </template>
                    <span class="font-bold text-slate-900 dark:text-slate-100" style="font-size: clamp(8px, 1vmin, 12px);">kW</span>
                  </div>
                </div>

                <!-- Today vs Yesterday Comparison - Proportional -->
                <div class="grid grid-cols-2 gap-0 flex-1">
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-0 border border-green-200 dark:border-green-900/30 flex flex-col justify-center items-center">
                    <p class="text-green-800 dark:text-green-300 font-extrabold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">{{ $t('globalMeters.today') }}</p>
                    <template v-if="isLoadingAPI && compteur.today === undefined">
                      <span class="kpi-shimmer rounded-lg" style="height: clamp(14px, 2.3vmin, 24px); width: 50px; animation-delay: 0.2s;"></span>
                    </template>
                    <template v-else-if="compteur.today === undefined">
                      <!-- No value -->
                    </template>
                    <p v-else class="text-green-900 dark:text-green-200 font-bold leading-tight" style="font-size: clamp(14px, 2.3vmin, 24px); line-height: 1.1;">{{ formatValue(compteur.today) }}</p>
                    <p class="text-green-800 dark:text-green-300 font-bold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">kWh</p>
                  </div>
                  <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/30 rounded-lg p-0 border border-slate-300 dark:border-slate-700/50 flex flex-col justify-center items-center">
                    <p class="text-slate-700 dark:text-slate-300 font-extrabold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">{{ $t('globalMeters.yesterday') }}</p>
                    <template v-if="isLoadingAPI && compteur.yesterday === undefined">
                      <span class="kpi-shimmer rounded-lg" style="height: clamp(14px, 2.3vmin, 24px); width: 50px; animation-delay: 0.3s;"></span>
                    </template>
                    <template v-else-if="compteur.yesterday === undefined">
                      <!-- No value -->
                    </template>
                    <p v-else class="text-slate-800 dark:text-slate-200 font-bold leading-tight" style="font-size: clamp(14px, 2.3vmin, 24px); line-height: 1.1;">{{ formatValue(compteur.yesterday) }}</p>
                    <p class="text-slate-700 dark:text-slate-300 font-bold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">kWh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Charts (1/3 width on lg, 1/2 on sm, full width on mobile) -->
        <div class="col-span-1 flex flex-col gap-1 min-h-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 lg:overflow-hidden">
          <!-- Today's Energy Consumption Chart -->
          <div class="overflow-hidden rounded-lg md:rounded-xl border border-green-300 md:border-2 dark:border-green-800 bg-white shadow-lg dark:bg-gray-800 flex flex-col flex-1 min-h-0 lg:max-h-[50%]">
            <div class="border-b border-green-300 md:border-b-2 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 px-1.5 md:px-3 py-1 md:py-1.5 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 md:gap-2">
                  <div class="h-1 w-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <h3 class="text-xs md:text-xs font-bold text-gray-900 dark:text-white">
                    {{ $t('globalMeters.todayConsumption', "Consommation d'aujourd'hui") }} (kWh)
                  </h3>
                </div>
                <!-- Chart Type Toggle -->
                <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                  <button
                    @click="dailyChartType = 'bar'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      dailyChartType === 'bar'
                        ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.barChart', 'Bar Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">bar_chart</span>
                  </button>
                  <button
                    @click="dailyChartType = 'line'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      dailyChartType === 'line'
                        ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.lineChart', 'Line Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">show_chart</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-white dark:bg-gray-800 min-h-0">
              <div v-if="enrichedCompteurs.length === 0 || enrichedCompteurs.every(m => !m.hourlyDataDifferential || m.hourlyDataDifferential.length === 0)" class="w-full h-full flex items-center justify-center">
                <p class="text-gray-500 dark:text-gray-400 font-semibold">{{ $t('common.noData') || 'No data available' }}</p>
              </div>
              <DailyEnergyChart
                v-else
                :meters="enrichedCompteurs"
                :loading="isLoadingAPI"
                :chart-type="dailyChartType"
              />
            </div>
          </div>

          <!-- Annual/Monthly Energy Chart -->
          <div class="overflow-hidden rounded-lg md:rounded-xl border border-green-300 md:border-2 dark:border-green-800 bg-white shadow-lg dark:bg-gray-800 flex flex-col flex-1 min-h-0 lg:max-h-[50%]">
            <div class="border-b border-green-300 md:border-b-2 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 px-1.5 md:px-3 py-1 md:py-1.5 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 md:gap-2">
                  <div class="h-1 w-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <h3 class="text-xs md:text-xs font-bold text-gray-900 dark:text-white">
                    {{ $t('globalMeters.energyConsumption') }} (kWh)
                  </h3>
                </div>
                <!-- Chart Type Toggle -->
                <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                  <button
                    @click="yearlyChartType = 'bar'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      yearlyChartType === 'bar'
                        ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.barChart', 'Bar Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">bar_chart</span>
                  </button>
                  <button
                    @click="yearlyChartType = 'line'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      yearlyChartType === 'line'
                        ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.lineChart', 'Line Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">show_chart</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-white dark:bg-gray-800 min-h-0">
              <div v-if="enrichedCompteurs.length === 0 || enrichedCompteurs.every(m => !m.yearlyDataDifferential || m.yearlyDataDifferential.length === 0)" class="w-full h-full flex items-center justify-center">
                <p class="text-gray-500 dark:text-gray-400 font-semibold">{{ $t('common.noData') || 'No data available' }}</p>
              </div>
              <EnergyConsumptionChart
                v-else
                :meters="enrichedCompteurs"
                :loading="isLoadingAPI"
                :chart-type="yearlyChartType"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== TEMPERATURE VIEW ===== -->
      <!-- Same 2/3 + 1/3 layout as energy view -->
      <div v-else-if="viewMode === 'temperature'" class="grid grid-cols-1 lg:grid-cols-3 gap-1 overflow-hidden pb-2 lg:flex-1 lg:min-h-0 h-auto">
        <!-- Left Panel: Sensor Cards (2/3 width on lg) -->
        <div class="col-span-1 lg:col-span-2 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 min-h-0 lg:overflow-y-auto">
          <!-- Empty State -->
          <div v-if="enrichedThermalSensors.length === 0" class="flex-1 flex items-center justify-center p-8">
            <div class="text-center">
              <span class="material-symbols-outlined text-gray-400 dark:text-text-muted text-5xl mb-4">thermostat</span>
              <p class="text-gray-900 dark:text-white text-lg font-semibold mb-2">{{ $t('globalMeters.noSensorsSelected.title', 'No sensors selected') }}</p>
              <p class="text-gray-600 dark:text-text-muted text-sm mb-6">{{ $t('globalMeters.noSensorsSelected.description', 'Select sensors to view temperature data') }}</p>
              <button @click="showCapteurSelector = true" class="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-3 text-sm font-bold text-white transition-colors shadow-lg">
                <span class="material-symbols-outlined text-lg">add</span>
                {{ $t('globalMeters.addSensors', 'Add Sensors') }}
              </button>
            </div>
          </div>
          <!-- Sensor Cards Grid (same structure as energy meter cards) -->
          <div v-else class="grid gap-1 md:gap-2 flex-1 min-h-0 p-0.5 md:p-1 auto-rows-fr" :style="getSensorsGridStyle()">
            <div
              v-for="(sensor, index) in enrichedThermalSensors"
              :key="sensor.id"
              class="rounded-xl bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all overflow-hidden relative border-2 flex flex-col"
              :style="{
                borderColor: getSensorColor(index),
                boxShadow: `0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 2px ${getSensorColor(index)}15`,
                ...getSensorCardGridSpan(index, enrichedThermalSensors.length)
              }"
            >
              <!-- Top accent line -->
              <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: getSensorColor(index) }"></div>

              <!-- Card Header -->
              <div class="px-4 py-1.5 flex-shrink-0 border-b-2 relative group/header flex items-start justify-between gap-2 overflow-hidden"
                :style="{ borderColor: getSensorColor(index), backgroundColor: `${getSensorColor(index)}08` }">
                <div class="flex-1 min-w-0 overflow-hidden">
                  <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight break-words pt-1" :title="sensor.name">
                    {{ sensor.name }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-500 leading-tight mt-1">{{ sensor.label }}</p>
                  <!-- Mode Badge -->
                  <span v-if="sensor.mode" :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1',
                    sensor.mode === 'manuel' || sensor.mode === 'manual'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  ]">
                    {{ sensor.mode === 'manuel' || sensor.mode === 'manual' ? $t('globalMeters.modeManuel') : $t('globalMeters.modeAuto') }}
                  </span>
                </div>
                <span :class="[
                  'inline-flex h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2',
                  sensor.powerStatus !== false
                    ? 'bg-green-500 animate-pulse shadow-[0_0_3px_rgba(34,197,94,0.5)]'
                    : 'bg-red-500 shadow-[0_0_3px_rgba(239,68,68,0.5)]'
                ]"></span>
              </div>

              <!-- Card Content (mirroring energy card layout) -->
              <div class="px-0.5 md:px-1 py-0 flex-1 flex flex-col justify-center gap-0 min-h-0">
                <!-- Current Temperature (like Instantaneous Power) -->
                <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-0 border border-slate-200 dark:border-slate-700 flex-1 flex flex-col justify-center items-center relative">
                  <div>
                    <span class="font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">
                      {{ $t('thermal.currentTemp', 'Current Temperature') }}
                    </span>
                  </div>
                  <div class="flex items-baseline justify-center gap-0.5 mt-0.25">
                    <template v-if="isLoadingThermal && sensor.temperature === null">
                      <span class="kpi-shimmer kpi-shimmer--purple rounded-lg" style="height: clamp(20px, 5vmin, 45px); width: 80px; animation-delay: 0.1s;"></span>
                    </template>
                    <template v-else-if="sensor.temperature === null">
                      <!-- No value -->
                    </template>
                    <template v-else>
                      <span class="font-extrabold leading-none" :style="{ fontSize: 'clamp(20px, 5vmin, 45px)', color: getSensorColor(index) }">
                        {{ formatTemp(sensor.temperature) }}
                      </span>
                    </template>
                    <span class="font-bold text-slate-900 dark:text-slate-100" style="font-size: clamp(8px, 1vmin, 12px);">°C</span>
                  </div>
                  <!-- Daily Min / Max (based on 24h data) -->
                  <div class="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-end mt-3 gap-0">
                    <div class="flex items-center gap-0">
                      <span class="material-symbols-outlined text-red-500 dark:text-red-400" style="font-size: clamp(10px, 1.5vmin, 14px);">arrow_upward</span>
                      <template v-if="isLoadingThermal && getDailyMinMax(sensor.deviceUUID).max === null">
                        <span class="kpi-shimmer kpi-shimmer--purple rounded-full" style="height: clamp(9px, 1.3vmin, 12px); width: 32px; animation-delay: 0.2s;"></span>
                      </template>
                      <template v-else-if="getDailyMinMax(sensor.deviceUUID).max === null">
                        <!-- No value -->
                      </template>
                      <span v-else class="font-bold text-slate-700 dark:text-slate-300 w-10 text-right -ml-4" style="font-size: clamp(9px, 1.3vmin, 12px);">{{ formatTemp(getDailyMinMax(sensor.deviceUUID).max) }}°</span>
                    </div>
                    <div class="flex items-center gap-0">
                      <span class="material-symbols-outlined text-blue-500 dark:text-blue-400" style="font-size: clamp(10px, 1.5vmin, 14px);">arrow_downward</span>
                      <template v-if="isLoadingThermal && getDailyMinMax(sensor.deviceUUID).min === null">
                        <span class="kpi-shimmer kpi-shimmer--purple rounded-full" style="height: clamp(9px, 1.3vmin, 12px); width: 32px; animation-delay: 0.3s;"></span>
                      </template>
                      <template v-else-if="getDailyMinMax(sensor.deviceUUID).min === null">
                        <!-- No value -->
                      </template>
                      <span v-else class="font-bold text-slate-700 dark:text-slate-300 w-10 text-right -ml-4" style="font-size: clamp(9px, 1.3vmin, 12px);">{{ formatTemp(getDailyMinMax(sensor.deviceUUID).min) }}°</span>
                    </div>
                  </div>
                </div>

                <!-- Humidity -->
                <div class="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg border border-purple-200 dark:border-purple-900/30 flex-1 flex items-center justify-center gap-1 px-2">
                  <span class="material-symbols-outlined text-purple-600 dark:text-purple-400" style="font-size: clamp(14px, 2vmin, 20px);">water_drop</span>
                  <p class="text-purple-800 dark:text-purple-300 font-extrabold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">{{ $t('thermal.humidity', 'Humidity') }}</p>
                  <template v-if="isLoadingThermal && sensor.humidity === null">
                    <span class="kpi-shimmer kpi-shimmer--purple rounded-lg" style="height: clamp(16px, 3vmin, 28px); width: 40px; animation-delay: 0.35s;"></span>
                  </template>
                  <template v-else-if="sensor.humidity === null">
                    <!-- No value -->
                  </template>
                  <p v-else class="text-purple-900 dark:text-purple-200 font-bold leading-tight" style="font-size: clamp(16px, 3vmin, 28px); line-height: 1;">{{ formatTemp(sensor.humidity) }}</p>
                  <p class="text-purple-800 dark:text-purple-300 font-bold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Temperature Charts (1/3 width on lg) -->
        <div class="col-span-1 flex flex-col gap-1 min-h-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 lg:overflow-hidden">
          <!-- 24-Hour Temperature Chart -->
          <div class="overflow-hidden rounded-lg md:rounded-xl border border-purple-300 md:border-2 dark:border-purple-800 bg-white shadow-lg dark:bg-gray-800 flex flex-col flex-1 min-h-0 lg:max-h-[50%]">
            <div class="border-b border-purple-300 md:border-b-2 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 px-1.5 md:px-3 py-1 md:py-1.5 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1 md:gap-2">
                  <div class="h-1 w-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <h3 class="text-xs md:text-xs font-bold text-gray-900 dark:text-white">
                    {{ $t('globalMeters.temperature24h', '24h Temperature') }} (°C)
                  </h3>
                </div>
                <!-- Chart Type Toggle -->
                <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                  <button
                    @click="temperatureChartType = 'bar'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      temperatureChartType === 'bar'
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.barChart', 'Bar Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">bar_chart</span>
                  </button>
                  <button
                    @click="temperatureChartType = 'line'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      temperatureChartType === 'line'
                        ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.lineChart', 'Line Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">show_chart</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-white dark:bg-gray-800 min-h-0">
              <div v-if="filteredTemperatureChartData.length === 0 && !isLoadingTemperature" class="w-full h-full flex flex-col items-center justify-center gap-2">
                <span class="material-symbols-outlined text-3xl text-purple-300 dark:text-purple-700">thermostat</span>
                <p class="text-gray-500 dark:text-gray-400 font-semibold text-sm text-center">{{ enrichedThermalSensors.length === 0 ? $t('globalMeters.noSensorsSelected.title', 'No sensors selected') : ($t('common.noData') || 'No data available') }}</p>
              </div>
              <TemperatureChart
                v-else
                :sensors="filteredTemperatureChartData"
                :loading="isLoadingTemperature"
                :show-legend="true"
                :chart-label="$t('globalMeters.temperature24h', '24h Temperature')"
                :sensor-colors="sensorColorMap"
                :chart-type="temperatureChartType"
              />
            </div>
          </div>

          <!-- Monthly Temperature Chart -->
          <div class="overflow-hidden bg-white shadow-lg dark:bg-gray-800 flex flex-col flex-1 min-h-0 lg:max-h-[50%] rounded-lg md:rounded-xl border border-indigo-300 md:border-2 dark:border-indigo-800">
            <div class="border-b border-indigo-300 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 flex-shrink-0 px-1.5 md:px-3 2xl:px-2 py-1 md:py-1.5 2xl:py-1 md:border-b-2">
              <div class="flex items-center justify-between gap-1 md:gap-2 2xl:gap-1">
                <div class="flex items-center gap-1 md:gap-2 2xl:gap-1">
                  <div class="h-1 w-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                  <h3 class="text-xs md:text-xs 2xl:text-[10px] font-bold text-gray-900 dark:text-white">
                    {{ $t('globalMeters.temperatureMonthly', 'Monthly Temperature') }} (°C)
                  </h3>
                </div>
                <!-- Chart Type Toggle -->
                <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
                  <button
                    @click="monthlyTemperatureChartType = 'bar'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      monthlyTemperatureChartType === 'bar'
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.barChart', 'Bar Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">bar_chart</span>
                  </button>
                  <button
                    @click="monthlyTemperatureChartType = 'line'"
                    :class="[
                      'p-0.5 rounded transition-colors',
                      monthlyTemperatureChartType === 'line'
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    ]"
                    :title="$t('globalMeters.lineChart', 'Line Chart')"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px;">show_chart</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 min-h-0 p-0.5 md:p-1.5 2xl:p-1">
              <div v-if="filteredMonthlyChartData.length === 0 && !isLoadingMonthlyChart" class="w-full h-full flex flex-col items-center justify-center gap-2">
                <span class="material-symbols-outlined text-3xl text-indigo-300 dark:text-indigo-700">thermostat</span>
                <p class="text-gray-500 dark:text-gray-400 font-semibold text-sm text-center">{{ enrichedThermalSensors.length === 0 ? $t('globalMeters.noSensorsSelected.title', 'No sensors selected') : ($t('common.noData') || 'No data available') }}</p>
              </div>
              <MonthlyTemperatureChart
                v-else
                :sensors="filteredMonthlyChartData"
                :available-sensors="availableMonthlySensors"
                :loading="isLoadingMonthlyChart"
                :loading-more="isLoadingMoreMonthly"
                :selected-sensor-id="selectedMonthlySensorId"
                :chart-type="monthlyTemperatureChartType"
                @sensor-selected="handleMonthlySensorSelected"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
// Chart type state for temperature charts
const temperatureChartType = ref<'bar' | 'line'>('line')
const monthlyTemperatureChartType = ref<'bar' | 'line'>('line')
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useViewLifecycle } from '@/composables/useViewLifecycle'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import CapteurSelector from '@/components/dashboard/CapteurSelector.vue'
import EnergyConsumptionChart from '@/features/meters/components/EnergyConsumptionChart.vue'
import DailyEnergyChart from '@/features/meters/components/DailyEnergyChart.vue'
import TemperatureChart from '@/features/meters/components/TemperatureChart.vue'
import MonthlyTemperatureChart from '@/features/meters/components/MonthlyTemperatureChart.vue'
import { getMeterColorByName } from '@/utils/meterColors'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { useRealtimeData } from '@/composables/useRealtimeData'
import { useGlobalMeters, type GlobalMeterData } from '@/composables/useGlobalMeters'
import { useMetersStore } from '@/stores/useMetersStore'
import { useSensorsStore } from '@/features/thermal-management/store/useSensorsStore'
import { fetchThermalDashboardData, fetchTemperatureChart24h, fetchTemperatureChartMonthly, type ThermalSensorData, type ThermalDashboardData } from '@/services/thermalTelemetryAPI'

const { t } = useI18n()

// Stores
const metersStore = useMetersStore()
const sensorsStore = useSensorsStore()

// State
const viewMode = ref<'energy' | 'temperature'>(
  (localStorage.getItem('globalMeters:viewMode') as 'energy' | 'temperature') || 'energy'
)
watch(viewMode, (val) => localStorage.setItem('globalMeters:viewMode', val))
const showCompteurSelector = ref(false)
const showCapteurSelector = ref(false)
const currentTime = ref(new Date())
const globalMetersList = ref<GlobalMeterData[]>([])
const isLoadingAPI = ref(false)
const isFirstLoad = ref(true)
const temperatureChartData = ref<any[]>([])
const monthlyChartData = ref<any[]>([])
const isLoadingTemperature = ref(false)
const isLoadingMonthlyChart = ref(false)
const isLoadingMoreMonthly = ref(false)  // True while fetching additional weeks after first response
const isLoadingThermal = ref(false)
const thermalZones = ref<ThermalSensorData[]>([])
const thermalSummary = ref<ThermalDashboardData['summary'] | null>(null)
const selectedMonthlySensorId = ref<string>('')

// Chart type state (bar or line)
const dailyChartType = ref<'bar' | 'line'>('bar')
const yearlyChartType = ref<'bar' | 'line'>('bar')

// Get combined grid styles for meters
const getMetersGridCombinedStyle = computed(() => {
  return getMetersGridStyle()
})

// Get combined grid styles for sensors
const getSensorsGridCombinedStyle = computed(() => {
  return getSensorsGridStyle()
})

// Available sensors for monthly chart selector
const availableMonthlySensors = computed(() => {
  const allSensors = sensorsStore.availableSensors
  return allSensors.map(s => ({
    deviceUUID: s.deviceUUID,
    sensorLabel: s.label || s.name
  }))
})

// Auto-select first sensor and fetch monthly data when sensors become available
watch(availableMonthlySensors, (sensors) => {
  console.log('[GlobalMetersView] availableMonthlySensors watcher fired - sensors:', sensors.length, 'selectedMonthlySensorId:', selectedMonthlySensorId.value)
  if (sensors.length > 0 && !selectedMonthlySensorId.value) {
    const firstSensorId = sensors[0].deviceUUID
    console.log('[GlobalMetersView] Auto-selecting first sensor:', firstSensorId)
    selectedMonthlySensorId.value = firstSensorId
    fetchMonthlyTemperatureData(firstSensorId)
  } else if (sensors.length === 0) {
    console.log('[GlobalMetersView] No sensors available yet')
  } else {
    console.log('[GlobalMetersView] Sensor already selected, skipping auto-select')
  }
}, { immediate: true })

// Initialize composables (same as DashboardView)
const {
  selectedCompteurs,
  selectedCompteurIds,
  availableCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

const { dashboardStore } = useRealtimeData()

const { fetchGlobalMeters, loading: globalMetersLoading, error: globalMetersError } = useGlobalMeters()

// Track connection status
const isConnected = computed(() => dashboardStore.isConnected)
const { isActive, guard } = useViewLifecycle()

// Update time every second for status display
let clockInterval: number | null = null
let refreshInterval: number | null = null

onMounted(async () => {
  // Initialize meter selection
  initializeCompteurSelection()

  // Load compteurs list from API
  try {
    await dashboardStore.loadCompteurs()
    console.log('[GlobalMetersView] Loaded compteurs:', dashboardStore.compteurs.length)
  } catch (error) {
    console.error('[GlobalMetersView] Failed to load compteurs:', error)
  }

  // Load sensors list from API (temperature sensors)
  try {
    await sensorsStore.fetchSensors()
    console.log('[GlobalMetersView] Loaded sensors:', sensorsStore.availableSensors.length)
  } catch (error) {
    console.error('[GlobalMetersView] Failed to load sensors:', error)
  }

  // Update clock
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Perform initial load with loading indicators
  await performInitialLoad()
  if (!guard()) return // Component unmounted during initial load

  // Start silent refresh interval AFTER initial load completes
  refreshInterval = setInterval(() => {
    if (!isActive.value) return // Skip if component unmounted
    silentRefresh()
  }, 15000) // 15 seconds
})

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Watch for compteur selection changes and fetch API data
// For user-initiated selection changes, we show a brief loading state
watch(selectedCompteurs, async (newCompteurs, oldCompteurs) => {
  console.log('[GlobalMetersView] Selection changed:', newCompteurs.length, 'meters')

  // Skip if this is the first load (handled by performInitialLoad)
  if (isFirstLoad.value) {
    return
  }

  if (newCompteurs.length > 0) {
    // User changed selection - show loading briefly
    isLoadingAPI.value = true
    try {
      await fetchGlobalMetersData(false) // Don't use internal loader since we're managing it here
    } finally {
      isLoadingAPI.value = false
    }
  } else {
    globalMetersList.value = []
  }
}, { deep: true })

// Fetch global meters data from API
async function fetchGlobalMetersData(showLoader = true) {
  const deviceUUIDs = selectedCompteurs.value
    .filter((c) => c.deviceUUID)
    .map((c) => c.deviceUUID!)

  if (deviceUUIDs.length === 0) {
    globalMetersList.value = []
    return
  }

  const shouldShowLoader = showLoader && isFirstLoad.value
  if (shouldShowLoader) {
    isLoadingAPI.value = true
  }

  try {
    const response = await fetchGlobalMeters(deviceUUIDs, false)

    if (response && response.success) {
      globalMetersList.value = response.data
      console.log('[GlobalMetersView] Updated meter data from API:', globalMetersList.value)
    } else {
      console.error('[GlobalMetersView] API response not successful:', response)
      globalMetersList.value = []
    }
  } catch (error) {
    console.error('[GlobalMetersView] Error fetching global meters:', error)
    globalMetersList.value = []
  } finally {
    // Always clear loading state if it was set
    if (shouldShowLoader) {
      isLoadingAPI.value = false
      isFirstLoad.value = false
    }
  }
}

// Fetch temperature chart data (24h)
async function fetchTemperatureData() {
  try {
    isLoadingTemperature.value = true
    const response = await fetchTemperatureChart24h()

    if (response && response.success) {
      temperatureChartData.value = response.data.sensors
      console.log('[GlobalMetersView] Updated 24h temperature chart data:', temperatureChartData.value.length, 'sensors')
    } else {
      console.error('[GlobalMetersView] 24h Temperature API response not successful')
      temperatureChartData.value = []
    }
  } catch (error) {
    console.error('[GlobalMetersView] Error fetching 24h temperature data:', error)
    temperatureChartData.value = []
  } finally {
    isLoadingTemperature.value = false
  }
}

// Fetch monthly temperature chart data progressively (week-by-week)
// Each week's data is displayed on the chart as it arrives
async function fetchMonthlyTemperatureData(sensorId?: string) {
  const sensorIds = sensorId ? [sensorId] : undefined
  console.log('[GlobalMetersView] fetchMonthlyTemperatureData called with sensorId:', sensorId)

  // Show loading indicator and clear previous data
  isLoadingMonthlyChart.value = true
  isLoadingMoreMonthly.value = true
  monthlyChartData.value = []

  let isFirstCallback = true
  try {
    await fetchTemperatureChartMonthly((sensors) => {
      // Called after each week loads — update chart progressively
      // Deep clone to ensure Vue reactivity detects changes
      console.log('[GlobalMetersView] onWeekReady callback - received', sensors.length, 'sensors with', sensors.reduce((n, s) => n + s.data.length, 0), 'total points')
      monthlyChartData.value = sensors.map(s => ({
        ...s,
        data: [...s.data]
      }))
      // Hide loading after first week data arrives
      if (isFirstCallback) {
        isLoadingMonthlyChart.value = false
        isFirstCallback = false
      }
      console.log('[GlobalMetersView] monthlyChartData updated, length:', monthlyChartData.value.length, 'data points:', monthlyChartData.value[0]?.data?.length)
    }, sensorIds)
    // Fully loaded - hide loading more indicator
    isLoadingMoreMonthly.value = false
    console.log('[GlobalMetersView] Monthly temperature chart fully loaded:', monthlyChartData.value.length, 'sensors')
  } catch (error) {
    console.error('[GlobalMetersView] Error fetching monthly temperature data:', error)
    isLoadingMonthlyChart.value = false
    isLoadingMoreMonthly.value = false
    monthlyChartData.value = []
  }
}

/**
 * Handle sensor selection change from MonthlyTemperatureChart
 */
function handleMonthlySensorSelected(sensorId: string) {
  console.log('[GlobalMetersView] Monthly sensor selected:', sensorId, 'current:', selectedMonthlySensorId.value)
  if (sensorId && sensorId !== selectedMonthlySensorId.value) {
    selectedMonthlySensorId.value = sensorId
    // Refetch data for only this sensor
    console.log('[GlobalMetersView] Fetching monthly data for sensor:', sensorId)
    fetchMonthlyTemperatureData(sensorId)
  } else {
    console.log('[GlobalMetersView] Sensor already selected or invalid, skipping fetch')
  }
}

/**
 * Fetch thermal sensor data from backend API (same approach as ThermalManagementView)
 * Uses GET /api/telemetry/thermal to get all sensor readings
 */
async function fetchThermalSensorData(showLoader = true) {
  try {
    if (showLoader) isLoadingThermal.value = true

    console.log('[GlobalMetersView] Fetching thermal sensor data from API...')
    const thermalData = await fetchThermalDashboardData(false)

    if (thermalData.status === 'success' && thermalData.sensors.length > 0) {
      thermalZones.value = thermalData.sensors
      thermalSummary.value = thermalData.summary
      console.log(`[GlobalMetersView] Loaded ${thermalData.sensors.length} thermal sensors from API`)
    } else if (thermalData.status === 'partial' && thermalData.sensors.length > 0) {
      thermalZones.value = thermalData.sensors
      thermalSummary.value = thermalData.summary
      console.warn('[GlobalMetersView] Partial thermal data:', thermalData.message)
    } else {
      console.warn('[GlobalMetersView] Thermal API returned no data:', thermalData.message)
    }
  } catch (error) {
    console.error('[GlobalMetersView] Error fetching thermal data:', error)
  } finally {
    if (showLoader) isLoadingThermal.value = false
  }
}

/**
 * Perform initial data load with loading indicators
 * Shows loaders during first-time data fetch
 */
async function performInitialLoad() {
  try {
    // Fetch all required data in parallel
    const promises: Promise<any>[] = []

    // Only fetch global meters if compteurs are selected
    if (selectedCompteurs.value.length > 0) {
      promises.push(fetchGlobalMetersData(true))
    }

    // Always fetch temperature chart data (24h only - monthly waits for sensor selection)
    promises.push(fetchTemperatureData())

    // Always fetch thermal sensor data (for temperature view)
    promises.push(fetchThermalSensorData(true))

    // Wait for all initial data to load
    await Promise.all(promises)

    console.log('[GlobalMetersView] Initial load completed')
  } catch (error) {
    console.error('[GlobalMetersView] Error during initial load:', error)
  } finally {
    // Mark initial load as complete
    isFirstLoad.value = false
  }
}

/**
 * Silent refresh - fetches all data without showing loaders
 * Updates state atomically only if all APIs succeed
 * Keeps old data on failure to maintain UX consistency
 */
async function silentRefresh() {
  try {
    console.log('[GlobalMetersView] Starting silent refresh...')

    const deviceUUIDs = selectedCompteurs.value
      .filter((c) => c.deviceUUID)
      .map((c) => c.deviceUUID!)

    // Prepare all API calls
    // NOTE: chart-data and chart-monthly are NOT refreshed — they are heavy and cached on the backend
    const apiCalls: Promise<any>[] = []

    // Fetch global meters data if there are selected compteurs
    let globalMetersPromise: Promise<any> | null = null
    if (deviceUUIDs.length > 0) {
      globalMetersPromise = fetchGlobalMeters(deviceUUIDs, false)
      apiCalls.push(globalMetersPromise)
    }

    // Fetch thermal sensor data (silent, no loader)
    const thermalPromise = fetchThermalDashboardData(false)
    apiCalls.push(thermalPromise)

    // Wait for all APIs to complete in parallel
    const results = await Promise.all(apiCalls)

    // Parse results based on what was requested
    let idx = 0
    let globalMetersResponse = null
    let thermalResponse = null

    if (globalMetersPromise && deviceUUIDs.length > 0) {
      globalMetersResponse = results[idx++]
    }
    thermalResponse = results[idx++]

    // Update energy data atomically
    if (globalMetersResponse && globalMetersResponse.success) {
      globalMetersList.value = globalMetersResponse.data
    }

    // Update thermal sensor data
    if (thermalResponse && thermalResponse.status === 'success' && thermalResponse.sensors?.length > 0) {
      thermalZones.value = thermalResponse.sensors
      thermalSummary.value = thermalResponse.summary
    }

    console.log('[GlobalMetersView] Silent refresh completed')
  } catch (error) {
    // Silent error logging - do not interrupt user interaction
    console.error('[GlobalMetersView] Silent refresh error:', error)
    // Keep existing data - no state changes
  }
}

// Computed
const lastUpdateTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.value.getSeconds().toString().padStart(2, '0')
  const date = currentTime.value.toLocaleDateString('fr-FR')
  return `${date} ${hours}:${minutes}:${seconds}`
})

const handleCompteurSelection = (selectedIds: string[]) => {
  // Update the metersStore with the selected IDs
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
  // The watch on selectedCompteurs will trigger API fetch
}

const handleCapteurSelection = (selectedIds: string[]) => {
  // Update the sensorsStore with the selected IDs
  sensorsStore.setSelectedSensors(selectedIds)
  showCapteurSelector.value = false
}

/**
 * Get enriched thermal sensor data by merging store sensors with API thermal data
 * Same approach as ThermalManagementView.buildZonesFromThermalAPI
 */
const enrichedThermalSensors = computed(() => {
  const sensors = sensorsStore.selectedSensors
  if (sensors.length === 0) return []

  return sensors.map((sensor, index) => {
    // Find matching thermal API data by deviceUUID
    const thermalData = thermalZones.value.find(
      (tz) => tz.deviceUUID === sensor.deviceUUID
    )

    return {
      ...sensor,
      // Override with live API data if available
      temperature: thermalData?.temperature ?? null,
      humidity: thermalData?.humidity ?? null,
      dewPoint: thermalData?.dewPoint ?? null,
      mode: thermalData?.mode ?? sensor.mode ?? null,
      minTemp: thermalData?.minTemp ?? sensor.minTemp,
      maxTemp: thermalData?.maxTemp ?? sensor.maxTemp,
      active: thermalData?.active ?? null,
      powerStatus: thermalData?.powerStatus ?? null,
      relay: thermalData?.relay ?? null,
      sensorLabel: thermalData?.label || thermalData?.displayName || sensor.label || sensor.name,
    }
  })
})

// Filtered chart data: only show selected sensors
const selectedSensorUUIDs = computed(() => {
  const sensors = sensorsStore.selectedSensors
  return new Set(sensors.map(s => s.deviceUUID))
})

const filteredTemperatureChartData = computed(() => {
  if (selectedSensorUUIDs.value.size === 0) return []
  return temperatureChartData.value.filter(s => selectedSensorUUIDs.value.has(s.deviceUUID))
})

const dailyMinMaxBySensor = computed(() => {
  const map = new Map<string, { min: number | null; max: number | null }>()
  for (const sensor of temperatureChartData.value) {
    const values = (sensor.data || [])
      .map((point: any) => point?.value)
      .filter((value: any) => typeof value === 'number') as number[]
    if (values.length === 0) {
      map.set(sensor.deviceUUID, { min: null, max: null })
      continue
    }
    map.set(sensor.deviceUUID, {
      min: Math.min(...values),
      max: Math.max(...values),
    })
  }
  return map
})

function getDailyMinMax(sensorUUID: string): { min: number | null; max: number | null } {
  return dailyMinMaxBySensor.value.get(sensorUUID) ?? { min: null, max: null }
}

const filteredMonthlyChartData = computed(() => {
  if (selectedSensorUUIDs.value.size === 0) return []
  return monthlyChartData.value.filter(s => selectedSensorUUIDs.value.has(s.deviceUUID))
})

// Sensor color palette - modern, accessible, diverse colors for temperature visualization
// Designed for high contrast in both light and dark themes
const SENSOR_COLORS = [
  '#0891b2', // Cyan 600 - cool blue-green
  '#f59e0b', // Amber 500 - warm orange
  '#10b981', // Emerald 500 - healthy green
  '#3b82f6', // Blue 500 - classic blue
  '#8b5cf6', // Violet 500 - purple accent
  '#ec4899', // Pink 500 - warm pink
  '#14b8a6', // Teal 500 - blue-green
  '#6366f1'  // Indigo 500 - deep blue
]

const getSensorColor = (index: number) => SENSOR_COLORS[index % SENSOR_COLORS.length]

// Generate sensor color map for chart consistency
const sensorColorMap = computed(() => {
  const colorMap: Record<string, string> = {}
  enrichedThermalSensors.value.forEach((sensor, index) => {
    colorMap[sensor.deviceUUID] = getSensorColor(index)
  })
  return colorMap
})

// Sensor grid style — identical approach to energy meters (getMetersGridStyle)
const getSensorsGridStyle = () => {
  const count = enrichedThermalSensors.value.length

  if (window.innerWidth < 768) {
    return 'grid-template-columns: 1fr; grid-auto-rows: minmax(180px, auto);'
  }

  switch (count) {
    case 1:
      return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'
    case 2:
      return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'
    case 3:
      return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'
    case 4:
      return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'
    case 5:
      return 'grid-template-columns: repeat(6, 1fr); grid-auto-rows: 1fr;'
    case 6:
      return 'grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr;'
    case 7:
      return 'grid-template-columns: repeat(12, 1fr); grid-auto-rows: 1fr;'
    case 8:
      return 'grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr;'
    default:
      return 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); grid-auto-rows: 1fr;'
  }
}

// Sensor card grid span — identical approach to energy meters (getCardGridSpan)
const getSensorCardGridSpan = (index: number, totalCount: number): Record<string, any> => {
  // 5 sensors: first row (0-2) at 33% each, second row (3-4) at 50% each
  if (totalCount === 5) {
    if (index <= 2) return { gridColumn: 'span 2' }  // Items 0-2: 2 cols = 33%
    if (index >= 3) return { gridColumn: 'span 3' }  // Items 3-4: 3 cols = 50%
  }
  // 7 sensors: first row (0-3) at 25% each, second row (4-6) at 33.33% each
  if (totalCount === 7) {
    if (index <= 3) return { gridColumn: 'span 3' }  // Items 0-3: 3 cols = 25%
    if (index >= 4) return { gridColumn: 'span 4' }  // Items 4-6: 4 cols = 33.33%
  }
  // 3 sensors: last item spans full
  if (totalCount === 3 && index === 2) {
    return { gridColumn: '1 / -1' }
  }

  return {}
}

const formatTemp = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—'
  return val.toFixed(1)
}

// Enrich selected compteurs with API data only (no mock data)
const enrichedCompteurs = computed(() => {
  return selectedCompteurs.value.map((compteur, index) => {
    // Try to find corresponding API data
    const apiData = globalMetersList.value.find((m) => m.deviceUUID === compteur.deviceUUID)

    if (apiData) {
      // Use real API data (differential approach)
      // Note: Backend returns todayReadings, map to hourlyDataDifferential for charts
      return {
        ...compteur,
        id: compteur.id,
        name: compteur.name,
        status: apiData.status,
        instantaneous: apiData.instantaneous ?? undefined,
        currentPower: apiData.instantaneous ?? undefined, // For ComparisonChart
        today: apiData.today ?? undefined,
        yesterday: apiData.yesterday ?? undefined,
        hourlyDataDifferential: (apiData as any).todayReadings || apiData.hourlyDataDifferential || [],
        monthlyDataDifferential: apiData.monthlyDataDifferential || [],
        yearlyDataDifferential: apiData.yearlyDataDifferential || [],
      }
    } else {
      // No API data available - return undefined values that will display as "--"
      return {
        ...compteur,
        id: compteur.id,
        name: compteur.name,
        status: 'offline' as const,
        instantaneous: undefined,
        currentPower: undefined,
        today: undefined,
        yesterday: undefined,
        hourlyDataDifferential: [],
        monthlyDataDifferential: [],
        yearlyDataDifferential: [],
      }
    }
  })
})



// Dynamic panel sizing based on meter count - STRICT 2/3 - 1/3 split
const leftPanelStyle = computed(() => {
  // Always 2/3 width (66.666%) to preserve consistent layout ratio
  return { flex: '0 0 66.666%' }
})

const rightPanelStyle = computed(() => {
  // Always 1/3 width (33.333%) to preserve consistent layout ratio
  return { flex: '0 0 33.333%' }
})

// Methods
const getMeterColorTailwind = (index: number, name?: string) => {
  return getMeterColorByName(name, index).tailwind
}

const getDelta = (compteur: any) => {
  return compteur.today - compteur.yesterday
}

const formatValue = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--'
  return value.toFixed(1)
}

const getChartColor = (index: number, name?: string) => {
  return getMeterColorByName(name, index).hex
}

// Helper function to make overflow items span properly
const getCardGridSpan = (index: number, totalCount: number): Record<string, any> => {
  // 5 meters: first row (0-2) at 33% each, second row (3-4) at 50% each
  if (totalCount === 5) {
    if (index <= 2) return { gridColumn: 'span 2' }  // Items 0-2: 2 cols = 33%
    if (index >= 3) return { gridColumn: 'span 3' }  // Items 3-4: 3 cols = 50%
  }

  // 7 meters: first row (0-3) at 25% each, second row (4-6) at 33.33% each
  if (totalCount === 7) {
    if (index <= 3) return { gridColumn: 'span 3' }  // Items 0-3: 3 cols = 25%
    if (index >= 4) return { gridColumn: 'span 4' }  // Items 4-6: 4 cols = 33.33%
  }

  // 3 meters: last item spans full
  if (totalCount === 3 && index === 2) {
    return { gridColumn: '1 / -1' }
  }

  return {}
}

// Deterministic grid style based on number of meters
// No hard-coded widths per meter count - uses CSS Grid for automatic layout
const getMetersGridStyle = () => {
  const count = enrichedCompteurs.value.length

  // Responsive breakpoint for mobile
  if (window.innerWidth < 768) {
    // Mobile: single column, responsive height
    return 'grid-template-columns: 1fr; grid-auto-rows: minmax(180px, auto);'
  }

  // Desktop: deterministic layouts based on meter count
  // Each layout ensures cards are evenly distributed and fill width
  switch (count) {
    case 1:
      // 1 meter: 1 widget full width
      return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'

    case 2:
      // 2 meters: 1 per row (2 rows), full width each
      return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'

    case 3:
      // 3 meters: 2 on first row, 1 on second row (full width shared)
      // Use CSS Grid template to create uneven rows
      return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'

    case 4:
      // 4 meters: 2 per row (2 rows)
      return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'

    case 5:
      // 5 meters: 3 on first row (33% each), 2 on second row (50% each)
      return 'grid-template-columns: repeat(6, 1fr); grid-auto-rows: 1fr;'

    case 6:
      // 6 meters: 3 per row (2 rows)
      return 'grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr;'

    case 7:
      // 7 meters: 4 on first row (25% each), 3 on second row (33.33% each)
      return 'grid-template-columns: repeat(12, 1fr); grid-auto-rows: 1fr;'

    case 8:
      // 8 meters: 4 per row (2 rows)
      return 'grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr;'

    default:
      // Fallback for edge cases: responsive auto-fit
      return 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); grid-auto-rows: 1fr;'
  }
}

// Keep old getGridStyle for any backward compatibility (deprecated)
const getGridStyle = () => {
  return getMetersGridStyle()
}
</script>

<style scoped>
/* KPI Shimmer / Skeleton loading animation */
@keyframes kpiShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.kpi-shimmer {
  display: inline-block;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.08) 0%,
    rgba(148, 163, 184, 0.18) 20%,
    rgba(148, 163, 184, 0.28) 50%,
    rgba(148, 163, 184, 0.18) 80%,
    rgba(148, 163, 184, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: kpiShimmer 1.8s ease-in-out infinite;
}

:root.dark .kpi-shimmer {
  background: linear-gradient(
    90deg,
    rgba(100, 116, 139, 0.1) 0%,
    rgba(100, 116, 139, 0.22) 20%,
    rgba(100, 116, 139, 0.35) 50%,
    rgba(100, 116, 139, 0.22) 80%,
    rgba(100, 116, 139, 0.1) 100%
  );
  background-size: 200% 100%;
}

.kpi-shimmer--purple {
  background: linear-gradient(
    90deg,
    rgba(147, 51, 234, 0.05) 0%,
    rgba(147, 51, 234, 0.14) 20%,
    rgba(147, 51, 234, 0.22) 50%,
    rgba(147, 51, 234, 0.14) 80%,
    rgba(147, 51, 234, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: kpiShimmer 1.8s ease-in-out infinite;
}

:root.dark .kpi-shimmer--purple {
  background: linear-gradient(
    90deg,
    rgba(147, 51, 234, 0.08) 0%,
    rgba(147, 51, 234, 0.2) 20%,
    rgba(147, 51, 234, 0.3) 50%,
    rgba(147, 51, 234, 0.2) 80%,
    rgba(147, 51, 234, 0.08) 100%
  );
  background-size: 200% 100%;
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

/* Hide scrollbars while keeping scroll functionality */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Reduce sidebar margin for GlobalMetersView to maximize card space */
:global(.global-meters-view) {
  margin-left: calc(-10px + (100% - 100%));
}

/* Adjust for expanded sidebar */
:global(.sidebar-expanded.global-meters-view),
:global(.sidebar-hovered.global-meters-view) {
  margin-left: -90px;
}
</style>
