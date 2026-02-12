<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700 pb-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('energyHistory.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('energyHistory.subtitle') }}
          </p>
        </div>
        <div class="flex gap-3 w-full sm:w-auto sm:justify-end">
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
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 border-2 border-slate-300 dark:border-slate-600 mb-4">
      <div v-if="validSelectedMeterIds.length > 0" class="space-y-3">
        <!-- Header: Title + Manage Button -->
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {{ t('compteur.selector.title') }}
          </h3>
        </div>

        <!-- All Meters Pills - Grid Layout -->
        <div v-if="validSelectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <button
            v-for="meterId in validSelectedMeterIds"
            :key="meterId"
            @click="toggleCompteurActive(meterId)"
            :class="[
              'px-4 py-2.5 mr-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-2 relative overflow-hidden',
              activeCompteurIds.includes(meterId) || activeCompteurIds.length === 0
                ? 'text-white shadow-lg scale-105 border-transparent'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
            ]"
            :style="(activeCompteurIds.includes(meterId) || activeCompteurIds.length === 0) ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
          >
            <!-- Background gradient for non-active -->
            <div
              v-if="!activeCompteurIds.includes(meterId) && activeCompteurIds.length > 0"
              class="absolute inset-0 opacity-0 group-hover:opacity-5 transition"
              :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"
            />

            <!-- Content -->
            <span v-if="activeCompteurIds.includes(meterId) || activeCompteurIds.length === 0" class="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
            <span class="truncate relative z-10">{{ getMeterName(meterId) }}</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
        <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
        <p class="text-sm">{{ t('dashboard.noMetersSelected.description') }}</p>
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

    <!-- Main Content Grid: 70% Chart Area, 30% Controls -->
    <div v-if="dashboardLoading" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-6">
      {{ t('common.loading') }}
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <!-- Left Panel: Chart Area (70%) -->
        <div class="xl:col-span-7 space-y-6">

        <!-- View Mode Toggle & Export Buttons -->
        <div class="flex items-center justify-between gap-3">
          <!-- Export Buttons (left) -->
          <div class="flex gap-2">

          </div>

          <!-- View Mode Toggle (right) -->
          <div class="flex items-center rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button @click="viewMode = 'chart'" :class="['px-3 py-1.5 text-xs', viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']">{{ t('energyHistory.viewMode.chart') }}</button>
            <button @click="viewMode = 'table'" :class="['px-3 py-1.5 text-xs', viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']">{{ t('energyHistory.viewMode.table') }}</button>
          </div>
        </div>

        <!-- Multi-Metric Chart -->
        <div v-show="viewMode === 'chart'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.chart.title', { resolution: resolutionLabel }) }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ chartSubtitle }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="toggleChartType"
                class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                title="Toggle Chart Type"
              >
                <span class="material-symbols-outlined">{{ chartType === 'line' ? 'bar_chart' : 'show_chart' }}</span>
              </button>
            </div>
          </div>

          <!-- Chart Canvas -->
          <div class="relative" style="height: 400px;">
            <!-- Loading State -->
            <div v-if="store.loading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <div class="flex flex-col items-center gap-3">
                <div class="animate-spin">
                  <span class="material-symbols-outlined text-4xl text-blue-500">sync</span>
                </div>
                <p class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ t('common.loading') }}</p>
              </div>
            </div>
            <!-- Error State -->
            <div v-else-if="store.error" class="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <span class="material-symbols-outlined text-5xl mb-3 text-red-400 opacity-50">error</span>
              <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ t('common.error') }}</p>
              <p class="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs text-center">{{ store.error }}</p>
              <button
                @click="refreshData"
                class="mt-3 px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition"
              >
                {{ t('common.retry') }}
              </button>
            </div>
            <!-- Empty State -->
            <div v-else-if="!hasChartData" class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <span v-if="selectedDates.length === 0" class="material-symbols-outlined text-6xl mb-4 opacity-50 text-blue-400">calendar_today</span>
              <span v-else class="material-symbols-outlined text-6xl mb-4 opacity-30 text-gray-400">bar_chart</span>
              <p class="text-lg font-medium">{{ emptyStateMessage }}</p>
              <p v-if="selectedDates.length === 0" class="text-sm mt-2 text-blue-600 dark:text-blue-400">{{ t('energyHistory.emptyState.selectDate') }}</p>
              <p v-else class="text-sm mt-2">{{ t('energyHistory.emptyState.hint') }}</p>

            </div>
            <!-- Chart -->
            <canvas v-show="hasChartData && !store.loading && !store.error" ref="chartCanvas"></canvas>
          </div>

          <!-- Chart Legend (Interactive) -->
          <div v-if="chartData.datasets.length > 0" class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              v-for="dataset in chartData.datasets"
              :key="dataset.label"
              @click="toggleDataset(dataset.label)"
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                hiddenDatasets.includes(dataset.label)
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: dataset.borderColor }"></span>
              {{ dataset.label }}
            </button>
          </div>
        </div>

        <!-- Data Table -->
        <div v-show="viewMode === 'table'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.table.title') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ t(`energyHistory.table.subtitle.${effectiveResolution}`) }} • {{ t('energyHistory.table.entries', { count: pagedRows.length }) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="isTableZoomed = true" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" :title="t('energyHistory.table.zoomIn')">
                  <span class="material-symbols-outlined">zoom_in</span>
                </button>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800">
                    {{ t(`energyHistory.table.columns.${effectiveResolution === 'hourly' ? 'hour' : 'date'}`) }}
                  </th>
                   <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                     <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       {{ compteur.name }}
                     </th>
                   </template>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="row in pagedRows" :key="row.time" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                    {{ row.time }}
                  </td>
                  <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                      {{ formatCell(row[compteur.id]) }}
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('energyHistory.pagination.page', { current: currentPage, total: totalPages }) }} • {{ t('energyHistory.pagination.perPage', { count: itemsPerPage }) }}
            </div>
            <div class="flex items-center gap-2">
              <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50">{{ t('energyHistory.pagination.previous') }}</button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50">{{ t('energyHistory.pagination.next') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Controls (30%) -->
      <div class="xl:col-span-3 space-y-6">
        <!-- Calendar Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.calendar.title') }}</h3>
            <button
              @click="goToToday"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ t('energyHistory.buttons.today') }}
            </button>
          </div>

          <!-- Period Presets -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ t('energyHistory.calendar.periods.title') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="selectLast7Days"
                :disabled="energyHistoryLoading"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  activePeriodPreset === 'last7Days'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.last7Days') }}
              </button>
              <button
                @click="selectLast30Days"
                :disabled="energyHistoryLoading"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  activePeriodPreset === 'last30Days'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.last30Days') }}
              </button>
              <button
                @click="selectThisMonth"
                :disabled="energyHistoryLoading"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  activePeriodPreset === 'thisMonth'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.thisMonth') }}
              </button>
              <button
                @click="selectLastMonth"
                :disabled="energyHistoryLoading"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                  activePeriodPreset === 'lastMonth'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.lastMonth') }}
              </button>
            </div>
          </div>

           <!-- Selected Dates Range Info -->
          <div v-if="selectedDates.length > 0" class="mb-4 mt-2 p-3 rounded-lg border"
               :class="selectedDates.length >= 32
                 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                 : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'">
            <div class="flex items-center justify-between">
              <div class="text-xs">
                <span class="font-semibold"
                      :class="selectedDates.length >= 32
                        ? 'text-orange-900 dark:text-orange-100'
                        : 'text-blue-900 dark:text-blue-100'">
                  {{ t('energyHistory.calendar.daysSelected', { count: selectedDates.length }) }}
                  <span v-if="selectedDates.length >= 32" class="ml-2 text-orange-600 dark:text-orange-400">
                    ({{ t('energyHistory.calendar.maxReached') || 'Max 32 days' }})
                  </span>
                </span>
                <div v-if="selectedDates.length > 1"
                     :class="selectedDates.length >= 32
                       ? 'text-orange-700 dark:text-orange-300'
                       : 'text-blue-700 dark:text-blue-300'"
                     class="mt-1">
                  {{ selectedDates[0] }} → {{ selectedDates[selectedDates.length - 1] }}
                </div>
              </div>
              <button
                @click="goToToday"
                :class="selectedDates.length >= 32
                  ? 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'"
                class="text-xs"
              >
                {{ t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-4">
            <button
              @click="prevMonth"
              :disabled="energyHistoryLoading"
              class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ monthLabel }}
            </span>
            <button
              @click="nextMonth"
              :disabled="energyHistoryLoading"
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
              @click="day.date && !energyHistoryLoading && toggleDate(day.date)"
              @mousedown="day.date && !energyHistoryLoading && startDrag(day.date)"
              @mouseover="isDragging && !energyHistoryLoading && day.date && onDragOver(day.date)"
              @mouseup="endDrag"
              :disabled="!day.date || energyHistoryLoading"
              :class="[
                'aspect-square flex items-center justify-center text-xs rounded-md transition-all relative',
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
              <span
                v-if="day.hasData"
                class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"
              ></span>
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- Debug Panel (Development Only) -->
    <div v-if="false" class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-mono">
      <h4 class="font-bold mb-2 text-gray-900 dark:text-white">DEBUG INFO</h4>
      <div class="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
        <div><strong>Store Loading:</strong> {{ store.loading }}</div>
        <div><strong>Store Error:</strong> {{ store.error || 'None' }}</div>
        <div><strong>Selected Dates:</strong> {{ selectedDates.length }}</div>
        <div><strong>Visible Compteurs:</strong> {{ visibleCompteurs.length }}</div>
        <div><strong>Enabled Metrics:</strong> {{ enabledMetrics.filter(m => m.enabled).length }}</div>
        <div><strong>Chart Datasets:</strong> {{ chartData.datasets.length }}</div>
        <div><strong>Chart Labels:</strong> {{ chartData.labels.length }}</div>
        <div><strong>Has Chart Data:</strong> {{ hasChartData }}</div>
        <div><strong>Effective Resolution:</strong> {{ effectiveResolution }}</div>
        <div><strong>Hour Range:</strong> {{ hourFrom }}-{{ hourTo }}</div>
      </div>
      <div v-if="chartData.datasets.length > 0" class="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
        <strong>Datasets:</strong>
        <div v-for="(ds, idx) in chartData.datasets" :key="idx" class="ml-2 mt-1">
          {{ ds.label }}: {{ ds.data.length }} points
        </div>
      </div>
    </div>
  </AdminLayout>
  <!-- Table Zoom Overlay -->
  <Teleport to="body">
    <div v-if="isTableZoomed" class="table-zoom-overlay" @click.self="isTableZoomed = false">
      <div class="table-zoom-content rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.table.fullscreen') }}</h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ t(`energyHistory.resolution.${effectiveResolution}`) }} • {{ t('energyHistory.table.entries', { count: tableData.length }) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="isTableZoomed = false" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">{{ t('common.close') }}</button>
        </div>
      </div>
      <div class="overflow-auto h-[calc(85vh-64px)]">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800">
                {{ t(`energyHistory.table.columns.${effectiveResolution === 'hourly' ? 'hour' : 'date'}`) }}
              </th>
              <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ compteur.name }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="row in tableData" :key="row.time" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                {{ row.time }}
              </td>
              <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {{ formatCell(row[compteur.id]) }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Debounce helper function
function debounce(func: (...args: any[]) => Promise<void>, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { useEnergyHistoryStore } from '@/features/energy-history/store/useEnergyHistoryStore'
import { useMetersStore } from '@/stores/useMetersStore'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { useEnergyHistory } from '@/composables/useEnergyHistory'
import { useMockData } from '@/config/dataMode'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

// Register Chart.js components
Chart.register(LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ChartDataLabels)

// ===========================
// Store Integration
// ===========================
const { t, locale } = useI18n()
const store = useEnergyHistoryStore()
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()
const { selectedMeterIds } = storeToRefs(metersStore)
const dashboardLoading = computed(() => dashboardStore.loading)
const mockMode = useMockData()

// ===========================
// Energy History Data Fetching
// ===========================
const {
  isLoading: energyHistoryLoading,
  error: energyHistoryError,
  data: energyHistoryData,
  fetchEnergyHistory,
  getDeviceMetricData,
  getAggregatedMetricData,
  clearCache: clearEnergyHistoryCache
} = useEnergyHistory()

// Use the same composable as DashboardView and PuissanceView for consistency
const {
  availableCompteurs: allCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Filter out any meter IDs that don't exist in allCompteurs (to avoid showing "Unknown")
const validSelectedMeterIds = computed(() => {
  return selectedMeterIds.value.filter(meterId => {
    return allCompteurs.value.some(c => c.id === meterId)
  })
})

// UI State for Meter Selection
const showCompteurSelector = ref(false)

// Handle meter selection from modal
function handleCompteurSelection(selectedIds: string[]) {
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
}

// Primary meter selection
const primaryMeter = computed(() => metersStore.selectedMeters[0] || null)

// Comparison meters (remaining selections after primary)
const comparisonMeters = computed(() => metersStore.selectedMeters.slice(1))

const {
  availableMetrics,
  selectedDates,
  currentMonth,
  activePeriodPreset,
  hourFrom,
  hourTo,
  photovoltaicEnabled,
  photovoltaicPercentage,
  enabledMetrics,
  primaryDate,
  effectiveResolution,
  resolutionLabel,
  calendarDays,
  chartData,
  metricCardsData,
  tableData,
  selectedCompteurs,
  visibleCompteurs,
  activeCompteurIds,
  selectedMetric,
  loading,
  error,
  historicalData,
} = storeToRefs(store)

const {
  toggleMetric,
  toggleDate,
  prevMonth,
  nextMonth,
  goToToday,
  selectLast7Days,
  selectLast30Days,
  selectThisMonth,
  selectLastMonth,
  setTimeRange,
  toggleCompteurActive,
  enableAllCompteurs,
  resetFilters,
  exportToCSV,
  exportToPDF,
  refreshData,
  processAPIResponse,
} = store

// ===========================
// Local State
// ===========================
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null
const chartType = ref<'line' | 'bar'>('line')

// Meter color mapping (dashboard theme)
const METER_COLORS: Record<string, string> = {
  'TGBT': '#ef4444',        // red-500
  'Compresseurs': '#10b981', // green-500
  'Clim': '#3b82f6',        // blue-500
  'Cooling': '#3b82f6',     // blue-500 (alias)
  'Éclairage': '#eab308',   // yellow-500
  'Eclairage': '#eab308',   // yellow-500 (alias)
  'Lighting': '#eab308',    // yellow-500 (alias)
}

function getMeterColor(meterName: string): string {
  return METER_COLORS[meterName] || '#3b82f6'
}

function formatCell(v: any) {
  // Handle if v is an object with a value property
  if (v && typeof v === 'object' && 'value' in v) {
    v = v.value
  }

  if (typeof v !== 'number' || isNaN(v)) return '-'

  const dp = selectedMetric.value.decimalPlaces
  return v.toFixed(dp)
}
const hiddenDatasets = ref<string[]>([])
const viewMode = ref<'chart' | 'table'>('chart')
const isTableZoomed = ref(false)
const itemsPerPage = ref(100)
const currentPage = ref(1)

const totalPages = computed(() => {
  const total = tableData.value.length
  return Math.max(1, Math.ceil(total / itemsPerPage.value))
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return tableData.value.slice(start, end)
})

function prevPage() {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

function nextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}

function resetTableZoom() {
  // Reset paging
  currentPage.value = 1
  itemsPerPage.value = effectiveResolution.value === 'hourly' ? 24 : Math.min(100, tableData.value.length)
}

// Calendar drag-to-select
const isDragging = ref(false)
const dragStart = ref<string | null>(null)

// API call tracking - prevent concurrent requests
const isFetchingData = ref(false)

// ===========================
// Category Selection - Synced with Centralized Meter Selection
// ===========================

/**
 * Selected category for UI filtering
 * When changed, updates the centralized meter selection
 */
const selectedCategory = ref<string | null>(null)
const selectedElement = ref<string | null>(null)

/**
 * Available meter categories from centralized store
 */
const meterCategories = computed(() => {
  const categories = Array.from(new Set(metersStore.allMeters.map(m => m.type ?? 'meter')))
  const order = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage']
  return categories.sort((a, b) => order.indexOf(a as string) - order.indexOf(b as string)).slice(0, 4)
})

/**
 * Currently selected meters from centralized store
 * This is the SINGLE SOURCE OF TRUTH
 */
const selectedMetersFromStore = computed(() => metersStore.selectedMeters)

/**
 * Filtered meters based on category (for UI display only)
 * Does NOT affect data - data comes from selectedMetersFromStore
 */
const filteredMetersForDisplay = computed(() => {
  if (!selectedCategory.value) return metersStore.allMeters
  return metersStore.allMeters.filter(m => (m.type ?? 'meter') === selectedCategory.value)
})

/**
 * Get current category from selected meters
 * Auto-detects category from actually selected meters
 */
const currentCategory = computed(() => {
  if (selectedMetersFromStore.value.length === 0) return null
  // Get category from first selected meter
  return selectedMetersFromStore.value[0]?.type || null
})

/**
 * Get elements for current meter (if any)
 * Used for element selection UI (e.g., TGBT L1/L2/L3)
 */
const currentMeterElements = computed(() => {
  const firstMeter = selectedMetersFromStore.value[0]
  if (firstMeter && (firstMeter as any).elements) {
    const elements = (firstMeter as any).elements
    // Extract element IDs or names (handle both string[] and MeterElement[])
    if (Array.isArray(elements) && elements.length > 0) {
      if (typeof elements[0] === 'string') {
        return elements // Already strings (element IDs/names)
      } else if (typeof elements[0] === 'object' && elements[0].id) {
        return elements.map((el: any) => el.id) // Extract IDs from MeterElement objects
      }
    }
  }
  return []
})

// Category Helper Functions
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'TGBT': '#ef4444',           // Red
    'Compresseurs': '#22c55e',    // Green
    'Clim': '#3b82f6',            // Blue
    'Éclairage': '#f59e0b',       // Amber
    'Eclairage': '#f59e0b'        // Amber (alternative spelling)
  }
  return colors[category] || '#6b7280'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'TGBT': 'electrical_services',
    'Compresseurs': 'settings',
    'Clim': 'ac_unit',
    'Éclairage': 'lightbulb'
  }
  return icons[category] || 'power'
}

