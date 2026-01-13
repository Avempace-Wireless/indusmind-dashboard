<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700 pb-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('comparison.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('comparison.subtitle') }}
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="exportToCSV"
            class="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span class="material-symbols-outlined text-lg">file_download</span>
            {{ t('comparison.buttons.export') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid: 65% Chart Area, 35% Controls -->
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <!-- Left Panel: Chart & Analysis Area (65%) -->
      <div class="xl:col-span-6 space-y-6">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            v-for="card in kpiCards"
            :key="card.label"
            class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
          >
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
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ t(`comparison.chartType.${chartType}`) }} - {{ t(`comparison.mode.${comparisonMode}`) }}
                <span v-if="selectedCharacteristic" class="text-sm text-gray-500 ml-2">
                  ({{ t(`comparison.characteristics.${selectedCharacteristic}`) }})
                </span>
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
                      v-for="period in (comparisonMode === 'byMeters' ? selectedPeriods : [...new Set(comparisonData.map(d => d.periodLabel))])"
                      :key="period"
                      class="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {{ period }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="meter in selectedMeters" :key="meter.id">
                    <td class="border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {{ meter.name }}
                    </td>
                    <td
                      v-for="period in (comparisonMode === 'byMeters' ? selectedPeriods : [...new Set(comparisonData.map(d => d.periodLabel))])"
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
                      {{ comparisonMode === 'byMeters' ? 'Meter' : 'Period' }}
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Value
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Variance %
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="row in comparisonTable" :key="row.label">
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
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Comparison Data Table -->
        <div v-if="chartType !== 'table'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Detailed Comparison</h3>
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
                  v-for="row in paginatedComparisonTable"
                  :key="row.label"
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
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="mt-4 flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <span class="text-xs text-gray-600 dark:text-gray-400">
              {{ (currentTablePage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentTablePage * itemsPerPage, comparisonTable.length) }} of {{ comparisonTable.length }}
            </span>
            <div class="flex gap-2">
              <button
                @click="prevTablePage"
                :disabled="currentTablePage === 1"
                class="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span class="px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                Page {{ currentTablePage }} / {{ totalTablePages }}
              </span>
              <button
                @click="nextTablePage"
                :disabled="currentTablePage === totalTablePages"
                class="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Controls (35%) -->
      <div class="xl:col-span-4 space-y-6">
        <!-- Comparison Mode Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.mode.title') }}</h3>

          <div class="space-y-2">
            <label
                v-for="mode in ['byMeters', 'matrix']"
              :key="mode"
              class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all"
              :class="comparisonMode === mode
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
            >
              <input
                type="radio"
                :value="mode"
                v-model="comparisonMode"
                @change="setComparisonMode(mode as any)"
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

        <!-- Meters Selection -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('comparison.meters.title') }}</h3>
            <button @click="selectAllMeters" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {{ t('comparison.buttons.selectAll') }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="meter in availableMeters"
              :key="meter.id"
              class="flex items-center gap-2 cursor-pointer group p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                :checked="selectedMeterIds.includes(meter.id)"
                @change="toggleMeter(meter.id)"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getMeterColor(meter.name) }"></span>
              <span class="text-xs text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                {{ meter.name }}
              </span>
            </label>
          </div>

          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ t('comparison.meters.selected', { count: selectedMeters.length }) }}
          </div>
        </div>

        <!-- Period Selection -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.periods.title') }}</h3>

          <!-- Period Presets -->
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in ['last7Days', 'last4Weeks', 'last3Months']"
              :key="preset"
              @click="selectPresetAndHideCalendar(preset)"
              :class="[
                'px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                isPresetActive(preset)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ t(`comparison.periods.presets.${preset}`) }}
            </button>
            <button
              v-if="comparisonMode === 'matrix'"
              @click="toggleCustomCalendar"
              :class="[
                'px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                showCustomCalendar
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ t('comparison.periods.presets.custom') }}
            </button>
          </div>

          <!-- Selected Periods Chips -->
          <div class="mt-2 flex flex-wrap gap-1">
            <button
              v-for="d in selectedDates"
              :key="d"
              @click="toggleDate(d)"
              class="px-2 py-0.5 text-xs rounded-full border transition-colors focus:outline-none"
              :class="[
                selectedDates.includes(d)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              ]"
            >
              {{ d }}
            </button>
          </div>

          <!-- Calendar (conditional - only for matrix mode) -->
          <div v-if="showCustomCalendar && comparisonMode === 'matrix'" class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <!-- Month Navigation -->
            <div class="flex items-center justify-between mb-2">
              <button
                @click="prevMonth"
                class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <span class="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <span class="text-xs font-medium text-gray-900 dark:text-white">
                {{ monthLabel }}
              </span>
              <button
                @click="nextMonth"
                class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <span class="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-0.5 mb-1">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-0.5"
              >
                {{ day.substring(0, 1) }}
              </div>
            </div>

            <!-- Calendar Days -->
            <div class="grid grid-cols-7 gap-0.5">
              <button
                v-for="(day, index) in calendarDays"
                :key="index"
                @click="day.isCurrentMonth && day.date && toggleDate(day.date)"
                :disabled="!day.isCurrentMonth"
                :class="[
                  'aspect-square flex items-center justify-center text-xs rounded transition-all relative',
                  day.isCurrentMonth
                    ? day.isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : day.isToday
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                ]"
              >
                {{ day.dateObj ? day.dateObj.getDate() : '' }}
                <span
                    v-if="comparisonMode === 'matrix'"
                  class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"
                ></span>
              </button>
            </div>
          </div>

          <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ selectedDates.length }} dates</span>
              <button v-if="selectedDates.length > 0" @click="clearDates" class="text-blue-600 dark:text-blue-400 hover:underline">
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Characteristics Selection -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.characteristics.title') }}</h3>

          <div class="space-y-2 max-h-48 overflow-y-auto">
            <label
              v-for="characteristic in ['consumption', 'energy', 'cost', 'co2']"
              :key="characteristic"
              class="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="radio"
                :value="characteristic"
                v-model="selectedCharacteristic"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-xs text-gray-700 dark:text-gray-300 capitalize">
                {{ t(`comparison.characteristics.${characteristic}`) }}
              </span>
            </label>
          </div>
        </div>

        <!-- Aggregation Level Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">{{ t('comparison.aggregation.title') }}</h3>

          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="level in ['hourly', 'daily', 'weekly', 'monthly']"
              :key="level"
              @click="setAggregationLevel(level as any)"
              :class="[
                'px-2 py-1.5 text-xs font-medium rounded transition-colors',
                aggregationLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
              :title="t(`comparison.aggregation.${level}`)"
            >
              {{ level === 'hourly' ? 'H' : level === 'daily' ? 'D' : level === 'weekly' ? 'W' : 'M' }}
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
              :class="[
                'p-2 rounded border-2 transition-all flex items-center justify-center',
                chartType === type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useComparisonStore } from '../stores/useComparisonStore'
