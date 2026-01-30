<template>
  <AdminLayout>
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title & Description -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('puissance.pageTitle') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('puissance.pageDescription') }}
          </p>
        </div>
        <button
          @click="showCompteurSelector = true"
          class="flex w-full sm:w-auto items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm self-start"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          {{ $t('dashboard.manageMeters') }}
        </button>
      </div>

      <!-- CompteurSelector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="allCompteurs"
        :selected-ids="selectedMeterIdsArray"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- Controls Section - Compact Meter Selection -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 border-2 border-slate-300 dark:border-slate-600 mb-4">
        <div v-if="validSelectedMeterIds.length > 0 && currentMeterId" class="space-y-3">
          <!-- Header: Title + Manage Button -->
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {{ $t('compteur.selector.title') }}
            </h3>
          </div>

          <!-- All Meters Pills - Grid Layout -->
          <div v-if="validSelectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <button
              v-for="(meterId, index) in validSelectedMeterIds"
              :key="meterId"
              @click="selectMeter(index)"
              :class="[
                'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-1 relative overflow-hidden group',
                currentMeterIndex === index
                  ? 'text-white shadow-lg scale-105 border-transparent'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
              ]"
              :style="currentMeterIndex === index ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
            >
              <!-- Background gradient for non-selected -->
              <div
                v-if="currentMeterIndex !== index"
                class="absolute inset-0 opacity-0 group-hover:opacity-5 transition"
                :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"
              />

              <!-- Content -->
              <span v-if="currentMeterIndex === index" class="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
              <span class="truncate relative z-10">{{ getMeterName(meterId) }}</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
          <p class="text-sm">{{ $t('dashboard.noMetersSelected.description') }}</p>
        </div>
      </div>
    </div>

    <!-- Loading Banner for Energy Data Fetching -->
    <div v-if="isLoadingTelemetry && isMeterDataReady" class="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-cyan-900 rounded-xl p-4 shadow-md animate-fadeIn">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
          <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 dark:border-cyan-700 border-t-blue-600 dark:border-t-cyan-400"></div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-lg">cloud_download</span>
            <h3 class="text-sm font-semibold text-blue-900 dark:text-cyan-100">Chargement des données de consommation énergétique...</h3>
          </div>
          <p class="text-xs text-blue-700 dark:text-cyan-300">Récupération des données : cette heure, aujourd'hui, hier, ce mois-ci...</p>
        </div>
        <div class="flex-shrink-0">
          <div class="flex items-center gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State - Improved with current meter info -->
    <div v-if="(!isMeterDataReady || telemetryFetchStatus === 'loading') && validSelectedMeterIds.length > 0" class="flex items-center justify-center py-16">
      <div class="text-center">
        <div class="inline-block mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-teal-600"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('common.loading') }} {{ currentMeterId ? getMeterName(currentMeterId) : $t('common.meterData') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('puissance.labels.fetchingData') }}</p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <div class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></div>
          <span class="text-xs text-slate-500 dark:text-slate-500">{{ $t('common.meter') }} {{ currentMeterIndex + 1 }} {{ $t('common.of') }} {{ validSelectedMeterIds.length }}</span>
        </div>
      </div>
    </div>

    <!-- No Data Message - When meter has no elements/data AND not in API mode or no chart data -->
    <div v-else-if="telemetryFetchStatus === 'success' && currentMeterData && (!currentMeterData.hourlyData.values || currentMeterData.hourlyData.values.length === 0) && (!currentMeterData.elements || currentMeterData.elements.length === 0)" class="flex items-center justify-center py-16">
      <div class="text-center max-w-md">
        <span class="material-symbols-outlined text-5xl mb-3 block text-slate-400">info</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('puissance.labels.noElementData') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
          <strong>{{ currentMeterId ? getMeterName(currentMeterId) : $t('common.thisMeter') }}</strong> {{ $t('puissance.labels.noElementBreakdown') }}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-500">
          {{ $t('puissance.labels.tryDifferentMeter') }}
        </p>
      </div>
    </div>

    <!-- No API Data Available - When in API mode and fetch completed but no telemetry data -->
    <div v-else-if="telemetryFetchStatus === 'success' && !currentMeterData && validSelectedMeterIds.length > 0" class="flex items-center justify-center py-16">
      <div class="text-center max-w-md">
        <span class="material-symbols-outlined text-5xl mb-3 block text-amber-500">cloud_off</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('puissance.labels.noApiData') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {{ $t('puissance.labels.noApiDataDescription') }}
          <strong>{{ currentMeterId ? getMeterName(currentMeterId) : $t('common.thisMeter') }}</strong>
        </p>
        <div class="flex items-center justify-center gap-2 mb-4">
          <span class="material-symbols-outlined text-lg text-amber-500">settings_suggest</span>
          <p class="text-xs text-slate-500 dark:text-slate-500">
            {{ $t('puissance.labels.checkDeviceConfig') }}
          </p>
        </div>
        <button
          @click="loadCurrentMeterData()"
          class="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
          :disabled="isLoadingTelemetry"
        >
          <span v-if="isLoadingTelemetry" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ $t('common.retrying') }}
          </span>
          <span v-else class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">refresh</span>
            {{ $t('common.retry') }}
          </span>
        </button>
      </div>
    </div>

    <!-- Display Mode Toggle - Only show when data is ready AND has chart/element data -->
    <div
      v-if="telemetryFetchStatus === 'success' && currentMeterData && (currentMeterData.hourlyData.values?.length > 0 || currentMeterData.elements?.length > 0)"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 px-1"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{{ $t('puissance.displayMode') }}</span>
      </h2>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
          @click="viewMode = 'overview'"
          :class="[
            'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border text-sm font-medium',
            viewMode === 'overview'
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md border-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
          ]"
        >
          <span class="material-symbols-outlined">dashboard</span>
          {{ $t('puissance.tabs.overview') }}
        </button>
        <button
          @click="viewMode = 'charts'"
          :class="[
            'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border text-sm font-medium',
            viewMode === 'charts'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md border-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
          ]"
        >
          <span class="material-symbols-outlined">bar_chart</span>
          {{ $t('puissance.tabs.charts') }}
        </button>
        <button
          @click="viewMode = 'tables'"
          :class="[
            'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border text-sm font-medium',
            viewMode === 'tables'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md border-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
          ]"
        >
          <span class="material-symbols-outlined">table_chart</span>
          {{ $t('puissance.tabs.tables') }}
        </button>
      </div>
    </div>

    <!-- Overview View: 2-Column Layout (Widgets Left, Charts Right) - Show if has chart or element data -->
    <div v-if="telemetryFetchStatus === 'success' && currentMeterData && (currentMeterData.hourlyData.values?.length > 0 || currentMeterData.elements?.length > 0) && viewMode === 'overview'" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: KPI Cards (1 col) -->
        <div v-if="displayElements.kpis" class="lg:col-span-1 space-y-4">
            <div class="flex items-center gap-3 mb-4">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.metrics') }}</h2>
          </div>

          <!-- KPI Cards Loading State -->
          <div v-if="isLoadingTelemetry" class="space-y-3">
            <div v-for="i in 8" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
              <div class="flex items-center justify-between mb-3">
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div class="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
            </div>
          </div>

          <!-- KPI Cards in Column -->
          <div v-else-if="currentMeterData" class="space-y-3">
            <KPICard
              v-for="(kpiKey, idx) in visibleKpiKeys"
              :key="idx"
              :title="$t(`puissance.kpi.${kpiKey}`)"
              :value="(currentMeterData.kpiValues as unknown as Record<string, number | null>)[kpiKey]"
              :unit="kpiKey === 'instantaneousConsumption' ? $t('common.unit.kw') : $t('common.unit.kwh')"
              :meter-name="currentMeterData.name"
              :meter-color="currentMeterData.color"
            />
          </div>
        </div>

        <!-- Right Column: Charts (2 cols) -->
        <div v-if="displayElements.charts" :class="[displayElements.kpis ? 'lg:col-span-2' : 'lg:col-span-3', 'space-y-6']">
          <!-- Charts Loading State -->
          <div v-if="isLoadingTelemetry" class="space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
              <div class="flex items-center justify-between mb-4">
                <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
              </div>
              <div class="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
                <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
                <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Charts Content -->
          <template v-else>
          <!-- Monthly Chart -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.overview.yearly') }}</h2>
                </div>
              <button
                @click="showChartModal('monthly')"
                :class="['px-3 py-2 rounded-lg text-sm font-medium hover:transition border', getDetailButtonClasses(currentMeterData.color)]"
              >
                <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
                {{ $t('common.viewDetails') }}
              </button>
            </div>
            <BarChart
              :title="$t('puissance.charts.monthlyPower')"
              :subtitle="$t('puissance.charts.monthlyAverage')"
              :labels="currentMeterData.monthlyData.labels"
              :data="currentMeterData.monthlyData.values"
              :bar-color="currentMeterData.color"
            />
          </div>

          <!-- Daily and Hourly Charts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.daily') }}</h3>
                </div>
                <button
                  @click="showChartModal('daily')"
                  :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
                >
                  <span class="material-symbols-outlined text-lg">zoom_in</span>
                </button>
              </div>
              <BarChart
                :title="$t('puissance.charts.dailyPower')"
                :subtitle="$t('puissance.charts.monthlyAverage')"
                :labels="currentMeterData.dailyData.labels"
                :data="currentMeterData.dailyData.values"
                :bar-color="currentMeterData.color"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourly') }}</h3>
                </div>
                <button
                  @click="showChartModal('hourly')"
                  :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
                >
                  <span class="material-symbols-outlined text-lg">zoom_in</span>
                </button>
              </div>
              <BarChart
                :title="$t('puissance.charts.hourlyPower')"
                :subtitle="$t('puissance.charts.monthlyAverage')"
                :labels="currentMeterData.hourlyData.labels"
                :data="currentMeterData.hourlyData.values"
                :bar-color="currentMeterData.color"
              />
            </div>
          </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Charts View: Full Width Charts - Show if has chart or element data -->
    <div v-else-if="telemetryFetchStatus === 'success' && currentMeterData && (currentMeterData.hourlyData.values?.length > 0 || currentMeterData.elements?.length > 0) && viewMode === 'charts'" class="space-y-8 animate-fadeIn">
      <!-- Monthly Chart -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.yearlyOverview') }}</h2>
          </div>
          <button
            @click="showChartModal('monthly')"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <BarChart
          :title="$t('puissance.charts.monthlyPower')"
          :subtitle="$t('puissance.charts.monthlyAverage')"
          :labels="currentMeterData.monthlyData.labels"
          :data="currentMeterData.monthlyData.values"
          :bar-color="currentMeterData.color"
        />
      </div>

      <!-- Daily and Hourly Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
              <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.daily') }}</h2>
            </div>
            <button
              @click="showChartModal('daily')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <BarChart
            :title="$t('puissance.charts.dailyPower')"
            :subtitle="$t('puissance.charts.monthlyAverage')"
            :labels="currentMeterData.dailyData.labels"
            :data="currentMeterData.dailyData.values"
            :bar-color="currentMeterData.color"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
              <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourly') }}</h2>
            </div>
            <button
              @click="showChartModal('hourly')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <BarChart
            :title="$t('puissance.charts.hourlyPower')"
            :subtitle="$t('puissance.charts.monthlyAverage')"
            :labels="currentMeterData.hourlyData.labels"
            :data="currentMeterData.hourlyData.values"
            :bar-color="currentMeterData.color"
          />
        </div>
      </div>
    </div>

    <!-- Tables View: Full Width Tables - Show if has chart or element data -->
    <div v-else-if="telemetryFetchStatus === 'success' && currentMeterData && (currentMeterData.hourlyData.values?.length > 0 || currentMeterData.elements?.length > 0) && viewMode === 'tables'" class="space-y-8 animate-fadeIn">
      <!-- Hourly Table -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourlyData') }}</h2>
          </div>
          <button
            @click="showTableModal('hourly')"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <DataTable
          :title="$t('puissance.tables.hourlyPower', { meter: currentMeterData.name })"
          :realtime-label="$t('puissance.tables.realtimeLastDay')"
          :columns="[
            { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'time' },
            { key: 'power', label: $t('puissance.tables.columns.power'), format: 'number' },
          ]"
          :data="currentMeterData.hourlyTableData"
          :items-per-page="15"
        />
      </div>

      <!-- Daily Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.dailyTotal') }}</h2>
          </div>
            <button
              @click="showTableModal('daily')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyTotal')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.date'), format: 'date' },
              { key: 'power', label: $t('puissance.tables.columns.dailyPower'), format: 'number' },
            ]"
            :data="currentMeterData.dailyTableData"
            :items-per-page="15"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.dailyAverage') }}</h2>
          </div>
            <button
              @click="showTableModal('monthly')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyAverage')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.month'), format: 'date' },
              { key: 'power', label: $t('puissance.tables.columns.averagePower'), format: 'number' },
            ]"
            :data="currentMeterData.dailyAverageData"
            :items-per-page="15"
          />
        </div>
      </div>
    </div>

    <!-- Chart Detail Modal -->
    <ChartDetailModal
      v-if="currentMeterData"
      :is-open="chartModalOpen"
      :chart-title="chartModalData.title"
      :chart-subtitle="chartModalData.subtitle"
      :meter-name="currentMeterData.name"
      :meter-color="currentMeterData.color"
      :data="chartModalData.data"
      :labels="chartModalData.labels"
      :hourly-data="chartModalData.hourlyData"
      :daily-data="chartModalData.dailyData"
      :weekly-data="chartModalData.weeklyData"
      :monthly-data="chartModalData.monthlyData"
      :yearly-data="chartModalData.yearlyData"
      @close="chartModalOpen = false"
    />

    <!-- Table Detail Modal -->
    <TableDetailModal
      v-if="currentMeterData"
      :is-open="tableModalOpen"
      :table-title="tableModalData.title"
      :meter-name="currentMeterData.name"
      :columns="tableModalData.columns"
      :hourly-data="currentMeterData.hourlyTableData"
      :daily-data="currentMeterData.dailyTableData"
      :monthly-data="currentMeterData.dailyAverageData"
      :initial-period="tableModalData.initialPeriod"
      @close="tableModalOpen = false"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import KPICard from '@/components/puissance/KPICard.vue'