function getCategoryTranslationKey(category: string): string {
  const keys: Record<string, string> = {
    'TGBT': 'categories.tgbt',
    'Compresseurs': 'categories.compressors',
    'Clim': 'categories.cooling',
    'Éclairage': 'categories.lighting'
  }
  return keys[category] || category
}

function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Helper function to get meter name by ID (same as PuissanceView)
function getMeterName(meterId: string): string {
  const meter = allCompteurs.value.find(c => c.id === meterId)
  return meter?.name || 'Unknown'
}

// ===========================
// Watchers - Sync Category with Centralized Selection
// ===========================

/**
 * When category changes, update centralized meter selection
 * This ensures ALL views see the same selected meters
 */
watch(selectedCategory, (newCategory) => {
  if (!newCategory) {
    // If no category selected, clear meter selection
    metersStore.clearSelection()
    selectedElement.value = null
    return
  }

  // Get all meters in this category
  const categoryMeterIds = metersStore.allMeters
    .filter(m => (m.type ?? 'meter') === newCategory)
    .map(m => m.id)

  // Update centralized selection
  if (categoryMeterIds.length > 0) {
    metersStore.setSelectedMeters(categoryMeterIds)
  }

  // Auto-select first element if available
  if (currentMeterElements.value.length > 0) {
    selectedElement.value = currentMeterElements.value[0]
  } else {
    selectedElement.value = null
  }
}, { flush: 'post' })

