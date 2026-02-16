<template>
  <AdminLayout>
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title & Description -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-slate-900 dark:text-white text-3xl font-bold tracking-tight mb-2">
            {{ $t('current.pageTitle') }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {{ $t('current.multiMeterOverview') }}
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
          <!-- Header: Title -->
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {{ $t('compteur.selector.title') }}
            </h3>
          </div>

          <!-- All Meters Pills - Grid Layout (Same as PuissanceView) -->
          <div v-if="validSelectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            <button
              v-for="(meterId, index) in validSelectedMeterIds"
              :key="meterId"
              @click="selectMeter(index)"
              :class="[
                'px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-1 relative overflow-hidden group',
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

    <!-- Loading Banner -->
    <div v-if="isLoading && validSelectedMeterIds.length > 0" class="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-cyan-900 rounded-xl p-4 shadow-md animate-fadeIn">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
          <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 dark:border-cyan-700 border-t-blue-600 dark:border-t-cyan-400"></div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-lg">cloud_download</span>
            <h3 class="text-sm font-semibold text-blue-900 dark:text-cyan-100">{{ $t('current.loading') }}</h3>
          </div>
          <p class="text-xs text-blue-700 dark:text-cyan-300">{{ $t('current.loadingDescription') }}</p>
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

    <!-- Tabs/Display Mode Switcher & Period Selector -->
    <div
      v-if="currentMeterId && !isLoading"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 px-1"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{{ $t('current.displayMode') }}</span>
      </h2>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
          @click="viewMode = 'overview'"
          :class="[
            'px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 border text-xs sm:text-sm font-medium whitespace-nowrap',
            viewMode === 'overview'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 border-transparent'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600'
          ]"
        >
          <span class="material-symbols-outlined text-sm">dashboard</span>
          <span>{{ $t('current.tabs.overview') }}</span>
        </button>
        <button
          @click="viewMode = 'charts'"
          :class="[
            'px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 border text-xs sm:text-sm font-medium whitespace-nowrap',
            viewMode === 'charts'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/50 border-transparent'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600'
          ]"
        >
          <span class="material-symbols-outlined text-sm">bar_chart</span>
          <span>{{ $t('current.tabs.charts') }}</span>
        </button>
        <button
          @click="viewMode = 'tables'"
          :class="[
            'px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 border text-xs sm:text-sm font-medium whitespace-nowrap',
            viewMode === 'tables'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 border-transparent'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600'
          ]"
        >
          <span class="material-symbols-outlined text-sm">table_chart</span>
          <span>{{ $t('current.tabs.tables') }}</span>
        </button>
      </div>
    </div>


    <!-- Overview Tab: All Selected Meters KPI Cards & Comparative Chart -->
    <div v-if="!isLoading && viewMode === 'overview' && validSelectedMeterIds.length > 0" class="space-y-6 animate-fadeIn">
      <!-- Layout: KPI Cards on left (1 col), Chart on right (2 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: KPI Cards -->
        <div v-if="validSelectedMeterIds.length > 0" class="lg:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterId ? metersStore.getMeterColor(currentMeterId as string) : '#ccc' }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('current.metrics') }}</h2>
          </div>

          <!-- KPI Cards Loading State -->
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
              <div class="flex items-center justify-between mb-3">
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div class="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
            </div>
          </div>

          <!-- KPI Cards Grid -->
          <div v-else-if="currentMeterId && (currentKPIs || currentOverviewData || metersCurrentData.length > 0)" class="space-y-3">
            <!-- Instantaneous Current -->
            <CurrentKPICard
              :title="$t('current.instantaneous')"
              :value="isApiMode && currentKPIs ? currentKPIs.instantaneousCurrent : metersCurrentData[currentMeterIndex]?.current ?? null"
              :unit="$t('common.unit.ampere')"
              :meter-name="getMeterName(currentMeterId)"
              :meter-color="metersStore.getMeterColor(currentMeterId)"
            />

            <!-- Last Hour Average -->
            <CurrentKPICard
              :title="$t('current.lastHourAvg')"
              :value="isApiMode && currentKPIs ? currentKPIs.lastHourAverage : getLastHourAvg(currentMeterIndex)"
              :unit="$t('common.unit.ampere')"
              :meter-name="getMeterName(currentMeterId)"
              :meter-color="metersStore.getMeterColor(currentMeterId)"
            />

            <!-- Today Average -->
            <CurrentKPICard
              :title="$t('current.todayAvg')"
              :value="isApiMode && currentKPIs ? currentKPIs.todayAverage : getTodayAvg(currentMeterIndex)"
              :unit="$t('common.unit.ampere')"
              :meter-name="getMeterName(currentMeterId)"
              :meter-color="metersStore.getMeterColor(currentMeterId)"
            />
          </div>
        </div>


        <!-- Right Column: Historical Current Chart (2 cols) -->
        <div v-if="currentMeterId" class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <!-- Header -->
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-500 text-lg sm:text-xl">history</span>
                  <span class="truncate">{{ $t('current.historicalTitle') }}</span>
                </h2>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {{ $t('current.historicalDescription') }} -
                  <span class="font-semibold text-slate-700 dark:text-slate-300">
                    {{ getMeterName(currentMeterId) }}
                  </span>
                  -
                  <span class="font-semibold text-slate-700 dark:text-slate-300">
                    {{ periods.find(p => p.value === selectedPeriod)?.label }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Chart Container -->
            <div class="p-3 sm:p-6">
              <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-4 shadow-sm">
                <div class="h-64 sm:h-80 lg:h-96 relative">
                  <!-- Loading State -->
                  <div v-if="isChartLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                    <div class="animate-spin rounded-full h-10 w-10 border-3 border-indigo-200 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400"></div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
                  </div>

                  <!-- No Data State -->
                  <div v-if="!isChartLoading && !chartHasData" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                    <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">data_thresholding</span>
                    <div class="text-center">
                      <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
                    </div>
                  </div>

                  <canvas ref="overviewChartCanvas" id="overviewChart"></canvas>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Tab: Multiple Timeframe Charts -->
    <div v-if="currentMeterId && viewMode === 'charts' && !isLoading" class="space-y-8 animate-fadeIn">
      <!-- Header with View Details Button -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ $t('current.tabs.charts') }}</h2>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Visualisation des données de courant sur différentes périodes</p>
        </div>
        <button
          @click="showChartModal('day')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition border bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-lg">zoom_in</span>
          {{ $t('common.viewDetails') }}
        </button>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 24-Hour Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-500 text-lg sm:text-xl">trending_up</span>
                <span class="truncate">{{ $t('current.chart24h') }}</span>
              </h3>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('current.chart24hDescription') }}</p>
            </div>
          </div>
          <div class="p-3 sm:p-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-4 shadow-sm">
              <div class="h-64 sm:h-72 lg:h-80 relative">
                <!-- Loading State -->
                <div v-if="isChartLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-3 border-indigo-200 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400"></div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
                </div>

                <!-- No Data State -->
                <div v-if="!isChartLoading && !chartHasData" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">data_thresholding</span>
                  <div class="text-center">
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
                  </div>
                </div>

                <canvas ref="chart24hCanvas" id="chart24h"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily Average Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-500 text-lg sm:text-xl">calendar_month</span>
                <span class="truncate">{{ $t('current.chartDaily') }}</span>
              </h3>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('current.chartDailyDescription') }}</p>
            </div>
          </div>
          <div class="p-3 sm:p-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-4 shadow-sm">
              <div class="h-64 sm:h-72 lg:h-80 relative">
                <!-- Loading State -->
                <div v-if="isChartLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-3 border-indigo-200 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400"></div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
                </div>

                <!-- No Data State -->
                <div v-if="!isChartLoading && !chartHasData" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">data_thresholding</span>
                  <div class="text-center">
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
                  </div>
                </div>

                <canvas ref="chartDailyCanvas" id="chartDaily"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-500 text-lg sm:text-xl">date_range</span>
                <span class="truncate">{{ $t('current.chartWeekly') }}</span>
              </h3>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('current.chartWeeklyDescription') }}</p>
            </div>
          </div>
          <div class="p-3 sm:p-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-4 shadow-sm">
              <div class="h-64 sm:h-72 lg:h-80 relative">
                <!-- Loading State -->
                <div v-if="isChartLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-3 border-indigo-200 dark:border-indigo-700 border-t-indigo-600 dark:border-t-indigo-400"></div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
                </div>

                <!-- No Data State -->
                <div v-if="!isChartLoading && !chartHasData" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">data_thresholding</span>
                  <div class="text-center">
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
                  </div>
                </div>

                <canvas ref="chartWeeklyCanvas" id="chartWeekly"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-orange-500 text-lg sm:text-xl">calendar_month</span>
                <span class="truncate">{{ $t('current.chartMonthly') || 'Données Mensuelles' }}</span>
              </h3>
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('current.chartMonthlyDescription') || 'Tendance mensuelle de la consommation de courant' }}</p>
            </div>
          </div>
          <div class="p-3 sm:p-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2 sm:p-4 shadow-sm">
              <div class="h-64 sm:h-72 lg:h-80 relative">
                <!-- Loading State -->
                <div v-if="isChartLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-3 border-orange-200 dark:border-orange-700 border-t-orange-600 dark:border-t-orange-400"></div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('common.loading') }}</p>
                </div>

                <!-- No Data State -->
                <div v-if="!isChartLoading && !chartHasData" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-lg z-10">
                  <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">data_thresholding</span>
                  <div class="text-center">
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
                  </div>
                </div>

                <canvas ref="chartMonthlyCanvas" id="chartMonthly"></canvas>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Tables Tab: Detailed Data -->
    <div v-if="currentMeterId && viewMode === 'tables' && !isLoading" class="animate-fadeIn">
      <!-- No Data State for entire tab -->
      <div v-if="getTableData.length === 0" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">data_thresholding</span>
        <p class="text-center">
          <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
        </p>
      </div>

      <!-- Grid Layout: 2 tables per row -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Day Period Table -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-indigo-500 text-lg sm:text-xl">schedule</span>
              <span class="truncate">Données Horaires (Aujourd'hui)</span>
            </h3>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mesures de courant par heure</p>
          </div>
        </div>
        <div class="p-3 sm:p-6">
          <div v-if="paginatedDayTableData.length === 0" class="flex flex-col items-center justify-center py-12">
            <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">data_thresholding</span>
            <p class="text-center">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
            </p>
          </div>
          <div v-else class="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th class="text-left py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Heure</th>
                  <th class="text-right py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Courant (A)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedDayTableData" :key="index" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="py-2 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ item.timestamp }}</td>
                  <td class="text-right py-2 sm:py-4 px-2 sm:px-4 font-bold text-blue-600 dark:text-blue-400">
                    <span v-if="item.current !== null && item.current !== undefined" class="inline-block bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-lg">{{ item.current.toFixed(2) }}</span>
                    <span v-else class="inline-block text-gray-400 dark:text-gray-500 px-3 py-1">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="dayTotalPages > 1" class="mt-4 flex items-center justify-center gap-1 sm:gap-2">
            <button
              @click="changeDayPage(dayCurrentPage - 1)"
              :disabled="dayCurrentPage === 1"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                dayCurrentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">{{ dayCurrentPage }} / {{ dayTotalPages }}</span>
            <button
              @click="changeDayPage(dayCurrentPage + 1)"
              :disabled="dayCurrentPage === dayTotalPages"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                dayCurrentPage === dayTotalPages
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Week Period Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-purple-500 text-lg sm:text-xl">date_range</span>
              <span class="truncate">Données Hebdomadaires (7 Derniers Jours)</span>
            </h3>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mesures de courant par jour</p>
          </div>
        </div>
        <div class="p-3 sm:p-6">
          <div v-if="paginatedWeekTableData.length === 0" class="flex flex-col items-center justify-center py-12">
            <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">data_thresholding</span>
            <p class="text-center">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ $t('common.noData') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Aucune donnée disponible pour cette période</p>
            </p>
          </div>
          <div v-else class="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th class="text-left py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Date</th>
                  <th class="text-right py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Courant (A)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedWeekTableData" :key="index" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="py-2 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ item.timestamp }}</td>
                  <td class="text-right py-2 sm:py-4 px-2 sm:px-4 font-bold text-purple-600 dark:text-purple-400">
                    <span v-if="item.current !== null && item.current !== undefined" class="inline-block bg-purple-50 dark:bg-purple-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">{{ item.current.toFixed(2) }}</span>
                    <span v-else class="inline-block text-gray-400 dark:text-gray-500 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="weekTotalPages > 1" class="mt-4 flex items-center justify-center gap-1 sm:gap-2">
            <button
              @click="changeWeekPage(weekCurrentPage - 1)"
              :disabled="weekCurrentPage === 1"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                weekCurrentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">{{ weekCurrentPage }} / {{ weekTotalPages }}</span>
            <button
              @click="changeWeekPage(weekCurrentPage + 1)"
              :disabled="weekCurrentPage === weekTotalPages"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                weekCurrentPage === weekTotalPages
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Month Period Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-green-500 text-lg sm:text-xl">calendar_month</span>
              <span class="truncate">Données Mensuelles (30 Derniers Jours)</span>
            </h3>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mesures de courant par jour</p>
          </div>
        </div>
        <div class="p-3 sm:p-6">
          <div class="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th class="text-left py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Date</th>
                  <th class="text-right py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Courant (A)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedMonthTableData" :key="index" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="py-2 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ item.timestamp }}</td>
                  <td class="text-right py-2 sm:py-4 px-2 sm:px-4 font-bold text-green-600 dark:text-green-400">
                    <span v-if="item.current !== null && item.current !== undefined" class="inline-block bg-green-50 dark:bg-green-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">{{ item.current.toFixed(2) }}</span>
                    <span v-else class="inline-block text-gray-400 dark:text-gray-500 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="monthTotalPages > 1" class="mt-4 flex items-center justify-center gap-1 sm:gap-2">
            <button
              @click="changeMonthPage(monthCurrentPage - 1)"
              :disabled="monthCurrentPage === 1"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                monthCurrentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">{{ monthCurrentPage }} / {{ monthTotalPages }}</span>
            <button
              @click="changeMonthPage(monthCurrentPage + 1)"
              :disabled="monthCurrentPage === monthTotalPages"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                monthCurrentPage === monthTotalPages
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Year Period Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-orange-500 text-lg sm:text-xl">calendar_today</span>
              <span class="truncate">Données Annuelles (12 Derniers Mois)</span>
            </h3>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mesures de courant par mois</p>
          </div>
        </div>
        <div class="p-3 sm:p-6">
          <div class="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th class="text-left py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Mois</th>
                  <th class="text-right py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white uppercase text-[10px] sm:text-xs tracking-wide">Courant (A)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedYearTableData" :key="index" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="py-2 sm:py-4 px-2 sm:px-4 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ item.timestamp }}</td>
                  <td class="text-right py-2 sm:py-4 px-2 sm:px-4 font-bold text-orange-600 dark:text-orange-400">
                    <span v-if="item.current !== null && item.current !== undefined" class="inline-block bg-orange-50 dark:bg-orange-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">{{ item.current.toFixed(2) }}</span>
                    <span v-else class="inline-block text-gray-400 dark:text-gray-500 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="yearTotalPages > 1" class="mt-4 flex items-center justify-center gap-1 sm:gap-2">
            <button
              @click="changeYearPage(yearCurrentPage - 1)"
              :disabled="yearCurrentPage === 1"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                yearCurrentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1">{{ yearCurrentPage }} / {{ yearTotalPages }}</span>
            <button
              @click="changeYearPage(yearCurrentPage + 1)"
              :disabled="yearCurrentPage === yearTotalPages"
              :class="[
                'px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border',
                yearCurrentPage === yearTotalPages
                  ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
              ]"
            >
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!currentMeterId && !isLoading" class="text-center py-16 px-4">
      <span class="material-symbols-outlined text-6xl mb-4 block opacity-30 text-gray-400">sensors</span>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('current.noData.title') }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('current.noData.description') }}</p>
      <button
        @click="showCompteurSelector = true"
        class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 font-medium hover:shadow-lg transition-shadow"
      >
        <span class="material-symbols-outlined">add</span>
        {{ $t('dashboard.manageMeters') }}
      </button>
    </div>

    <!-- Current Detail Modal -->
    <CurrentDetailModal
      v-if="currentMeterId"
      :is-open="chartModalOpen"
      :chart-title="chartModalData.title"
      :chart-subtitle="chartModalData.subtitle"
      :meter-name="getMeterName(currentMeterId)"
      :meter-color="metersStore.getMeterColor(currentMeterId)"
      :data="chartModalData.data"
      :labels="chartModalData.labels"
      :hourly-data="chartModalData.hourlyData"
      :daily-data="chartModalData.dailyData"
      :weekly-data="chartModalData.weeklyData"
      :monthly-data="chartModalData.monthlyData"
      :yearly-data="chartModalData.yearlyData"
      @close="chartModalOpen = false"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMetersStore } from '@/stores/useMetersStore'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import CurrentKPICard from '@/components/current/CurrentKPICard.vue'
