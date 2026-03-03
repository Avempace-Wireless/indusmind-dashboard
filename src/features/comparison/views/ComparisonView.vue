<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700 pb-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
            {{ t('comparison.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('comparison.subtitle') }}
          </p>
        </div>
        <button
          @click="showCompteurSelector = true"
          class="flex w-full sm:w-auto items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          {{ t('dashboard.manageMeters') }}
        </button>
      </div>
    </div>

    <!-- Meter Selection Section (Single Select) -->
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-lg p-5 border-2 border-blue-200 dark:border-blue-700 mb-6">
      <h3 class="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide flex items-center gap-2 mb-3">
        <span class="material-symbols-outlined text-lg">compare</span>
        {{ t('comparison.meters.selectOne') }}
      </h3>

      <div v-if="validSelectedMeterIds.length > 0" class="space-y-3">
        <!-- Single Meter Selector -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            v-for="meterId in validSelectedMeterIds"
            :key="meterId"
            @click="selectSingleMeter(meterId)"
            :class="([
              'px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-2',
              selectedMeterId === meterId
                ? 'text-white shadow-lg border-transparent'
                : 'border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-blue-900/40'
            ])"
            :style="selectedMeterId === meterId ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
          >
            <span v-if="selectedMeterId === meterId" class="material-symbols-outlined text-sm">check_circle</span>
            <span class="truncate">{{ getMeterName(meterId) }}</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-4 text-blue-600 dark:text-blue-300">
        <p class="text-sm font-medium">{{ t('comparison.meters.selectMeters') }}</p>
      </div>
    </div>

    <!-- CompteurSelector Modal -->
    <CompteurSelector
      :is-open="showCompteurSelector"
      :all-compteurs="allCompteurs"
      :selected-ids="validSelectedMeterIds"
      @apply="handleCompteurSelection"
      @close="showCompteurSelector = false"
    />

    <!-- Loading Bar -->
    <div v-if="isLoading && !hasLoadedOnce" class="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-cyan-200 dark:border-blue-900 rounded-xl p-4 shadow-md animate-fadeIn">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
          <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 dark:border-blue-700 border-t-cyan-600 dark:border-t-blue-400"></div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-cyan-600 dark:text-blue-400 text-lg">cloud_download</span>
            <h3 class="text-sm font-semibold text-cyan-900 dark:text-blue-100">{{ t('common.loading') }}</h3>
          </div>
          <p class="text-xs text-cyan-700 dark:text-blue-300">{{ t('comparison.fetchingData') }}</p>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6" :class="{ 'opacity-60 pointer-events-none': isLoading && !hasLoadedOnce }">
      <!-- Left Panel: Comparison Charts (70%) -->
      <div class="lg:col-span-7 space-y-4 md:space-y-6">
        <!-- Error Banner -->
        <div v-if="apiError" class="rounded-xl border border-red-200 dark:border-red-800/60 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 px-5 py-4 flex items-start justify-between gap-4 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 dark:bg-red-800/50 flex items-center justify-center">
              <span class="material-symbols-outlined text-lg text-red-600 dark:text-red-400">error_outline</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-red-800 dark:text-red-200">{{ t('comparison.errors.loadFailed') }}</p>
              <p class="text-xs text-red-600 dark:text-red-300 mt-0.5">{{ apiError }}</p>
            </div>
          </div>
          <button @click="refreshData()" class="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">refresh</span>
            {{ t('common.retry') }}
          </button>
        </div>

        <!-- Validation Error Banner -->
        <div v-if="validationError" class="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/15 px-5 py-4 flex items-start justify-between gap-4 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
              <span class="material-symbols-outlined text-lg text-amber-600 dark:text-amber-400">info</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">{{ t('comparison.errors.validation.title') }}</p>
              <p class="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{{ validationError }}</p>
            </div>
          </div>
          <button @click="dismissValidation()" class="shrink-0 p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors">
            <span class="material-symbols-outlined text-base text-amber-600 dark:text-amber-400">close</span>
          </button>
        </div>

        <!-- Empty State: No meter selected -->
        <div v-if="!isLoading && !selectedMeterId" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-12 text-center">
          <div class="flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">compare_arrows</span>
            <div>
              <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">{{ t('comparison.empty.title') }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('comparison.empty.description') }}</p>
            </div>
          </div>
        </div>

        <!-- Unified Meter Comparison Chart -->
        <div v-if="selectedMeterId" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('comparison.charts.unified', { granularity: granularityLabel, count: 1 }) }}
            </h3>

          </div>

          <!-- Single Unified Chart -->
          <div
            class="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
            :class="isChartVisualization ? 'h-[300px] sm:h-[400px] md:h-[450px] flex items-center justify-center' : 'min-h-[220px] p-3 sm:p-4'"
          >
            <!-- Loading Overlay -->
            <div v-if="isChartVisualization && isLoading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
              <div class="flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 dark:border-blue-700 border-t-cyan-600 dark:border-t-blue-400"></div>
                <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ t('common.loading') }}</p>
              </div>
            </div>
            <!-- Error State -->
            <div v-if="isChartVisualization && !isLoading && apiError" class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50/95 to-rose-50/95 dark:from-red-900/40 dark:to-rose-900/30 rounded-xl backdrop-blur-sm z-20">
              <div class="flex flex-col items-center gap-4 max-w-sm text-center px-6">
                <div class="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-800/40 flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-3xl text-red-500 dark:text-red-400">cloud_off</span>
                </div>
                <div>
                  <p class="text-base font-bold text-red-800 dark:text-red-200">{{ t('common.error') }}</p>
                  <p class="text-sm text-red-600 dark:text-red-300 mt-1.5 leading-relaxed">{{ apiError }}</p>
                </div>
                <button
                  @click="refreshData"
                  class="px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-base">refresh</span>
                  {{ t('common.retry') }}
                </button>
              </div>
            </div>
            <!-- Validation Error State -->
            <div v-if="isChartVisualization && !isLoading && validationError" class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/95 to-yellow-50/95 dark:from-amber-900/30 dark:to-yellow-900/20 rounded-xl backdrop-blur-sm z-20">
              <div class="flex flex-col items-center gap-4 max-w-sm text-center px-6">
                <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-3xl text-amber-500 dark:text-amber-400">event_busy</span>
                </div>
                <div>
                  <p class="text-base font-bold text-amber-800 dark:text-amber-200">{{ t('comparison.errors.validation.title') }}</p>
                  <p class="text-sm text-amber-700 dark:text-amber-300 mt-1.5 leading-relaxed">{{ validationError }}</p>
                </div>
                <!-- Guide: select period then press button -->
                <div class="flex flex-col items-center gap-2 mt-1 pt-3 border-t border-amber-200 dark:border-amber-700/40 w-full">
                  <p class="text-xs text-amber-600 dark:text-amber-400">{{ t('comparison.charts.selectPeriodsHint') }}</p>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    <span class="material-symbols-outlined text-sm">play_arrow</span>
                    {{ t('comparison.calendar.fetchData') }}
                  </span>
                </div>
                <button
                  @click="dismissValidation()"
                  class="px-4 py-2 text-xs font-medium rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-800/30 transition-colors"
                >
                  {{ t('common.close') || 'Dismiss' }}
                </button>
              </div>
            </div>
            <!-- Empty State -->
            <div v-if="isChartVisualization && !isLoading && !apiError && !validationError && !hasChartData" class="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-[3px] rounded-xl">
              <!-- Fetched but no data returned -->
              <div v-if="fetchedButEmpty" class="flex flex-col items-center gap-5 max-w-md text-center px-8">
                <div class="relative">
                  <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 dark:from-slate-800/60 dark:via-gray-800/40 dark:to-slate-700/50 flex items-center justify-center shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                    <span class="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">search_off</span>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                    <span class="material-symbols-outlined text-sm text-amber-500 dark:text-amber-400">info</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ t('comparison.empty.title') }}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{{ t('comparison.empty.description') }}</p>
                </div>
                <button
                  @click="dismissValidation()"
                  class="group px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-base group-hover:-rotate-45 transition-transform">autorenew</span>
                  {{ t('comparison.empty.tryAgain') }}
                </button>
              </div>

              <!-- Both periods selected: ready to fetch -->
              <div v-else-if="referencePeriod && comparisonPeriod" class="flex flex-col items-center gap-4 max-w-sm text-center px-6">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-800/30 dark:to-teal-800/30 flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ t('comparison.charts.readyToCompare') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{{ t('comparison.charts.readyToCompareHint') }}</p>
                </div>
                <!-- Compact inline period summary -->
                <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <span class="font-medium text-blue-600 dark:text-blue-400">{{ referencePeriod }}</span>
                  <span class="font-bold text-gray-300 dark:text-gray-600">vs</span>
                  <span class="font-medium text-emerald-600 dark:text-emerald-400">{{ comparisonPeriod }}</span>
                </div>
                <button
                  @click="validateAndFetch"
                  :disabled="isLoading || !canFetch"
                  :class="([
                    'px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg',
                    isLoading || !canFetch
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                  ])"
                >
                  <span v-if="isLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-base">play_arrow</span>
                  {{ t('comparison.calendar.fetchData') }}
                </button>
              </div>

              <!-- Only one period selected: ask to select the other -->
              <div v-else-if="referencePeriod || comparisonPeriod" class="flex flex-col items-center gap-4 max-w-sm text-center px-6">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800/30 dark:to-orange-800/30 flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">edit_calendar</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ t('comparison.charts.selectOtherPeriod') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    {{ referencePeriod ? t('comparison.charts.selectComparisonPeriod') : t('comparison.charts.selectReferencePeriod') }}
                  </p>
                </div>
                <!-- Already selected period: prominent display -->
                <div class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">{{ referencePeriod ? t('comparison.periods.reference') : t('comparison.periods.comparison') }}</p>
                  <p class="text-base font-bold text-gray-900 dark:text-white">{{ referencePeriod || comparisonPeriod }}</p>
                </div>
                <!-- Then press Fetch button hint -->
                <button
                  @click="validateAndFetch"
                  :disabled="isLoading || !canFetch"
                  :class="([
                    'px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg',
                    isLoading || !canFetch
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                  ])"
                >
                  <span v-if="isLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-base">play_arrow</span>
                  {{ t('comparison.calendar.fetchData') }}
                </button>
              </div>

              <!-- No periods selected -->
              <div v-else class="flex flex-col items-center gap-4 max-w-sm text-center px-6">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-2xl text-gray-400 dark:text-gray-500">compare_arrows</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t('comparison.charts.selectPeriods') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{{ t('comparison.charts.selectPeriodsHint') }}</p>
                </div>
                <button
                  @click="validateAndFetch"
                  :disabled="isLoading || !canFetch"
                  :class="([
                    'px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg',
                    isLoading || !canFetch
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                  ])"
                >
                  <span v-if="isLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-base">play_arrow</span>
                  {{ t('comparison.calendar.fetchData') }}
                </button>
              </div>
            </div>

            <!-- Bar/Line Chart Canvas -->
            <canvas v-show="(chartType === 'bar' || chartType === 'line') && !validationError" ref="unifiedChartCanvas"></canvas>

            <!-- Heatmap View -->
            <div v-if="chartType === 'heatmap' && !validationError" class="w-full">
              <!-- Heatmap: No data state -->
              <div v-if="!hasChartData" class="h-full flex flex-col items-center justify-center">
                <div v-if="fetchedButEmpty" class="flex flex-col items-center gap-4 max-w-md text-center px-6">
                  <div class="relative">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 dark:from-slate-800/60 dark:via-gray-800/40 dark:to-slate-700/50 flex items-center justify-center shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                      <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">search_off</span>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                      <span class="material-symbols-outlined text-xs text-amber-500 dark:text-amber-400">info</span>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <p class="text-base font-bold text-slate-800 dark:text-slate-100">{{ t('comparison.empty.title') }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ t('comparison.empty.description') }}</p>
                  </div>
                  <button @click="dismissValidation()" class="group px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm group-hover:-rotate-45 transition-transform">autorenew</span>
                    {{ t('comparison.empty.tryAgain') }}
                  </button>
                </div>
                <div v-else-if="isLoading" class="flex flex-col items-center gap-3">
                  <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 dark:border-blue-700 border-t-cyan-600 dark:border-t-blue-400"></div>
                  <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ t('common.loading') }}</p>
                </div>
                <div v-else class="flex flex-col items-center gap-3 max-w-sm text-center px-6">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-2xl text-gray-400 dark:text-gray-500">grid_on</span>
                  </div>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t('comparison.charts.selectPeriods') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ t('comparison.charts.selectPeriodsHint') }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      <span class="material-symbols-outlined text-sm">play_arrow</span>
                      {{ t('comparison.calendar.fetchData') }}
                    </span>
                  </div>
                </div>
              </div>
              <!-- Heatmap: Data table (transposed: periods as rows) -->
              <div v-else class="flex flex-col">
                <div class="w-full">
                  <table class="w-full table-fixed border-collapse text-xs">
                    <thead class="sticky top-0 z-10">
                      <tr>
                        <th class="px-2.5 py-2 text-center font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          {{ t('comparison.periods.period') }}
                        </th>
                        <th class="px-2.5 py-2 text-center font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <div class="flex items-center justify-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-sm inline-block shrink-0" :style="{ backgroundColor: selectedMeter ? metersStore.getMeterColor(selectedMeter.id) : '#3b82f6' }"></span>
                            {{ t('comparison.periods.reference') }}
                          </div>
                        </th>
                        <th class="px-2.5 py-2 text-center font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <div class="flex items-center justify-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block shrink-0"></span>
                            {{ t('comparison.periods.comparison') }}
                          </div>
                        </th>
                        <th class="px-2.5 py-2 text-center font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          {{ t('comparison.heatmap.delta') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(period, idx) in heatmapPeriods"
                        :key="period"
                        :class="idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/60 dark:bg-gray-800/40'"
                        class="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <td class="px-2.5 py-2 font-medium text-gray-800 dark:text-gray-200 text-center whitespace-nowrap">
                          {{ period }}
                        </td>
                        <td
                          class="px-2.5 py-2 text-center font-semibold text-gray-900 dark:text-white"
                          :style="{ backgroundColor: getHeatmapColor('reference', period) }"
                        >
                          {{ getHeatmapValue('reference', period) }}
                        </td>
                        <td
                          class="px-2.5 py-2 text-center font-semibold text-gray-900 dark:text-white"
                          :style="{ backgroundColor: getHeatmapColor('comparison', period) }"
                        >
                          {{ getHeatmapValue('comparison', period) }}
                        </td>
                        <td class="px-2.5 py-2 text-center font-semibold">
                          <span :class="getHeatmapDeltaClass(period)">{{ getHeatmapDelta(period) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!-- Color intensity legend -->
                <div class="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
                  <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400">{{ heatmapPeriods.length }} {{ t('comparison.periods.period').toLowerCase() }}s</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ t('comparison.heatmap.low') }}</span>
                    <div class="w-16 h-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-600 dark:from-blue-900 dark:to-blue-400 ring-1 ring-gray-200 dark:ring-gray-700"></div>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ t('comparison.heatmap.high') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table View -->
            <div v-if="chartType === 'table' && !validationError" class="h-full w-full overflow-auto">
              <!-- Table: No data state -->
              <div v-if="!hasChartData" class="h-full flex flex-col items-center justify-center">
                <div v-if="fetchedButEmpty" class="flex flex-col items-center gap-4 max-w-md text-center px-6">
                  <div class="relative">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 dark:from-slate-800/60 dark:via-gray-800/40 dark:to-slate-700/50 flex items-center justify-center shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                      <span class="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">search_off</span>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                      <span class="material-symbols-outlined text-xs text-amber-500 dark:text-amber-400">info</span>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <p class="text-base font-bold text-slate-800 dark:text-slate-100">{{ t('comparison.empty.title') }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ t('comparison.empty.description') }}</p>
                  </div>
                  <button @click="dismissValidation()" class="group px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm group-hover:-rotate-45 transition-transform">autorenew</span>
                    {{ t('comparison.empty.tryAgain') }}
                  </button>
                </div>
                <div v-else-if="isLoading" class="flex flex-col items-center gap-3">
                  <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 dark:border-blue-700 border-t-cyan-600 dark:border-t-blue-400"></div>
                  <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ t('common.loading') }}</p>
                </div>
                <div v-else class="flex flex-col items-center gap-3 max-w-sm text-center px-6">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-2xl text-gray-400 dark:text-gray-500">table_chart</span>
                  </div>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ t('comparison.charts.selectPeriods') }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ t('comparison.charts.selectPeriodsHint') }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      <span class="material-symbols-outlined text-sm">play_arrow</span>
                      {{ t('comparison.calendar.fetchData') }}
                    </span>
                  </div>
                </div>
              </div>
              <!-- Table: Data view -->
              <template v-else>
              <div class="flex flex-col h-full">
              <div class="flex-1 overflow-auto min-h-0 px-3 pt-2">
              <table class="w-full border-collapse text-xs">
                <thead class="sticky top-0 z-10">
                  <tr>
                    <th class="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      {{ t('comparison.table.meter') }}
                    </th>
                    <th class="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      {{ t('comparison.table.value') }}
                    </th>
                    <th class="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      {{ t('comparison.table.variance') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in paginatedComparisonTable"
                    :key="`${row.label}-${rowIndex}`"
                    :class="rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/60 dark:bg-gray-800/40'"
                    class="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <td class="px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white">
                      {{ row.label }}
                    </td>
                    <td class="px-3 py-2.5 text-sm text-right text-gray-900 dark:text-white font-semibold tabular-nums">
                      {{ row.value }}
                    </td>
                    <td class="px-3 py-2.5 text-sm text-right">
                      <span
                        :class="row.variance > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : row.variance < 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-600 dark:text-gray-400'"
                        :title="row.varianceTooltip"
                        class="cursor-help inline-flex items-center gap-1"
                      >
                        <span v-if="row.variance > 0" class="material-symbols-outlined text-xs">trending_up</span>
                        <span v-else-if="row.variance < 0" class="material-symbols-outlined text-xs">trending_down</span>
                        {{ row.varianceText }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="paginatedComparisonTable.length === 0">
                    <td colspan="3" class="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      {{ t('comparison.table.noResults') }}
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
              <div class="flex flex-col gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700 shrink-0 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    {{ t('comparison.table.pagination.range', {
                      start: tableRange.start,
                      end: tableRange.end,
                      total: tableRange.total,
                    }) }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('common.itemsPerPage') }}</span>
                    <select
                      v-model.number="itemsPerPage"
                      :disabled="isLoading"
                      class="px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option v-for="option in rowsPerPageOptions" :key="option" :value="option">{{ option }}</option>
                    </select>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="prevTablePage"
                    :disabled="currentTablePage === 1"
                    class="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← {{ t('common.previous') }}
                  </button>
                  <span class="px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {{ t('comparison.table.pagination.page', { current: currentTablePage, total: totalChartTablePages }) }}
                  </span>
                  <button
                    @click="nextTablePage"
                    :disabled="currentTablePage === totalChartTablePages"
                    class="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ t('common.next') }} →
                  </button>
                </div>
              </div>
              </div>
              </template>
            </div>
          </div>

          <!-- Period Totals Summary -->
          <div v-if="selectedMeter && hasLoadedOnce" class="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: selectedMeter && metersStore.getMeterColor(selectedMeter.id) }"></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ t('comparison.periods.reference') }} ({{ referencePeriod }})</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ referenceData.reduce((sum, p) => sum + (p.value || 0), 0).toFixed(2) }} kWh</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div class="w-3 h-3 rounded-full flex-shrink-0 bg-emerald-500"></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ t('comparison.periods.comparison') }} ({{ comparisonPeriod }})</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ comparisonData.reduce((sum, p) => sum + (p.value || 0), 0).toFixed(2) }} kWh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Calendar & Controls (30%) -->
      <div class="lg:col-span-3 space-y-4 md:space-y-6">
        <!-- Chart Type Selection -->
        <div class="order-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4" :class="{ 'opacity-60 pointer-events-none': isLoading }">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('comparison.chartType.title') }}</h3>
            <button
              @click="dismissValidation"
              :disabled="isLoading || (!referencePeriodInput && !comparisonPeriodInput)"
              :title="t('common.clear')"
              :class="([
                'p-1.5 rounded-lg transition-all',
                isLoading || (!referencePeriodInput && !comparisonPeriodInput)
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              ])"
            >
              <span class="material-symbols-outlined text-base">clear</span>
            </button>
          </div>

          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="type in ['line', 'bar', 'heatmap', 'table']"
              :key="type"
              @click="setChartType(type as any)"
              :disabled="isLoading"
              :class="([
                'p-2 rounded border-2 transition-all flex items-center justify-center',
                chartType === type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              ])"
              :title="t(`comparison.chartType.${type}`)"
            >
              <span class="material-symbols-outlined text-lg text-gray-700 dark:text-gray-300">
                {{ type === 'bar' ? 'bar_chart' : type === 'line' ? 'show_chart' : type === 'heatmap' ? 'grid_on' : 'table_chart' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Period Comparison Selection -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.periods.title') }}</h3>

          <!-- Period Summary (Reference + Comparison) -->
          <div v-if="referencePeriod || comparisonPeriod" class="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/60 to-emerald-50/60 dark:from-blue-900/20 dark:to-emerald-900/20 p-3">
            <div class="flex items-center gap-2 mb-2">
              <span class="material-symbols-outlined text-base text-slate-600 dark:text-slate-300">event</span>
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ t('comparison.periods.title') }}</p>
            </div>
            <div class="grid grid-cols-1 gap-2">
              <div
                class="flex items-center gap-2 rounded-md bg-white/70 dark:bg-gray-900/50 px-3 py-2 border"
                :style="{ borderColor: selectedMeter ? metersStore.getMeterColor(selectedMeter.id) : '#3b82f6' }"
              >
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: selectedMeter ? metersStore.getMeterColor(selectedMeter.id) : '#3b82f6' }"></span>
                <div class="min-w-0">
                  <p
                    class="text-[10px] uppercase tracking-wide"
                    :style="{ color: selectedMeter ? metersStore.getMeterColor(selectedMeter.id) : '#3b82f6' }"
                  >
                    {{ t('comparison.periods.reference') }}
                  </p>
                  <p class="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                    {{ referencePeriod || t('comparison.periods.selectDate') }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-2 rounded-md bg-white/70 dark:bg-gray-900/50 px-3 py-2 border"
                :style="{ borderColor: '#A855F7' }"
              >
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: '#A855F7' }"></span>
                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-wide" :style="{ color: '#A855F7' }">
                    {{ t('comparison.periods.comparison') }}
                  </p>
                  <p class="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                    {{ comparisonPeriod || t('comparison.periods.selectDate') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparison Type Selection -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('comparison.periods.comparisonType') }}
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="type in (['day', 'week', 'month'] as const)"
                :key="type"
                @click="comparisonType = type"
                :disabled="isLoading"
                :class="([
                  'py-2 text-xs font-medium rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1',
                  comparisonType === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ])"
              >
                <span class="material-symbols-outlined text-sm">
                  {{ type === 'day' ? 'today' : type === 'week' ? 'date_range' : 'calendar_month' }}
                </span>
                {{ t(`comparison.periods.types.${type}`) }}
              </button>
            </div>
          </div>

          <!-- Reference Period -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('comparison.periods.reference') }}
            </label>

            <!-- Day Picker Input for Day Comparison -->
            <div v-if="comparisonType === 'day'" class="relative">
              <button
                @click="showRefCalendar = !showRefCalendar"
                :disabled="isLoading"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span>{{ referencePeriodInput || t('comparison.periods.selectDate') }}</span>
                <span class="material-symbols-outlined text-base">calendar_today</span>
              </button>

              <!-- Calendar Dropdown -->
              <div
                v-if="showRefCalendar"
                class="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10"
              >
                <div class="flex items-center justify-between mb-3">
                  <button
                    @click="prevReferenceMonth"
                    :disabled="isLoading"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <span class="text-xs font-medium">{{ getMonthName(refCalendarMonth) }} {{ refCalendarYear }}</span>
                  <button
                    @click="nextReferenceMonth"
                    :disabled="isLoading"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
                <div class="space-y-1">
                  <div class="grid grid-cols-7 gap-1 mb-1">
                    <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day" class="text-xs text-center font-bold text-gray-500">
                      {{ day }}
                    </div>
                  </div>
                  <div class="grid grid-cols-7 gap-1">
                    <button
                      v-for="day in refCalendarDays"
                      :key="day.dateStr"
                      @click="selectReferenceDate(day); showRefCalendar = false"
                      :disabled="isLoading || !day.isCurrentMonth"
                      :class="([
                        'p-1.5 text-xs rounded font-medium transition-all',
                        day.isSelected
                          ? 'bg-blue-600 text-white'
                          : day.isCurrentMonth
                          ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                          : 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700/50'
                      ])"
                    >
                      {{ day.day }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Default input for week and month -->
            <input
              v-else-if="comparisonType === 'week'"
              v-model="referencePeriodInput"
              type="week"
              :disabled="isLoading"
              @click="($event.target as HTMLInputElement).showPicker?.()"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            />
            <input
              v-else
              v-model="referencePeriodInput"
              type="month"
              :disabled="isLoading"
              @click="($event.target as HTMLInputElement).showPicker?.()"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            />
          </div>

          <!-- Comparison Period -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('comparison.periods.comparison') }}
            </label>

            <!-- Day Picker Input for Day Comparison -->
            <div v-if="comparisonType === 'day'" class="relative">
              <button
                @click="showCompCalendar = !showCompCalendar"
                :disabled="isLoading"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span>{{ comparisonPeriodInput || t('comparison.periods.selectDate') }}</span>
                <span class="material-symbols-outlined text-base">calendar_today</span>
              </button>

              <!-- Calendar Dropdown -->
              <div
                v-if="showCompCalendar"
                class="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-10"
              >
                <div class="flex items-center justify-between mb-3">
                  <button
                    @click="prevComparisonMonth"
                    :disabled="isLoading"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <span class="text-xs font-medium">{{ getMonthName(compCalendarMonth) }} {{ compCalendarYear }}</span>
                  <button
                    @click="nextComparisonMonth"
                    :disabled="isLoading"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span class="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
                <div class="space-y-1">
                  <div class="grid grid-cols-7 gap-1 mb-1">
                    <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day" class="text-xs text-center font-bold text-gray-500">
                      {{ day }}
                    </div>
                  </div>
                  <div class="grid grid-cols-7 gap-1">
                    <button
                      v-for="day in compCalendarDays"
                      :key="day.dateStr"
                      @click="selectComparisonDate(day); showCompCalendar = false"
                      :disabled="isLoading || !day.isCurrentMonth"
                      :class="([
                        'p-1.5 text-xs rounded font-medium transition-all',
                        day.isSelected
                          ? 'bg-teal-600 text-white'
                          : day.isCurrentMonth
                          ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-gray-600'
                          : 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700/50'
                      ])"
                    >
                      {{ day.day }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Default input for week and month -->
            <input
              v-else-if="comparisonType === 'week'"
              v-model="comparisonPeriodInput"
              type="week"
              :disabled="isLoading"
              @click="($event.target as HTMLInputElement).showPicker?.()"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            />
            <input
              v-else
              v-model="comparisonPeriodInput"
              type="month"
              :disabled="isLoading"
              @click="($event.target as HTMLInputElement).showPicker?.()"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            />
          </div>

          <!-- Fetch Button -->
          <button
            @click="validateAndFetch"
            :disabled="isLoading || !canFetch"
            :class="([
              'w-full py-2.5 px-4 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2',
              isLoading || !canFetch
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            ])"
          >
            <span v-if="isLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-base">query_stats</span>
            {{ isLoading ? t('comparison.fetchingData') : t('comparison.calendar.fetchData') }}
          </button>
        </div>
      </div>
    </div>

  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { useEnergyHistory } from '@/composables/useEnergyHistory'