/**
 * Initialize category from currently selected meters
 * Runs once on mount to sync UI with existing selection
 */
watch(
  () => selectedMetersFromStore.value,
  (meters) => {
    if (meters.length > 0 && !selectedCategory.value) {
      // Set category to match first selected meter
      selectedCategory.value = meters[0].type || 'meter'
    }
  },
  { immediate: true }
)

/**
 * Sync activeCompteurIds when selectedCompteurs changes
 * This ensures charts update when meter selection changes
 */
watch(
  () => selectedCompteurs.value,
  async (newCompteurs) => {
    if (newCompteurs.length > 0) {
      // Wait for next tick to ensure computed values have updated
      await nextTick()
      // Update activeCompteurIds to match new selection
      activeCompteurIds.value = newCompteurs.map(c => c.id)
      // Refresh data to load new meter data
      await refreshData()
    }
  },
  { immediate: true }
)

// ===========================
// Computed Properties
// ===========================
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

const chartSubtitle = computed(() => {
  if (selectedDates.value.length === 0) return t('energyHistory.chart.subtitle.noData')
  if (selectedDates.value.length === 1) return t('energyHistory.chart.subtitle.singleDay', { date: selectedDates.value[0] })
  if (selectedDates.value.length <= 3) return t('energyHistory.chart.subtitle.multipleDays', { dates: selectedDates.value.join(' • ') })
  return t('energyHistory.chart.subtitle.daysCount', { count: selectedDates.value.length })
})

