/**
 * Stitch Dashboard Component Patterns
 * Vue 3 + Tailwind CSS + TypeScript Implementation
 *
 * This file contains reusable component patterns extracted from 16 Stitch design screens
 * Each pattern can be used as a basis for creating Vue components
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  progress?: number;
  background?: string;
  iconBackground?: string;
}

export interface AlertCardProps {
  icon: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  badgeText?: string;
  timestamp?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export interface BadgeConfig {
  type: 'alert' | 'status' | 'default';
  severity?: 'critical' | 'warning' | 'info' | 'success';
}

// ============================================================================
// COLOR PALETTE CONSTANTS
// ============================================================================

export const ColorPalette = {
  primary: '#135bec',
  primaryDark: '#0f4bc9',
  successGreen: '#0bda5e',
  warningOrange: '#fa6238',
  warningAmber: '#fbbf24',
  errorRed: '#ef4444',
  infoRed: '#EA2831',
  backgroundLight: '#f6f6f8',
  backgroundDark: '#101622',
  surfaceLight: '#ffffff',
  surfaceDark: '#1e293b',
  sidebarDark: '#111722',
  cardActiveDark: '#232f48',
  borderDark: '#324467',
  textSecondary: '#92a4c9',
} as const;

// ============================================================================
// TAILWIND CLASSES PATTERNS
// ============================================================================

export const TailwindPatterns = {
  // ===== CARDS =====
  statCard: {
    base: 'flex flex-col gap-1 rounded-xl border shadow-sm hover:shadow-md',
    light: 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
    padding: 'p-5',
    group: 'group relative',
  },

  chartCard: {
    base: 'flex flex-col rounded-xl border shadow-sm',
    light: 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
    padding: 'p-6',
    minHeight: 'min-h-[400px]',
  },

  alertCard: {
    base: 'flex items-center gap-4 rounded-lg border-l-4 px-4 py-3',
    critical: 'bg-red-500/10 border-l-red-500 dark:bg-red-900/20',
    warning: 'bg-orange-500/10 border-l-orange-500 dark:bg-orange-900/20',
    info: 'bg-blue-500/10 border-l-blue-500 dark:bg-blue-900/20',
    success: 'bg-green-500/10 border-l-green-500 dark:bg-green-900/20',
  },

  // ===== BUTTONS =====
  primaryButton: {
    base: 'inline-flex items-center justify-center px-4 py-2 h-10 rounded-lg',
    style: 'bg-primary hover:bg-primary-dark text-white font-bold text-sm',
    shadow: 'shadow-lg shadow-primary/20',
    transition: 'transition-all transform active:scale-95',
  },

  secondaryButton: {
    base: 'inline-flex items-center justify-center px-4 py-2 h-10 rounded-lg',
    style: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300 font-medium text-sm',
    transition: 'transition-colors hover:bg-slate-50 dark:hover:bg-slate-700',
  },

  // ===== INPUTS =====
  textInput: {
    base: 'h-11 px-4 py-2.5 rounded-lg border text-sm',
    light: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    text: 'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
    focus: 'focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none',
  },

  selectInput: {
    base: 'h-11 pl-3 pr-10 rounded-lg border appearance-none text-sm',
    light: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    text: 'text-slate-900 dark:text-white',
  },

  // ===== TABLES =====
  tableContainer: {
    base: 'w-full overflow-x-auto rounded-xl border shadow-sm',
    light: 'border-slate-200 dark:border-slate-800',
  },

  tableHeader: {
    base: 'bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800',
    text: 'px-6 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium',
  },

  tableRow: {
    base: 'border-b border-slate-200 dark:border-slate-800 transition-colors',
    hover: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
  },

  tableCell: {
    base: 'px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium',
  },

  // ===== BADGES =====
  badge: {
    base: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
    critical: 'bg-red-500/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-500/30',
    warning: 'bg-orange-500/10 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    info: 'bg-blue-500/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    success: 'bg-green-500/10 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  },

  // ===== PROGRESS BARS =====
  progressBar: {
    container: 'h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden',
    fill: 'h-full rounded-full transition-all',
  },

  // ===== MODALS =====
  modalOverlay: 'fixed inset-0 bg-black/50 dark:bg-black/70 z-40',
  modalDialog: {
    base: 'relative bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6',
    width: 'max-w-md md:max-w-lg',
    maxHeight: 'max-h-[90vh] overflow-y-auto',
  },

  // ===== NAVIGATION =====
  sidebar: {
    base: 'w-64 border-r border-slate-200 dark:border-slate-800',
    light: 'bg-white dark:bg-slate-900',
    padding: 'p-4',
    layout: 'flex flex-col h-full justify-between',
  },

  navItem: {
    base: 'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
    default: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
    active: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white shadow-md',
  },

  // ===== LAYOUTS =====
  mainLayout: {
    container: 'flex h-screen w-full',
    sidebar: 'w-64 hidden md:flex flex-col flex-shrink-0',
    content: 'flex-1 flex flex-col h-full overflow-hidden',
    header: 'sticky top-0 z-20',
    body: 'flex-1 overflow-y-auto p-6 md:p-8',
  },

  gridLayouts: {
    card4Col: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    card2Col: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    card3Col: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  },
} as const;

// ============================================================================
// COMPONENT PATTERN TEMPLATES
// ============================================================================

/**
 * Stat Card Component
 * Used for displaying KPI metrics with optional trend indicators
 */
