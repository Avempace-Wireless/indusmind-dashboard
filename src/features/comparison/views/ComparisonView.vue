<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700 pb-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('comparison.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('comparison.subtitle') }}
          </p>
        </div>
        <div class="flex items-center justify-between w-full sm:w-auto">
          <button
            @click="showCompteurSelector = true"
            class="flex w-full sm:w-auto items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm self-start sm:self-auto"
          >
            <span class="material-symbols-outlined text-base">tune</span>
            {{ t('dashboard.manageMeters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Controls Section - Compact Meter Selection -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5 border-2 border-slate-300 dark:border-slate-600 mb-6">
      <div v-if="validSelectedMeterIds.length > 0" class="space-y-3">
        <!-- Header: Title + Manage Button -->
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {{ t('comparison.meters.title') }}
          </h3>

        </div>

        <!-- All Meters Pills - Grid Layout -->
        <div v-if="validSelectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-5">
          <button
            v-for="meterId in validSelectedMeterIds"
            :key="meterId"
            @click="toggleMeterVisibility(meterId)"
            :disabled="isLoading"
            :class="[
              'px-4 py-3 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-3 relative overflow-hidden',
              activeMeterIds.includes(meterId) || activeMeterIds.length === 0
                ? 'text-white shadow-lg scale-105 border-transparent'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50',
              isLoading ? 'opacity-60 cursor-not-allowed' : ''
            ]"
            :style="(activeMeterIds.includes(meterId) || activeMeterIds.length === 0) ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
          >
            <!-- Background gradient for non-active -->
            <div
              v-if="!activeMeterIds.includes(meterId) && activeMeterIds.length > 0"
              class="absolute inset-0 opacity-0 group-hover:opacity-5 transition"
              :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"
            />

            <!-- Content -->
            <span class="relative z-10">{{ getMeterName(meterId) }}</span>
          </button>
        </div>

        <!-- Info: Selected Count -->
        <div class="text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          {{ $t('comparison.meters.selected', { count: activeMeterIds.length === 0 ? validSelectedMeterIds.length : activeMeterIds.length }) }}
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
        <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
        <p class="text-sm">{{ t('comparison.meters.selectMeters') }}</p>
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

    <!-- Loading Bar (Top of content, like GlobalMetersView) -->
    <div v-if="isLoading && !hasLoadedOnce" class="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-cyan-200 dark:border-blue-900 rounded-xl p-4 shadow-md animate-fadeIn">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
          <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 dark:border-blue-700 border-t-cyan-600 dark:border-t-blue-400"></div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-cyan-600 dark:text-blue-400 text-lg">cloud_download</span>
            <h3 class="text-sm font-semibold text-cyan-900 dark:text-blue-100">{{ $t('common.loading') || 'Chargement des données...' }}</h3>
          </div>
          <p class="text-xs text-cyan-700 dark:text-blue-300">{{ $t('comparison.fetchingData') || 'Récupération des données de comparaison...' }}</p>
        </div>
        <div class="flex-shrink-0">
          <div class="flex items-center gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-blue-400 animate-pulse" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-blue-400 animate-pulse" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-blue-400 animate-pulse" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid: 65% Chart Area, 35% Controls -->
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <!-- Left Panel: Chart & Analysis Area (65%) -->
      <div class="xl:col-span-7 space-y-6">
        <div v-if="apiError" class="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center justify-between gap-3">
          <span>{{ t('comparison.errors.loadFailed') }}: {{ apiError }}</span>
          <button @click="fetchComparisonDataFromAPI()" class="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 transition-colors whitespace-nowrap">
            <span class="material-symbols-outlined text-sm align-middle mr-1">refresh</span>
            {{ t('common.retry') }}
          </button>
        </div>
        <div v-else-if="hasLoadedOnce && comparisonData.length === 0" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-12 text-center">
          <div class="flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">inbox</span>
            <div>
              <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">{{ t('comparison.empty.title') }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('comparison.empty.description') }}</p>
            </div>
          </div>
        </div>
        <!-- KPI Cards -->
        <div v-if="metersStore.selectedMeters.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            v-for="card in kpiCards"
            :key="card.label"
            class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 relative overflow-hidden group cursor-help"
            :title="card.tooltip || card.description || ''"
          >
            <!-- Loading Overlay with Spinner -->
            <div v-if="isLoading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ $t('common.loading') || 'Chargement' }}</p>
              </div>
            </div>

            <!-- Hidden tooltip shown on hover -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-md px-3 py-2 whitespace-nowrap z-20 pointer-events-none">
              {{ card.tooltip || card.description || '' }}
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>

            <div class="flex items-center justify-between mb-3">
              <span class="material-symbols-outlined text-2xl" :style="{ color: card.color }">{{ card.icon }}</span>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ card.label }}</p>
              <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ card.value }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ card.subtitle }}</p>


            </div>
          </div>
        </div>

        <!-- Main Comparison Chart -->
        <div v-if="metersStore.selectedMeters.length > 0" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 relative overflow-hidden">
          <!-- Loading Overlay with Spinner -->
          <div v-if="isLoading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
            <div class="flex flex-col items-center gap-3">
              <div class="animate-spin rounded-full h-10 w-10 border-3 border-slate-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400"></div>
              <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ $t('common.loading') || 'Chargement du graphique...' }}</p>
            </div>
          </div>
          <div v-if="!isLoading" class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t(`comparison.chartType.${chartType}`) }} - {{ t(`comparison.mode.${comparisonMode}`) }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ selectedMeters.length }} {{ t('comparison.kpi.items') }}
              </p>
              <p v-if="comparisonMode === 'byMeters'" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ t('comparison.periods.title') }}: <span class="font-medium text-gray-700 dark:text-gray-200">{{ activePeriodLabel }}</span>
              </p>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ t('comparison.periods.title') }}: <span class="font-medium text-gray-700 dark:text-gray-200">{{ aggregatedLabels.length }}</span>
              </p>
            </div>
            <button
              @click="exportToCSV"
              class="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition-colors"
            >
              <span class="material-symbols-outlined text-lg">file_download</span>
              {{ t('comparison.buttons.export') }}
            </button>
          </div>

          <!-- Chart Canvas -->
          <div class="relative" style="height: 400px;">
            <canvas v-if="chartType === 'bar' || chartType === 'line'" ref="chartCanvas"></canvas>

            <!-- Heatmap View -->
            <div v-if="chartType === 'heatmap'" class="h-full overflow-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800"></th>
                    <th
                      v-for="period in (comparisonMode === 'byMeters' ? selectedPeriods : [...new Set(comparisonData.map((d: ComparisonDataItem) => d.periodLabel || ''))])"
                      :key="period"
                      class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {{ period }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="meter in (activeMeterIds.length > 0 ? metersStore.selectedMeters.filter(m => activeMeterIds.includes(m.id)) : metersStore.selectedMeters)" :key="meter.id">
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {{ meter.name }}
                    </td>
                    <td
                      v-for="period in (comparisonMode === 'byMeters' ? selectedPeriods : [...new Set(comparisonData.map((d: ComparisonDataItem) => d.periodLabel || ''))])"
                      :key="`${meter.id}-${period}`"
                      class="border border-gray-300 dark:border-gray-600 p-2 text-center text-xs"
                      :style="{ backgroundColor: getHeatmapColor(meter.id, period) }"
                    >
                      {{ getHeatmapValue(meter.id, period) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Table View -->
            <div v-if="chartType === 'table'" class="h-full overflow-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {{ comparisonMode === 'byMeters' ? t('comparison.table.meter') : t('comparison.table.period') }}
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {{ t('comparison.table.value') }}
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {{ t('comparison.table.variance') }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="(row, rowIndex) in paginatedComparisonTable" :key="`${row.label}-${rowIndex}`">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {{ row.label }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {{ row.value }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right">
                      <span :class="row.variance > 0 ? 'text-green-600' : row.variance < 0 ? 'text-red-600' : 'text-gray-600'">
                        {{ row.varianceText }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="paginatedComparisonTable.length === 0">
                    <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      {{ t('comparison.table.noResults') }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="mt-3 flex flex-col gap-3 px-4 py-2 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
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
                    {{ t('comparison.table.pagination.page', { current: currentTablePage, total: totalTablePages }) }}
                  </span>
                  <button
                    @click="nextTablePage"
                    :disabled="currentTablePage === totalTablePages"
                    class="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ t('common.next') }} →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart Legend (Interactive) -->
          <div v-if="chartType === 'bar' || chartType === 'line'" class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              v-for="meterId in metersStoreSelectedIds"
              :key="meterId"
              @click="toggleMeterVisibility(meterId)"
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                activeMeterIds.includes(meterId) || activeMeterIds.length === 0
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ring-1 ring-offset-0 ring-transparent'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              ]"
            >
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"></span>
              <span class="truncate max-w-[12rem]">{{ getMeterName(meterId) }}</span>
            </button>
          </div>
        </div>

        <!-- Comparison Data Table -->
        <div v-if="metersStore.selectedMeters.length > 0 && chartType !== 'table'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex flex-col gap-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('comparison.table.detailed') }}</h3>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex flex-wrap items-center gap-3">
                  <div class="relative w-full sm:w-72">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">search</span>
                    <input
                      v-model="comparisonTableSearch"
                      type="text"
                      :placeholder="t('comparison.table.searchPlaceholder')"
                      :disabled="isLoading"
                      class="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <!-- Mobile view options placed near the table for better proximity -->
                <div class="flex flex-wrap gap-3 xl:hidden">
                  <label
                    v-for="option in (['showRanking', 'showVariance', 'highlightOutliers', 'showTrendArrows'] as const)"
                    :key="`mobile-${option}`"
                    class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      :checked="viewOptions[option]"
                      @change="toggleViewOption(option)"
                      class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{{ t(`comparison.viewOptions.${option}`) }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th v-if="viewOptions.showRanking" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {{ t('comparison.table.rank') }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {{ t('comparison.table.label') }}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {{ t('comparison.table.value') }}
                  </th>
                  <th v-if="viewOptions.showVariance" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {{ t('comparison.table.variance') }}
                  </th>
                  <th v-if="viewOptions.showTrendArrows" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {{ t('comparison.table.trend') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(row, rowIndex) in paginatedComparisonTable"
                  :key="`${row.label}-${rowIndex}`"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                  :class="{ 'bg-yellow-50 dark:bg-yellow-900/20': viewOptions.highlightOutliers && Math.abs(row.variance) > 20 }"
                >
                  <td v-if="viewOptions.showRanking" class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                      :style="{ backgroundColor: row.rank <= 3 ? ['#10b981', '#3b82f6', '#8b5cf6'][row.rank - 1] : '#6b7280' }"
                    >
                      {{ row.rank }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: row.color }"></span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ row.label }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                    {{ row.value }}
                  </td>
                  <td v-if="viewOptions.showVariance" class="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span :class="row.variance > 0 ? 'text-green-600' : row.variance < 0 ? 'text-red-600' : 'text-gray-600'">
                      {{ row.varianceText }}
                    </span>
                  </td>
                  <td v-if="viewOptions.showTrendArrows" class="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      class="material-symbols-outlined text-xl"
                      :class="{
                        'text-green-600': row.trend === 'up',
                        'text-red-600': row.trend === 'down',
                        'text-gray-600': row.trend === 'stable'
                      }"
                    >
                      {{ row.trend === 'up' ? 'trending_up' : row.trend === 'down' ? 'trending_down' : 'trending_flat' }}
                    </span>
                  </td>
                </tr>
                  <tr v-if="paginatedComparisonTable.length === 0">
                    <td :colspan="viewOptions.showRanking ? (viewOptions.showVariance && viewOptions.showTrendArrows ? 5 : viewOptions.showVariance || viewOptions.showTrendArrows ? 4 : 3) : (viewOptions.showVariance && viewOptions.showTrendArrows ? 4 : viewOptions.showVariance || viewOptions.showTrendArrows ? 3 : 2)" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {{ t('comparison.table.noResults') }}
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="mt-4 flex flex-col gap-3 px-6 py-3 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
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
                {{ t('comparison.table.pagination.page', { current: currentTablePage, total: totalTablePages }) }}
              </span>
              <button
                @click="nextTablePage"
                :disabled="currentTablePage === totalTablePages"
                class="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ t('common.next') }} →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Controls (35%) -->
      <div class="xl:col-span-3 space-y-6" :class="{ 'opacity-60 pointer-events-none': isLoading }">
        <!-- Comparison Mode Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.mode.title') }}</h3>

          <div class="space-y-2">
            <label
                v-for="mode in ['matrix', 'byMeters']"
              :key="mode"
              class="flex items-center gap-2 p-2 rounded-lg border transition-all"
              :class="[
                comparisonMode === mode
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <input
                type="radio"
                :value="mode"
                v-model="comparisonMode"
                @change="setComparisonMode(mode as any)"
                :disabled="isLoading"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div class="flex-1">
                <div class="text-xs font-medium text-gray-900 dark:text-white">
                  {{ t(`comparison.mode.${mode}`) }}
                </div>
              </div>
            </label>
          </div>
        </div>



        <!-- Period Selection -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('comparison.periods.title') }}</h3>
            <button v-if="selectedDates.length > 0" @click="clearDates" :disabled="isLoading" class="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
              {{ t('common.clear') }}
            </button>
          </div>

          <!-- Period Presets -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button
              v-for="preset in ['last7Days', 'last4Weeks', 'last3Months']"
              :key="preset"
              @click="selectPresetAndHideCalendar(preset)"
              :disabled="isLoading"
              :class="[
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                isPresetActive(preset)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              {{ t(`comparison.periods.presets.${preset}`) }}
            </button>
          </div>

          <!-- Selected Dates Info -->
          <div v-if="selectedDates.length > 0" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center justify-between">
              <div class="text-xs">
                <span class="font-semibold text-blue-900 dark:text-blue-100">
                  {{ t('comparison.periods.selected', { count: selectedDates.length }) }}
                </span>
                <div v-if="selectedDates.length > 1" class="text-blue-700 dark:text-blue-300 mt-1">
                  {{ t('comparison.periods.range', { start: selectedDates[0], end: selectedDates[selectedDates.length - 1] }) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-4">
            <button
              @click="prevMonth"
              :disabled="isLoading"
              class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ monthLabel }}
            </span>
            <button
              @click="nextMonth"
              :disabled="isLoading"
              class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="day.isCurrentMonth && day.date && !isLoading && toggleDate(day.date)"
              :disabled="!day.isCurrentMonth || isLoading"
              :class="[
                'aspect-square flex items-center justify-center text-xs rounded-md transition-all relative',
                isLoading ? 'cursor-not-allowed' : '',
                day.isCurrentMonth
                  ? day.isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : day.isToday
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : day.isSelected
                  ? 'bg-blue-500 text-white font-medium'
                  : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              ]"
            >
              {{ day.dateObj ? day.dateObj.getDate() : '' }}
            </button>
          </div>
        </div>

        <!-- Characteristics Selection -->
        <!-- Aggregation Level Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.aggregation.title') }}</h3>

          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="level in ['hourly', 'daily', 'weekly', 'monthly']"
              :key="level"
              @click="setAggregationLevel(level as any)"
              :disabled="isLoading"
              :class="[
                'px-2 py-1.5 text-xs font-medium rounded transition-colors',
                aggregationLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :title="t(`comparison.aggregation.${level}`)"
            >
              {{ t(`comparison.aggregation.short.${level}`) }}
            </button>
          </div>
        </div>

        <!-- Chart Type Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ t('comparison.chartType.title') }}</h3>

          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="type in ['bar', 'line', 'heatmap', 'table']"
              :key="type"
              @click="setChartType(type as any)"
              :disabled="isLoading"
              :class="[
                'p-2 rounded border-2 transition-all flex items-center justify-center',
                chartType === type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :title="t(`comparison.chartType.${type}`)"
            >
              <span class="material-symbols-outlined text-lg text-gray-700 dark:text-gray-300">
                {{ type === 'bar' ? 'bar_chart' : type === 'line' ? 'show_chart' : type === 'heatmap' ? 'grid_on' : 'table_chart' }}
              </span>
            </button>
          </div>
        </div>

        <!-- View Options -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ t('comparison.viewOptions.title') }}</h3>

          <div class="space-y-2">
            <label
              v-for="option in (['showRanking', 'showVariance', 'highlightOutliers', 'showTrendArrows'] as const)"
              :key="option"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="viewOptions[option]"
                @change="toggleViewOption(option)"
                class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-xs text-gray-700 dark:text-gray-300">
                {{ t(`comparison.viewOptions.${option}`) }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useMetersStore } from '@/stores/useMetersStore'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useComparisonStore } from '@/features/comparison/store/useComparisonStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { TimeUtils } from '@/utils/TimeUtils'
import { Chart, BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const { t, locale } = useI18n()
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()
const store = useComparisonStore()

// Use the same composable as DashboardView, PuissanceView, and EnergyHistorical for consistency
const {
  availableCompteurs: allCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Type definitions for comparison data
interface ComparisonDataItem {
  id?: string
  meterId?: string
  label?: string
  meterLabel?: string
  periodLabel?: string
  periodId?: string
  value: number
  color: string
}

interface ComparisonTableRow {
  rank: number
  label: string
  value: string
  variance: number
  varianceText: string
  trend: string
  color: string
}

// UI State
const showCompteurSelector = ref(false)

// Track which meters are visible/active in comparison
const activeMeterIds = ref<string[]>([])

function handleCompteurSelection(selectedIds: string[]) {
  // Update meters store with new selection
  metersStore.setSelectedMeters(selectedIds)

  // Initialize all selected meters as active
  activeMeterIds.value = [...selectedIds]

  showCompteurSelector.value = false

  // Trigger API fetch with new meter selection
  fetchComparisonDataFromAPI()
}

function toggleMeterVisibility(meterId: string) {
  const idx = activeMeterIds.value.indexOf(meterId)
  if (idx > -1) {
    // Remove from active list
    activeMeterIds.value.splice(idx, 1)
  } else {
    // Add to active list
    activeMeterIds.value.push(meterId)
  }
}

// Helper function to get meter name by ID
function getMeterName(meterId: string): string {
  const meter = allCompteurs.value.find(c => c.id === meterId)
  return meter?.name || 'Unknown'
}

const { selectedMeterIds: metersStoreSelectedIds } = storeToRefs(metersStore)

// Filter out any meter IDs that don't exist in allCompteurs (to avoid showing "Unknown")
const validSelectedMeterIds = computed(() => {
  return metersStoreSelectedIds.value.filter(meterId => {
    return allCompteurs.value.some(c => c.id === meterId)
  })
})

const {
  comparisonMode,
  selectedMeterIds,
  selectedPeriods,
  selectedDates,
  aggregationLevel,
  chartType,
  viewOptions,
  currentMonth,
  availableMeters,
  selectedMeters: comparisonStoreSelectedMeters,
  comparisonData,
  aggregatedLabels,
  expectedLabels,
  activePeriodLabel,
  kpiCards,
  comparisonTable,
  detailedTableMeters,
  detailedTableRows,
  calendarDays,
  isLoading,
  apiError,
  apiTimeSeriesData,
  apiKPIsData,
  apiSummaryData,
  apiMeta,
  hasLoadedOnce,
} = storeToRefs(store)

// Use metersStore as the source of truth for selected meters
const selectedMeters = computed(() => metersStore.selectedMeters)

const {
  toggleMeter,
  selectAllMeters,
  setComparisonMode,
  setChartType,
  setAggregationLevel,
  toggleViewOption,
  selectPeriodPreset,
  toggleDate,
  clearDates,
  prevMonth,
  nextMonth,
  goToToday,
  resetFilters,
  exportToCSV,
  getMeterColor,
  fetchComparisonDataFromAPI
} = store

// Custom period selection state
const showCustomCalendar = ref(false)

// Pagination state for Comparison table
const currentTablePage = ref(1)
const itemsPerPage = ref(5)
const rowsPerPageOptions = [5, 10, 15, 20]
const comparisonTableSearch = ref('')
const effectiveItemsPerPage = computed(() => {
  const value = Number(itemsPerPage.value)
  return Number.isFinite(value) && value > 0 ? value : 5
})

const filteredComparisonTable = computed(() => {
  const query = comparisonTableSearch.value.trim().toLowerCase()
  let filtered = comparisonTable.value

  // Only filter by activeMeterIds in byMeters mode
  // In matrix mode, all periods should be shown (activeMeterIds controls visualization, not table filtering)
  if (comparisonMode.value === 'byMeters' && activeMeterIds.value.length > 0) {
    filtered = filtered.filter((row: ComparisonTableRow) => {
      return activeMeterIds.value.some(id => row.label.includes(getMeterName(id)))
    })
  }

  if (query) {
    filtered = filtered.filter((row: ComparisonTableRow) => {
      const labelMatch = row.label.toLowerCase().includes(query)
      const valueMatch = row.value.toLowerCase().includes(query)
      const varianceMatch = row.varianceText.toLowerCase().includes(query)
      return labelMatch || valueMatch || varianceMatch
    })
  }

  // Always keep results sorted by value (desc) after filtering
  return [...filtered].sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
})

const tableRange = computed(() => {
  if (filteredComparisonTable.value.length === 0) {
    return { start: 0, end: 0, total: 0 }
  }
  const start = (currentTablePage.value - 1) * effectiveItemsPerPage.value + 1
  const end = start + paginatedComparisonTable.value.length - 1
  return { start, end, total: filteredComparisonTable.value.length }
})

const totalTablePages = computed(() => {
  return Math.max(1, Math.ceil(filteredComparisonTable.value.length / effectiveItemsPerPage.value))
})

const paginatedComparisonTable = computed(() => {
  const start = (currentTablePage.value - 1) * effectiveItemsPerPage.value
  const end = start + effectiveItemsPerPage.value
  return filteredComparisonTable.value.slice(start, end)
})

function prevTablePage() {
  if (currentTablePage.value > 1) currentTablePage.value--
}

function nextTablePage() {
  if (currentTablePage.value < totalTablePages.value) currentTablePage.value++
}

watch([comparisonTableSearch, comparisonTable, comparisonMode, activeMeterIds, itemsPerPage], () => {
  currentTablePage.value = 1
})

watch(totalTablePages, (pageCount) => {
  if (currentTablePage.value > pageCount) {
    currentTablePage.value = pageCount
  }
})

// Calendar weekdays
const weekDays = computed(() => [
  t('energyHistory.calendar.weekdays.mon'),
  t('energyHistory.calendar.weekdays.tue'),
  t('energyHistory.calendar.weekdays.wed'),
  t('energyHistory.calendar.weekdays.thu'),
  t('energyHistory.calendar.weekdays.fri'),
  t('energyHistory.calendar.weekdays.sat'),
  t('energyHistory.calendar.weekdays.sun')
])

const monthLabel = computed(() => {
  const localeCode = locale.value === 'en' ? 'en-US' : 'fr-FR'
  const month = currentMonth.value.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' })
  return month.charAt(0).toUpperCase() + month.slice(1)
})

function selectPresetAndHideCalendar(preset: string) {
  selectPeriodPreset(preset)
  showCustomCalendar.value = false
}

function toggleCustomCalendar() {
  showCustomCalendar.value = !showCustomCalendar.value
}

// Preset helpers for active state
const toLocalDateStr = (ts: number) => TimeUtils.toLocalDateStr(ts)

function presetDatesFor(preset: string): string[] {
  const today = new Date()
  const dates: string[] = []
  switch (preset) {
    case 'last7Days':
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dates.push(toLocalDateStr(d.getTime()))
      }
      break
    case 'last4Weeks':
      for (let i = 27; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dates.push(toLocalDateStr(d.getTime()))
      }
      break
    case 'last3Months': {
      const start3m = new Date(today)
      start3m.setMonth(start3m.getMonth() - 3)
      const totalDays3m = Math.round((today.getTime() - start3m.getTime()) / 86400000)
      for (let i = totalDays3m; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dates.push(toLocalDateStr(d.getTime()))
      }
      break
    }
    default:
      dates.push(toLocalDateStr(today.getTime()))
  }
  return dates
}

function isPresetActive(preset: string): boolean {
  const expected = presetDatesFor(preset).sort()
  const current = [...selectedDates.value].sort()
  if (expected.length !== current.length) return false
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] !== current[i]) return false
  }
  return true
}

// Toggle selection using metersStore as source of truth
function toggleMeterSelection(meterId: string) {
  const current = [...metersStoreSelectedIds.value]
  const idx = current.indexOf(meterId)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(meterId)
  }
  metersStore.setSelectedMeters(current)
}