/**
 * Check if we have valid data to display
 * Prevents rendering empty charts
 */
const hasValidData = computed(() => {
  return visibleCompteurs.value.length > 0 &&
         selectedDates.value.length > 0 &&
         enabledMetrics.value.length > 0
})

/**
 * Check if chart has actual data points (not just null/placeholder values)
 */
const hasActualData = computed(() => {
  if (chartData.value.datasets.length === 0) return false

  // Check if any dataset has at least one non-null data point
  return chartData.value.datasets.some(dataset =>
    dataset.data.some(value => value !== null && value !== undefined)
  )
})

/**
 * Check if chart has data to render
 */
const hasChartData = computed(() => {
  const hasValid = hasValidData.value
  const hasDatasets = chartData.value.datasets.length > 0
  const hasLabels = chartData.value.labels.length > 0
  const hasData = hasActualData.value

  const result = hasValid && hasDatasets && hasLabels && hasData

  // Enhanced logging for debugging
  if (!result) {
    console.warn('[EnergyHistorical] Chart data incomplete:', {
      hasValidData: hasValid,
      visibleCompteurs: visibleCompteurs.value.length,
      selectedDates: selectedDates.value.length,
      enabledMetrics: enabledMetrics.value.filter(m => m.enabled).length,
      datasetsLength: chartData.value.datasets.length,
      labelsLength: chartData.value.labels.length,
      hasActualData: hasData,
      hasData: result,
      historicalDataSize: historicalData.value.size,
      storeLoading: store.loading,
      storeError: store.error,
    })
  }

  return result
})

/**
 * Compute missing hours (hourly mode): list hours 00–23 with no data
 */