export const StatCardTemplate = {
  container: `
    <div class="group relative flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <!-- Header with Icon -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ label }}</span>
        <span v-if="icon" class="material-symbols-outlined text-slate-400">{{ icon }}</span>
      </div>

      <!-- Main Value -->
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ value }}</span>
        <span v-if="unit" class="text-lg font-normal text-slate-400">{{ unit }}</span>
      </div>

      <!-- Trend Indicator -->
      <div v-if="trend" class="mt-1 flex items-center gap-1 rounded-full px-2 py-0.5"
        :class="trend.isPositive ? 'bg-green-500/10' : 'bg-red-500/10'">
        <span class="material-symbols-outlined text-xs"
          :class="trend.isPositive ? 'text-green-500' : 'text-red-500'">
          {{ trend.isPositive ? 'trending_up' : 'trending_down' }}
        </span>
        <span class="text-xs font-medium" :class="trend.isPositive ? 'text-green-600' : 'text-red-600'">
          {{ Math.abs(trend.value) }}%
        </span>
      </div>

      <!-- Optional Progress Bar -->
      <div v-if="progress !== undefined" class="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div class="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
          :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  `,
};

/**
 * Alert Card Component
 * Used for displaying alerts with severity colors and actions
 */
export const AlertCardTemplate = {
  container: `
    <div class="flex items-center gap-4 rounded-lg border-l-4 px-4 py-3"
      :class="{
        'border-l-red-500 bg-red-500/10 dark:bg-red-900/20': severity === 'critical',
        'border-l-orange-500 bg-orange-500/10 dark:bg-orange-900/20': severity === 'warning',
        'border-l-blue-500 bg-blue-500/10 dark:bg-blue-900/20': severity === 'info',
        'border-l-green-500 bg-green-500/10 dark:bg-green-900/20': severity === 'success'
      }">

      <!-- Icon -->
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        :class="{
          'bg-red-500/20 text-red-500': severity === 'critical',
          'bg-orange-500/20 text-orange-500': severity === 'warning',
          'bg-blue-500/20 text-blue-500': severity === 'info',
          'bg-green-500/20 text-green-500': severity === 'success'
        }">
        <span class="material-symbols-outlined">{{ icon }}</span>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col gap-1">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
          <span v-if="badgeText" class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
            :class="{
              'bg-red-500/30 text-red-600 dark:text-red-300': severity === 'critical',
              'bg-orange-500/30 text-orange-600 dark:text-orange-300': severity === 'warning',
              'bg-blue-500/30 text-blue-600 dark:text-blue-300': severity === 'info',
              'bg-green-500/30 text-green-600 dark:text-green-300': severity === 'success'
            }">
            {{ badgeText }}
          </span>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ description }}</p>
        <span v-if="timestamp" class="text-xs text-slate-500 dark:text-slate-500">{{ timestamp }}</span>
      </div>

      <!-- Action Button -->
      <button v-if="actionButton" @click="actionButton.onClick"
        class="shrink-0 text-sm font-medium text-primary hover:underline">
        {{ actionButton.label }}
      </button>
    </div>
  `,
};

/**
 * Data Table Component
 * Used for displaying structured data with sorting and pagination
 */
export const DataTableTemplate = {
  container: `
    <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <table class="w-full">
        <!-- Table Header -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th v-for="column in columns" :key="column.key"
              class="px-6 py-3 text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium"
              :style="{ width: column.width }"
              :class="column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''">
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
          <tr v-for="row in rows" :key="row.id"
            class="border-b border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td v-for="column in columns" :key="column.key"
              class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
              {{ column.render ? column.render(row[column.key], row) : row[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <span class="text-sm text-slate-600 dark:text-slate-400">
        Showing {{ currentPage * pageSize - pageSize + 1 }} to {{ Math.min(currentPage * pageSize, total) }} of {{ total }}
      </span>
      <div class="flex items-center gap-2">
        <button @click="prevPage" class="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="currentPage === 1">Previous</button>
        <button v-for="page in totalPages" :key="page" @click="currentPage = page"
          class="rounded-lg px-3 py-2 text-sm transition-colors"
          :class="currentPage === page ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'">
          {{ page }}
        </button>
        <button @click="nextPage" class="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  `,
};

/**
 * Line Chart Component
 * SVG-based chart for time-series data
 */
