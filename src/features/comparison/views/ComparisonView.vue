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

    <!-- Meter Selection Section -->
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-lg p-5 border-2 border-blue-200 dark:border-blue-700 mb-6">
      <div v-if="validSelectedMeterIds.length > 0" class="space-y-3">
        <h3 class="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">compare</span>
          {{ t('comparison.meters.title') }}
        </h3>

        <!-- Meters Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            v-for="meterId in validSelectedMeterIds"
            :key="meterId"
            @click="toggleMeterActive(meterId)"
            :class="[
              'px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 border-2 flex items-center justify-center gap-2 relative overflow-hidden',
              activeMeterIds.includes(meterId) || activeMeterIds.length === 0
                ? 'text-white shadow-lg border-transparent'
                : 'border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-blue-900/40'
            ]"
            :style="(activeMeterIds.includes(meterId) || activeMeterIds.length === 0) ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
          >
            <span v-if="activeMeterIds.includes(meterId) || activeMeterIds.length === 0" class="material-symbols-outlined text-sm">check_circle</span>
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
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-6" :class="{ 'opacity-60 pointer-events-none': isLoading && !hasLoadedOnce }">
      <!-- Left Panel: Comparison Charts (70%) -->
      <div class="xl:col-span-7 space-y-6">
        <!-- Error State -->
        <div v-if="apiError" class="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center justify-between gap-3">
          <span>{{ t('comparison.errors.loadFailed') }}: {{ apiError }}</span>
          <button @click="refreshData()" class="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 transition-colors whitespace-nowrap">
            <span class="material-symbols-outlined text-sm align-middle mr-1">refresh</span>
            {{ t('common.retry') }}
          </button>
        </div>

        <!-- Empty State: No meters -->
        <div v-if="!isLoading && visibleMeters.length === 0" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-12 text-center">
          <div class="flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">compare_arrows</span>
            <div>
              <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">{{ t('comparison.empty.title') }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ t('comparison.empty.description') }}</p>
            </div>
          </div>
        </div>

        <!-- Unified Meter Comparison Chart -->
        <div v-if="visibleMeters.length >= 1" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('comparison.charts.unified', { granularity: granularityLabel, count: visibleMeters.length }) }}
            </h3>

          </div>

          <!-- Single Unified Chart -->
          <div class="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30" style="height: 450px;">
            <!-- Loading Overlay -->
            <div v-if="isChartVisualization && isLoading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
              <div class="flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-8 w-8 border-3 border-cyan-200 dark:border-blue-700 border-t-cyan-600 dark:border-t-blue-400"></div>
                <p class="text-sm text-slate-600 dark:text-slate-300 font-medium">{{ t('common.loading') }}</p>
              </div>
            </div>
            <!-- Error State -->
            <div v-if="isChartVisualization && !isLoading && apiError" class="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 z-20">
              <span class="material-symbols-outlined text-5xl mb-3 text-red-400 opacity-50">error</span>
              <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ t('common.error') }}</p>
              <p class="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs text-center">{{ apiError }}</p>
              <button
                @click="refreshData"
                class="mt-3 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition"
              >
                {{ t('common.retry') }}
              </button>
            </div>
            <!-- Empty State -->
            <div v-if="isChartVisualization && !isLoading && !apiError && !hasChartData" class="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
              <!-- Need another meter -->
              <div v-if="visibleMeters.length === 1" class="flex flex-col items-center px-6">
                <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-3">compare_arrows</span>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('comparison.charts.selectOtherMeter') }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('comparison.charts.selectPeriod') }}</p>
              </div>
              <!-- Pending state: dates selected but not confirmed -->
              <div v-else-if="selectedDates.length > 0 && !hasLoadedOnce" class="flex flex-col items-center px-6">
                <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-3">bar_chart</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {{ selectedDates.length }} {{ selectedDates.length === 1 ? t('energyHistory.calendar.day') : t('energyHistory.calendar.days') }}
                  <span class="font-normal">·</span>
                  {{ selectedDates[0] }}<span v-if="selectedDates.length > 1"> → {{ selectedDates[selectedDates.length - 1] }}</span>
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ t('energyHistory.emptyState.clickButton') }}</p>
                <button
                  @click="validateAndFetch"
                  :disabled="isLoading"
                  :class="[
                    'px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2',
                    isLoading
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  ]"
                >
                  <span v-if="isLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-base">query_stats</span>
                  {{ t('comparison.calendar.fetchData') }}
                </button>
              </div>

              <!-- No dates selected -->
              <div v-else-if="selectedDates.length === 0" class="flex flex-col items-center px-6">
                <span class="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-3">calendar_today</span>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('comparison.charts.selectPeriod') }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('energyHistory.emptyState.selectDateHint') }}</p>
              </div>

              <!-- No data available -->
              <div v-else class="flex flex-col items-center">
                <span class="material-symbols-outlined text-4xl mb-3 text-gray-400 dark:text-gray-500">bar_chart</span>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('energyHistory.emptyState.noData') }}</p>
              </div>
            </div>

            <!-- Bar/Line Chart Canvas -->
            <canvas v-if="chartType === 'bar' || chartType === 'line'" ref="unifiedChartCanvas"></canvas>

            <!-- Heatmap View -->
            <div v-if="chartType === 'heatmap' && hasChartData" class="h-full overflow-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800"></th>
                    <th
                      v-for="period in heatmapPeriods"
                      :key="period"
                      class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {{ period }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="meter in visibleSortedMeters" :key="meter.id">
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {{ meter.name }}
                    </td>
                    <td
                      v-for="period in heatmapPeriods"
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
            <div v-if="chartType === 'table' && hasChartData" class="h-full overflow-auto">
              <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {{ t('comparison.table.meter') }}
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
                      <span
                        :class="row.variance > 0 ? 'text-green-600' : row.variance < 0 ? 'text-red-600' : 'text-gray-600'"
                        :title="row.varianceTooltip"
                        class="cursor-help"
                      >
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
          </div>

          <!-- Meter Totals Summary -->
          <div class="mt-6 grid gap-3" :class="visibleMeters.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'">
            <div v-for="meter in visibleMeters" :key="meter.id" class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: metersStore.getMeterColor(meter.id) }"></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ meter.name }}</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">{{ meter.totalConsumption.toFixed(2) }} kWh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Calendar & Controls (30%) -->
      <div class="xl:col-span-3 space-y-6">
        <!-- Chart Type Selection -->
        <div class="order-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4" :class="{ 'opacity-60 pointer-events-none': isLoading }">
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

        <!-- Calendar & Date Selection -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.periods.title') }}</h3>

          <!-- Period Presets -->
          <div class="grid grid-cols-3 gap-1.5 mb-3">
            <button
              v-for="preset in ['last7Days', 'last4Weeks', 'last3Months']"
              :key="preset"
              @click="selectPreset(preset)"
              :disabled="isLoading"
              :class="[
                'py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                activePeriodPreset === preset
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ t(`comparison.periods.presets.${preset}`) }}
            </button>
          </div>

          <!-- Selected Range Display -->
          <div v-if="selectedDates.length > 0" class="flex items-center justify-between mb-3 text-xs">
            <span class="font-medium text-blue-700 dark:text-blue-300 truncate">
              {{ t('comparison.periods.selected', { count: selectedDates.length }) }}
              <span v-if="selectedDates.length > 1" class="text-gray-400 ml-1">· {{ selectedDates[0] }} → {{ selectedDates[selectedDates.length - 1] }}</span>
            </span>
            <button @click="clearDates" class="ml-2 shrink-0 text-red-500 hover:text-red-700 flex items-center gap-0.5">
              <span class="material-symbols-outlined text-sm leading-none">close</span>
            </button>
          </div>

          <!-- Fetch Button -->
          <button
            @click="validateAndFetch"
            :disabled="isLoading || visibleMeters.length < 2"
            :class="[
              'w-full py-2 px-4 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 mb-3',
              isLoading || visibleMeters.length < 2
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            ]"
          >
            <span v-if="isLoading" class="material-symbols-outlined text-base animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-base">query_stats</span>
            {{ isLoading ? t('comparison.fetchingData') : t('comparison.calendar.fetchData') }}
          </button>

          <!-- Divider -->
          <div class="border-t border-gray-200 dark:border-gray-700 mb-3"></div>

          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-2">
            <button @click="prevMonth" :disabled="isLoading" class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50">
              <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ monthLabel }}</span>
            <button @click="nextMonth" :disabled="isLoading" class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50">
              <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          <!-- Week Days Headers -->
          <div class="grid grid-cols-7 gap-0.5 mb-0.5">
            <div v-for="day in weekDays" :key="day" class="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 gap-0.5">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="day.date && !isLoading && toggleDate(day.date)"
              @mousedown="day.date && !isLoading && startDrag(day.date)"
              @mouseover="isDragging && !isLoading && day.date && onDragOver(day.date)"
              @mouseup="endDrag"
              :disabled="!day.date || isLoading"
              :class="[
                'aspect-square flex items-center justify-center text-[11px] rounded transition-all relative',
                day.isSelected && day.date && interiorSelectedDates.has(day.date)
                  ? 'text-gray-700 dark:text-gray-300'
                  : day.isCurrentMonth
                  ? day.isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : day.isToday
                    ? 'text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-300 dark:ring-blue-700'
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


      </div>
    </div>

    <!-- Full Width Comparison Table -->
    <div v-if="!isLoading && hasLoadedOnce && selectedDates.length > 0 && visibleMeters.length >= 2" class="mt-6">
      <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('comparison.table.detailed') }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ t(`comparison.table.subtitle.${effectiveResolution}`) }}
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
                  {{ effectiveResolution === 'hourly' ? t('energyHistory.table.columns.hour') : t('energyHistory.table.columns.date') }}
                </th>
                <template v-for="meter in visibleMeters" :key="meter.id">
                  <th colspan="3" class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider bg-gray-50 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600" :style="{ color: metersStore.getMeterColor(meter.id) }">
                    {{ meter.name }}
                  </th>
                </template>
              </tr>
              <tr>
                <th class="sticky left-0 bg-gray-50 dark:bg-gray-800 z-10"></th>
                <template v-for="meter in visibleMeters" :key="`sub-${meter.id}`">
                  <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right bg-gray-50 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600">
                    {{ t('comparison.table.value') }}
                  </th>
                  <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right bg-gray-50 dark:bg-gray-800">
                    {{ t('comparison.table.variance') }}
                  </th>
                  <th class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center bg-gray-50 dark:bg-gray-800">
                    {{ t('comparison.table.trend') }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="row in paginatedTableRows"
                :key="row.timeLabel"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                  {{ row.timeLabel }}
                </td>
                <template v-for="meter in visibleMeters" :key="meter.id">
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium border-l border-gray-200 dark:border-gray-700">
                    {{ row.values[meter.id]?.value?.toFixed(2) || '—' }} <span class="text-xs text-gray-500">kWh</span>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-right" :class="{
                    'text-green-600 dark:text-green-400': row.values[meter.id]?.variance < -5,
                    'text-gray-600 dark:text-gray-400': row.values[meter.id]?.variance >= -5 && row.values[meter.id]?.variance <= 5,
                    'text-red-600 dark:text-red-400': row.values[meter.id]?.variance > 5
                  }">
                    <span class="cursor-help relative group/tip">
                      {{ row.values[meter.id]?.varianceText || '—' }}
                      <span v-if="row.values[meter.id]?.varianceTooltip" class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/tip:block whitespace-nowrap rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 shadow-xl z-50">
                        {{ row.values[meter.id]?.varianceTooltip }}
                      </span>
                    </span>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm text-center">
                    <div v-if="row.values[meter.id]?.trend" class="flex items-center justify-center gap-1">
                      <span class="material-symbols-outlined text-base cursor-help relative group/trend" :class="{
                        'text-red-500': row.values[meter.id].trend === 'up',
                        'text-green-500': row.values[meter.id].trend === 'down',
                        'text-gray-400': row.values[meter.id].trend === 'stable'
                      }">
                        {{ row.values[meter.id].trend === 'up' ? 'trending_up' : row.values[meter.id].trend === 'down' ? 'trending_down' : 'trending_flat' }}
                        <span v-if="row.values[meter.id]?.trendTooltip" class="pointer-events-none absolute bottom-full right-0 mb-3 hidden group-hover/trend:block whitespace-nowrap rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-100 shadow-xl z-50 not-italic" style="font-family: system-ui, sans-serif">
                          {{ row.values[meter.id]?.trendTooltip }}
                        </span>
                      </span>
                      <span class="text-xs" :class="{
                        'text-red-600 dark:text-red-400': row.values[meter.id].trend === 'up',
                        'text-green-600 dark:text-green-400': row.values[meter.id].trend === 'down',
                        'text-gray-500 dark:text-gray-400': row.values[meter.id].trend === 'stable'
                      }">
                        {{ row.values[meter.id].trendText }}
                      </span>
                    </div>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                </template>
              </tr>
              <tr v-if="paginatedTableRows.length === 0">
                <td :colspan="1 + (visibleMeters.length * 3)" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {{ t('comparison.table.noResults') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col gap-3 px-6 py-3 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-3">
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

// Meter selection & visibility
const activeMeterIds = ref<string[]>([])
const validSelectedMeterIds = computed(() => {
  return metersStoreSelectedIds.value.filter((id: string) => allCompteurs.value.some((c: any) => c.id === id))
})

const visibleMeters = computed(() => {
  const meterIds = activeMeterIds.value.length > 0 ? activeMeterIds.value : validSelectedMeterIds.value
  return allCompteurs.value
    .filter((m: any) => meterIds.includes(m.id))
    .map((m: any) => ({
      id: m.id,
      name: m.name || 'Unknown',
      deviceUUID: m.deviceUUID || m.id,
      totalConsumption: 0
    }))
})

// Calendar & Date Selection
const currentMonth = ref(new Date())
const selectedDates = ref<string[]>([])
const isDragging = ref(false)
const dragStart = ref<string | null>(null)
const interiorSelectedDates = computed(() => {
  if (selectedDates.value.length < 3) return new Set<string>()

  const sorted = [...selectedDates.value].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const interior = new Set<string>()

  for (const date of sorted) {
    if (date !== first && date !== last) interior.add(date)
  }

  return interior
})
const activePeriodPreset = ref<string | null>(null)

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
const hasLoadedOnce = ref(false)

// Comparison data
const comparisonData = ref<Map<string, any[]>>(new Map())
const unifiedChartCanvas = ref<HTMLCanvasElement | null>(null)
const unifiedChart = ref<any>(null)
const chartType = ref<'bar' | 'line' | 'table' | 'heatmap'>('bar')

// Table configuration
const currentTablePage = ref(1)
const itemsPerPage = ref(25)
const rowsPerPageOptions = [10, 25, 50, 100]

// ============ Computed Properties ============

const effectiveResolution = computed(() => {
  if (selectedDates.value.length === 0) return 'daily'
  return selectedDates.value.length <= 3 ? 'hourly' : 'daily'
})

const granularityLabel = computed(() => {
  return effectiveResolution.value === 'hourly' ? t('common.hourly') : t('common.daily')
})

const weekDays = computed(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

const monthLabel = computed(() => {
  const localeCode = locale.value === 'en' ? 'en-US' : 'fr-FR'
  const month = currentMonth.value.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' })
  return month.charAt(0).toUpperCase() + month.slice(1)
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ dateObj: null, date: null, isCurrentMonth: false, isSelected: false, isToday: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day)
    dateObj.setHours(0, 0, 0, 0)
    const dateStr = formatLocalDate(dateObj)
    const isSelected = selectedDates.value.includes(dateStr)
    const isToday = dateObj.getTime() === today.getTime()

    days.push({
      dateObj,
      date: dateStr,
      isCurrentMonth: true,
      isSelected,
      isToday
    })
  }

  return days
})

const tableRows = computed(() => {
  const rows: any[] = []
  const firstMeterData = comparisonData.value.get(visibleMeters.value[0]?.deviceUUID || '')

  if (!firstMeterData) return rows

  // Calculate average for each meter (for variance calculation)
  const meterAverages = new Map<string, number>()
  for (const meter of visibleMeters.value) {
    const meterData = comparisonData.value.get(meter.deviceUUID) || []
    if (meterData.length > 0) {
      const total = meterData.reduce((sum, p) => sum + (p.value || 0), 0)
      meterAverages.set(meter.id, total / meterData.length)
    }
  }

  // Build rows for each time period
  for (const point of firstMeterData) {
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : new Date(point.timestamp).toLocaleDateString('en-US')

    const values: Record<string, any> = {}
    for (const meter of visibleMeters.value) {
      const meterData = comparisonData.value.get(meter.deviceUUID) || []
      const matchingPoint = meterData.find(p => p.timestamp === point.timestamp)

      if (matchingPoint) {
        const value = matchingPoint.value || 0
        const avg = meterAverages.get(meter.id) || 0

        // Calculate variance: (value - avg) / avg × 100
        const variance = avg !== 0 ? ((value - avg) / avg) * 100 : 0
        const varianceText = `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`
        const varianceTooltip = t('comparison.kpi.varianceFormula', {
          value: value.toFixed(2),
          avg: avg.toFixed(2),
          result: variance.toFixed(1)
        })

        // Calculate trend: compare to previous period
        const currentIndex = meterData.findIndex(p => p.timestamp === point.timestamp)
        let trend: 'up' | 'down' | 'stable' = 'stable'
        let trendPct = 0
        let prevDateLabel = ''
        let prevValue = 0

        if (currentIndex > 0) {
          prevValue = meterData[currentIndex - 1].value || 0
          if (prevValue !== 0) {
            trendPct = ((value - prevValue) / prevValue) * 100
            trend = trendPct > 2 ? 'up' : trendPct < -2 ? 'down' : 'stable'
          }
          const prevTimestamp = meterData[currentIndex - 1].timestamp
          prevDateLabel = effectiveResolution.value === 'hourly'
            ? new Date(prevTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : new Date(prevTimestamp).toLocaleDateString('en-US')
        }

        const trendText = currentIndex > 0 ? `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}%` : '—'
        const trendTooltip = currentIndex > 0
          ? t('comparison.kpi.trendFormula', {
              prevDate: prevDateLabel,
              value: value.toFixed(2),
              prevValue: prevValue.toFixed(2),
              result: `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}`
            })
          : t('comparison.kpi.noPreviousPeriod')

        values[meter.id] = {
          value,
          variance,
          varianceText,
          varianceTooltip,
          trend,
          trendPct,
          trendText,
          trendTooltip
        }
      }
    }

    rows.push({ timeLabel, timestamp: point.timestamp, values })
  }

  return rows.sort((a, b) => a.timestamp - b.timestamp)
})

const paginatedTableRows = computed(() => {
  const start = (currentTablePage.value - 1) * itemsPerPage.value
  return tableRows.value.slice(start, start + itemsPerPage.value)
})

const totalTablePages = computed(() => {
  return Math.ceil(tableRows.value.length / itemsPerPage.value) || 1
})

const totalDataPoints = computed(() => {
  return tableRows.value.length * visibleMeters.value.length
})

const hasChartData = computed(() => {
  if (!hasLoadedOnce.value) return false

  for (const meter of visibleMeters.value) {
    const meterData = comparisonData.value.get(meter.deviceUUID)
    if (meterData && meterData.length > 0) return true
  }

  return false
})

const isChartVisualization = computed(() => {
  return chartType.value === 'bar' || chartType.value === 'line'
})

// Simplified comparison table for table chart type
const comparisonTable = computed(() => {
  const table: Array<{ label: string; value: string; variance: number; varianceText: string; varianceTooltip: string }> = []

  for (const meter of visibleMeters.value) {
    const meterData = comparisonData.value.get(meter.deviceUUID) || []
    if (meterData.length === 0) continue

    // Calculate average for variance
    const total = meterData.reduce((sum, p) => sum + (p.value || 0), 0)
    const avg = total / meterData.length

    for (const point of meterData) {
      const value = point.value || 0
      const variance = avg !== 0 ? ((value - avg) / avg) * 100 : 0
      const timeLabel = effectiveResolution.value === 'hourly'
        ? new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        : new Date(point.timestamp).toLocaleDateString('en-US')

      table.push({
        label: `${meter.name} - ${timeLabel}`,
        value: `${value.toFixed(2)} kWh`,
        variance,
        varianceText: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`,
        varianceTooltip: t('comparison.kpi.varianceFormula', {
          value: value.toFixed(2),
          avg: avg.toFixed(2),
          result: variance.toFixed(1)
        })
      })
    }
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

// Heatmap data structure: meters as rows, periods as columns
const visibleSortedMeters = computed(() => {
  return [...visibleMeters.value].sort((a, b) => a.name.localeCompare(b.name))
})

const heatmapPeriods = computed(() => {
  // Get unique periods from the data
  const periods = new Set<string>()
  for (const meter of visibleMeters.value) {
    const meterData = comparisonData.value.get(meter.deviceUUID) || []
    for (const point of meterData) {
      const timeLabel = effectiveResolution.value === 'hourly'
        ? new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        : new Date(point.timestamp).toLocaleDateString('en-US')
      periods.add(timeLabel)
    }
  }
  return Array.from(periods).sort()
})

// ============ Methods ============

function getMeterName(meterId: string): string {
  const meter = allCompteurs.value.find((m: any) => m.id === meterId)
  return meter?.name || 'Unknown'
}

function getHeatmapValue(meterId: string, period: string): string {
  const meter = visibleMeters.value.find(m => m.id === meterId)
  if (!meter) return '—'

  const meterData = comparisonData.value.get(meter.deviceUUID) || []
  const point = meterData.find(p => {
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(p.timestamp).toLocaleDateString('en-US')
    return timeLabel === period
  })

  return point ? `${(point.value || 0).toFixed(2)}` : '—'
}

function getHeatmapColor(meterId: string, period: string): string {
  const meter = visibleMeters.value.find(m => m.id === meterId)
  if (!meter) return 'transparent'

  const meterData = comparisonData.value.get(meter.deviceUUID) || []
  const point = meterData.find(p => {
    const timeLabel = effectiveResolution.value === 'hourly'
      ? new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : new Date(p.timestamp).toLocaleDateString('en-US')
    return timeLabel === period
  })

  if (!point || point.value === undefined) return 'transparent'

  // Calculate color intensity based on value relative to meter's data range
  const values = meterData.map(p => p.value || 0).filter(v => v > 0)
  if (values.length === 0) return 'transparent'

  const min = Math.min(...values)
  const max = Math.max(...values)
  const value = point.value || 0

  // Normalize value to 0-1 range
  const normalized = max > min ? (value - min) / (max - min) : 0.5

  // Use the meter's color with varying opacity
  const baseColor = metersStore.getMeterColor(meter.id)

  // Convert hex to rgba with opacity based on value
  const opacity = 0.2 + (normalized * 0.6) // Range from 0.2 to 0.8

  // Simple hex to rgb conversion
  const r = parseInt(baseColor.slice(1, 3), 16)
  const g = parseInt(baseColor.slice(3, 5), 16)
  const b = parseInt(baseColor.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function resetChartState() {
  comparisonData.value.clear()
  hasLoadedOnce.value = false
  apiError.value = ''

  if (unifiedChart.value) {
    unifiedChart.value.destroy()
    unifiedChart.value = null
  }
}

function toggleMeterActive(meterId: string) {
  const index = activeMeterIds.value.indexOf(meterId)
  if (index > -1) {
    activeMeterIds.value.splice(index, 1)
  } else {
    activeMeterIds.value.push(meterId)
  }
  resetChartState()
  currentTablePage.value = 1
}

function handleCompteurSelection(selectedIds: string[]) {
  metersStore.setSelectedMeters(selectedIds)
  activeMeterIds.value = []
  showCompteurSelector.value = false
  resetChartState()
}

function toggleDate(date: string) {
  const index = selectedDates.value.indexOf(date)
  if (index > -1) {
    selectedDates.value.splice(index, 1)
    activePeriodPreset.value = null
  } else {
    selectedDates.value.push(date)
    activePeriodPreset.value = null
  }
  selectedDates.value.sort()
  resetChartState()
}

function startDrag(date: string) {
  dragStart.value = date
}

function onDragOver(date: string) {
  if (!dragStart.value) return
  const [start, end] = [dragStart.value, date].sort()
  const newSelection = new Set<string>()
  const current = parseLocalDate(start)
  const endDate = parseLocalDate(end)
  while (current <= endDate) {
    newSelection.add(formatLocalDate(current))
    current.setDate(current.getDate() + 1)
  }
  selectedDates.value = Array.from(newSelection).sort()
}

function endDrag() {
  dragStart.value = null
}

function clearDates() {
  selectedDates.value = []
  activePeriodPreset.value = null
  resetChartState()
  currentTablePage.value = 1
}

async function selectPreset(preset: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dates: string[] = []

  if (preset === 'last7Days') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(formatLocalDate(d))
    }
  } else if (preset === 'last4Weeks') {
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(formatLocalDate(d))
    }
  } else if (preset === 'last3Months') {
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      dates.push(formatLocalDate(d))
    }
  }

  selectedDates.value = dates
  activePeriodPreset.value = preset
  if (dates.length > 0) {
    const firstDate = parseLocalDate(dates[0])
    currentMonth.value = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  }
  resetChartState()
  currentTablePage.value = 1

  // Presets auto-load data; manual calendar selection still requires the button.
  await fetchComparisonData()
}

function prevMonth() {
  currentMonth.value.setMonth(currentMonth.value.getMonth() - 1)
  currentMonth.value = new Date(currentMonth.value)
}

function nextMonth() {
  currentMonth.value.setMonth(currentMonth.value.getMonth() + 1)
  currentMonth.value = new Date(currentMonth.value)
}

function formatValue(value?: number): string {
  if (value === undefined) return '—'
  return value.toFixed(2) + ' kWh'
}

function prevTablePage() {
  if (currentTablePage.value > 1) currentTablePage.value--
}

function nextTablePage() {
  if (currentTablePage.value < totalTablePages.value) currentTablePage.value++
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
  if (visibleMeters.value.length < 1) {
    apiError.value = t('comparison.errors.needMeters')
    return
  }

  if (selectedDates.value.length === 0) {
    // Auto-select today
    const today = new Date()
    selectedDates.value = [formatLocalDate(today)]
  }

  await fetchComparisonData()
}

async function fetchComparisonData() {
  if (visibleMeters.value.length < 1 || selectedDates.value.length === 0) return

  try {
    apiError.value = ''
    comparisonData.value.clear()

    const resolution = effectiveResolution.value
    const sortedDates = [...selectedDates.value].sort()
    const firstDate = parseLocalDate(sortedDates[0])
    firstDate.setHours(0, 0, 0, 0)
    const startDate = firstDate.getTime()

    const lastDate = parseLocalDate(sortedDates[sortedDates.length - 1])
    lastDate.setHours(23, 59, 59, 999)
    const endDate = lastDate.getTime()

    // Fetch energy history for all visible meters
    const result = await fetchEnergyHistory({
      deviceUUIDs: visibleMeters.value.map((m: any) => m.deviceUUID),
      startDate,
      endDate,
      metricTypes: ['consumption'],
      resolution,
      selectedDates: sortedDates
    }, false)

    if (!result.success || !result.data) {
      throw new Error('API call failed')
    }

    // Calculate total consumption per meter
    for (const meter of visibleMeters.value) {
      const meterData = result.data[meter.deviceUUID] || {}
      const consumptionData = meterData.consumption || []

      let total = 0
      const processedData: any[] = []

      if (Array.isArray(consumptionData)) {
        for (const point of consumptionData) {
          const value = point.value || 0
          total += value
          processedData.push({
            timestamp: point.timestamp,
            value,
            date: point.date
          })
        }
      }

      // Update meter with total consumption
      const meterIdx = visibleMeters.value.findIndex((m: any) => m.deviceUUID === meter.deviceUUID)
      if (meterIdx >= 0) {
        visibleMeters.value[meterIdx].totalConsumption = total
      }

      comparisonData.value.set(meter.deviceUUID, processedData)
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
  // Destroy existing chart
  if (unifiedChart.value) {
    unifiedChart.value.destroy()
    unifiedChart.value = null
  }

  if (!isChartVisualization.value) return
  if (!unifiedChartCanvas.value) return
  if (visibleMeters.value.length === 0) return

  // Get labels from first meter's data
  const firstMeter = visibleMeters.value[0]
  const firstMeterData = comparisonData.value.get(firstMeter.deviceUUID) || []
  if (firstMeterData.length === 0) return

  const labels = firstMeterData.map((p: any) => {
    return formatAxisLabel(p.timestamp, effectiveResolution.value)
  })

  // Build datasets array (one per meter)
  const datasets = visibleMeters.value.map((meter: any) => {
    const meterData = comparisonData.value.get(meter.deviceUUID) || []
    const values = meterData.map((p: any) => p.value || 0)
    const color = metersStore.getMeterColor(meter.id)

    return {
      label: meter.name,
      data: values,
      borderColor: color,
      backgroundColor: chartType.value === 'bar' ? color : color + '20',
      borderWidth: 2,
      tension: chartType.value === 'line' ? 0.4 : 0,
      fill: false,
      pointRadius: chartType.value === 'line' ? 3 : 0,
      pointHoverRadius: chartType.value === 'line' ? 5 : 0,
      spanGaps: false
    }
  })

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
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v: any) => v + ' kWh'
          }
        }
      }
    }
  }

  unifiedChart.value = new Chart(ctx, chartConfig)
}

function refreshData() {
  apiError.value = ''
  hasLoadedOnce.value = false
  currentTablePage.value = 1
}

// ============ Lifecycle ============

watch(() => visibleMeters.value, () => {
  currentTablePage.value = 1
})

watch(() => itemsPerPage.value, () => {
  currentTablePage.value = 1
})

onMounted(async () => {
  // Initialize compteur selection
  await initializeCompteurSelection()

  // Hydrate meters store from dashboard and restore selection
  if (dashboardStore.compteurs.length > 0) {
    metersStore.setAllMetersFromDashboard(dashboardStore.compteurs as any)
  }
  metersStore.restoreSelection()

  // Auto-select today on first load
  const today = new Date()
  selectedDates.value = [formatLocalDate(today)]

  await nextTick()
  if (visibleMeters.value.length >= 2) {
    await fetchComparisonData()
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