const missingHours = computed(() => {
  if (effectiveResolution.value !== 'hourly') return [] as string[]
  if (chartData.value.datasets.length === 0) return [] as string[]

  const hoursWithData = new Set<number>()
  // If any dataset has a non-null value for an hour, consider it present
  for (let hour = 0; hour < 24; hour++) {
    const hasAny = chartData.value.datasets.some(ds => ds.data[hour] !== null && ds.data[hour] !== undefined)
    if (hasAny) hoursWithData.add(hour)
  }

  const missing: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    if (!hoursWithData.has(hour)) {
      missing.push(`${hour.toString().padStart(2, '0')}:00`)
    }
  }
  return missing
})

/**
 * Get empty state message
 */
const emptyStateMessage = computed(() => {
  if (visibleCompteurs.value.length === 0) {
    return t('energyHistory.emptyState.noMeters')
  }
  if (selectedDates.value.length === 0) {
    return t('energyHistory.emptyState.selectDate')
  }
  if (enabledMetrics.value.length === 0) {
    return t('energyHistory.emptyState.noMetrics')
  }
  return t('energyHistory.emptyState.noData')
})

// ===========================
// Chart Initialization
// ===========================
function initChart() {
  // Return early if no canvas available
  if (!chartCanvas.value) {
    console.warn('Chart canvas not found, retrying in next tick')
    nextTick(() => initChart())
    return
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) {
    console.warn('Cannot get 2D context from canvas')
    return
  }

  // Log raw chart data before initialization
  console.log('[Chart Init] Raw chartData:', {
    labels: chartData.value.labels,
    labelsJSON: JSON.stringify(chartData.value.labels),
    labelsSorted: JSON.stringify([...chartData.value.labels].sort()),
    datasetsCount: chartData.value.datasets.length,
    datasets: chartData.value.datasets.map(ds => ({
      label: ds.label,
      dataLength: ds.data.length,
      dataValues: ds.data,
      yAxisID: ds.yAxisID,
      hasData: ds.data.some(v => v !== null && v !== undefined),
      nonNullCount: ds.data.filter(v => v !== null && v !== undefined).length,
      sampleValues: ds.data.slice(0, 3)
    }))
  })
  console.log('[Vue] Chart labels received:', chartData.value.labels)
  console.log('[Vue] Are labels sorted?', JSON.stringify(chartData.value.labels) === JSON.stringify([...chartData.value.labels].sort()))

  // Prepare datasets (filter hidden ones)
  const visibleDatasets = chartData.value.datasets
    .filter(ds => !hiddenDatasets.value.includes(ds.label))
    .map(ds => {
      const baseConfig = {
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        backgroundColor: ds.backgroundColor,
        yAxisID: ds.yAxisID,
        borderWidth: 2,
      }

      // For daily mode (multiple days), use bar chart by default for better visibility
      if (effectiveResolution.value === 'daily' && chartType.value === 'line') {
        return {
          ...baseConfig,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: false, // Don't connect across null values (keep gaps empty)
          type: 'line' as const,
        }
      }

      return {
        ...baseConfig,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: false, // Don't connect across null values (keep gaps empty)
        type: chartType.value,
      }
    })

  // Determine if we need dual Y-axes
  const hasLeftAxis = visibleDatasets.some(ds => ds.yAxisID === 'y')
  const hasRightAxis = visibleDatasets.some(ds => ds.yAxisID === 'y1')

  console.log('[Chart Init] About to create Chart.js instance with:', {
    chartType: chartType.value,
    labelsCount: chartData.value.labels.length,
    labels: chartData.value.labels,
    visibleDatasetsCount: visibleDatasets.length,
    visibleDatasets: visibleDatasets.map(ds => ({
      label: ds.label,
      type: ds.type,
      yAxisID: ds.yAxisID,
      dataLength: ds.data.length,
      sampleData: ds.data.slice(0, 3),
      nonNullCount: ds.data.filter(v => v !== null).length,
      colors: {
        border: ds.borderColor,
        background: ds.backgroundColor
      }
    })),
    hasLeftAxis,
    hasRightAxis
  })

  chartInstance = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels: chartData.value.labels,
      datasets: visibleDatasets as any,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        datalabels: {
          display: false,
        },
        legend: {
          display: false, // Using custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            title: function(context) {
              if (!context || context.length === 0) return ''
              const dataIndex = context[0].dataIndex
              const rawTs = (chartData.value as any).rawTimestamps?.[dataIndex]
              const label = context[0].label || ''
              if (rawTs !== undefined) {
                return `${label}\nTS: ${rawTs}ms`
              }
              return label
            },
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                // Find metric for this dataset
                const metricMatch = enabledMetrics.value.find(m =>
                  context.dataset.label?.includes(m.name)
                )
                const unit = metricMatch?.unit || ''
                const value = context.parsed.y
                label += `${value.toFixed(2)} ${unit}`

              }
              return label
            }
          }
        },
      },
      scales: {
        x: {
          display: !store.loading, // Hide entire x-axis while loading
          grid: {
            display: !store.loading, // Hide grid while loading
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            display: !store.loading, // Hide labels while loading
            color: '#6b7280',
            // For many labels, show fewer to avoid crowding
            maxRotation: chartData.value.labels.length > 14 ? 90 : 45,
            minRotation: 45,
            maxTicksLimit: Math.max(6, Math.ceil(chartData.value.labels.length / 4)),
            font: {
              size: 10,
            }
          },
        },
        y: {
          display: hasLeftAxis,
          position: 'left',
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y1: {
          display: hasRightAxis,
          position: 'right',
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
      },
    },
  })

  console.log('[Chart Init] Chart instance created successfully:', {
    chartCanvasWidth: chartCanvas.value?.width,
    chartCanvasHeight: chartCanvas.value?.height,
    canvasAvailable: !!chartCanvas.value,
    chartCreated: !!chartInstance
  })

  // After chart init, log missing hours in hourly mode
  if (effectiveResolution.value === 'hourly' && missingHours.value.length > 0) {
    console.warn('[Chart] Missing hourly data for:', missingHours.value)
  }
}