import { getMeterOrderRank } from '@/utils/meterColors'

const { t, locale } = useI18n()
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()
const { selectedMeterIds: metersStoreSelectedIds } = storeToRefs(metersStore)

const {
  availableCompteurs: allCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

const {
  isLoading: energyHistoryLoading,
  error: energyHistoryError,
  fetchEnergyHistory,
} = useEnergyHistory()

// Modal state
const showCompteurSelector = ref(false)

// Calendar state
const showRefCalendar = ref(false)
const showCompCalendar = ref(false)

// Single Meter selection
const selectedMeterId = ref<string>('')
const validSelectedMeterIds = computed(() => {
  const priorityOrder = ['tgbt', 'climatisation', 'compressor']
  const priorityIndex = (name: string) => {
    const lower = name.toLowerCase()
    const index = priorityOrder.findIndex(key => lower.includes(key))
    return index === -1 ? priorityOrder.length : index
  }

  return metersStoreSelectedIds.value
    .filter((id: string) => allCompteurs.value.some((c: any) => c.id === id))
    .sort((a: string, b: string) => {
      const nameA = getMeterName(a)
      const nameB = getMeterName(b)
      const priorityA = priorityIndex(nameA)
      const priorityB = priorityIndex(nameB)

      if (priorityA !== priorityB) return priorityA - priorityB
      return nameA.localeCompare(nameB)
    })
})

const selectedMeter = computed(() => {
  if (!selectedMeterId.value) return null
  const meter = allCompteurs.value.find((m: any) => m.id === selectedMeterId.value)
  if (!meter) return null
  return {
    id: meter.id,
    name: meter.name || 'Unknown',
    deviceUUID: meter.deviceUUID || meter.id,
    totalConsumption: 0
  }
})

const visibleMeters = computed(() => {
  return selectedMeter.value ? [selectedMeter.value] : []
})

// Period Comparison Selection
const comparisonType = ref<'day' | 'week' | 'month'>('day')
const referencePeriodInput = ref<string>('')
const comparisonPeriodInput = ref<string>('')

// Calendar state
const refCalendarMonth = ref<number>(0)
const refCalendarYear = ref<number>(0)
const compCalendarMonth = ref<number>(0)
const compCalendarYear = ref<number>(0)

function formatLocalDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseLocalDate(dateStr: string): Date {
  const [yyyy, mm, dd] = dateStr.split('-').map(Number)
  return new Date(yyyy, (mm || 1) - 1, dd || 1)
}

// Loading & Error states
const isLoading = computed(() => energyHistoryLoading.value)
const apiError = ref('')
const validationError = ref('')
const hasLoadedOnce = ref(false)

// Comparison data - now stores data for both periods
const referenceData = ref<any[]>([])
const comparisonData = ref<any[]>([])
const unifiedChartCanvas = ref<HTMLCanvasElement | null>(null)
const unifiedChart = ref<any>(null)
const chartType = ref<'line' | 'bar' | 'table' | 'heatmap'>('line')

// Table configuration
const currentTablePage = ref(1)
const itemsPerPage = ref(25)
const rowsPerPageOptions = [10, 25, 50, 100]

// ============ Computed Properties ============

const effectiveResolution = computed(() => {
  if (comparisonType.value === 'day') return 'hourly'
  if (comparisonType.value === 'week') return 'hourly'
  return 'daily' // month
})

const granularityLabel = computed(() => {
  return effectiveResolution.value === 'hourly' ? t('common.hourly') : t('common.daily')
})

const hasChartData = computed(() => {
  if (!hasLoadedOnce.value) return false
  return referenceData.value.length > 0 && comparisonData.value.length > 0
})

// Data was fetched but came back empty
const fetchedButEmpty = computed(() => {
  return hasLoadedOnce.value && !hasChartData.value
})

const isChartVisualization = computed(() => {
  return chartType.value === 'bar' || chartType.value === 'line'
})

// True only when meter + both valid periods are selected
const canFetch = computed(() => {
  if (!selectedMeterId.value) return false
  if (!referencePeriodInput.value || !comparisonPeriodInput.value) return false
  // For day type, inputs must be valid YYYY-MM-DD dates
  if (comparisonType.value === 'day') {
    const ref = parseLocalDate(referencePeriodInput.value)
    const comp = parseLocalDate(comparisonPeriodInput.value)
    if (isNaN(ref.getTime()) || isNaN(comp.getTime())) return false
  }
  // For week type, inputs must match YYYY-Www
  if (comparisonType.value === 'week') {
    const weekPattern = /^\d{4}-W\d{2}$/
    if (!weekPattern.test(referencePeriodInput.value) || !weekPattern.test(comparisonPeriodInput.value)) return false
  }
  // For month type, inputs must match YYYY-MM
  if (comparisonType.value === 'month') {
    const monthPattern = /^\d{4}-\d{2}$/
    if (!monthPattern.test(referencePeriodInput.value) || !monthPattern.test(comparisonPeriodInput.value)) return false
  }
  return true
})

const referencePeriod = computed(() => {
  if (!referencePeriodInput.value) return ''

  const startDate = parseLocalDate(referencePeriodInput.value)
  const localeStr = locale.value || 'en-US'

  switch (comparisonType.value) {
    case 'day':
      return startDate.toLocaleDateString(localeStr, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    case 'week': {
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      return `${startDate.toLocaleDateString(localeStr, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(localeStr, { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    case 'month':
      return startDate.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' })
    default:
      return ''
  }
})

const comparisonPeriod = computed(() => {
  if (!comparisonPeriodInput.value) return ''

  const startDate = parseLocalDate(comparisonPeriodInput.value)
  const localeStr = locale.value || 'en-US'

  switch (comparisonType.value) {
    case 'day':
      return startDate.toLocaleDateString(localeStr, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    case 'week': {
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      return `${startDate.toLocaleDateString(localeStr, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(localeStr, { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    case 'month':
      return startDate.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' })
    default:
      return ''
  }
})

// Simplified comparison table for table chart type
const comparisonTable = computed(() => {
  const table: Array<{ label: string; value: string; variance: number; varianceText: string; varianceTooltip: string }> = []

  if (referenceData.value.length === 0) return table

  // Calculate averages
  const refTotal = referenceData.value.reduce((sum, p) => sum + (p.value || 0), 0)
  const refAvg = refTotal / referenceData.value.length
  const compTotal = comparisonData.value.reduce((sum, p) => sum + (p.value || 0), 0)
  const compAvg = comparisonData.value.length > 0 ? compTotal / comparisonData.value.length : 0

  // Add reference period data
  for (const point of referenceData.value) {
    const value = point.value || 0
    const variance = refAvg !== 0 ? ((value - refAvg) / refAvg) * 100 : 0
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(point.timestamp).toLocaleDateString('en-US')

    table.push({
      label: `${t('comparison.periods.reference')} - ${timeLabel}`,
      value: `${value.toFixed(2)} kWh`,
      variance,
      varianceText: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`,
      varianceTooltip: t('comparison.kpi.varianceFormula', {
        value: value.toFixed(2),
        avg: refAvg.toFixed(2),
        result: variance.toFixed(1)
      })
    })
  }

  // Add comparison period data
  for (const point of comparisonData.value) {
    const value = point.value || 0
    const variance = compAvg !== 0 ? ((value - compAvg) / compAvg) * 100 : 0
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(point.timestamp).toLocaleDateString('en-US')

    table.push({
      label: `${t('comparison.periods.comparison')} - ${timeLabel}`,
      value: `${value.toFixed(2)} kWh`,
      variance,
      varianceText: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`,
      varianceTooltip: t('comparison.kpi.varianceFormula', {
        value: value.toFixed(2),
        avg: compAvg.toFixed(2),
        result: variance.toFixed(1)
      })
    })
  }

  return table
})

const paginatedComparisonTable = computed(() => {
  const start = (currentTablePage.value - 1) * itemsPerPage.value
  return comparisonTable.value.slice(start, start + itemsPerPage.value)
})

const tableRange = computed(() => {
  const start = comparisonTable.value.length > 0 ? (currentTablePage.value - 1) * itemsPerPage.value + 1 : 0
  const end = Math.min(currentTablePage.value * itemsPerPage.value, comparisonTable.value.length)
  return { start, end, total: comparisonTable.value.length }
})

// Update totalTablePages to use comparisonTable for table/heatmap chart types
const totalChartTablePages = computed(() => {
  return Math.ceil(comparisonTable.value.length / itemsPerPage.value) || 1
})

// Heatmap data structure: periods as rows, reference vs comparison as columns
const heatmapPeriods = computed(() => {
  // Use the longer dataset so all periods are shown
  const longer = referenceData.value.length >= comparisonData.value.length
    ? referenceData.value
    : comparisonData.value
  const periods: string[] = []
  for (const point of longer) {
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(point.timestamp).toLocaleDateString('en-US')
    periods.push(timeLabel)
  }
  return periods
})

// Calendar days for reference period
const refCalendarDays = computed(() => {
  const year = refCalendarYear.value
  const month = refCalendarMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())

  const days = []
  let current = new Date(startDate)

  while (current <= lastDay || current.getDay() !== 0) {
    const isCurrentMonth = current.getMonth() === month
    const dateStr = formatLocalDate(current)
    const isSelected = referencePeriodInput.value === dateStr

    days.push({
      day: current.getDate(),
      dateStr,
      isCurrentMonth,
      isSelected,
      date: new Date(current)
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

// Calendar days for comparison period
const compCalendarDays = computed(() => {
  const year = compCalendarYear.value
  const month = compCalendarMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())

  const days = []
  let current = new Date(startDate)

  while (current <= lastDay || current.getDay() !== 0) {
    const isCurrentMonth = current.getMonth() === month
    const dateStr = formatLocalDate(current)
    const isSelected = comparisonPeriodInput.value === dateStr

    days.push({
      day: current.getDate(),
      dateStr,
      isCurrentMonth,
      isSelected,
      date: new Date(current)
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

// ============ Methods ============

function getMeterName(meterId: string): string {
  const meter = allCompteurs.value.find((m: any) => m.id === meterId)
  return meter?.name || 'Unknown'
}

// Calendar functions
function initializeCalendars() {
  const today = new Date()
  refCalendarMonth.value = today.getMonth()
  refCalendarYear.value = today.getFullYear()

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  compCalendarMonth.value = yesterday.getMonth()
  compCalendarYear.value = yesterday.getFullYear()
}

function getMonthName(month: number): string {
  return new Date(2000, month, 1).toLocaleString(locale.value || 'en-US', { month: 'long' })
}

function prevReferenceMonth() {
  if (refCalendarMonth.value === 0) {
    refCalendarMonth.value = 11
    refCalendarYear.value--
  } else {
    refCalendarMonth.value--
  }
}

function nextReferenceMonth() {
  if (refCalendarMonth.value === 11) {
    refCalendarMonth.value = 0
    refCalendarYear.value++
  } else {
    refCalendarMonth.value++
  }
}

function prevComparisonMonth() {
  if (compCalendarMonth.value === 0) {
    compCalendarMonth.value = 11
    compCalendarYear.value--
  } else {
    compCalendarMonth.value--
  }
}

function nextComparisonMonth() {
  if (compCalendarMonth.value === 11) {
    compCalendarMonth.value = 0
    compCalendarYear.value++
  } else {
    compCalendarMonth.value++
  }
}

function selectReferenceDate(day: any) {
  referencePeriodInput.value = day.dateStr
  // Sync comparison calendar to show the same month for easy comparison
  const selectedDate = new Date(day.date)
  compCalendarMonth.value = selectedDate.getMonth()
  compCalendarYear.value = selectedDate.getFullYear()
}

function selectComparisonDate(day: any) {
  comparisonPeriodInput.value = day.dateStr
  // Sync reference calendar to show the same month for easy comparison
  const selectedDate = new Date(day.date)
  refCalendarMonth.value = selectedDate.getMonth()
  refCalendarYear.value = selectedDate.getFullYear()
}

function getHeatmapNumericValue(periodType: 'reference' | 'comparison', period: string): number | null {
  const data = periodType === 'reference' ? referenceData.value : comparisonData.value
  const point = data.find(p => {
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(p.timestamp).toLocaleDateString('en-US')
    return timeLabel === period
  })
  return point?.value ?? null
}

function getHeatmapValue(periodType: 'reference' | 'comparison', period: string): string {
  const val = getHeatmapNumericValue(periodType, period)
  return val !== null ? val.toFixed(2) : '—'
}

function getHeatmapDelta(period: string): string {
  const refVal = getHeatmapNumericValue('reference', period)
  const compVal = getHeatmapNumericValue('comparison', period)
  if (refVal === null || compVal === null) return '—'
  const delta = compVal - refVal
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta.toFixed(2)}`
}

function getHeatmapDeltaClass(period: string): string {
  const refVal = getHeatmapNumericValue('reference', period)
  const compVal = getHeatmapNumericValue('comparison', period)
  if (refVal === null || compVal === null) return 'text-gray-400 dark:text-gray-500'
  const delta = compVal - refVal
  if (delta > 0) return 'text-red-600 dark:text-red-400'
  if (delta < 0) return 'text-green-600 dark:text-green-400'
  return 'text-gray-500 dark:text-gray-400'
}

function getHeatmapColor(periodType: 'reference' | 'comparison', period: string): string {
  const data = periodType === 'reference' ? referenceData.value : comparisonData.value
  const point = data.find(p => {
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(p.timestamp).toLocaleDateString('en-US')
    return timeLabel === period
  })

  if (!point || point.value === undefined) return 'transparent'

  // Calculate color intensity based on value relative to data range
  const values = data.map(p => p.value || 0).filter(v => v > 0)
  if (values.length === 0) return 'transparent'

  const min = Math.min(...values)
  const max = Math.max(...values)
  const value = point.value || 0

  // Normalize value to 0-1 range
  const normalized = max > min ? (value - min) / (max - min) : 0.5

  // Use different colors for reference and comparison
  const baseColor = periodType === 'reference'
    ? (selectedMeter.value ? metersStore.getMeterColor(selectedMeter.value.id) : '#3b82f6')
    : '#A855F7' // Beautiful purple for comparison (matches line chart)

  // Convert hex to rgba with opacity based on value
  const opacity = 0.2 + (normalized * 0.6) // Range from 0.2 to 0.8

  // Simple hex to rgb conversion
  const r = parseInt(baseColor.slice(1, 3), 16)
  const g = parseInt(baseColor.slice(3, 5), 16)
  const b = parseInt(baseColor.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function dismissValidation() {
  validationError.value = ''
  referencePeriodInput.value = ''
  comparisonPeriodInput.value = ''
  resetChartState()
}

function resetChartState() {
  referenceData.value = []
  comparisonData.value = []
  hasLoadedOnce.value = false
  apiError.value = ''

  if (unifiedChart.value) {
    unifiedChart.value.destroy()
    unifiedChart.value = null
  }
}

async function selectSingleMeter(meterId: string) {
  selectedMeterId.value = meterId
  resetChartState()
  currentTablePage.value = 1

  if (canFetch.value) {
    await nextTick()
    validateAndFetch()
  }
}

function handleCompteurSelection(selectedIds: string[]) {
  metersStore.setSelectedMeters(selectedIds)
  selectedMeterId.value = ''
  showCompteurSelector.value = false
  resetChartState()
}

function applyQuickPreset(preset: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (preset === 'todayYesterday') {
    comparisonType.value = 'day'
    // Reference = yesterday (older date)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    referencePeriodInput.value = formatLocalDate(yesterday)
    // Comparison = today (newer date)
    comparisonPeriodInput.value = formatLocalDate(today)
  } else if (preset === 'last7Days') {
    comparisonType.value = 'week'
    // This week
    referencePeriodInput.value = getISOWeek(today)
    // 7 days ago
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    comparisonPeriodInput.value = getISOWeek(sevenDaysAgo)
  } else if (preset === 'thisWeekLastWeek') {
    comparisonType.value = 'week'
    // Get current week (ISO week format YYYY-Www)
    const currentWeek = getISOWeek(today)
    referencePeriodInput.value = currentWeek
    // Get last week
    const lastWeekDate = new Date(today)
    lastWeekDate.setDate(lastWeekDate.getDate() - 7)
    comparisonPeriodInput.value = getISOWeek(lastWeekDate)
  } else if (preset === 'last30Days') {
    comparisonType.value = 'month'
    // Current month
    referencePeriodInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    // 30 days ago (previous month)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    comparisonPeriodInput.value = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}`
  } else if (preset === 'thisMonthLastMonth') {
    comparisonType.value = 'month'
    // Current month (YYYY-MM)
    referencePeriodInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    // Last month
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    comparisonPeriodInput.value = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`
  } else if (preset === 'thisQuarterLastQuarter') {
    comparisonType.value = 'month'
    // Get current quarter
    const currentMonth = today.getMonth()
    const currentQuarterStart = Math.floor(currentMonth / 3) * 3
    referencePeriodInput.value = `${today.getFullYear()}-${String(currentQuarterStart + 1).padStart(2, '0')}`
    // Get last quarter
    const lastQuarterMonth = currentQuarterStart - 3
    if (lastQuarterMonth < 0) {
      comparisonPeriodInput.value = `${today.getFullYear() - 1}-${String(lastQuarterMonth + 12 + 1).padStart(2, '0')}`
    } else {
      comparisonPeriodInput.value = `${today.getFullYear()}-${String(lastQuarterMonth + 1).padStart(2, '0')}`
    }
  }

  resetChartState()
}

function getISOWeek(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

function formatValue(value?: number): string {
  if (value === undefined) return '—'
  return value.toFixed(2) + ' kWh'
}

function prevTablePage() {
  if (currentTablePage.value > 1) currentTablePage.value--
}

function nextTablePage() {
  if (currentTablePage.value < totalChartTablePages.value) currentTablePage.value++
}

async function setChartType(type: 'bar' | 'line' | 'table' | 'heatmap') {
  chartType.value = type

  if (type === 'bar' || type === 'line') {
    if (hasChartData.value) {
      await nextTick()
      renderCharts()
    }
    return
  }

  if (unifiedChart.value) {
    unifiedChart.value.destroy()
    unifiedChart.value = null
  }
}

async function toggleChartType() {
  if (chartType.value !== 'bar' && chartType.value !== 'line') {
    await setChartType('bar')
    return
  }

  await setChartType(chartType.value === 'bar' ? 'line' : 'bar')
}

async function validateAndFetch() {
  validationError.value = ''
  apiError.value = ''

  // Check if meter is selected
  if (!selectedMeterId.value) {
    validationError.value = t('comparison.errors.validation.needMeter')
    return
  }

  // Check if periods are selected
  if (!referencePeriod.value || !comparisonPeriod.value) {
    if (referencePeriod.value && !comparisonPeriod.value) {
      validationError.value = t('comparison.errors.validation.selectCompPeriod')
    } else if (!referencePeriod.value && comparisonPeriod.value) {
      validationError.value = t('comparison.errors.validation.selectRefPeriod')
    } else {
      validationError.value = t('comparison.errors.validation.selectBothPeriods')
    }
    return
  }

  // Ensure raw inputs are present for week/month comparisons
  if (comparisonType.value !== 'day') {
    if (!referencePeriodInput.value || !comparisonPeriodInput.value) {
      if (referencePeriodInput.value && !comparisonPeriodInput.value) {
        validationError.value = t('comparison.errors.validation.selectCompPeriod')
      } else if (!referencePeriodInput.value && comparisonPeriodInput.value) {
        validationError.value = t('comparison.errors.validation.selectRefPeriod')
      } else {
        validationError.value = t('comparison.errors.validation.selectBothPeriods')
      }
      return
    }

    const refRange = parsePeriodRange(referencePeriodInput.value, comparisonType.value)
    const compRange = parsePeriodRange(comparisonPeriodInput.value, comparisonType.value)

    if (!Number.isFinite(refRange.start) || !Number.isFinite(refRange.end) || !Number.isFinite(compRange.start) || !Number.isFinite(compRange.end)) {
      validationError.value = t('comparison.errors.validation.invalidDateRange')
      return
    }
  }

  // Validate dates for day comparison
  if (comparisonType.value === 'day') {
    const refDate = parseLocalDate(referencePeriodInput.value)
    const compDate = parseLocalDate(comparisonPeriodInput.value)

    // Check if dates are valid
    if (isNaN(refDate.getTime()) || isNaN(compDate.getTime())) {
      validationError.value = t('comparison.errors.validation.invalidDateFormat')
      return
    }

    // Check if any date is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (refDate > today) {
      validationError.value = t('comparison.errors.validation.refDateInFuture')
      return
    }

    if (compDate > today) {
      validationError.value = t('comparison.errors.validation.compDateInFuture')
      return
    }

    // Ensure reference date is before comparison date (older date first)
    if (refDate >= compDate) {
      validationError.value = t('comparison.errors.validation.refBeforeComp', {
        refDate: formatLocalDate(refDate),
        compDate: formatLocalDate(compDate)
      })
      return
    }
  }

  // Validate dates for month comparison
  if (comparisonType.value === 'month') {
    const [refYear, refMonth] = referencePeriodInput.value.split('-').map(Number)
    const [compYear, compMonth] = comparisonPeriodInput.value.split('-').map(Number)

    const refDate = new Date(refYear, refMonth - 1, 1)
    const compDate = new Date(compYear, compMonth - 1, 1)

    // Check if any month is in the future
    const today = new Date()
    today.setDate(1)
    today.setHours(0, 0, 0, 0)

    if (refDate > today) {
      validationError.value = t('comparison.errors.validation.refDateInFuture')
      return
    }

    if (compDate > today) {
      validationError.value = t('comparison.errors.validation.compDateInFuture')
      return
    }

    // Ensure reference month is before comparison month
    if (refDate >= compDate) {
      const refStr = refDate.toLocaleDateString(locale.value || 'en-US', { month: 'long', year: 'numeric' })
      const compStr = compDate.toLocaleDateString(locale.value || 'en-US', { month: 'long', year: 'numeric' })
      validationError.value = t('comparison.errors.validation.refBeforeComp', {
        refDate: refStr,
        compDate: compStr
      })
      return
    }
  }

  // Validate dates for week comparison
  if (comparisonType.value === 'week') {
    const [refYear, refWeek] = referencePeriodInput.value.split('-W').map(Number)
    const [compYear, compWeek] = comparisonPeriodInput.value.split('-W').map(Number)

    // Parse week dates
    const getWeekStartDate = (year: number, week: number) => {
      const firstDay = new Date(year, 0, 1)
      const daysOffset = (week - 1) * 7
      const weekStart = new Date(firstDay)
      weekStart.setDate(firstDay.getDate() + daysOffset - (firstDay.getDay() || 7) + 1)
      return weekStart
    }

    const refDate = getWeekStartDate(refYear, refWeek)
    const compDate = getWeekStartDate(compYear, compWeek)

    // Check if any week is in the future
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (refDate > today) {
      validationError.value = t('comparison.errors.validation.refDateInFuture')
      return
    }

    if (compDate > today) {
      validationError.value = t('comparison.errors.validation.compDateInFuture')
      return
    }

    // Ensure reference week is before comparison week
    if (refDate >= compDate) {
      const refStr = `${refYear}-W${String(refWeek).padStart(2, '0')}`
      const compStr = `${compYear}-W${String(compWeek).padStart(2, '0')}`
      validationError.value = t('comparison.errors.validation.refBeforeComp', {
        refDate: refStr,
        compDate: compStr
      })
      return
    }
  }

  // Clear validation error and fetch data
  validationError.value = ''
  await fetchComparisonData()
  await fetchComparisonData()
}

async function fetchComparisonData() {
  if (!selectedMeter.value || !referencePeriod.value || !comparisonPeriod.value) return

  try {
    apiError.value = ''
    referenceData.value = []
    comparisonData.value = []

    const resolution = effectiveResolution.value
    const deviceUUID = selectedMeter.value.deviceUUID

    // Parse periods into date ranges
    const refRange = parsePeriodRange(referencePeriodInput.value, comparisonType.value)
    const compRange = parsePeriodRange(comparisonPeriodInput.value, comparisonType.value)

    // Fetch reference period data
    const refResult = await fetchEnergyHistory({
      deviceUUIDs: [deviceUUID],
      startDate: refRange.start,
      endDate: refRange.end,
      metricTypes: ['consumption'],
      resolution,
      selectedDates: refRange.dates
    }, false)

    // Fetch comparison period data
    const compResult = await fetchEnergyHistory({
      deviceUUIDs: [deviceUUID],
      startDate: compRange.start,
      endDate: compRange.end,
      metricTypes: ['consumption'],
      resolution,
      selectedDates: compRange.dates
    }, false)

    if (!refResult.success || !refResult.data || !compResult.success || !compResult.data) {
      throw new Error('API call failed')
    }

    // Process reference data
    const refMeterData = refResult.data[deviceUUID] || {}
    const refConsumption = refMeterData.consumption || []
    let refTotal = 0
    if (Array.isArray(refConsumption)) {
      for (const point of refConsumption) {
        const value = point.value || 0
        refTotal += value
        referenceData.value.push({
          timestamp: point.timestamp,
          value,
          date: point.date
        })
      }
    }

    // Process comparison data
    const compMeterData = compResult.data[deviceUUID] || {}
    const compConsumption = compMeterData.consumption || []
    let compTotal = 0
    if (Array.isArray(compConsumption)) {
      for (const point of compConsumption) {
        const value = point.value || 0
        compTotal += value
        comparisonData.value.push({
          timestamp: point.timestamp,
          value,
          date: point.date
        })
      }
    }

    // Update meter totals
    if (selectedMeter.value) {
      selectedMeter.value.totalConsumption = refTotal
    }

    hasLoadedOnce.value = true
    currentTablePage.value = 1
    await nextTick()
    renderCharts()
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : 'Failed to load comparison data'
    console.error('[ComparisonView] Fetch Error:', error)
  }
}

function parsePeriodRange(period: string, type: 'day' | 'week' | 'month'): { start: number; end: number; dates: string[] } {
  const dates: string[] = []

  if (type === 'day') {
    // period format: YYYY-MM-DD
    const date = parseLocalDate(period)
    date.setHours(0, 0, 0, 0)
    const start = date.getTime()
    date.setHours(23, 59, 59, 999)
    const end = date.getTime()
    dates.push(period)
    return { start, end, dates }
  } else if (type === 'week') {
    // period format: YYYY-Www (e.g., 2024-W12)
    const [year, week] = period.split('-W').map(Number)
    const firstDayOfYear = new Date(year, 0, 1)
    const daysOffset = (week - 1) * 7
    const firstDayOfWeek = new Date(firstDayOfYear)
    firstDayOfWeek.setDate(firstDayOfYear.getDate() + daysOffset - (firstDayOfYear.getDay() || 7) + 1)

    firstDayOfWeek.setHours(0, 0, 0, 0)
    const start = firstDayOfWeek.getTime()

    const lastDayOfWeek = new Date(firstDayOfWeek)
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6)
    lastDayOfWeek.setHours(23, 59, 59, 999)
    const end = lastDayOfWeek.getTime()

    // Generate dates for the week
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDayOfWeek)
      d.setDate(d.getDate() + i)
      dates.push(formatLocalDate(d))
    }

    return { start, end, dates }
  } else {
    // period format: YYYY-MM
    const [year, month] = period.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    firstDay.setHours(0, 0, 0, 0)
    const start = firstDay.getTime()

    const lastDay = new Date(year, month, 0) // Last day of the month
    lastDay.setHours(23, 59, 59, 999)
    const end = lastDay.getTime()

    // Generate dates for the month
    const daysInMonth = lastDay.getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i)
      dates.push(formatLocalDate(d))
    }

    return { start, end, dates }
  }
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatAxisLabel(timestamp: number, resolution: 'hourly' | 'daily'): string {
  const d = new Date(timestamp)
  const yyyy = d.getFullYear()
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())

  if (resolution === 'hourly') {
    const hh = pad2(d.getHours())
    return `${yyyy}-${mm}-${dd} ${hh}:00`
  }

  return `${yyyy}-${mm}-${dd}`
}

function renderCharts() {
  // Destroy existing chart safely
  if (unifiedChart.value) {
    unifiedChart.value.config.options.animation = false
    unifiedChart.value.stop()
    unifiedChart.value.destroy()
    unifiedChart.value = null
  }

  if (!isChartVisualization.value) return
  if (!unifiedChartCanvas.value) return
  if (!selectedMeter.value) return
  if (referenceData.value.length === 0) return

  // Use reference data for labels (assumes reference and comparison have matching time structure)
  const labels = referenceData.value.map((p: any) => {
    return formatAxisLabel(p.timestamp, effectiveResolution.value)
  })

  // Build datasets array (one for reference, one for comparison)
  const meterColor = metersStore.getMeterColor(selectedMeter.value.id)
  const refColor = meterColor
  const compColor = '#A855F7' // Beautiful purple for comparison

  const datasets = [
    {
      label: `${t('comparison.periods.reference')} (${referencePeriod.value})`,
      data: referenceData.value.map((p: any) => p.value || 0),
      borderColor: refColor,
      backgroundColor: chartType.value === 'bar' ? refColor : refColor + '30',
      borderWidth: chartType.value === 'line' ? 3 : 2,
      tension: chartType.value === 'line' ? 0.5 : 0,
      fill: false,
      pointRadius: chartType.value === 'line' ? 4 : 0,
      pointHoverRadius: chartType.value === 'line' ? 6 : 0,
      pointBackgroundColor: refColor,
      pointBorderColor: '#fff',
      pointBorderWidth: chartType.value === 'line' ? 2 : 0,
      spanGaps: false,
      segment: {
        borderDash: []
      }
    },
    {
      label: `${t('comparison.periods.comparison')} (${comparisonPeriod.value})`,
      data: comparisonData.value.map((p: any) => p.value || 0),
      borderColor: compColor,
      backgroundColor: chartType.value === 'bar' ? compColor : compColor + '30',
      borderWidth: chartType.value === 'line' ? 3 : 2,
      tension: chartType.value === 'line' ? 0.5 : 0,
      fill: false,
      pointRadius: chartType.value === 'line' ? 4 : 0,
      pointHoverRadius: chartType.value === 'line' ? 6 : 0,
      pointBackgroundColor: compColor,
      pointBorderColor: '#fff',
      pointBorderWidth: chartType.value === 'line' ? 2 : 0,
      spanGaps: false,
      segment: {
        borderDash: []
      }
    }
  ]

  const ctx = unifiedChartCanvas.value.getContext('2d')
  if (!ctx) return

  const chartConfig: any = {
    type: chartType.value,
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 15,
          bottom: 10
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: window.innerWidth < 768 ? 'bottom' : 'top',
          align: 'start',
          labels: {
            usePointStyle: true,
            padding: window.innerWidth < 768 ? 12 : 18,
            font: { size: window.innerWidth < 768 ? 11 : 13, weight: '600' },
            boxWidth: window.innerWidth < 768 ? 10 : 14,
            boxHeight: window.innerWidth < 768 ? 10 : 14,
            color: '#374151'
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: '#fff',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderWidth: 2,
          padding: 14,
          displayColors: true,
          cornerRadius: 10,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12, weight: '500' },
          callbacks: {
            title: (context: any) => {
              if (context.length > 0) {
                return `📅 ${context[0].label}`
              }
              return ''
            },
            label: (context: any) => {
              const value = context.parsed.y.toFixed(2)
              const label = context.dataset.label
              return `  ${label}: ${value} kWh`
            }
          }
        },
        filler: {
          propagate: true
        }
      },
        animation: false,
        animations: false,
      scales: {
        x: {
          ticks: {
            maxRotation: window.innerWidth < 768 ? 45 : 0,
            minRotation: window.innerWidth < 768 ? 45 : 0,
            font: { size: window.innerWidth < 768 ? 9 : 11 },
            autoSkip: true,
            maxTicksLimit: window.innerWidth < 768 ? 8 : 12,
            color: '#6B7280'
          },
          grid: {
            display: true,
            color: 'rgba(107, 114, 128, 0.08)',
            drawBorder: false
          }
        },
        y: {
          beginAtZero: false,
          grace: '20%',
          ticks: {
            callback: (v: any) => v + ' kWh',
            font: { size: window.innerWidth < 768 ? 9 : 11 },
            maxTicksLimit: window.innerWidth < 768 ? 6 : 8,
            color: '#6B7280',
            padding: 8
          },
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            drawBorder: false
          }
        }
      }
    }
  }

  // Add legend bottom margin plugin (safe with animation: false)
  chartConfig.plugins = [{
    id: 'legendMargin',
    afterInit(chart: any) {
      if (chart.legend) {
        const origFit = chart.legend.fit
        chart.legend.fit = function() {
          origFit.call(this)
          this.height += 20
        }
      }
    }
  }]

  unifiedChart.value = new Chart(ctx, chartConfig)
}

function refreshData() {
  apiError.value = ''
  validationError.value = ''
  hasLoadedOnce.value = false
  currentTablePage.value = 1
}

// ============ Lifecycle ============

watch(() => comparisonType.value, () => {
  showRefCalendar.value = false
  showCompCalendar.value = false
  validationError.value = ''
  referencePeriodInput.value = ''
  comparisonPeriodInput.value = ''
})

watch([() => referencePeriodInput.value, () => comparisonPeriodInput.value], () => {
  validationError.value = ''
})

watch(() => selectedMeterId.value, () => {
  currentTablePage.value = 1
  resetChartState()
})

watch(() => itemsPerPage.value, () => {
  currentTablePage.value = 1
})

watch(() => locale.value, async () => {
  if (!hasChartData.value || !isChartVisualization.value) return
  await nextTick()
  renderCharts()
})

onMounted(async () => {
  // Initialize compteur selection
  await initializeCompteurSelection()

  // Initialize calendars
  initializeCalendars()

  // Hydrate meters store from dashboard and restore selection
  if (dashboardStore.compteurs.length > 0) {
    metersStore.setAllMetersFromDashboard(dashboardStore.compteurs as any)
  }
  metersStore.restoreSelection()

  // Auto-select first meter if available
  if (validSelectedMeterIds.value.length > 0) {
    selectedMeterId.value = validSelectedMeterIds.value[0]
  }

  // Set default preset and fetch data
  await applyQuickPreset('todayYesterday')

  await nextTick()
  if (selectedMeterId.value) {
    await validateAndFetch()
  }
})
</script>

<style scoped>
/* Smooth transitions */
button:disabled {
  cursor: not-allowed;
}

/* Calendar grid spacing */
.grid-cols-7 {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
</style>