import CurrentDetailModal from '@/components/current/CurrentDetailModal.vue'
import { useCurrent, type CurrentData, type CurrentChartData, type CurrentKPIData, type CurrentOverviewData, type CurrentChartDataResponse } from '@/composables/current/useCurrent'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { useApiData } from '@/config/dataMode'
import Chart from 'chart.js/auto'

const { t } = useI18n()
const metersStore = useMetersStore()
const isApiMode = useApiData()

// Use the same composable as other views for consistency
const {
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Chart instances
let overviewChart: Chart | null = null
let chart24h: Chart | null = null
let chartDaily: Chart | null = null
let chartWeekly: Chart | null = null
let chartMonthly: Chart | null = null
let chartYearly: Chart | null = null

// Refs
const showCompteurSelector = ref(false)
const viewMode = ref<'overview' | 'charts' | 'tables'>('overview')
const selectedPeriod = ref<'day' | 'week' | 'month' | 'year'>('day')
const tablePeriod = ref<'day' | 'week' | 'month' | 'year'>('day')
const currentMeterIndex = ref(0)
const isLoading = ref(false)
const isChartLoading = ref(false)
const chartHasData = ref(true)

// Auto-refresh interval for telemetry data (20-second silent refresh)
let telemetryRefreshInterval: ReturnType<typeof setInterval> | null = null

// Pagination state for each table
const dayCurrentPage = ref(1)
const weekCurrentPage = ref(1)
const monthCurrentPage = ref(1)
const yearCurrentPage = ref(1)
const itemsPerPage = 7

// Modal state
const chartModalOpen = ref(false)
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

const { getCurrentData, getChartData, fetchCurrentKPIs, fetchCurrentOverview, fetchCurrentChartData } = useCurrent()

// Store API data per device UUID
const currentKPIDataMap = ref<Map<string, CurrentKPIData>>(new Map())
const currentOverviewDataMap = ref<Map<string, CurrentOverviewData>>(new Map())
const currentChartDataMap = ref<Map<string, CurrentChartDataResponse>>(new Map())

const periods = computed(() => [
  { value: 'day' as const, label: t('current.periods.day') },
  { value: 'week' as const, label: t('current.periods.week') },
  { value: 'month' as const, label: t('current.periods.month') },
  { value: 'year' as const, label: t('current.periods.year') },
])

const selectedMeterIdsArray = computed(() => Array.from(metersStore.selectedMeterIds))

// Import for sorting by meter name
import { getMeterOrderRank } from '@/utils/meterColors'

// Filter valid meters and sort by TGBT -> Climatisation -> Compressor
const validSelectedMeterIds = computed(() => {
  const valid = selectedMeterIdsArray.value.filter(id => metersStore.getMeterById(id))

  // Sort by TGBT -> Climatisation -> Compressor
  const sorted = [...valid].map(id => {
    const meter = metersStore.getMeterById(id)
    return { id, name: meter?.name }
  })

  sorted.sort((a, b) => {
    const rankDiff = getMeterOrderRank(a.name) - getMeterOrderRank(b.name)
    if (rankDiff !== 0) return rankDiff
    return valid.indexOf(a.id) - valid.indexOf(b.id)
  })

  return sorted.map(item => item.id)
})

const currentMeterId = computed(() => validSelectedMeterIds.value[currentMeterIndex.value] || null)
const currentDeviceUUID = computed(() => {
  if (!currentMeterId.value) return null
  const meter = metersStore.getMeterById(currentMeterId.value)
  return meter?.deviceUUID || currentMeterId.value
})

// Current meter's overview data from API (when in API mode)
const currentOverviewData = computed(() => {
  if (!isApiMode || !currentDeviceUUID.value) return null
  // Explicitly access the ref value to ensure reactivity
  const map = currentOverviewDataMap.value
  return map.get(currentDeviceUUID.value) || null
})

// Current meter's chart data from API (when in API mode)
const currentChartData = computed(() => {
  if (!isApiMode || !currentDeviceUUID.value) return null
  // Explicitly access the ref value to ensure reactivity
  const map = currentChartDataMap.value
  return map.get(currentDeviceUUID.value) || null
})

// Legacy compatibility - combine overview and chart data
const currentKPIData = computed(() => {
  if (!isApiMode || !currentDeviceUUID.value) return null

  const overview = currentOverviewData.value
  const chartData = currentChartData.value

  if (!overview || !chartData) return null

  // Combine data for legacy compatibility
  return {
    instantaneousCurrent: overview.instantaneousCurrent,
    lastHourMin: null, // Not in overview
    lastHourAverage: overview.lastHourAverage,
    lastHourMax: null, // Not in overview
    todayAverage: overview.todayAverage,
    hourlyData: overview.hourlyData,
    widgetData: [], // Not needed
    dailyWeekData: chartData.weeklyData,
    dailyMonthData: chartData.dailyMonth,
    dailyYearData: chartData.monthlyYear,
  }
})

// Computed property to get KPI values - from API only when in API mode
const currentKPIs = computed(() => {
  if (!isApiMode) return null

  if (currentOverviewData.value) {
    return {
      instantaneousCurrent: currentOverviewData.value.instantaneousCurrent ?? 0,
      lastHourMin: 0, // Not available in overview
      lastHourAverage: currentOverviewData.value.lastHourAverage ?? 0,
      lastHourMax: 0, // Not available in overview
      todayAverage: currentOverviewData.value.todayAverage ?? 0,
    }
  }
  return null
})

const currentData = ref<CurrentData | null>(null)
const metersCurrentData = ref<CurrentData[]>([])
const historicalData = ref<any[]>([])

// Computed property for allCompteurs (for template compatibility)
const allCompteurs = computed(() =>
  metersStore.allMeters.map(meter => ({
    id: meter.id,
    name: meter.name,
    category: meter.type || 'PM2200',
    subtitle: meter.subtitle || '',
    color: meter.color || 'blue',
    instantaneous: 0,
    today: 0,
    yesterday: 0,
    linkedEquipment: meter.linkedEquipment || [],
    translationKey: meter.translationKey
  } as any))
)

const getMeterName = (meterId: string) => {
  const meter = metersStore.getMeterById(meterId)
  return meter?.name || meterId
}

const getMeterBackgroundColor = (meterId: string) => {
  const color = metersStore.getMeterColor(meterId)
  return color + '15'
}

// Helper functions to get statistics - only from API when in API mode
const getLastHourMin = (meterIndex: number): number | null => {
  if (!isApiMode) return null
  return currentKPIData.value?.lastHourMin ?? null
}

const getLastHourMax = (meterIndex: number): number | null => {
  if (!isApiMode) return null
  return currentKPIData.value?.lastHourMax ?? null
}

const getLastHourAvg = (meterIndex: number): number | null => {
  if (!isApiMode) return null
  return currentKPIData.value?.lastHourAverage ?? null
}

const getTodayAvg = (meterIndex: number): number | null => {
  if (!isApiMode) return null
  return currentKPIData.value?.todayAverage ?? null
}

const getYesterdayAvg = (meterIndex: number): number | null => {
  if (!historicalData.value || historicalData.value.length === 0) return null
  // Simulate yesterday's average (slightly lower than today for demo)
  const todayAvg = getTodayAvg(meterIndex)
  if (!todayAvg) return null
  return todayAvg * 0.92 // Yesterday was 92% of today's average
}

// Get table data for the current period
const getTableData = computed(() => {
  if (!isApiMode) return []
  if (!currentKPIData.value) return []
  // Map API data to table format based on table period
  let dataPoints: Array<{ ts: number; value: number }> = []

  switch (tablePeriod.value) {
    case 'day':
      dataPoints = currentKPIData.value.hourlyData.filter((d: any) => d.value !== null && d.value !== undefined).map((d: any) => ({ ts: d.ts, value: d.value }))
      break
    case 'week':
      dataPoints = currentKPIData.value.dailyWeekData.filter((d: any) => d.value !== null && d.value !== undefined).map((d: any) => ({ ts: d.ts, value: d.value }))
      break
    case 'month':
      dataPoints = currentKPIData.value.dailyMonthData.filter((d: any) => d.value !== null && d.value !== undefined).map((d: any) => ({ ts: d.ts, value: d.value }))
      break
    case 'year':
      dataPoints = (currentKPIData.value.dailyYearData || []).filter((d: any) => d.value !== null && d.value !== undefined).map((d: any) => ({ ts: d.ts, value: d.value }))
      break
    default:
      dataPoints = currentKPIData.value.hourlyData.filter((d: any) => d.value !== null && d.value !== undefined).map((d: any) => ({ ts: d.ts, value: d.value }))
  }

  return dataPoints.map(p => ({
    timestamp: new Date(p.ts).toLocaleString(),
    current: p.value
  }))
})

// Get day table data (hourly)
const getDayTableData = computed(() => {
  if (!isApiMode) return []
  if (!currentKPIData.value) return []

  const dataPoints = currentKPIData.value.hourlyData
  return dataPoints.map(p => ({
    timestamp: new Date(p.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
    current: p.value
  }))
})

// Get week table data (daily)
const getWeekTableData = computed(() => {
  if (!isApiMode) return []
  if (!currentKPIData.value) return []

  const dataPoints = currentKPIData.value.dailyWeekData
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return dataPoints.map(p => {
    const date = new Date(p.ts)
    const dayName = dayNames[date.getDay()]
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    return {
      timestamp: `${dayName} ${dateStr}`,
      current: p.value
    }
  })
})

// Get month table data (daily)
const getMonthTableData = computed(() => {
  if (!isApiMode) return []
  if (!currentKPIData.value) return []

  const dataPoints = currentKPIData.value.dailyMonthData
  return dataPoints.map(p => ({
    timestamp: new Date(p.ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    current: p.value
  }))
})

// Get year table data (monthly)
const getYearTableData = computed(() => {
  if (!isApiMode) return []
  if (!currentKPIData.value) return []

  const dataPoints = currentKPIData.value.dailyYearData || []
  return dataPoints.map(p => ({
    timestamp: new Date(p.ts).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    current: p.value
  }))
})

// Paginated table data for each period
const paginatedDayTableData = computed(() => {
  const data = getDayTableData.value
  const start = (dayCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
})

const paginatedWeekTableData = computed(() => {
  const data = getWeekTableData.value
  const start = (weekCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
})

const paginatedMonthTableData = computed(() => {
  const data = getMonthTableData.value
  const start = (monthCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
})

const paginatedYearTableData = computed(() => {
  const data = getYearTableData.value
  const start = (yearCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return data.slice(start, end)
})

// Total pages for each period
const dayTotalPages = computed(() => Math.ceil(getDayTableData.value.length / itemsPerPage))
const weekTotalPages = computed(() => Math.ceil(getWeekTableData.value.length / itemsPerPage))
const monthTotalPages = computed(() => Math.ceil(getMonthTableData.value.length / itemsPerPage))
const yearTotalPages = computed(() => Math.ceil(getYearTableData.value.length / itemsPerPage))

// Change page functions for each period
const changeDayPage = (page: number) => {
  if (page >= 1 && page <= dayTotalPages.value) {
    dayCurrentPage.value = page
  }
}

const changeWeekPage = (page: number) => {
  if (page >= 1 && page <= weekTotalPages.value) {
    weekCurrentPage.value = page
  }
}

const changeMonthPage = (page: number) => {
  if (page >= 1 && page <= monthTotalPages.value) {
    monthCurrentPage.value = page
  }
}

const changeYearPage = (page: number) => {
  if (page >= 1 && page <= yearTotalPages.value) {
    yearCurrentPage.value = page
  }
}

// Get statistics for the selected period
const getTableStats = computed(() => {
  const data = getTableData.value
  if (!data || data.length === 0) {
    return { min: 0, max: 0, avg: 0 }
  }

  const values = data.map(d => d.current).filter(v => v !== null && v !== undefined) as number[]
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0 }
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  return { min, max, avg }
})

const selectMeter = (index: number) => {
  currentMeterIndex.value = index
}

const handleCompteurSelection = (selectedIds: string[]) => {
  metersStore.setSelectedMeters(selectedIds)
  currentMeterIndex.value = 0
}

// Load current data for only the current selected meter
const loadCurrentMeterData = async () => {
  if (!currentMeterId.value || !currentDeviceUUID.value) {
    console.log('[CurrentView] No meter or device UUID available')
    isLoading.value = false
    return
  }

  // Check if we already have cached data for this device
  if (currentOverviewDataMap.value.has(currentDeviceUUID.value) && currentChartDataMap.value.has(currentDeviceUUID.value)) {
    console.log('[CurrentView] Using cached data for device UUID:', currentDeviceUUID.value)
    isLoading.value = false
    await nextTick()
    initCharts()
    return
  }

  isLoading.value = true
  try {
    if (isApiMode) {
      console.log('[CurrentView] Fetching optimized current data (overview + chart) for:', {
        meterId: currentMeterId.value,
        deviceUUID: currentDeviceUUID.value
      })

      // Start both requests in parallel but handle them independently
      const overviewPromise = fetchCurrentOverview(currentDeviceUUID.value, { useCache: true })
      const chartDataPromise = fetchCurrentChartData(currentDeviceUUID.value, { useCache: true })

      // Wait for overview data first - show KPIs immediately
      const overview = await overviewPromise

      if (overview) {
        currentOverviewDataMap.value.set(currentDeviceUUID.value, overview)
        console.log('[CurrentView] ✓ Overview data loaded - displaying KPIs and hourly chart')
        // Remove loader and show KPI cards immediately
        isLoading.value = false
        // Initialize overview chart immediately with hourly data from overview
        await nextTick()
        initOverviewChart()
      } else {
        console.warn('[CurrentView] ⚠ Failed to fetch overview data')
        isLoading.value = false
      }

      // Chart data continues loading in background
      const chartData = await chartDataPromise

      if (chartData) {
        currentChartDataMap.value.set(currentDeviceUUID.value, chartData)
        console.log('[CurrentView] ✓ Chart data loaded')
        // Initialize detailed charts now that chart data is available
        await nextTick()
        initDetailedCharts()
      } else {
        console.warn('[CurrentView] ⚠ Failed to fetch chart data')
      }
    }
  } catch (err) {
    console.error('[CurrentView] ✗ Error loading current meter data:', err)
    isLoading.value = false
  }
}

const reloadCharts = async () => {
  // Reload data and reinitialize charts for new period
  await loadCurrentMeterData()
}

const loadCurrentMeterDataSilently = async () => {
  // Silent refresh without showing loading indicators
  // Makes direct API calls without triggering the composable's isLoading flag
  if (!currentMeterId.value || !currentDeviceUUID.value) {
    return
  }

  try {
    if (isApiMode) {
      console.log('[CurrentView] Silent refresh: Fetching fresh current data for:', currentDeviceUUID.value)

      const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000'

      // Fetch both endpoints in parallel without going through composable
      const [overviewResponse, chartResponse] = await Promise.all([
        fetch(`${baseUrl}/api/telemetry/${currentDeviceUUID.value}/current/overview`),
        fetch(`${baseUrl}/api/telemetry/${currentDeviceUUID.value}/current/chart`)
      ])

      if (!overviewResponse.ok || !chartResponse.ok) {
        throw new Error(`Failed to fetch data: overview=${overviewResponse.ok}, chart=${chartResponse.ok}`)
      }

      const overviewJson = await overviewResponse.json()
      const chartJson = await chartResponse.json()

      if (overviewJson?.success && overviewJson?.data) {
        currentOverviewDataMap.value.set(currentDeviceUUID.value, overviewJson.data)
        console.log('[CurrentView] ✓ Silent refresh: Overview data updated')
        await nextTick()
        initOverviewChart()
      }

      if (chartJson?.success && chartJson?.data) {
        currentChartDataMap.value.set(currentDeviceUUID.value, chartJson.data)
        console.log('[CurrentView] ✓ Silent refresh: Chart data updated')
        await nextTick()
        initDetailedCharts()
      }

      console.log('[CurrentView] ✓ Silent refresh complete')
    }
  } catch (err) {
    console.error('[CurrentView] ✗ Silent refresh failed:', err instanceof Error ? err.message : String(err))
  }
}

const reloadChartsOnly = async () => {
  // Reload only charts without re-fetching data
  await nextTick()
  initCharts()
}

// Initialize overview chart immediately using overview data
const initOverviewChart = async () => {
  if (validSelectedMeterIds.value.length === 0 || !currentOverviewData.value) return

  // Wait for canvas element to be mounted
  await nextTick()

  try {
    const overviewCanvas = document.getElementById('overviewChart') as HTMLCanvasElement
    if (!overviewCanvas) return

    // Properly destroy existing chart and clean canvas
    if (overviewChart) {
      overviewChart.destroy()
      overviewChart = null
    }

    // Also check if there's any chart instance attached to the canvas
    const existingChart = Chart.getChart(overviewCanvas)
    if (existingChart) {
      existingChart.destroy()
    }

    // Wait for Chart.js to fully clean up
    await nextTick()

    const ctx = overviewCanvas.getContext('2d')

    if (ctx && currentMeterId.value) {
      // Use hourly data from overview endpoint - always shows today's 24 hours
      const hourlyData = currentOverviewData.value.hourlyData || []

      // Parse all data points with hour and value
      const dataByHour = new Map<number, number | null>()

      hourlyData.forEach((dataPoint: any) => {
        const date = new Date(dataPoint.ts)
        const hour = date.getHours()
        dataByHour.set(hour, dataPoint.value)
      })

      // Generate all 24 hours
      const allHours: Array<{ label: string; value: number | null }> = []

      for (let hour = 0; hour < 24; hour++) {
        const hourLabel = `${String(hour).padStart(2, '0')}:00`
        const value = dataByHour.has(hour) ? dataByHour.get(hour)! : null
        allHours.push({ label: hourLabel, value })
      }

      const aggregatedLabels = allHours.map(d => d.label)
      const aggregatedValues = allHours.map(d => d.value)

      // Chart creation with overview data
      overviewChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: aggregatedLabels,
          datasets: [
            {
              label: t('current.current'),
              data: aggregatedValues,
              borderColor: metersStore.getMeterColor(currentMeterId.value),
              backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`,
              borderWidth: 2.5,
              tension: 0.4,
              fill: true,
              spanGaps: false,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBackgroundColor: metersStore.getMeterColor(currentMeterId.value),
              pointBorderColor: '#fff',
              pointBorderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index' as const,
            intersect: false
          },
          plugins: {
            tooltip: {
              enabled: true,
              backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
              titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
              bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
              borderColor: metersStore.getMeterColor(currentMeterId.value),
              borderWidth: 2,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (context) => {
                  const value = context.raw as number | null
                  if (value === null || value === undefined) {
                    return `${t('common.noData')}`
                  }
                  return `${(value as number).toFixed(2)} A`
                }
              }
            },
            legend: {
              display: true,
              labels: {
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                padding: 15,
                font: { size: 12, weight: 500 as any }
              }
            },
            filler: {
              propagate: true
            },
            datalabels: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: `${t('current.current')} (A)`,
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#cbd5e1' : '#64748b',
                font: { size: 12, weight: 500 as any }
              },
              ticks: {
                display: true,
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                font: { size: 11 },
                callback: function(value) {
                  return `${value} A`
                }
              },
              grid: {
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#e5e7eb'
              }
            },
            x: {
              title: {
                display: true,
                text: t('current.time'),
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#cbd5e1' : '#64748b',
                font: { size: 12, weight: 500 as any }
              },
              ticks: {
                display: true,
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                font: { size: 9 },
                maxRotation: 90,
                minRotation: 45,
                autoSkip: true
              },
              grid: {
                color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#e5e7eb'
              }
            }
          }
        }
      })

      console.log('[CurrentView] ✓ Overview chart created with overview data')
      chartHasData.value = true
    }
  } catch (err) {
    console.error('[CurrentView] Error initializing overview chart:', err)
  }
}

// Initialize detailed charts using chart endpoint data
const initDetailedCharts = async () => {
  if (validSelectedMeterIds.value.length === 0 || !currentChartData.value) return

  // Set loading state for detailed charts
  isChartLoading.value = true

  // Wait for canvas elements to be mounted
  await nextTick()

  let hasChartData = false
  try {
    console.log('[CurrentView] Initializing detailed charts with chart data')
    // Implementation for detailed charts goes here
    // This will handle 24h, daily, weekly, yearly charts based on currentChartData

    hasChartData = true
  } catch (err) {
    console.error('[CurrentView] Error initializing detailed charts:', err)
    hasChartData = false
  } finally {
    isChartLoading.value = false
  }
}

const initCharts = async () => {
  if (validSelectedMeterIds.value.length === 0) return

  // Set loading state
  isChartLoading.value = true
  chartHasData.value = true

  // Wait for canvas elements to be mounted
  await nextTick()

  let hasChartData = false
  try {
    // Fetch chart data once from cached KPI data (API returns all periods at once)
    let chartData: CurrentChartData | null = null

    if (isApiMode && currentDeviceUUID.value) {
      // Use cached KPI data instead of calling getChartData
      if (currentKPIData.value) {
        // Build chart data from cached KPI response
        // Use the selected period to determine which data to display
        chartData = {
          labels: [] as string[],
          datasets: [{
            label: t('current.current'),
            data: [] as number[],
            borderColor: '',
            backgroundColor: ''
          }]
        }

        // Map the cached data based on selected period
        if (chartData) {
          switch (selectedPeriod.value) {
            case 'day': {
              const hourlyData = currentKPIData.value.hourlyData
              chartData.labels = hourlyData.map((d: any) => {
                const date = new Date(d.ts)
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              })
              chartData.datasets[0].data = hourlyData.map((d: any) => d.value)
              break
            }
            case 'week': {
              const weekData = currentKPIData.value.dailyWeekData
              chartData.labels = weekData.map((d: any) => {
                const date = new Date(d.ts)
                return date.toLocaleDateString('fr-FR')
              })
              chartData.datasets[0].data = weekData.map((d: any) => d.value)
              break
            }
            case 'month': {
              const monthData = currentKPIData.value.dailyMonthData
              chartData.labels = monthData.map((d: any) => {
                const date = new Date(d.ts)
                return date.toLocaleDateString('fr-FR')
              })
              chartData.datasets[0].data = monthData.map((d: any) => d.value)
              break
            }
            case 'year': {
              const yearData = currentKPIData.value.dailyYearData || []
              chartData.labels = yearData.map((d: any) => {
                const date = new Date(d.ts)
                return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
              })
              chartData.datasets[0].data = yearData.map((d: any) => d.value)
              break
            }
          }
        }
      }
    } else if (!isApiMode && currentMeterId.value) {
      chartData = await getChartData(currentMeterId.value, selectedPeriod.value)
    }

    // Overview Chart - Historical current data for selected meter and period
    const overviewCanvas = document.getElementById('overviewChart') as HTMLCanvasElement
    if (overviewCanvas) {
      // Properly destroy existing chart and clean canvas
      if (overviewChart) {
        overviewChart.destroy()
        overviewChart = null
      }

      // Also check if there's any chart instance attached to the canvas
      const existingChart = Chart.getChart(overviewCanvas)
      if (existingChart) {
        existingChart.destroy()
      }

      // Wait for Chart.js to fully clean up
      await nextTick()

      const ctx = overviewCanvas.getContext('2d')

      if (ctx && currentMeterId.value) {
        // chartData already fetched above

        if (chartData) {
          let chartLabels = chartData.labels
          let chartValues: (number | null)[] = chartData.datasets[0].data

          // Use raw labels and values from API without aggregation
          let aggregatedLabels = chartLabels
          let aggregatedValues = chartValues

          // Special handling for day period to show all 24 hours
          if (selectedPeriod.value === 'day') {
            // Parse all data points with hour and value
            const dataByHour = new Map<number, number | null>()

            chartLabels.forEach((label, index) => {
              const value = chartValues[index]
              // Extract hour from label - format could be "HH:MM" or "H:MM"
              const hourMatch = label.match(/^(\d{1,2})/)
              if (hourMatch) {
                const hour = parseInt(hourMatch[1])
                dataByHour.set(hour, value)
              }
            })

            // Generate all 24 hours
            const allHours: Array<{ label: string; value: number | null }> = []

            for (let hour = 0; hour < 24; hour++) {
              const hourLabel = `${String(hour).padStart(2, '0')}:00`
              const value = dataByHour.has(hour) ? dataByHour.get(hour)! : null
              allHours.push({ label: hourLabel, value })
            }

            aggregatedLabels = allHours.map(d => d.label)
            aggregatedValues = allHours.map(d => d.value)
          }

          // Special handling for week period to show all 7 days
          if (selectedPeriod.value === 'week') {
            const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

            // Parse all data points with date and value
            const dataByDate = new Map<string, { value: number | null; date: Date }>()
            let minDate: Date | null = null
            let maxDate: Date | null = null

            chartLabels.forEach((label, index) => {
              const value = chartValues[index]
              // Extract date from label - format could be "DD/MM/YYYY" or "dayIndex:DD/MM/YYYY"
              let dateStr = label
              const colonMatch = label.match(/^\d+:(.+)$/)
              if (colonMatch) {
                dateStr = colonMatch[1]
              }

              // Parse DD/MM/YYYY
              const dateMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
              if (dateMatch) {
                const [, day, month, year] = dateMatch
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                dataByDate.set(dateStr, { value, date })

                if (!minDate || date < minDate) minDate = date
                if (!maxDate || date > maxDate) maxDate = date
              }
            })

            // Generate all days in the week range
            const allDays: Array<{ label: string; value: number | null; ts: number }> = []

            if (minDate && maxDate) {
              // Calculate start of week (Monday) and end of week (Sunday)
              const startDate = new Date(minDate)
              const endDate = new Date(maxDate)

              // Adjust to get full week (Monday to Sunday)
              const startDay = startDate.getDay()
              const daysToMonday = startDay === 0 ? 6 : startDay - 1
              startDate.setDate(startDate.getDate() - daysToMonday)

              const endDay = endDate.getDay()
              const daysToSunday = endDay === 0 ? 0 : 7 - endDay
              endDate.setDate(endDate.getDate() + daysToSunday)

              // Generate all days in range
              const currentDate = new Date(startDate)
              while (currentDate <= endDate) {
                const dateStr = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`
                const dayIndex = currentDate.getDay()
                const dayName = dayNames[dayIndex]
                const label = `${dayName} ${dateStr}`
                const value = dataByDate.has(dateStr) ? dataByDate.get(dateStr)!.value : null

                allDays.push({ label, value, ts: currentDate.getTime() })
                currentDate.setDate(currentDate.getDate() + 1)
              }
            }

            aggregatedLabels = allDays.map(d => d.label)
            aggregatedValues = allDays.map(d => d.value)
          }

          // Special handling for month period to show all days in the month
          if (selectedPeriod.value === 'month') {
            // Backend returns DD/MM/YYYY format, use it directly for numeric display
            aggregatedLabels = chartLabels
            aggregatedValues = chartValues
          }

          // Special handling for year period to show all 12 months for each year
          if (selectedPeriod.value === 'year') {
            const monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]

            // Parse all data points and collect years
            const dataByYearMonth = new Map<string, number | null>()
            const yearsSet = new Set<string>()

            chartLabels.forEach((label, index) => {
              const value = chartValues[index]
              // API format: "monthNumber:MonthName/YYYY" where monthNumber is 1-12
              const match = label.match(/^(\d+):([A-Za-z]+)\/(\d{4})/)
              if (match) {
                const month = parseInt(match[1]) // 1-12 from API
                const year = match[3]
                yearsSet.add(year)
                const key = `${year}-${month}`
                dataByYearMonth.set(key, value)
              }
            })

            // Sort years
            const years = Array.from(yearsSet).sort()

            // Build complete data for all months in all years
            const completeData: Array<{ label: string; value: number | null }> = []

            years.forEach(year => {
              for (let month = 1; month <= 12; month++) {
                const key = `${year}-${month}`
                const monthName = monthNames[month - 1]
                const label = `${monthName}/${year}`
                const value = dataByYearMonth.has(key) ? dataByYearMonth.get(key)! : null
                completeData.push({ label, value })
              }
            })

            aggregatedLabels = completeData.map(d => d.label)
            aggregatedValues = completeData.map(d => d.value)
          }

          // Chart creation with current data
          overviewChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: aggregatedLabels,
              datasets: [
                {
                    label: t('current.current'),
                    data: aggregatedValues,
                    borderColor: metersStore.getMeterColor(currentMeterId.value),
                    backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`,
                    borderWidth: 2.5,
                  tension: 0.4,
                  fill: true,
                  spanGaps: false,
                  pointRadius: 0,
                  pointHoverRadius: 6,
                  pointBackgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  pointBorderColor: '#fff',
                  pointBorderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false
              },
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
                  titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
                  bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 2,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number | null
                      if (value === null || value === undefined) {
                        return `${t('common.noData')}`
                      }
                      return `${(value as number).toFixed(2)} A`
                    }
                  }
                },
                legend: {
                  display: true,
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                    padding: 15,
                    font: { size: 12, weight: 500 as any }
                  }
                },
                filler: {
                  propagate: true
                },
                datalabels: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: `${t('current.current')} (A)`,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#cbd5e1' : '#64748b',
                    font: { size: 12, weight: 500 as any }
                  },
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 },
                    callback: function(value) {
                      return `${value} A`
                    }
                  },
                  grid: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#e5e7eb'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: selectedPeriod.value === 'day' ? t('current.time') :
                          selectedPeriod.value === 'week' ? t('current.date') :
                          selectedPeriod.value === 'month' ? t('current.dayMonthYear') :
                          selectedPeriod.value === 'year' ? t('current.month') : '',
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#cbd5e1' : '#64748b',
                    font: { size: 12, weight: 500 as any }
                  },
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 9 },
                    maxRotation: 90,
                    minRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: selectedPeriod.value === 'month' ? 15 : undefined,
                    callback: function(value, index, ticks) {
                      const label = this.getLabelForValue(value as number)
                      // For month period, show every other day to avoid crowding
                      if (selectedPeriod.value === 'month') {
                        return label
                      }
                      return label
                    }
                  },
                  grid: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#e5e7eb'
                  }
                }
              }
            }
          })
        }
      }
    }

    // 24H Chart - Last 24 hours hourly data (use cached data)
    if (!currentMeterId.value) return

    let chart24hData: CurrentChartData | null = null

    if (isApiMode && currentKPIData.value) {
      // Use cached hourly data from KPI response
      const hourlyData = currentKPIData.value.hourlyData || []
      const validHourlyData = hourlyData.filter((d: any) => d.value !== null && d.value !== undefined)
      chart24hData = {
        labels: validHourlyData.map((d: any) => {
          const date = new Date(d.ts)
          return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
        }),
        datasets: [{
          label: t('current.current'),
          data: validHourlyData.map((d: any) => d.value as number),
          borderColor: metersStore.getMeterColor(currentMeterId.value),
          backgroundColor: metersStore.getMeterColor(currentMeterId.value)
        }]
      }
    } else if (!isApiMode && currentMeterId.value) {
      chart24hData = await getChartData(currentMeterId.value, 'day')
    }

    if (chart24hData) {
      const chart24hCanvas = document.getElementById('chart24h') as HTMLCanvasElement
      if (chart24hCanvas) {
        const ctx = chart24hCanvas.getContext('2d')
        if (ctx) {
          if (chart24h) chart24h.destroy()

          // Use hourly data directly - no need to fill all 24 hours as API provides them
          const chartLabels = chart24hData.labels
          const chartValues = (chart24hData.datasets[0].data as number[]) || []

          chart24h = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                {
                  label: t('current.current'),
                  data: chartValues,
                  backgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 0
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
                  titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
                  bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 2,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number | null
                      if (value === null || value === undefined) {
                        return `${t('common.noData')}`
                      }
                      return `${(value as number).toFixed(2)} A`
                    }
                  }
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                },
                datalabels: {
                  display: false
                }
              },
              scales: {
                x: {
                  stacked: false,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                y: {
                  stacked: false,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
        }
      }
    }

    // Daily/Month Chart - Monthly daily data (use cached data)
    let dailyPeriodData: CurrentChartData | null = null
    if (isApiMode && currentKPIData.value) {
      // Use cached daily month data from KPI response
      const dailyData = currentKPIData.value.dailyMonthData
      dailyPeriodData = {
        labels: dailyData.map((d: any) => {
          const date = new Date(d.ts)
          return date.toLocaleDateString('fr-FR')
        }),
        datasets: [{
          label: t('current.current'),
          data: dailyData.map((d: any) => d.value),
          borderColor: metersStore.getMeterColor(currentMeterId.value),
          backgroundColor: metersStore.getMeterColor(currentMeterId.value)
        }]
      }
    } else if (!isApiMode && currentMeterId.value) {
      dailyPeriodData = await getChartData(currentMeterId.value, 'month')
    }

    if (dailyPeriodData) {
      const chartDailyCanvas = document.getElementById('chartDaily') as HTMLCanvasElement
      if (chartDailyCanvas) {
        const ctx = chartDailyCanvas.getContext('2d')
        if (ctx) {
          if (chartDaily) chartDaily.destroy()

          chartDaily = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dailyPeriodData.labels,
              datasets: [
                {
                  label: t('current.average'),
                  data: dailyPeriodData.datasets[0].data,
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  spanGaps: false,
                  pointBackgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 7
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
                  titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
                  bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 2,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number | null
                      if (value === null || value === undefined) {
                        return `${t('common.noData')}`
                      }
                      return `${(value as number).toFixed(2)} A`
                    }
                  }
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                },
                datalabels: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                x: {
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
        }
      }
    }

    // Weekly Chart - Last 7 days daily data (use cached data)
    let weeklyData: CurrentChartData | null = null
    if (isApiMode && currentKPIData.value) {
      // Use cached weekly data from KPI response
      const weekData = currentKPIData.value.dailyWeekData
      weeklyData = {
        labels: weekData.map((d: any) => {
          const date = new Date(d.ts)
          return date.toLocaleDateString('fr-FR')
        }),
        datasets: [{
          label: t('current.current'),
          data: weekData.map((d: any) => d.value),
          borderColor: metersStore.getMeterColor(currentMeterId.value),
          backgroundColor: metersStore.getMeterColor(currentMeterId.value)
        }]
      }
    } else if (!isApiMode && currentMeterId.value) {
      weeklyData = await getChartData(currentMeterId.value, 'week')
    }

    if (weeklyData) {
      const chartWeeklyCanvas = document.getElementById('chartWeekly') as HTMLCanvasElement
      if (chartWeeklyCanvas) {
        const ctx = chartWeeklyCanvas.getContext('2d')
        if (ctx) {
          if (chartWeekly) chartWeekly.destroy()

          chartWeekly = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: weeklyData.labels,
              datasets: [
                {
                  label: t('current.average'),
                  data: weeklyData.datasets[0].data,
                  backgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 0,
                  borderRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
                  titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
                  bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 2,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number | null
                      if (value === null || value === undefined) {
                        return `${t('common.noData')}`
                      }
                      return `${(value as number).toFixed(2)} A`
                    }
                  }
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                },
                datalabels: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                x: {
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
        }
      }
    }

    // Monthly Chart - Monthly data for the last 12 months (use cached data)
    let monthlyData: CurrentChartData | null = null
    if (isApiMode && currentKPIData.value) {
      // Use cached monthly/yearly data from KPI response
      const monthData = currentKPIData.value.dailyYearData || []
      monthlyData = {
        labels: monthData.map((d: any) => d.monthYear || d.month),
        datasets: [{
          label: t('current.average'),
          data: monthData.map((d: any) => d.value),
          borderColor: metersStore.getMeterColor(currentMeterId.value),
          backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`
        }]
      }
    } else if (!isApiMode && currentMeterId.value) {
      monthlyData = await getChartData(currentMeterId.value, 'year')
    }

    if (monthlyData) {
      const chartMonthlyCanvas = document.getElementById('chartMonthly') as HTMLCanvasElement
      if (chartMonthlyCanvas) {
        const ctx = chartMonthlyCanvas.getContext('2d')
        if (ctx) {
          if (chartMonthly) chartMonthly.destroy()

          chartMonthly = new Chart(ctx, {
            type: 'line',
            data: {
              labels: monthlyData.labels,
              datasets: [
                {
                  label: t('current.average'),
                  data: monthlyData.datasets[0].data,
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  spanGaps: false,
                  pointBackgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 7
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
                  titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
                  bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 2,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number | null
                      if (value === null || value === undefined) {
                        return `${t('common.noData')}`
                      }
                      return `${(value as number).toFixed(2)} A`
                    }
                  }
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                },
                datalabels: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                x: {
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
        }
      }
    }

    // Yearly Chart - Monthly data for the year (use cached data)
    let yearlyData: CurrentChartData | null = null
    if (isApiMode && currentKPIData.value) {
      // Use cached yearly data from KPI response
      const yearData = currentKPIData.value.dailyYearData || []
      console.log('[CurrentView] Building yearly chart with data:', yearData)

      if (yearData.length > 0) {
        // Use monthYear field directly from API response
        yearlyData = {
          labels: yearData.map((d: any) => d.monthYear || d.month),
          datasets: [{
            label: t('current.average'),
            data: yearData.map((d: any) => d.value),
            borderColor: metersStore.getMeterColor(currentMeterId.value),
            backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`
          }]
        }
        console.log('[CurrentView] Yearly chart data built:', {
          labels: yearlyData?.labels,
          values: yearlyData?.datasets[0].data
        })
      } else {
        console.log('[CurrentView] No yearly data available')
      }
    } else if (!isApiMode && currentMeterId.value) {
      yearlyData = await getChartData(currentMeterId.value, 'year')
    }

    if (yearlyData) {
      console.log('[CurrentView] Creating yearly chart with:', yearlyData)
      const chartYearlyCanvas = document.getElementById('chartYearly') as HTMLCanvasElement
      if (chartYearlyCanvas) {
        console.log('[CurrentView] Found chartYearly canvas')
        const ctx = chartYearlyCanvas.getContext('2d')
        if (ctx) {
          if (chartYearly) chartYearly.destroy()

          chartYearly = new Chart(ctx, {
            type: 'line',
            data: {
              labels: yearlyData?.labels || [],
              datasets: [
                {
                  label: t('current.average'),
                  data: (yearlyData?.datasets[0].data as number[]) || [],
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  spanGaps: false,
                  pointBackgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 7
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true,
                  backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1f2937' : '#fff',
                  titleColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#f3f4f6' : '#111827',
                  bodyColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 2,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number | null
                      if (value === null || value === undefined) {
                        return `${t('common.noData')}`
                      }
                      return `${(value as number).toFixed(2)} A`
                    }
                  }
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                },
                datalabels: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                x: {
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
          console.log('[CurrentView] ✓ Yearly chart created successfully')
        }
      }
    }

    hasChartData = true
  } catch (err) {
    console.error('[CurrentView] Error initializing charts:', err)
    hasChartData = false
  } finally {
    chartHasData.value = hasChartData
    isChartLoading.value = false
  }
}

watch(currentMeterId, async (newMeterId, oldMeterId) => {
  if (newMeterId && newMeterId !== oldMeterId) {
    console.log('[CurrentView] Meter changed:', {
      oldMeterId,
      newMeterId,
      deviceUUID: currentDeviceUUID.value
    })
    await loadCurrentMeterData()
  }
})

// Watch for store meter changes (handles async loading)
watch(() => metersStore.allMeters.length, async () => {
  if (validSelectedMeterIds.value.length === 0 && metersStore.allMeters.length > 0) {
    const firstMeterId = metersStore.allMeters[0].id
    metersStore.setSelectedMeters([firstMeterId])
    await nextTick()
    await loadCurrentMeterData()
  }
})

// Watch for tab changes to initialize charts when needed
watch(viewMode, async () => {
  if (!currentMeterId.value || !currentDeviceUUID.value) return

  await nextTick()

  if (viewMode.value === 'overview') {
    // Re-initialize overview chart whenever switching to this tab
    const overviewCanvas = document.getElementById('overviewChart') as HTMLCanvasElement
    if (overviewCanvas) {
      initCharts()
    }
  } else if (viewMode.value === 'charts') {
    // Check if chart data already exists for this device
    if (!currentChartDataMap.value.has(currentDeviceUUID.value)) {
      // Data doesn't exist - fetch it
      console.log('[CurrentView] Chart data not cached, fetching for:', currentDeviceUUID.value)
      isChartLoading.value = true
      chartHasData.value = true
      try {
        const chartData = await fetchCurrentChartData(currentDeviceUUID.value, { useCache: true })
        if (chartData) {
          currentChartDataMap.value.set(currentDeviceUUID.value, chartData)
          console.log('[CurrentView] ✓ Chart data loaded from API')
          chartHasData.value = true
        } else {
          console.warn('[CurrentView] ⚠ No chart data returned from API')
          chartHasData.value = false
        }
      } catch (err) {
        console.error('[CurrentView] ✗ Error fetching chart data:', err)
        chartHasData.value = false
      } finally {
        isChartLoading.value = false
      }
    } else {
      console.log('[CurrentView] Using cached chart data for:', currentDeviceUUID.value)
      chartHasData.value = true
    }

    // Re-initialize charts tab charts whenever switching to this tab
    const chart24hCanvas = document.getElementById('chart24h') as HTMLCanvasElement
    const chartDailyCanvas = document.getElementById('chartDaily') as HTMLCanvasElement
    if (chart24hCanvas || chartDailyCanvas) {
      initCharts()
    }

    // After initializing, wait for DOM to fully update then resize all charts
    setTimeout(() => {
      console.log('[CurrentView] Resizing all charts for visibility')
      if (chart24h) {
        chart24h.resize()
      }
      if (chartDaily) {
        chartDaily.resize()
      }
      if (chartWeekly) {
        chartWeekly.resize()
      }
      if (chartMonthly) {
        chartMonthly.resize()
      }
      if (chartYearly) {
        chartYearly.resize()
      }
      if (overviewChart) {
        overviewChart.resize()
      }
    }, 50)
  } else if (viewMode.value === 'tables') {
    // Check if table data (overview data containing KPI details) already exists for this device
    if (!currentOverviewDataMap.value.has(currentDeviceUUID.value)) {
      // Data doesn't exist - fetch it
      console.log('[CurrentView] Table data not cached, fetching for:', currentDeviceUUID.value)
      isLoading.value = true
      try {
        const overview = await fetchCurrentOverview(currentDeviceUUID.value, { useCache: true })
        if (overview) {
          currentOverviewDataMap.value.set(currentDeviceUUID.value, overview)
          console.log('[CurrentView] ✓ Table data loaded from API')
        } else {
          console.warn('[CurrentView] ⚠ No table data returned from API')
        }
      } catch (err) {
        console.error('[CurrentView] ✗ Error fetching table data:', err)
      } finally {
        isLoading.value = false
      }
    } else {
      console.log('[CurrentView] Using cached table data for:', currentDeviceUUID.value)
    }
  }
})


// Watch for period changes in overview tab to refresh overview chart
watch(selectedPeriod, async () => {
  if (viewMode.value === 'overview') {
    await nextTick()
    initCharts()
  }
})

onMounted(async () => {
  // Initialize compteur selection (same as PuissanceView)
  await initializeCompteurSelection()

  // Wait for store to be ready
  await nextTick()

  // Restore selected meters from localStorage
  metersStore.restoreSelection()

  await nextTick()

  // Check if we have selected meters
  let metersToUse = validSelectedMeterIds.value

  // If no meters are selected, auto-select the first available meter
  if (metersToUse.length === 0 && metersStore.allMeters.length > 0) {
    const firstMeterId = metersStore.allMeters[0].id
    metersStore.setSelectedMeters([firstMeterId])
    await nextTick()
    metersToUse = validSelectedMeterIds.value
  }

  // Load data if we have a meter
  if (metersToUse.length > 0) {
    currentMeterIndex.value = 0
    await loadCurrentMeterData()
  }

  // Start 20-second silent refresh interval for telemetry data
  if (isApiMode) {
    telemetryRefreshInterval = setInterval(() => {
      if (validSelectedMeterIds.value.length > 0 && currentDeviceUUID.value) {
        console.log('[Current] Silent refresh triggered (20s interval)')
        loadCurrentMeterDataSilently()
      }
    }, 20000)
  }
})

const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '--:--'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Show chart modal with detailed view
 */
const showChartModal = async (chartType: 'day' | 'week' | 'month' | 'year') => {
  if (!currentDeviceUUID.value && !currentMeterId.value) return
  if (!currentKPIData.value) return

  let title = ''
  let subtitle = ''

  // Set title and subtitle based on chart type
  switch (chartType) {
    case 'day':
      title = t('current.chart24h')
      subtitle = t('current.chart24hDescription')
      break
    case 'week':
      title = t('current.chartWeekly')
      subtitle = t('current.chartWeeklyDescription')
      break
    case 'month':
      title = t('current.chartDaily')
      subtitle = t('current.chartDailyDescription')
      break
    case 'year':
      title = t('current.chartYearly')
      subtitle = t('current.chartYearlyDescription')
      break
  }

  // Build all chart data from cached KPI response (no API calls)
  const hourlyData = currentKPIData.value.hourlyData
  const dailyData = currentKPIData.value.dailyMonthData
  const weeklyData = currentKPIData.value.dailyWeekData
  const yearlyData = currentKPIData.value.dailyYearData || []

  chartModalData.value = {
    title,
    subtitle,
    data: [],
    labels: [],
    hourlyData: {
      labels: hourlyData.map((d: any) => {
        const date = new Date(d.ts)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }),
      values: hourlyData.map((d: any) => d.value)
    },
    dailyData: {
      labels: dailyData.map((d: any) => {
        const date = new Date(d.ts)
        return date.toLocaleDateString('fr-FR')
      }),
      values: dailyData.map((d: any) => d.value)
    },
    weeklyData: {
      labels: weeklyData.map((d: any) => {
        const date = new Date(d.ts)
        return date.toLocaleDateString('fr-FR')
      }),
      values: weeklyData.map((d: any) => d.value)
    },
    monthlyData: {
      labels: dailyData.map((d: any) => {
        const date = new Date(d.ts)
        return date.toLocaleDateString('fr-FR')
      }),
      values: dailyData.map((d: any) => d.value)
    },
    yearlyData: {
      labels: yearlyData.map((d: any) => {
        const date = new Date(d.ts)
        return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      }),
      values: yearlyData.map((d: any) => d.value)
    }
  }
  chartModalOpen.value = true
}

onUnmounted(() => {
  overviewChart?.destroy()
  chart24h?.destroy()
  chartDaily?.destroy()
  chartWeekly?.destroy()
  chartYearly?.destroy()
  
  // Clean up auto-refresh interval
  if (telemetryRefreshInterval) {
    clearInterval(telemetryRefreshInterval)
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
</style>