function toggleDataset(label: string) {
  const index = hiddenDatasets.value.indexOf(label)
  if (index > -1) {
    hiddenDatasets.value.splice(index, 1)
  } else {
    hiddenDatasets.value.push(label)
  }
  initChart()
}

function zoomIn() {
  // Simple zoom: reduce hour range
  if (hourTo.value - hourFrom.value > 6) {
    const mid = Math.floor((hourFrom.value + hourTo.value) / 2)
    const range = Math.floor((hourTo.value - hourFrom.value) / 2)
    setTimeRange(Math.max(0, mid - range), Math.min(23, mid + range))
  }
}

function resetZoom() {
  setTimeRange(0, 23)
}

function toggleChartType() {
  chartType.value = chartType.value === 'line' ? 'bar' : 'line'
  initChart()
}

// ===========================
// Calendar Drag-to-Select
// ===========================
function startDrag(dateStr: string | null) {
  if (!dateStr) return
  isDragging.value = true
  dragStart.value = dateStr
}

function onDragOver(dateStr: string | null) {
  if (!isDragging.value || !dragStart.value || !dateStr) return

  // Get dates between start and current
  const draggedDates = getDatesBetween(dragStart.value, dateStr)

  // Check if range exceeds 32 days
  if (draggedDates.length > 32) {
    console.warn(`[onDragOver] Selection would exceed 32 days (${draggedDates.length} days). Limiting to 32 days.`)
    // Limit to first 32 days
    selectedDates.value = draggedDates.slice(0, 32)
  } else {
    // Use continuous range (no gaps allowed in drag selection)
    selectedDates.value = draggedDates
  }
}