export const LineChartTemplate = {
  svgStructure: `
    <div class="relative w-full h-80">
      <svg :viewBox="\`0 0 1000 200\`" preserveAspectRatio="none" class="w-full h-full">
        <!-- Gradient Definition -->
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#135bec" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#135bec" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line v-for="i in 4" :key="i" :x1="0" :y1="i * 50" :x2="1000" :y2="i * 50"
          stroke="#e2e8f0" stroke-dasharray="5,5" stroke-width="1" />

        <!-- Chart Area (Fill under line) -->
        <path :d="chartPath" fill="url(#chartGradient)" />

        <!-- Chart Line -->
        <polyline :points="linePoints" fill="none" stroke="#135bec" stroke-width="3" stroke-linecap="round" />

        <!-- Data Points -->
        <circle v-for="(point, index) in dataPoints" :key="index"
          :cx="point.x" :cy="point.y" r="4" fill="#135bec" stroke="white" stroke-width="2" />
      </svg>

      <!-- Legend -->
      <div class="absolute bottom-4 left-4 flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="h-3 w-3 rounded-full bg-primary"></div>
          <span class="text-sm text-slate-600 dark:text-slate-400">Active Power (kW)</span>
        </div>
      </div>
    </div>
  `,
};

/**
 * Progress Bar Component
 * Used for showing progress/completion percentage
 */
export const ProgressBarTemplate = {
  container: `
    <div class="flex flex-col gap-2">
      <!-- Label -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-900 dark:text-white">{{ label }}</span>
        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ progress }}%</span>
      </div>

      <!-- Progress Bar -->
      <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div class="h-full rounded-full transition-all"
          :style="{ width: progress + '%' }"
          :class="{
            'bg-emerald-500': status === 'success',
            'bg-amber-500': status === 'warning',
            'bg-red-500': status === 'danger',
            'bg-primary': status === 'info'
          }"></div>
      </div>
    </div>
  `,
};

/**
 * Modal/Dialog Component
 * Overlay modal for forms, confirmations, etc.
 */
export const ModalTemplate = {
  container: `
    <teleport to="body">
      <!-- Overlay -->
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 dark:bg-black/70 z-40" @click="close"></div>

      <!-- Dialog -->
      <div v-if="isOpen" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ title }}</h2>
            <button @click="close" class="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Content -->
          <div class="mb-6">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-6">
            <button @click="close" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button @click="confirm" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </teleport>
  `,
};

/**
 * Badge Component
 * Inline badge/tag for labels, statuses, etc.
 */
export const BadgeTemplate = {
  container: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      :class="{
        'bg-red-500/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-500/30': severity === 'critical',
        'bg-orange-500/10 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400': severity === 'warning',
        'bg-blue-500/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400': severity === 'info',
        'bg-green-500/10 text-green-700 dark:bg-green-900/20 dark:text-green-400': severity === 'success'
      }">
      {{ label }}
    </span>
  `,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get badge color classes based on severity
 */
export const getBadgeClasses = (severity: 'critical' | 'warning' | 'info' | 'success') => {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium';

  const severityClasses = {
    critical: 'bg-red-500/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200',
    warning: 'bg-orange-500/10 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    info: 'bg-blue-500/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    success: 'bg-green-500/10 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  };

  return `${baseClasses} ${severityClasses[severity]}`;
};

/**
 * Get status color based on state
 */
export const getStatusColor = (status: 'online' | 'offline' | 'maintenance' | 'error') => {
  const colors = {
    online: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    offline: { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-500' },
    maintenance: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
    error: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
  };

  return colors[status];
};

/**
 * Generate chart data from array of values
 */
export const generateChartData = (values: number[], label: string = 'Series 1') => {
  return {
    labels: values.map((_, i) => `Point ${i + 1}`),
    datasets: [{
      label,
      data: values,
      borderColor: ColorPalette.primary,
      backgroundColor: `${ColorPalette.primary}20`,
      fill: true,
    }],
  };
};

/**
 * Format large numbers with K, M suffixes
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(decimals) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(decimals) + 'K';
  return value.toFixed(decimals);
};

/**
 * Format currency with EUR symbol
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

/**
 * Get trend color and icon
 */
export const getTrendIndicator = (currentValue: number, previousValue: number) => {
  const percentage = ((currentValue - previousValue) / previousValue) * 100;
  const isPositive = percentage > 0;

  return {
    isPositive,
    percentage: Math.abs(percentage),
    icon: isPositive ? 'trending_up' : 'trending_down',
    color: isPositive ? 'text-green-500' : 'text-red-500',
  };
};

// ============================================================================
// COMPONENT EXPORT
// ============================================================================

export default {
  ColorPalette,
  TailwindPatterns,
  StatCardTemplate,
  AlertCardTemplate,
  DataTableTemplate,
  LineChartTemplate,
  ProgressBarTemplate,
  ModalTemplate,
  BadgeTemplate,
  getBadgeClasses,
  getStatusColor,
  generateChartData,
  formatNumber,
  formatCurrency,
  getTrendIndicator,
};