// Select-all using central store and keep active list in sync
function selectAllMetersUI() {
  const allIds = allCompteurs.value.map(c => c.id)
  handleCompteurSelection(allIds)
}

// Chart instance
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Initialize chart
function initChart() {
  if (!chartCanvas.value || chartType.value === 'heatmap' || chartType.value === 'table') return
  if (isLoading.value || comparisonData.value.length === 0) {
    console.log('[ComparisonView] initChart skipped: loading=%s, dataLength=%d', isLoading.value, comparisonData.value.length)
    return
  }

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (comparisonMode.value === 'byMeters') {
    // Filter data based on active meters (match by id, meterId, OR deviceUUID)
    const visibleData = activeMeterIds.value.length > 0
      ? comparisonData.value.filter((d: ComparisonDataItem) => {
          const did = d.meterId || d.id || ''
          const dUUID = (d as any).deviceUUID || ''
          // Match if the Compteur ID is in activeMeterIds, OR if the deviceUUID matches
          // any active meter's deviceUUID
          return activeMeterIds.value.includes(did) ||
            activeMeterIds.value.some(activeId => {
              const m = allCompteurs.value.find(c => c.id === activeId)
              return m?.deviceUUID === dUUID
            })
        })
      : comparisonData.value

    // One bar/point per meter with different colors
    const labels = visibleData.map((d: ComparisonDataItem) => d.label || d.meterLabel || '')
    const data = visibleData.map((d: ComparisonDataItem) => d.value)
    const colors = visibleData.map((d: ComparisonDataItem) => metersStore.getMeterColor((d.id || d.meterId) as string))

    chartInstance = new Chart(ctx, {
      type: chartType.value === 'bar' ? 'bar' : 'line',
      data: {
        labels,
        datasets: [{
          label: 'Value (kWh)',
          data,
          backgroundColor: chartType.value === 'bar' ? colors : colors.map(c => c + '40'),
          borderColor: colors,
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y
                return value !== null ? `${value.toFixed(2)} kWh` : '0.00 kWh'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'kWh'
            }
          }
        }
      }
    })
  } else {
    // byPeriods or matrix: Multiple lines/bars - one per meter across periods
    // Use expectedLabels to include ALL selected dates, even those with no data
    const labels = expectedLabels.value.length > 0
      ? expectedLabels.value
      : [...new Set(comparisonData.value.map((d: ComparisonDataItem) => (d.periodLabel || d.label || d.periodId || '')))].sort().filter((l: string) => l !== '')

    // Filter meters based on active selection
    const metersToShow = activeMeterIds.value.length > 0
      ? selectedMeters.value.filter(m => activeMeterIds.value.includes(m.id))
      : selectedMeters.value

    // Debug logging
    console.log('Chart byPeriods/Matrix mode:', {
      mode: comparisonMode.value,
      dataLength: comparisonData.value.length,
      metersCount: metersToShow.length,
      labelsCount: labels.length,
      expectedLabelsCount: expectedLabels.value.length,
      labels,
      expectedLabels: expectedLabels.value,
      sampleData: comparisonData.value.slice(0, 5)
    })

    const datasets = metersToShow.map(meter => {
      const meterData = labels.map((label: string) => {
        const item = comparisonData.value.find((d: ComparisonDataItem) => {
          // Match by Compteur ID (preferred) OR by deviceUUID fallback
          const idMatch = d.meterId === meter.id || d.id === meter.id ||
            (d as any).deviceUUID === (meter as any).deviceUUID
          const periodMatch = d.periodLabel === label || d.periodId === label || d.label === label
          return idMatch && periodMatch
        })
        return item ? item.value : 0
      })

      const color = metersStore.getMeterColor(meter.id)
      return {
        label: meter.name,
        data: meterData,
        backgroundColor: chartType.value === 'bar' ? color : color + '40',
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointBorderWidth: 2,
        fill: false
      }
    })

    chartInstance = new Chart(ctx, {
      type: chartType.value === 'bar' ? 'bar' : 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y
                return `${context.dataset.label}: ${value !== null ? value.toFixed(2) : '0.00'} kWh`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'kWh'
            }
          }
        }
      }
    })
  }
}