import BarChart from '@/components/puissance/BarChart.vue'
import DataTable from '@/components/puissance/DataTable.vue'
import ChartDetailModal from '@/components/puissance/ChartDetailModal.vue'
import TableDetailModal from '@/components/puissance/TableDetailModal.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { getMeterColorByIndex } from '@/utils/meterColors'
import { usePuissance } from '@/composables/usePuissance'
import { useApiData } from '@/config/dataMode'
import type { Meter, KPIValues } from '@/data/mockData'

const { t } = useI18n()

// ✅ USE PUISSANCE COMPOSABLE FOR KPI DATA
const { getKPIs, getChartData, fetchPuissanceKPIs, isLoading, error } = usePuissance()

// ✅ USE COMPOSABLE FOR CENTRALIZED METER MANAGEMENT
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()

// Use the same composable as DashboardView for consistency
const {
  selectedCompteurIds,
  availableCompteurs: allCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Get selected meter IDs as a reactive computed
const selectedMeterIds = computed(() => selectedCompteurIds.value)

// Filter out any meter IDs that don't exist in allCompteurs (to avoid showing "Unknown")
const validSelectedMeterIds = computed(() => {
  return selectedMeterIds.value.filter(meterId => {
    return allCompteurs.value.some(c => c.id === meterId)
  })
})

// Create a separate ref that tracks the array for prop passing
const selectedMeterIdsArray = computed(() => [...selectedMeterIds.value])

// ✅ TRACK CURRENTLY DISPLAYED METER
const currentMeterIndex = ref(0)
const currentMeterId = computed(() => validSelectedMeterIds.value[currentMeterIndex.value] || null)

// Functions to navigate between selected meters
function selectMeter(index: number) {
  currentMeterIndex.value = index
}

function previousMeter() {
  if (currentMeterIndex.value > 0) {
    currentMeterIndex.value--
  }
}

function nextMeter() {
  if (currentMeterIndex.value < selectedMeterIds.value.length - 1) {
    currentMeterIndex.value++
  }
}

// Watch for changes in validSelectedMeterIds to keep index valid
watch(validSelectedMeterIds, (newIds) => {
  if (currentMeterIndex.value >= newIds.length && newIds.length > 0) {
    currentMeterIndex.value = newIds.length - 1
  } else if (newIds.length === 0) {
    currentMeterIndex.value = 0
  }
})

// UI State
const showCompteurSelector = ref(false)

// Telemetry state
const telemetryFetchStatus = ref<'idle' | 'loading' | 'success' | 'failed'>('idle')
const isLoadingTelemetry = computed(() => isLoading.value)

// Temporary cache mapping for backward compatibility with view logic
const telemetryCache = ref<Map<string, any>>(new Map())

// Handle meter selection from modal
function handleCompteurSelection(selectedIds: string[]) {
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
}

// Helper function to get meter name by ID
function getMeterName(meterId: string): string {
  const compteur = allCompteurs.value.find(c => c.id === meterId)
  return compteur?.name || 'Unknown'
}

// Helper function to get meter color by index
function getMeterColorByIndexHelper(index: number): string {
  return getMeterColorByIndex(index).hex
}

/**
 * Get button color classes based on meter's color for "Details" buttons
 * Provides color-coded styling that matches the selected meter
 */
function getDetailButtonClasses(meterColor: string): string {
  const colorMap: Record<string, string> = {
    'red': 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800',
    'green': 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
    'blue': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    'yellow': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
  }
  return colorMap[meterColor] || colorMap['blue'] // Default to blue
}

// ===========================
// AUTO-SELECT 8 METERS ON MOUNT
// ===========================
onMounted(async () => {
  // Initialize compteur selection (syncs with DashboardView)
  await initializeCompteurSelection()

  // Restore and clean up any invalid meter IDs from localStorage
  metersStore.restoreSelection()

  // Auto-select first 8 meters if none are selected after restoration
  if (selectedMeterIds.value.length === 0 && dashboardStore.compteurs.length > 0) {
    const defaultSelection = dashboardStore.compteurs.slice(0, 8).map(c => c.id)
    metersStore.setSelectedMeters(defaultSelection)
    console.log('Auto-selected 8 meters for Puissance view:', defaultSelection)
  } else if (selectedMeterIds.value.length > 0) {
    console.log('Restored selected meters for Puissance view:', selectedMeterIds.value)
  }

  // Fetch telemetry data for current meter if API mode enabled
  if (useApiData()) {
    await loadCurrentMeterData()
  }
})

// ===========================
// TELEMETRY DATA FETCHING
// ===========================

/**
 * Load data for the currently active meter only
 */
async function loadCurrentMeterData() {
  if (!useApiData() || !currentMeterId.value) {
    console.log('[Puissance] Skipping data load - API mode disabled or no meter selected')
    return
  }

  const meter = allCompteurs.value.find(c => c.id === currentMeterId.value)
  if (!meter?.deviceUUID) {
    console.log('[Puissance] Skipping data load - meter not found or no deviceUUID:', currentMeterId.value)
    telemetryFetchStatus.value = 'idle'
    return
  }

  // Check if we already have cached data for this meter
  if (telemetryCache.value.has(meter.id)) {
    console.log('[Puissance] ✓ Using cached data for meter:', meter.name)
    telemetryFetchStatus.value = 'success'
    return
  }

  // Check if already loading to prevent duplicate requests
  if (telemetryFetchStatus.value === 'loading') {
    console.log('[Puissance] Already loading data, skipping duplicate request')
    return
  }

  telemetryFetchStatus.value = 'loading'

  try {
    console.log(`[Puissance] → Fetching KPI data from API for meter: ${meter.name} (deviceUUID: ${meter.deviceUUID})`)

    const response = await fetchPuissanceKPIs(meter.deviceUUID, { debug: false, useCache: true })

    // Map the new API response format to the legacy cache structure
    const cachedData = {
      meterId: meter.id,
      // Direct KPI values (used by kpiValues object)
      instantaneousConsumption: response.data.instantaneousPower,
      consumedThisHour: response.data.consumedThisHour,
      consumedToday: response.data.consumedToday,
      consumedYesterday: response.data.consumedYesterday,
      consumedThisMonth: response.data.consumedThisMonth,
      consumedLastMonth: response.data.consumedLastMonth,
      // Convert instantaneous power number to array format with key (for chart filtering)
      instantaneousPower: response.data.instantaneousPower !== null
        ? [{ key: 'ActivePowerTotal', ts: Date.now(), value: response.data.instantaneousPower }]
        : [],
      // Add key property to chart data arrays (view filters by key === 'ActivePowerTotal')
      hourlyData: response.data.hourlyData.map(d => ({ key: 'ActivePowerTotal', ts: d.ts, value: d.value })),
      dailyData: response.data.dailyData.map(d => ({ key: 'ActivePowerTotal', ts: d.ts, value: d.value })),
      monthlyData: response.data.monthlyData.map(d => ({ key: 'ActivePowerTotal', ts: d.ts, value: d.value }))
    }

    telemetryCache.value.set(meter.id, cachedData)

    // Force Vue reactivity by reassigning the Map reference
    // This ensures computed properties that depend on telemetryCache are re-evaluated
    telemetryCache.value = new Map(telemetryCache.value)

    console.log(`[Puissance] ✓ Cached data for ${meter.name}:`, {
      meterId: meter.id,
      kpis: {
        instantaneous: response.data.instantaneousPower,
        thisHour: response.data.consumedThisHour,
        today: response.data.consumedToday
      },
      chartPoints: {
        hourly: response.data.hourlyData.length,
        daily: response.data.dailyData.length,
        monthly: response.data.monthlyData.length
      }
    })

    telemetryFetchStatus.value = 'success'
  } catch (err) {
    console.error(`[Puissance] ✗ Failed to fetch ${meter.name}:`, err instanceof Error ? err.message : String(err))
    telemetryFetchStatus.value = 'failed'
  }
}

/**
 * Watch for current meter changes and fetch telemetry if needed
 * Only runs when meter actually changes (not on initial mount)
 */
watch(currentMeterId, async (newMeterId, oldMeterId) => {
  // Only fetch if meter actually changed and we're in API mode
  if (newMeterId && useApiData() && newMeterId !== oldMeterId) {
    console.log('[Puissance] Current meter changed:', { from: oldMeterId, to: newMeterId })
    await loadCurrentMeterData()
  }
})

// Type for Transformed Data
// ===========================
interface TransformedMeterData {
  name: string
  color: string
  icon: string
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  elements: string[]
  kpiValues: KPIValues
  hourlyData: { labels: string[]; values: number[] }
  dailyData: { labels: string[]; values: number[] }
  monthlyData: { labels: string[]; values: number[] }
  hourlyTableData: Array<{ timestamp: number; power: number; efficiency: number; status: string }>
  dailyTableData: Array<{ timestamp: number; power: number; average: number }>
  dailyAverageData: Array<{ timestamp: number; power: number; days: number }>
}

// Selected meter (single-meter view, but from the centralized selected list)
const selectedMeter = ref('tgbt')

// View mode toggle
const viewMode = ref<'overview' | 'charts' | 'tables'>('overview')

// Modal states
const chartModalOpen = ref(false)
const tableModalOpen = ref(false)

const chartModalData = ref({
  title: '',
  subtitle: '',
  data: [] as number[],
  labels: [] as string[],
  hourlyData: { labels: [] as string[], values: [] as number[] },
  dailyData: { labels: [] as string[], values: [] as number[] },
  weeklyData: { labels: [] as string[], values: [] as number[] },
  monthlyData: { labels: [] as string[], values: [] as number[] },
  yearlyData: { labels: [] as string[], values: [] as number[] },
})

const tableModalData = ref({
  title: '',
  columns: [] as any[],
  initialPeriod: 'hourly' as 'hourly' | 'daily' | 'monthly',
})

// ✅ ALL AVAILABLE METERS FROM CENTRALIZED STORE
const meters = computed(() => metersStore.allMeters.map(meter => ({
  id: meter.id,
  name: meter.name,
  color: meter.color,
  icon: meter.icon,
  category: meter.type ?? 'meter'
})))

// Meter categories for filtering - Only display main 4 categories
const mainCategories: string[] = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage']
const meterCategories = computed(() => {
  const availableCategories = new Set(meters.value.map(m => m.category))
  // Return only main categories that exist in data
  return mainCategories.filter((cat) => availableCategories.has(cat))
})

// Filter meters by selected category
const filteredMeters = computed(() => {
  if (!selectedCategory.value) {
    return meters.value
  }
  return meters.value.filter(m => m.category === selectedCategory.value)
})

// Category filter state - defaults to first available category
const selectedCategory = ref<string | null>('TGBT')

// Selected element state (for meters with multiple elements)
const selectedElement = ref<string | null>(null)

/**
 * Watch category changes and auto-select first meter
 */
watch(
  () => selectedCategory.value,
  (newCategory) => {
    // When category changes, auto-select the first available meter
    const filtered = filteredMeters.value
    if (filtered.length > 0) {
      selectedMeter.value = filtered[0].id
    }
  }
)

// Display elements selection
const displayElements = ref({
  kpis: true,
  charts: true,
  summary: true
})

// Visible KPI keys based on filter
const visibleKpiKeys = computed(() => {
  if (!displayElements.value.kpis) return []
  return kpiKeys
})

/**
 * Current meter data - using centralized metersData.ts
 * Returns full meter data with time series and KPIs
 * If element is selected, returns element-specific data
 * Updates when currentMeterId changes (navigation between selected meters)
 */
const currentMeterData = computed<TransformedMeterData | null>(() => {
  // Use currentMeterId which changes when user navigates between selected meters
  if (!currentMeterId.value) {
    console.log(`[Puissance KPI] currentMeterData computed: no currentMeterId`)
    return null
  }

  const data = transformMeterData(currentMeterId.value)

  if (data) {
    console.log(`[Puissance KPI] currentMeterData computed - KPI values:`, {
      meterId: currentMeterId.value,
      name: data.name,
      instantaneousConsumption: (data.kpiValues as any).instantaneousConsumption,
      consumedThisHour: (data.kpiValues as any).consumedThisHour,
      consumedToday: (data.kpiValues as any).consumedToday,
      consumedYesterday: (data.kpiValues as any).consumedYesterday,
      consumedThisMonth: (data.kpiValues as any).consumedThisMonth,
      consumedLastMonth: (data.kpiValues as any).consumedLastMonth
    })
  }

  return data
})

/**
 * Transform meter data from centralized format to view format
 * Uses real telemetry data if available, falls back to mock data only in mock mode
 */
function transformMeterData(meterId: string): TransformedMeterData | null {
  const selectedMeterObj = metersStore.allMeters.find(m => m.id === meterId)

  // Check if we have real telemetry data for this meter/element
  const telemetryData = telemetryCache.value.get(meterId)
  const isApiMode = useApiData()

  console.log(`[Puissance] transformMeterData called for ${meterId}:`, {
    isMeter: !!selectedMeterObj,
    telemetryDataAvailable: !!telemetryData,
    isApiMode,
    cacheSize: telemetryCache.value.size,
    cacheKeys: Array.from(telemetryCache.value.keys()),
    telemetryDataContent: telemetryData
  })

  // If not a direct meter, check if it's element data in cache
  if (!selectedMeterObj) {
    if (!telemetryData) {
      console.warn(`[Puissance] No meter or telemetry data found for: ${meterId}`)
      return null
    }
    // It's element data or a meter we're viewing from element breakdown
    // Try to construct minimal transformed data from telemetry
    console.log(`[Puissance] Using element/cached data for ${meterId}`)
  }

  // Get full meter data from centralized source (mock data)
  const fullData = selectedMeterObj ? metersStore.getFullMeterData(meterId) : null
  if (!fullData && !telemetryData) return null

  // In API mode, initialize with empty data if no telemetry available
  // (will display empty charts instead of error message)

  let hourlyValues: number[] = []
  let hourlyLabels: string[] = []
  let hourlyTimestamps: number[] = []
  let dailyValues: number[] = []
  let dailyLabels: string[] = []
  let dailyTimestamps: number[] = []
  let monthlyValues: number[] = []
  let monthlyLabels: string[] = []
  let monthlyTimestamps: number[] = []
  let instantaneousPowerValue: number | null = null
  let avgPowerToday: number | null = null
  let avgPowerYesterday: number | null = null
  let avgPowerThisMonth: number | null = null
  let avgPowerLastMonth: number | null = null
  let peakPowerToday: number | null = null

  if (telemetryData && isApiMode) {
    console.log(`[Puissance] Using API telemetry data for meter: ${meterId}`, {
      hasInstantaneousData: !!telemetryData.instantaneousPower,
      hasHourlyData: !!telemetryData.hourlyData,
      hasDailyData: !!telemetryData.dailyData,
      hasMonthlyData: !!telemetryData.monthlyData,
      instantaneousLength: telemetryData.instantaneousPower?.length || 0,
      hourlyLength: telemetryData.hourlyData?.length || 0,
      dailyLength: telemetryData.dailyData?.length || 0,
      monthlyLength: telemetryData.monthlyData?.length || 0,
      fullTelemetryData: telemetryData
    })

    // Extract instantaneous power (most recent reading)
    if (telemetryData.instantaneousPower && telemetryData.instantaneousPower.length > 0) {
      console.log(`[Puissance] Raw instantaneous data:`, {
        totalPoints: telemetryData.instantaneousPower.length,
        allPoints: telemetryData.instantaneousPower
      })

      // Get the most recent value
      const sortedByTime = [...telemetryData.instantaneousPower].sort((a, b) => b.ts - a.ts)
      const latest = sortedByTime[0]
      instantaneousPowerValue = latest.value
      console.log(`[Puissance KPI] instantaneousPower:`, {
        apiKey: latest.key,
        apiParameters: {
          timeRange: 'Last 5 minutes',
          interval: '1 minute',
          aggregation: 'NONE (latest value)',
          limit: 1
        },
        apiResponse: telemetryData.instantaneousPower,
        calculation: `latest value from response (sorted by timestamp desc)`,
        value: instantaneousPowerValue,
        unit: 'kW',
        timestamp: new Date(latest.ts).toLocaleString(),
        apiTimestampMs: latest.ts
      })
    }

    // Transform hourly data (already filtered to ActivePowerTotal)
    if (telemetryData.hourlyData && telemetryData.hourlyData.length > 0) {
      console.log(`[Puissance] Raw hourly data (before filtering):`, {
        totalPoints: telemetryData.hourlyData.length,
        uniqueKeys: [...new Set(telemetryData.hourlyData.map((d: any) => d.key))],
        firstFewPoints: telemetryData.hourlyData.slice(0, 3),
        allPoints: telemetryData.hourlyData
      })

      // Filter for ActivePowerTotal key only
      const powerData = telemetryData.hourlyData
        .filter((d: any) => d.key === 'ActivePowerTotal')
        .sort((a: any, b: any) => a.ts - b.ts)  // Ensure chronological order

      console.log(`[Puissance] Hourly data AFTER filtering for ActivePowerTotal:`, {
        pointsAfterFilter: powerData.length,
        pointsRemoved: telemetryData.hourlyData.length - powerData.length,
        filteredData: powerData
      })

      hourlyValues = powerData.map((d: any) => d.value)
      hourlyTimestamps = powerData.map((d: any) => d.ts)  // Keep raw timestamps
      hourlyLabels = powerData.map((d: any) => {
        const date = new Date(d.ts)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      })

      console.log(`[Puissance] Hourly timestamps:`, powerData.map((d: any) => new Date(d.ts).toLocaleString()))
      console.log(`[Puissance] Hourly labels:`, hourlyLabels)
      console.log(`[Puissance] Hourly values:`, hourlyValues)

      // Calculate today's average from hourly data
      if (hourlyValues.length > 0) {
        avgPowerToday = hourlyValues.reduce((a, b) => a + b, 0) / hourlyValues.length
        // Calculate peak power today
        peakPowerToday = Math.max(...hourlyValues)

        console.log(`[Puissance KPI] peakPowerToday:`, {
          apiKey: 'ActivePowerTotal',
          apiParameters: {
            timeRange: 'Last 24 hours',
            interval: '1 hour (hourly average)',
            aggregation: 'AVG'
          },
          apiResponse: hourlyValues,
          calculation: `Math.max(${hourlyValues.map((v, i) => `${v.toFixed(2)}`).join(', ')})`,
          value: peakPowerToday,
          unit: 'kW',
          dataPoints: hourlyValues.length
        })

        console.log(`[Puissance KPI] avgPowerToday:`, {
          apiKey: 'ActivePowerTotal',
          apiParameters: {
            timeRange: 'Last 24 hours',
            interval: '1 hour (hourly average)',
            aggregation: 'AVG'
          },
          apiResponse: hourlyValues,
          calculation: `sum([${hourlyValues.map(v => v.toFixed(2)).join(', ')}]) / ${hourlyValues.length}`,
          value: avgPowerToday,
          unit: 'kW',
          dataPoints: hourlyValues.length
        })
      }
    }

    // Transform daily data (already filtered to ActivePowerTotal)
    if (telemetryData.dailyData && telemetryData.dailyData.length > 0) {
      console.log(`[Puissance] Raw daily data (before filtering):`, {
        totalPoints: telemetryData.dailyData.length,
        uniqueKeys: [...new Set(telemetryData.dailyData.map((d: any) => d.key))],
        firstFewPoints: telemetryData.dailyData.slice(0, 3),
        allPoints: telemetryData.dailyData
      })

      // Filter for ActivePowerTotal key only
      const powerData = telemetryData.dailyData
        .filter((d: any) => d.key === 'ActivePowerTotal')
        .sort((a: any, b: any) => a.ts - b.ts)  // Ensure chronological order

      console.log(`[Puissance] Daily data AFTER filtering for ActivePowerTotal:`, {
        pointsAfterFilter: powerData.length,
        pointsRemoved: telemetryData.dailyData.length - powerData.length,
        filteredData: powerData
      })

      // Fill in missing days to show all days on x-axis
      if (powerData.length > 1) {
        const firstDate = new Date(powerData[0].ts)
        const lastDate = new Date(powerData[powerData.length - 1].ts)
        const filledData = []

        // Start from first day
        const current = new Date(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), firstDate.getUTCDate())

        while (current <= lastDate) {
          const dayKey = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}-${String(current.getUTCDate()).padStart(2, '0')}`
          const existingPoint = powerData.find((p: any) => {
            const pDate = new Date(p.ts)
            return pDate.getUTCFullYear() === current.getUTCFullYear() &&
                   pDate.getUTCMonth() === current.getUTCMonth() &&
                   pDate.getUTCDate() === current.getUTCDate()
          })

          if (existingPoint) {
            filledData.push(existingPoint)
          } else {
            // Add empty point for missing day
            filledData.push({
              ts: current.getTime(),
              value: 0,  // Show as zero/empty bar
              key: 'ActivePowerTotal'
            })
          }

          // Move to next day
          current.setUTCDate(current.getUTCDate() + 1)
        }

        console.log(`[Puissance] Filled daily data (with empty days):`, {
          originalCount: powerData.length,
          filledCount: filledData.length,
          filledData: filledData
        })

        dailyValues = filledData.map((d: any) => d.value)
        dailyTimestamps = filledData.map((d: any) => d.ts)  // Keep raw timestamps
        dailyLabels = filledData.map((d: any) => {
          const date = new Date(d.ts)
          const day = date.getUTCDate().toString().padStart(2, '0')
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
          return `${day}/${month}`
        })
      } else {
        dailyValues = powerData.map((d: any) => d.value)
        dailyTimestamps = powerData.map((d: any) => d.ts)  // Keep raw timestamps
        dailyLabels = powerData.map((d: any) => {
          const date = new Date(d.ts)
          const day = date.getUTCDate().toString().padStart(2, '0')
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
          return `${day}/${month}`
        })
      }

      console.log(`[Puissance] Daily timestamps:`, dailyLabels)
      console.log(`[Puissance] Daily labels:`, dailyLabels)
      console.log(`[Puissance] Daily values:`, dailyValues)

      // Calculate yesterday's average (second to last day in the data)
      if (dailyValues.length > 1) {
        avgPowerYesterday = dailyValues[dailyValues.length - 2]

        console.log(`[Puissance KPI] avgPowerYesterday:`, {
          apiKey: 'ActivePowerTotal',
          apiParameters: {
            timeRange: 'Last 30 days',
            interval: '1 day (daily average)',
            aggregation: 'AVG'
          },
          apiResponse: dailyValues,
          calculation: `dailyValues[${dailyValues.length - 2}] (second-to-last day)`,
          value: avgPowerYesterday,
          unit: 'kW',
          dataPoints: dailyValues.length,
          note: `Index ${dailyValues.length - 2} of ${dailyValues.length} days`
        })
      }
      if (dailyValues.length > 0) {
        const todayPower = dailyValues[dailyValues.length - 1]
        // Use this for "today" average if we don't have hourly data
        if (avgPowerToday === null) {
          avgPowerToday = todayPower
        }
      }
    }

    // Transform monthly data (already filtered to ActivePowerTotal)
    if (telemetryData.monthlyData && telemetryData.monthlyData.length > 0) {
      console.log(`[Puissance] Raw monthly data (before filtering):`, {
        totalPoints: telemetryData.monthlyData.length,
        uniqueKeys: [...new Set(telemetryData.monthlyData.map((d: any) => d.key))],
        firstFewPoints: telemetryData.monthlyData.slice(0, 3),
        allPoints: telemetryData.monthlyData
      })

      // Filter for ActivePowerTotal key only
      const powerData = telemetryData.monthlyData
        .filter((d: any) => d.key === 'ActivePowerTotal')
        .sort((a: any, b: any) => a.ts - b.ts)  // Ensure chronological order

      console.log(`[Puissance] Monthly data AFTER filtering for ActivePowerTotal:`, {
        pointsAfterFilter: powerData.length,
        pointsRemoved: telemetryData.monthlyData.length - powerData.length,
        filteredData: powerData
      })

      // Fill in missing months to show all months on x-axis
      if (powerData.length > 1) {
        const firstDate = new Date(powerData[0].ts)
        const lastDate = new Date(powerData[powerData.length - 1].ts)
        const filledData = []

        // Get year and month from first and last dates (using UTC)
        let year = firstDate.getUTCFullYear()
        let month = firstDate.getUTCMonth()
        const lastYear = lastDate.getUTCFullYear()
        const lastMonth = lastDate.getUTCMonth()

        // Iterate through months until we reach or pass the last date
        while (year < lastYear || (year === lastYear && month <= lastMonth)) {
          const existingPoint = powerData.find((p: any) => {
            const pDate = new Date(p.ts)
            return pDate.getUTCFullYear() === year &&
                   pDate.getUTCMonth() === month
          })

          if (existingPoint) {
            filledData.push(existingPoint)
          } else {
            // Add empty point for missing month using UTC date
            const pointDate = new Date(Date.UTC(year, month, 1))
            filledData.push({
              ts: pointDate.getTime(),
              value: 0,  // Show as zero/empty bar
              key: 'ActivePowerTotal'
            })
          }

          // Move to next month
          month++
          if (month > 11) {
            month = 0
            year++
          }
        }

        console.log(`[Puissance] Filled monthly data (with empty months):`, {
          originalCount: powerData.length,
          filledCount: filledData.length,
          filledData: filledData
        })

        monthlyValues = filledData.map((d: any) => d.value)
        monthlyTimestamps = filledData.map((d: any) => d.ts)  // Keep raw timestamps
        monthlyLabels = filledData.map((d: any) => {
          const date = new Date(d.ts)
          return date.toLocaleString('default', { month: 'short', year: '2-digit' })
        })
      } else {
        monthlyValues = powerData.map((d: any) => d.value)
        monthlyTimestamps = powerData.map((d: any) => d.ts)  // Keep raw timestamps
        monthlyLabels = powerData.map((d: any) => {
          const date = new Date(d.ts)
          return date.toLocaleString('default', { month: 'short', year: '2-digit' })
        })
      }

      console.log(`[Puissance] Monthly timestamps:`, monthlyLabels.map((_, i) => new Date(monthlyLabels[i] || '').toLocaleString()))
      console.log(`[Puissance] Monthly labels:`, monthlyLabels)
      console.log(`[Puissance] Monthly values:`, monthlyValues)

      // Calculate this month and last month averages
      if (monthlyValues.length > 0) {
        avgPowerThisMonth = monthlyValues[monthlyValues.length - 1]
        console.log(`[Puissance KPI] avgPowerThisMonth:`, {
          apiKey: 'ActivePowerTotal',
          apiParameters: {
            timeRange: 'Last 365 days (12 months)',
            interval: '30 days (monthly average)',
            aggregation: 'AVG'
          },
          apiResponse: monthlyValues,
          calculation: `monthlyValues[${monthlyValues.length - 1}] (last month in array)`,
          value: avgPowerThisMonth,
          unit: 'kW',
          dataPoints: monthlyValues.length,
          timestamp: new Date(powerData[powerData.length - 1].ts).toLocaleString()
        })
      }
      if (monthlyValues.length > 1) {
        avgPowerLastMonth = monthlyValues[monthlyValues.length - 2]
        console.log(`[Puissance KPI] avgPowerLastMonth:`, {
          apiKey: 'ActivePowerTotal',
          apiParameters: {
            timeRange: 'Last 365 days (12 months)',
            interval: '30 days (monthly average)',
            aggregation: 'AVG'
          },
          apiResponse: monthlyValues,
          calculation: `monthlyValues[${monthlyValues.length - 2}] (second-to-last month)`,
          value: avgPowerLastMonth,
          unit: 'kW',
          dataPoints: monthlyValues.length,
          timestamp: new Date(powerData[powerData.length - 2].ts).toLocaleString()
        })
      }
    }
  } else if (!isApiMode && fullData) {
    // Use mock data only in mock/hybrid mode
    console.log(`[Puissance] Using mock data for meter: ${meterId}`)
    hourlyValues = fullData.timeSeries.hourly.map(d => d.value)
    hourlyLabels = fullData.timeSeries.hourly.map(d => d.timestamp)
    dailyValues = fullData.timeSeries.daily.map(d => d.value)
    dailyLabels = fullData.timeSeries.daily.map(d => d.timestamp)
    monthlyValues = fullData.timeSeries.monthly.map(d => d.value)
    monthlyLabels = fullData.timeSeries.monthly.map(d => d.timestamp)
    instantaneousPowerValue = fullData.metrics.power
    avgPowerToday = fullData.kpis.avgPowerToday
    avgPowerYesterday = fullData.kpis.avgPowerYesterday
    avgPowerThisMonth = fullData.kpis.avgPowerThisMonth
    avgPowerLastMonth = fullData.kpis.avgPowerLastMonth
    peakPowerToday = fullData.kpis.peak
  } else if (isApiMode && !telemetryData) {
    // API mode but no data yet - keep empty arrays initialized above
    console.log(`[Puissance] API mode: Waiting for telemetry data for meter: ${meterId}`)
  }

  // Log all KPIs summary
  if (isApiMode && telemetryData) {
    console.log(`[Puissance KPIs Summary] All metrics for ${meterId}:`, {
      instantaneousPower: {
        value: instantaneousPowerValue,
        unit: 'kW',
        source: 'Latest ActivePowerTotal value'
      },
      peakPowerToday: {
        value: peakPowerToday,
        unit: 'kW',
        source: 'Maximum of hourly ActivePowerTotal values'
      },
      avgPowerToday: {
        value: avgPowerToday,
        unit: 'kW',
        source: 'Average of hourly ActivePowerTotal values',
        dataPoints: hourlyValues.length
      },
      avgPowerYesterday: {
        value: avgPowerYesterday,
        unit: 'kW',
        source: 'Second-to-last daily ActivePowerTotal value',
        dataPoints: dailyValues.length
      },
      avgPowerThisMonth: {
        value: avgPowerThisMonth,
        unit: 'kW',
        source: 'Last monthly ActivePowerTotal value',
        dataPoints: monthlyValues.length
      },
      avgPowerLastMonth: {
        value: avgPowerLastMonth,
        unit: 'kW',
        source: 'Second-to-last monthly ActivePowerTotal value',
        dataPoints: monthlyValues.length
      }
    })
  }

  // Calculate average power for table status
  const avgPower = hourlyValues.length > 0
    ? hourlyValues.reduce((a, b) => a + b, 0) / hourlyValues.length
    : fullData?.metrics?.power ?? 0

  // If element selected, return element-specific data
  if (selectedElement.value && fullData?.elements && fullData.elements.length > 0) {
    const elementData = metersStore.getElementData(meterId, selectedElement.value)
    if (elementData) {
      const elementAvgPower = elementData.metrics.power
      // Transform element data to match expected format
      return {
        name: `${fullData?.name || 'Meter'} - ${elementData.name}`,
        color: metersStore.getMeterColor(meterId) || '#6b7280',
        icon: selectedMeterObj?.icon ?? 'default_icon',
        category: (fullData?.type ?? 'meter') as 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage',
        elements: fullData?.elements?.map(el => el.id) || [],
        kpiValues: (isApiMode ? {
          // In API mode, use energy consumption values (kWh) from telemetry
          instantaneousConsumption: telemetryData?.instantaneousConsumption || null,
          consumedThisHour: telemetryData?.consumedThisHour || null,
          consumedToday: telemetryData?.consumedToday || null,
          consumedYesterday: telemetryData?.consumedYesterday || null,
          consumedDayBeforeYesterday: telemetryData?.consumedDayBeforeYesterday || null,
          consumedThisMonth: telemetryData?.consumedThisMonth || null,
          consumedLastMonth: telemetryData?.consumedLastMonth || null,
          realtimeCurrentYear: telemetryData?.realtimeCurrentYear || null,
          realtimeCurrentMonth: telemetryData?.realtimeCurrentMonth || null,
          // Legacy power values (deprecated)
          current: null,
          peak: peakPowerToday,
          average: null,
          total: null,
          instantaneousPower: instantaneousPowerValue,
          avgPowerToday,
          avgPowerYesterday,
          avgPowerThisMonth,
          avgPowerLastMonth,
          avgPowerBeforeYesterday: null
        } : {
          // In mock mode, merge element mock data with API overrides
          ...elementData.kpis,
          instantaneousPower: instantaneousPowerValue ?? elementData.kpis.instantaneousPower,
          avgPowerToday: avgPowerToday ?? elementData.kpis.avgPowerToday,
          avgPowerYesterday: avgPowerYesterday ?? elementData.kpis.avgPowerYesterday,
          avgPowerThisMonth: avgPowerThisMonth ?? elementData.kpis.avgPowerThisMonth,
          avgPowerLastMonth: avgPowerLastMonth ?? elementData.kpis.avgPowerLastMonth,
          peak: peakPowerToday ?? elementData.kpis.peak
        }) as KPIValues,
        hourlyData: {
          labels: hourlyLabels,
          values: hourlyValues
        },
        dailyData: {
          labels: dailyLabels,
          values: dailyValues
        },
        monthlyData: {
          labels: monthlyLabels,
          values: monthlyValues
        },
        hourlyTableData: hourlyValues.map((value, i) => ({
          timestamp: hourlyTimestamps[i] || Date.now(),  // Use raw timestamp
          power: value,
          efficiency: Math.round(85 + Math.random() * 10),
          status: value > elementAvgPower ? 'high' : 'normal'
        })),
        dailyTableData: dailyValues.map((value, i) => ({
          timestamp: dailyTimestamps[i] || Date.now(),  // Use raw timestamp
          power: value * 24,
          average: value
        })),
        dailyAverageData: monthlyValues.map((value, i) => ({
          timestamp: monthlyTimestamps[i] || Date.now(),  // Use raw timestamp,
          power: value,
          days: 30
        }))
      }
    }
  }

  // Return aggregated meter data with telemetry or mock data
  const transformedData = {
    name: fullData?.name || `Meter ${meterId}`,
    color: metersStore.getMeterColor(meterId) || '#6b7280',
    icon: selectedMeterObj?.icon ?? 'default_icon',
    category: (fullData?.type ?? 'meter') as 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage',
    elements: fullData?.elements?.map(el => el.id) || [],
    kpiValues: (isApiMode ? {
      // In API mode, use energy consumption values (kWh) from telemetry
      consumedThisHour: telemetryData?.consumedThisHour || null,
      consumedToday: telemetryData?.consumedToday || null,
      instantaneousConsumption: telemetryData?.instantaneousConsumption || null,
      consumedYesterday: telemetryData?.consumedYesterday || null,
      consumedDayBeforeYesterday: telemetryData?.consumedDayBeforeYesterday || null,
      consumedThisMonth: telemetryData?.consumedThisMonth || null,
      consumedLastMonth: telemetryData?.consumedLastMonth || null,
      // Legacy power values (deprecated)
      current: null,
      peak: peakPowerToday,
      average: null,
      total: null,
      instantaneousPower: instantaneousPowerValue,
      avgPowerToday,
      avgPowerYesterday,
      avgPowerThisMonth,
      avgPowerLastMonth,
      avgPowerBeforeYesterday: null
    } : {
      // In mock mode, use mock data with API overrides
      ...((fullData?.kpis) || {
        current: null,
        peak: null,
        average: null,
        total: null,
        avgPowerLastMonth: null,
        avgPowerThisMonth: null,
        avgPowerYesterday: null,
        avgPowerToday: null,
        avgPowerBeforeYesterday: null,
        instantaneousPower: null
      }),
      instantaneousPower: instantaneousPowerValue ?? fullData?.kpis?.instantaneousPower ?? null,
      avgPowerToday: avgPowerToday ?? fullData?.kpis?.avgPowerToday ?? null,
      avgPowerYesterday: avgPowerYesterday ?? fullData?.kpis?.avgPowerYesterday ?? null,
      avgPowerThisMonth: avgPowerThisMonth ?? fullData?.kpis?.avgPowerThisMonth ?? null,
      avgPowerLastMonth: avgPowerLastMonth ?? fullData?.kpis?.avgPowerLastMonth ?? null,
      peak: peakPowerToday ?? fullData?.kpis?.peak ?? null
    }) as KPIValues,
    hourlyData: {
      labels: hourlyLabels,
      values: hourlyValues
    },
    dailyData: {
      labels: dailyLabels,
      values: dailyValues
    },
    monthlyData: {
      labels: monthlyLabels,
      values: monthlyValues
    },
    hourlyTableData: hourlyValues.map((value, i) => ({
      timestamp: hourlyTimestamps[i] || Date.now(),  // Use raw timestamp
      power: value,
      efficiency: Math.round(85 + Math.random() * 10),
      status: value > avgPower ? 'high' : 'normal'
    })),
    dailyTableData: dailyValues.map((value, i) => ({
      timestamp: dailyTimestamps[i] || Date.now(),  // Use raw timestamp
      power: value * 24,
      average: value
    })),
    dailyAverageData: monthlyValues.map((value, i) => ({
      timestamp: monthlyTimestamps[i] || Date.now(),  // Use raw timestamp
      power: value,
      days: 30
    }))
  }

  console.log(`[Puissance] 📊 transformMeterData returning for ${meterId}:`, {
    name: transformedData.name,
    instantaneousConsumption: (transformedData.kpiValues as any).instantaneousConsumption,
    consumedThisHour: (transformedData.kpiValues as any).consumedThisHour,
    consumedToday: (transformedData.kpiValues as any).consumedToday,
    consumedYesterday: (transformedData.kpiValues as any).consumedYesterday,
    consumedDayBeforeYesterday: (transformedData.kpiValues as any).consumedDayBeforeYesterday,
    consumedThisMonth: (transformedData.kpiValues as any).consumedThisMonth,
    consumedLastMonth: (transformedData.kpiValues as any).consumedLastMonth,
    allKpiValues: transformedData.kpiValues
  })

  return transformedData
}

/**
 * Safe check if currentMeterData is loaded and valid
 */
const isMeterDataReady = computed(() => {
  return currentMeterData.value &&
         currentMeterData.value.kpiValues !== undefined &&
         currentMeterData.value.monthlyData !== undefined
})

// KPI keys in order - Energy consumption metrics (kWh)
const kpiKeys = [
  'instantaneousConsumption', // Current instantaneous power consumption (kW)
  'consumedThisHour',        // Energy consumed this hour (deltaHourEnergyConsumtion)
  'consumedToday',           // Energy consumed today (deltaDayEnergyConsumtion)
  'consumedYesterday',       // Energy consumed yesterday (historical calculation)
  'consumedThisMonth',       // Energy consumed this month (AccumulatedActiveEnergyDelivered calculation)
  'consumedLastMonth',       // Energy consumed last month (historical calculation)
]

/**
 * Get color for category badge
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'TGBT': '#ef4444',           // Red
    'Compresseurs': '#22c55e',    // Green
    'Clim': '#3b82f6',            // Blue
    'Éclairage': '#f59e0b',       // Amber
    'Eclairage': '#f59e0b'        // Amber (alternative spelling)
  }
  return colors[category] || '#6b7280' // Gray fallback
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'TGBT': 'bolt',              // Electrical/main power
    'Compresseurs': 'air',        // Air compressor
    'Clim': 'ac_unit',            // Air conditioning
    'Éclairage': 'light_mode',    // Lighting
    'Eclairage': 'light_mode',    // Lighting (alternative spelling)
  }
  return icons[category] || 'electric_meter'
}

/**
 * Get translation key for category
 */
function getCategoryTranslationKey(category: string): string {
  const keys: Record<string, string> = {
    'TGBT': 'categories.tgbt',
    'Compresseurs': 'categories.compressors',
    'Clim': 'categories.cooling',
    'Éclairage': 'categories.lighting',
    'Eclairage': 'categories.lighting'
  }
  return keys[category] || category
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#'
  const col = usePound ? color.slice(1) : color
  const num = parseInt(col, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return (usePound ? '#' : '') + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

/**
 * Watch for meter changes and auto-select element
 * TGBT-Specific Behavior:
 * - If meter has only 1 element → auto-display (no selection needed)
 * - If meter has multiple elements → auto-select first element
 * - If meter has no elements → clear element selection
 */
watch(
  () => currentMeterData.value,
  (newMeterData) => {
    if (!newMeterData) {
      selectedElement.value = null
      return
    }

    // If meter has elements
    if (newMeterData.elements && newMeterData.elements.length > 0) {
      // Auto-select first element if none selected or current selection is invalid
      if (!selectedElement.value || !newMeterData.elements.includes(selectedElement.value)) {
        selectedElement.value = newMeterData.elements[0]
      }
    } else {
      // No elements - clear selection
      selectedElement.value = null
    }
  },
  { immediate: true }
)

const showChartModal = (chartType: 'monthly' | 'daily' | 'hourly') => {
  if (!currentMeterData.value) return

  let title = ''
  let subtitle = ''
  let data: number[] = []
  let labels: string[] = []

  switch (chartType) {
    case 'monthly':
      title = t('puissance.charts.monthlyPower')
      subtitle = t('puissance.charts.monthlyAverage')
      data = currentMeterData.value.monthlyData.values
      labels = currentMeterData.value.monthlyData.labels
      break
    case 'daily':
      title = t('puissance.charts.dailyPower')
      subtitle = t('puissance.charts.dailyAverage')
      data = currentMeterData.value.dailyData.values
      labels = currentMeterData.value.dailyData.labels
      break
    case 'hourly':
      title = t('puissance.charts.hourlyPower')
      subtitle = t('puissance.charts.hourlyAverage')
      data = currentMeterData.value.hourlyData.values
      labels = currentMeterData.value.hourlyData.labels
      break
  }

  chartModalData.value = {
    title,
    subtitle,
    data,
    labels,
    hourlyData: currentMeterData.value.hourlyData,
    dailyData: currentMeterData.value.dailyData,
    weeklyData: currentMeterData.value.dailyData,
    monthlyData: currentMeterData.value.monthlyData,
    yearlyData: currentMeterData.value.monthlyData,
  }
  chartModalOpen.value = true
}

const showTableModal = (tableType: 'hourly' | 'daily' | 'monthly') => {
  if (!currentMeterData.value) return

  let title = ''
  let format: 'time' | 'date' | 'datetime' | 'number' | 'default' = 'time'

  switch (tableType) {
    case 'hourly':
      title = t('puissance.tables.hourlyPower', { meter: currentMeterData.value.name })
      format = 'time'
      break
    case 'daily':
      title = t('puissance.tables.dailyTotal')
      format = 'date'
      break
    case 'monthly':
      title = t('puissance.tables.dailyAverage')
      format = 'date'
      break
  }

  const columns = [
    { key: 'timestamp', label: t('puissance.tables.columns.timestamp'), format },
    { key: 'power', label: t('puissance.tables.columns.power'), format: 'number' as const },
  ]

  tableModalData.value = { title, columns, initialPeriod: tableType }
  tableModalOpen.value = true
}
</script>

<style scoped>
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

:is(.dark ::-webkit-scrollbar-thumb) {
  background: #475569;
}
</style>