import AdminLayout from '../components/layout/AdminLayout.vue'
import { Chart, BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
Chart.register(BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const { t, locale } = useI18n()
const store = useComparisonStore()

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
  selectedMeters,
  comparisonData,
  aggregatedLabels,
  activePeriodLabel,
  kpiCards,
  comparisonTable,
  calendarDays
} = storeToRefs(store)

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
  getMeterColor
} = store

// Custom period selection state
const showCustomCalendar = ref(false)

// Selected characteristic (consumption, energy, cost, co2)
const selectedCharacteristic = ref<'consumption' | 'energy' | 'cost' | 'co2'>('consumption')

// Pagination state for Detailed Comparison table
const currentTablePage = ref(1)
const itemsPerPage = 10

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

const totalTablePages = computed(() => Math.ceil(comparisonTable.value.length / itemsPerPage))

const paginatedComparisonTable = computed(() => {
  const start = (currentTablePage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return comparisonTable.value.slice(start, end)
})

function prevTablePage() {
  if (currentTablePage.value > 1) currentTablePage.value--
}

function nextTablePage() {
  if (currentTablePage.value < totalTablePages.value) currentTablePage.value++
}

function selectPresetAndHideCalendar(preset: string) {
  selectPeriodPreset(preset)
  showCustomCalendar.value = false
}

function toggleCustomCalendar() {
  showCustomCalendar.value = !showCustomCalendar.value
}

// Preset helpers for active state
function presetDatesFor(preset: string): string[] {
  const today = new Date()
  const dates: string[] = []
  switch (preset) {
    case 'last7Days':
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dates.push(d.toISOString().split('T')[0])
      }
      break
    case 'last4Weeks':
      for (let i = 3; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - (i * 7))
        dates.push(d.toISOString().split('T')[0])
      }
      break
    case 'last3Months':
      for (let i = 2; i >= 0; i--) {
        const d = new Date(today)
        d.setMonth(d.getMonth() - i)
        dates.push(d.toISOString().split('T')[0])
      }
      break
    default:
      dates.push(today.toISOString().split('T')[0])
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

// Chart instance
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Initialize chart
function initChart() {
  if (!chartCanvas.value || chartType.value === 'heatmap' || chartType.value === 'table') return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (comparisonMode.value === 'byMeters') {
    // One bar/point per meter with different colors
    const labels = comparisonData.value.map(d => d.label || d.meterLabel || '')
    const data = comparisonData.value.map(d => d.value)
    const colors = comparisonData.value.map(d => d.color)

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
    const uniquePeriods = [...new Set(comparisonData.value.map(d => d.periodLabel || d.label || d.periodId))]
    const labels = uniquePeriods.sort()
    const meters = selectedMeters.value

    // Debug logging
    console.log('Chart byPeriods/Matrix mode:', {
      mode: comparisonMode.value,
      dataLength: comparisonData.value.length,
      metersCount: meters.length,
      labelsCount: labels.length,
      labels,
      sampleData: comparisonData.value.slice(0, 5)
    })

    const datasets = meters.map(meter => {
      const meterData = labels.map(label => {
        const item = comparisonData.value.find(d => {
          const idMatch = d.meterId === meter.id || d.id === meter.id
          const periodMatch = d.periodLabel === label || d.periodId === label || d.label === label
          return idMatch && periodMatch
        })
        return item ? item.value : 0
      })

      const color = getMeterColor(meter.name)
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
  const item = comparisonData.value.find(d =>
    (d.meterId === meterId && d.periodId === period) ||
    (d.id === meterId && d.label === period)
  )
  return item ? item.value.toFixed(2) : '0.00'
}

function getHeatmapColor(meterId: string, period: string): string {
  const value = parseFloat(getHeatmapValue(meterId, period))
  const max = Math.max(...comparisonData.value.map(d => d.value))
  const min = Math.min(...comparisonData.value.map(d => d.value))
  const normalized = (value - min) / (max - min)

  // Color gradient from blue (low) to red (high)
  const r = Math.round(normalized * 255)
  const b = Math.round((1 - normalized) * 255)
  return `rgba(${r}, 100, ${b}, 0.3)`
}

// Watch for changes
watch([chartType, comparisonMode, comparisonData, selectedMeters], () => {
  if (chartType.value === 'bar' || chartType.value === 'line') {
    setTimeout(initChart, 100)
  }
}, { deep: true })

onMounted(() => {
  // Initialize store data if needed
  if (selectedMeterIds.value.length === 0) {
    selectAllMeters()
  }

  if (selectedPeriods.value.length === 0 && selectedDates.value.length === 0) {
    selectPeriodPreset('last7Days')
  }

  if (chartType.value === 'bar' || chartType.value === 'line') {
    initChart()
  }
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
/* Component-specific styles */
</style>