// Heatmap helpers
function getHeatmapValue(meterId: string, period: string): string {
  const item = comparisonData.value.find((d: ComparisonDataItem) =>
    (d.meterId === meterId && d.periodId === period) ||
    (d.id === meterId && d.label === period)
  )
  return item ? item.value.toFixed(2) : '0.00'
}

function getHeatmapColor(meterId: string, period: string): string {
  const value = parseFloat(getHeatmapValue(meterId, period))
  const max = Math.max(...comparisonData.value.map((d: ComparisonDataItem) => d.value))
  const min = Math.min(...comparisonData.value.map((d: ComparisonDataItem) => d.value))
  const normalized = (value - min) / (max - min)

  // Color gradient from blue (low) to red (high)
  const r = Math.round(normalized * 255)
  const b = Math.round((1 - normalized) * 255)
  return `rgba(${r}, 100, ${b}, 0.3)`
}

// Debounced chart init to handle multiple rapid changes
let chartInitTimer: ReturnType<typeof setTimeout> | null = null

function scheduleChartInit() {
  if (chartInitTimer) clearTimeout(chartInitTimer)
  chartInitTimer = setTimeout(async () => {
    await nextTick() // ensure DOM is up to date
    initChart()
  }, 200)
}

// Watch for changes
watch([chartType, comparisonMode, comparisonData, selectedMeters], () => {
  if (chartType.value === 'bar' || chartType.value === 'line') {
    scheduleChartInit()
  }
}, { deep: true })