function endDrag() {
  isDragging.value = false
  dragStart.value = null
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  let startDate = new Date(start)
  let endDate = new Date(end)

  if (startDate > endDate) {
    ;[startDate, endDate] = [endDate, startDate]
  }

  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(store.formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function removeDate(dateStr: string) {
  toggleDate(dateStr)
}

// ===========================
// Dynamic Data Fetching
// ===========================

/**
 * Fetch energy history data from new API based on current selections
 * This complements the store's refreshData() method with real backend data
 */
async function fetchEnergyHistoryData() {
  // Prevent concurrent API calls
  if (isFetchingData.value) {
    console.log('[EnergyHistorical] API call already in progress, skipping duplicate request')
    return
  }

  if (visibleCompteurs.value.length === 0 || selectedDates.value.length === 0) {
    console.log('[EnergyHistorical] Skipping fetch - no compteurs or dates selected')
    return
  }

  try {
    isFetchingData.value = true
    store.loading = true // Set store loading state
    console.log('[EnergyHistorical] Starting single API call for all selected days...')

    // Sort dates to ensure correct order
    const sortedDates = [...selectedDates.value].sort()

    // Get enabled metric types
    const metricTypes = enabledMetrics.value
      .filter(m => m.enabled)
      .map(m => {
        if (m.type === 'energy') return 'energy'
        if (m.type === 'co2') return 'co2'
        if (m.type === 'cost') return 'cost'
        if (m.type === 'consumption') return 'consumption'
        return null
      })
      .filter((m): m is 'energy' | 'co2' | 'cost' | 'consumption' => m !== null)

    if (metricTypes.length === 0) {
      console.log('[EnergyHistorical] No enabled metrics')
      return
    }

    // Determine resolution based on number of selected dates
    // Use hourly only for 3 days or less
    const resolution = selectedDates.value.length <= 3 ? 'hourly' : 'daily'

    // Convert date strings to timestamps for the date range
    const firstDate = new Date(sortedDates[0])
    firstDate.setHours(0, 0, 0, 0)
    const startDate = firstDate.getTime()

    const lastDate = new Date(sortedDates[sortedDates.length - 1])
    lastDate.setHours(23, 59, 59, 999)
    const endDate = lastDate.getTime()

    console.log('[EnergyHistorical] Sending single API request with all selected dates:', {
      selectedDateStrings: sortedDates,
      totalDays: sortedDates.length,
      deviceCount: visibleCompteurs.value.length,
      metricTypes,
      resolution,
      timeRange: `${hourFrom.value}:00 - ${hourTo.value}:59`,
      dateRange: `${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`
    })

    // Make single API call to backend
    // Backend will handle fetching data for each day using Promise.all
    const result = await fetchEnergyHistory({
      deviceUUIDs: visibleCompteurs.value.map(c => c.deviceUUID || c.id),
      startDate,
      endDate,
      metricTypes,
      resolution,
      // Pass selected dates to backend so it can fetch each day individually
      selectedDates: sortedDates,
      hourFrom: hourFrom.value,
      hourTo: hourTo.value
    }, false) // Don't use cache to ensure fresh data

    console.log('[EnergyHistorical] Backend API call completed:', {
      success: result.success,
      deviceCount: Object.keys(result.data).length,
      metricTypes,
      resolution
    })

    // Process API response into store so chartData can render
    if (result.success) {
      console.log('[EnergyHistorical] Raw API response:', {
        deviceCount: Object.keys(result.data).length,
        deviceUUIDs: Object.keys(result.data),
        firstDeviceDataPoints: Object.values(result.data)[0] ? Object.values(Object.values(result.data)[0])[0]?.length : 0,
        metaResolution: result.meta?.resolution,
        metaMetrics: result.meta?.metricTypes
      })

      console.log('[EnergyHistorical] Before processAPIResponse:', {
        visibleCompteursCount: visibleCompteurs.value.length,
        visibleCompteursIds: visibleCompteurs.value.map(c => c.id),
        visibleCompteursDeviceUUIDs: visibleCompteurs.value.map(c => c.deviceUUID || c.id),
        selectedDatesCount: selectedDates.value.length,
        selectedDates: selectedDates.value,
        enabledMetricsCount: enabledMetrics.value.filter(m => m.enabled).length,
        enabledMetricsTypes: enabledMetrics.value.filter(m => m.enabled).map(m => m.type),
        historicalDataSizeBefore: historicalData.value.size
      })

      processAPIResponse(result)

      // Wait for Vue to update DOM and computed properties
      await nextTick()
      await nextTick()

      console.log('[EnergyHistorical] After processAPIResponse:', {
        hasChartData: hasChartData.value,
        hasValidData: hasValidData.value,
        hasActualData: hasActualData.value,
        chartDatasets: chartData.value.datasets.length,
        chartLabels: chartData.value.labels.length,
        historicalDataSize: historicalData.value.size,
        visibleCompteurs: visibleCompteurs.value.length,
        selectedDates: selectedDates.value.length,
        enabledMetrics: enabledMetrics.value.filter(m => m.enabled).length,
        effectiveResolution: effectiveResolution.value
      })

      // Debug: log first few entries from historicalData
      if (historicalData.value.size > 0) {
        const firstEntries = Array.from(historicalData.value.entries()).slice(0, 3)
        console.log('[EnergyHistorical] First historicalData entries:', firstEntries.map(([key, value]) => ({
          key,
          datesCount: value.length,
          dates: value.slice(0, 5).map(d => d.date)
        })))
      }

      // Re-initialize chart with new data
      if (hasChartData.value) {
        console.log('[EnergyHistorical] Initializing chart with new data')
        initChart()
      } else {
        console.warn('[EnergyHistorical] No chart data available after API response', {
          reason: !hasValidData.value ? 'No valid data' :
                  chartData.value.datasets.length === 0 ? 'No datasets' :
                  chartData.value.labels.length === 0 ? 'No labels' :
                  !hasActualData.value ? 'No actual data points' :
                  'Unknown'
        })
      }
    }

    // Debug: compute present hours from API data to check gaps
    const hoursPresent = new Set<number>()
    Object.values(result.data).forEach(deviceData => {
      Object.values(deviceData).forEach(metricArray => {
        metricArray.forEach(dp => {
          const h = new Date(dp.timestamp).getHours()
          hoursPresent.add(h)
        })
      })
    })

    console.log('[EnergyHistorical] Successfully fetched aggregated energy history data:', {
      success: result.success,
      deviceCount: Object.keys(result.data).length,
      metrics: metricTypes,
      resolution,
      fetchedDays: sortedDates.length,
      totalDataPoints: Object.values(result.data).reduce((total, deviceData) => {
        return total + Object.values(deviceData).reduce((deviceTotal, metricArray) => {
          return deviceTotal + (Array.isArray(metricArray) ? metricArray.length : 0)
        }, 0)
      }, 0),
      hoursPresent: Array.from(hoursPresent).sort((a, b) => a - b),
    })

    return result
  } catch (error) {
    console.error('[EnergyHistorical] Error fetching energy history:', error)
    // Continue using store data on error
  } finally {
    // Always reset the fetching flag when done (success or error)
    isFetchingData.value = false
    store.loading = false // Clear store loading state
    console.log('[EnergyHistorical] API fetch completed')

    // Fallback: If chart still not initialized after a short delay, try again
    setTimeout(() => {
      if (!chartInstance && hasChartData.value && !store.loading) {
        console.log('[EnergyHistorical] Delayed chart initialization attempt')
        initChart()
      }
    }, 200)
  }
}

// ===========================
// Lifecycle Hooks
// ===========================
onMounted(async () => {
  // Ensure compteurs are loaded (will set loading internally)
  if (dashboardStore.compteurs.length === 0) {
    await dashboardStore.loadCompteurs()
  }

  // Initialize compteur selection (syncs with DashboardView and PuissanceView)
  await initializeCompteurSelection()

  // Hydrate meters store from dashboard and restore selection
  if (dashboardStore.compteurs.length > 0) {
    metersStore.setAllMetersFromDashboard(dashboardStore.compteurs as any)
  }
  metersStore.restoreSelection()

  // Auto-select first 8 meters if none are selected after restoration
  if (selectedMeterIds.value.length === 0 && dashboardStore.compteurs.length > 0) {
    const defaultSelection = dashboardStore.compteurs.slice(0, 8).map(c => c.id)
    metersStore.setSelectedMeters(defaultSelection)
    console.log('Auto-selected 8 meters for Energy Historical view:', defaultSelection)
  } else if (selectedMeterIds.value.length > 0) {
    console.log('Restored selected meters for Energy Historical view:', selectedMeterIds.value)
  }

  selectedCategory.value = null // No specific category filter

  // Initialize with today's date
  goToToday()

  // Wait for next tick to ensure all state is synchronized
  await nextTick()

  // Ensure at least one metric is enabled (default: consumption)
  if (enabledMetrics.value.filter(m => m.enabled).length === 0) {
    const consumptionMetric = enabledMetrics.value.find(m => m.type === 'consumption')
    if (consumptionMetric) consumptionMetric.enabled = true
  }

  // Refresh data to populate charts (MUST await to ensure data is loaded)
  console.log('Before refreshData:', {
    selectedDates: selectedDates.value.length,
    selectedMeterIds: selectedMeterIds.value.length,
    visibleCompteurs: visibleCompteurs.value.length,
    enabledMetrics: enabledMetrics.value.filter(m => m.enabled).length,
  })

  await refreshData()

  // Wait a bit longer to ensure computed properties fully recalculate after data arrives
  await nextTick()
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))

  // Debug: log chart state
  console.log('After refreshData:', {
    hasChartData: hasChartData.value,
    selectedDates: selectedDates.value.length,
    visibleCompteurs: visibleCompteurs.value.length,
    enabledMetrics: enabledMetrics.value.filter(m => m.enabled).length,
    chartLabels: Array.isArray(chartData.value?.labels) ? chartData.value.labels.length : 0,
    chartDatasets: Array.isArray(chartData.value?.datasets) ? chartData.value.datasets.length : 0,
  })

  // Initialize chart after data is loaded
  if (hasChartData.value) {
    initChart()
  }
  // If no data, show empty state instead of falling back to mock data

  // Force chart re-initialization if canvas still not ready after a delay
  setTimeout(() => {
    if (!chartInstance && hasChartData.value) {
      console.log('Delayed chart initialization (canvas/data ready now)...')
      initChart()
    }
  }, 300)
})

// Re-initialize chart whenever data becomes available after loading
watch(
  () => ({ ready: hasChartData.value, loading: dashboardStore.loading }),
  async ({ ready, loading }) => {
    if (!ready || loading) return
    await nextTick()
    if (!chartInstance) {
      initChart()
    }
  },
  { deep: true }
)

// Rebuild chart when chart data shape changes (labels/datasets)
watch(
  () => ({
    labels: Array.isArray(chartData.value?.labels) ? chartData.value.labels.length : 0,
    datasets: Array.isArray(chartData.value?.datasets) ? chartData.value.datasets.length : 0,
    ready: hasChartData.value
  }),
  async ({ labels, datasets, ready }) => {
    console.log('Chart data watcher triggered:', { labels, datasets, ready, hasChartInstance: !!chartInstance, loading: store.loading })

    // Skip if no data yet
    // ⚠️ NOTE: store.loading check removed - chartData computed already has loading guard
    // If chartData fired, data is ready. Don't add redundant loading check here.
    if (!ready || (labels === 0 && datasets === 0)) {
      console.log('Skipping chart init - data not ready')
      return
    }

    // If chart exists, destroy it to force re-render with new data
    if (chartInstance) {
      console.log('Destroying existing chart to re-render with new data')
      chartInstance.destroy()
      chartInstance = null
    }

    // Re-initialize with fresh data
    await nextTick()
    initChart()
  },
  { immediate: false } // Don't run on initial setup, let onMounted handle it
)

// Destroy chart when data is deselected (hasChartData becomes false)
watch(
  () => hasChartData.value,
  (hasData) => {
    if (!hasData && chartInstance) {
      console.log('Clearing chart - no data available')
      chartInstance.destroy()
      chartInstance = null
    }
  }
)

// When compteurs arrive later (e.g., after refresh), hydrate meters store and refresh
watch(
  () => dashboardStore.compteurs,
  async (compteurs) => {
    if (!compteurs || compteurs.length === 0) return
    metersStore.setAllMetersFromDashboard(compteurs as any)
    if (selectedMeterIds.value.length === 0) {
      metersStore.setSelectedMeters(compteurs.slice(0, 8).map(c => c.id))
    }
    await nextTick()
    await refreshData()
    if (!chartInstance && hasChartData.value) {
      initChart()
    }
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// ===========================
// Watchers
// ===========================

// Initialize chart when loading completes and data is ready
watch(
  () => store.loading,
  async (loading) => {
    if (!loading && hasChartData.value) {
      console.log('[Chart] Loading completed and data is ready, initializing chart')
      await nextTick()
      initChart()
    }
  }
)

watch(
  () => chartData.value,
  async () => {
    // Don't initialize while loading - let the loading watcher handle it
    if (store.loading) {
      console.log('[Chart] Skipping chartData watcher - still loading')
      return
    }
    // Ensure DOM is ready before initializing chart
    await nextTick()
    initChart()
  },
  { deep: true }
)

// Re-init chart when toggling back to chart view
watch(viewMode, (m) => {
  if (m === 'chart') {
    initChart()
  }
})

// Refresh chart when meter selection changes (activeCompteurIds toggle)
watch(activeCompteurIds, async () => {
  await nextTick()
  await refreshData()
  initChart()
}, { deep: true })

// Adjust table paging when resolution changes
watch(effectiveResolution, (res) => {
  currentPage.value = 1
  itemsPerPage.value = res === 'hourly' ? 24 : Math.min(100, tableData.value.length)
})

watch([hourFrom, hourTo], () => {
  // Validate range
  if (hourFrom.value > hourTo.value) {
    hourFrom.value = hourTo.value
  }
  // Refresh data when hour range changes
  refreshData()
})

// Debounced refresh function for date selection (wait 500ms after last click)
const debouncedRefreshData = debounce(async () => {
  console.log('[EnergyHistorical] Dates finished changing, calling API...')
  await fetchEnergyHistoryData()
}, 500)

// Refresh data when dates or enabled metrics change
watch([selectedDates, enabledMetrics, activePeriodPreset], async () => {
  console.log('[EnergyHistorical WATCHER] Triggered! Data:', {
    selectedDatesLength: selectedDates.value.length,
    enabledMetricsCount: enabledMetrics.value.filter((m: any) => m.enabled).length,
    activePeriodPreset: activePeriodPreset.value,
    isFetchingData: isFetchingData.value
  })

  // Don't start new API call if one is already in progress
  if (isFetchingData.value) {
    console.log('[EnergyHistorical WATCHER] Skipping - already fetching')
    return
  }

  // If a period preset was selected, fetch data immediately (no debounce)
  if (activePeriodPreset.value) {
    console.log('[EnergyHistorical WATCHER] Period preset detected, calling fetchEnergyHistoryData')
    await fetchEnergyHistoryData()
  } else {
    // For manual date selection, use debounce to wait for user to stop clicking
    console.log('[EnergyHistorical WATCHER] Manual selection, using debounce')
    debouncedRefreshData()
  }
}, { deep: true })
</script>

<style scoped>
.table-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 2rem;
}

.table-zoom-content {
  width: 95vw;
  max-width: 95vw;
  height: 85vh;
  max-height: 85vh;
  background: var(--color-bg, #fff);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
/* Add any component-specific styles here */
.sticky {
  position: sticky;
}

/* Smooth transitions */
button {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #4b5563;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
}
</style>