// Re-fetch data when aggregation level changes
watch(aggregationLevel, () => {
  fetchComparisonDataFromAPI()
})

// Watch for changes to selected meters and update active list
watch(metersStoreSelectedIds, (newIds) => {
  // If new meters were added to selection, add them to active list
  const newMeters = newIds.filter(id => !activeMeterIds.value.includes(id))
  if (newMeters.length > 0) {
    activeMeterIds.value.push(...newMeters)
  }

  // If meters were removed from selection, remove them from active list
  activeMeterIds.value = activeMeterIds.value.filter(id => newIds.includes(id))
}, { deep: true })

// Re-init chart when active meters change
watch(activeMeterIds, () => {
  if (chartType.value === 'bar' || chartType.value === 'line') {
    scheduleChartInit()
  }
}, { deep: true })

onMounted(async () => {
  // Load meters from backend (required for comparison)
  await dashboardStore.loadCompteurs()
  metersStore.setAllMetersFromCompteurs(dashboardStore.compteurs)

  // Restore and clean up any invalid meter IDs from localStorage
  metersStore.restoreSelection()

  // Initialize compteur selection (syncs with all other views)
  await initializeCompteurSelection()

  // Initialize store data if needed
  if (metersStoreSelectedIds.value.length === 0) {
    selectAllMeters()
  }

  // Initialize active meter IDs to match selected meters
  activeMeterIds.value = [...metersStoreSelectedIds.value]

  if (selectedPeriods.value.length === 0 && selectedDates.value.length === 0) {
    selectPeriodPreset('last7Days')
  }

  // Fetch real data from API
  await fetchComparisonDataFromAPI()

  // Chart init is handled by the watcher on comparisonData (scheduleChartInit)
})

// Re-fetch data when selected dates change
watch(selectedDates, () => {
  if (hasLoadedOnce.value) {
    fetchComparisonDataFromAPI()
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (chartInitTimer) clearTimeout(chartInitTimer)
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
/* Component-specific styles */
</style>
