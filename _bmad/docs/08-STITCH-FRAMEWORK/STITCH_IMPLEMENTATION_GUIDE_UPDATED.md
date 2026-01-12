# Stitch Component Patterns - Vue 3 Implementation Guide

## Overview

This guide provides comprehensive instructions for implementing Vue 3 components based on the Stitch design patterns extracted from 16 dashboard screens. All patterns use Tailwind CSS for styling and TypeScript for type safety.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Color System](#color-system)
3. [Component Patterns](#component-patterns)
4. [Layout Patterns](#layout-patterns)
5. [Responsive Design](#responsive-design)
6. [Dark Mode](#dark-mode)
7. [Typography](#typography)
8. [Interactive Elements](#interactive-elements)
9. [Implementation Examples](#implementation-examples)
10. [Accessibility](#accessibility)

---

## Getting Started

### Installation

Ensure your project has the following dependencies:

```bash
npm install vue@3 tailwindcss postcss autoprefixer @headlessui/vue
npm install -D typescript
```

### Tailwind Configuration

Update `tailwind.config.js` to match Stitch design system:

```javascript
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#135bec',
        'primary-dark': '#0f4bc9',
        'surface-dark': '#1e293b',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
```

---

## Color System

### Primary Colors

```typescript
// Use in TypeScript
import { ColorPalette } from '@/utils/StitchPatterns';

const primaryColor = ColorPalette.primary; // #135bec
const errorColor = ColorPalette.errorRed; // #ef4444
const successColor = ColorPalette.successGreen; // #0bda5e
```

### Applying Colors in Templates

```vue
<!-- Primary color for main actions -->
<button class="bg-primary text-white">Action</button>

<!-- Status colors for alerts -->
<span class="bg-red-500/10 text-red-700">Critical</span>
<span class="bg-amber-500/10 text-amber-700">Warning</span>
<span class="bg-emerald-500/10 text-emerald-700">Success</span>

<!-- Dark mode support -->
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content
</div>
```

---

## Component Patterns

### 1. Stat Card Component

**Usage**: Display KPI metrics with values, trends, and optional progress.

**Vue Component Example**:

```vue
<template>
  <div class="group relative flex flex-col gap-1 rounded-xl border border-slate-200 
              bg-white p-5 shadow-sm transition-all hover:shadow-md 
              dark:border-slate-800 dark:bg-slate-900">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-slate-600 dark:text-slate-400">
        {{ label }}
      </span>
      <span v-if="icon" class="material-symbols-outlined text-slate-400">
        {{ icon }}
      </span>
    </div>

    <!-- Main Value -->
    <div class="flex items-baseline gap-2">
      <span class="text-2xl font-bold text-slate-900 dark:text-white">
        {{ value }}
      </span>
      <span v-if="unit" class="text-lg font-normal text-slate-400">
        {{ unit }}
      </span>
    </div>

    <!-- Trend -->
    <div v-if="trend" class="mt-1 inline-flex items-center gap-1 rounded-full 
                              px-2 py-0.5"
         :class="trend.isPositive 
           ? 'bg-emerald-500/10' 
           : 'bg-red-500/10'">
      <span class="material-symbols-outlined text-xs"
            :class="trend.isPositive 
              ? 'text-emerald-500' 
              : 'text-red-500'">
        {{ trend.isPositive ? 'trending_up' : 'trending_down' }}
      </span>
      <span class="text-xs font-medium"
            :class="trend.isPositive 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-red-600 dark:text-red-400'">
        {{ Math.abs(trend.value) }}%
      </span>
    </div>

    <!-- Progress Bar -->
    <div v-if="progress !== undefined" class="mt-3 h-2 w-full overflow-hidden 
                                             rounded-full bg-slate-100 dark:bg-slate-700">
      <div class="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
           :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: { value: number; isPositive: boolean };
  progress?: number;
}

defineProps<Props>();
</script>
```

### 2. Alert Card Component

**Usage**: Display alerts with severity levels and action buttons.

```vue
<template>
  <div class="flex items-center gap-4 rounded-lg border-l-4 px-4 py-3"
       :class="severityClasses">
    <!-- Icon Container -->
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
         :class="iconClasses">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col gap-1">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-slate-900 dark:text-white">
          {{ title }}
        </h3>
        <span v-if="badgeText" class="inline-flex items-center rounded-full 
                                       px-2 py-1 text-xs font-medium"
              :class="badgeClasses">
          {{ badgeText }}
        </span>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        {{ description }}
      </p>
      <span v-if="timestamp" class="text-xs text-slate-500">
        {{ timestamp }}
      </span>
    </div>

    <!-- Action Button -->
    <button v-if="actionButton" @click="actionButton.onClick"
            class="shrink-0 text-sm font-medium text-primary hover:underline">
      {{ actionButton.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  badgeText?: string;
  timestamp?: string;
  actionButton?: { label: string; onClick: () => void };
}

const props = defineProps<Props>();

const severityClasses = computed(() => ({
  'border-l-red-500 bg-red-500/10 dark:bg-red-900/20': 
    props.severity === 'critical',
  'border-l-orange-500 bg-orange-500/10 dark:bg-orange-900/20': 
    props.severity === 'warning',
  'border-l-blue-500 bg-blue-500/10 dark:bg-blue-900/20': 
    props.severity === 'info',
  'border-l-green-500 bg-green-500/10 dark:bg-green-900/20': 
    props.severity === 'success',
}));

const iconClasses = computed(() => ({
  'bg-red-500/20 text-red-500': props.severity === 'critical',
  'bg-orange-500/20 text-orange-500': props.severity === 'warning',
  'bg-blue-500/20 text-blue-500': props.severity === 'info',
  'bg-green-500/20 text-green-500': props.severity === 'success',
}));

const badgeClasses = computed(() => ({
  'bg-red-500/30 text-red-600 dark:text-red-300': 
    props.severity === 'critical',
  'bg-orange-500/30 text-orange-600 dark:text-orange-300': 
    props.severity === 'warning',
  'bg-blue-500/30 text-blue-600 dark:text-blue-300': 
    props.severity === 'info',
  'bg-green-500/30 text-green-600 dark:text-green-300': 
    props.severity === 'success',
}));
</script>
```

### 3. Data Table Component

**Usage**: Display tabular data with sorting and pagination.

```vue
<template>
  <div>
    <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm 
                dark:border-slate-800">
      <table class="w-full">
        <!-- Header -->
        <thead class="border-b border-slate-200 bg-slate-50 dark:border-slate-800 
                      dark:bg-slate-800">
          <tr>
            <th v-for="col in columns" :key="col.key"
                class="px-6 py-3 text-left text-xs uppercase tracking-wider 
                       text-slate-500 dark:text-slate-400 font-medium"
                :style="{ width: col.width }">
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
          <tr v-for="row in paginatedRows" :key="row.id"
              class="border-b border-slate-200 transition-colors 
                     hover:bg-slate-50 dark:border-slate-800 
                     dark:hover:bg-slate-800/50">
            <td v-for="col in columns" :key="col.key"
                class="px-6 py-4 text-sm font-medium text-slate-700 
                       dark:text-slate-300">
              {{ col.render ? col.render(row[col.key], row) : row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <span class="text-sm text-slate-600 dark:text-slate-400">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ rows.length }}
      </span>
      <div class="flex items-center gap-2">
        <button @click="currentPage--"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm 
                       hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                :disabled="currentPage === 1">
          Previous
        </button>
        <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                class="rounded-lg px-3 py-2 text-sm transition-colors"
                :class="currentPage === page 
                  ? 'bg-primary text-white' 
                  : 'border border-slate-200 hover:bg-slate-50 dark:border-slate-700'">
          {{ page }}
        </button>
        <button @click="currentPage++"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm 
                       hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                :disabled="currentPage === totalPages">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Column {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => string;
}

interface Props {
  columns: Column[];
  rows: any[];
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
});

const currentPage = ref(1);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return props.rows.slice(start, start + props.pageSize);
});

const totalPages = computed(() => 
  Math.ceil(props.rows.length / props.pageSize)
);

const startIndex = computed(() => 
  (currentPage.value - 1) * props.pageSize
);

const endIndex = computed(() => 
  Math.min(currentPage.value * props.pageSize, props.rows.length)
);
</script>
```

### 4. Line Chart Component

**Usage**: Display time-series data with gradients and grid lines.

```vue
<template>
  <div class="relative h-80 w-full">
    <svg :viewBox="`0 0 ${width} ${height}`" 
         preserveAspectRatio="none" 
         class="h-full w-full">
      <!-- Gradient Definition -->
      <defs>
        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#135bec" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#135bec" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Grid Lines -->
      <line v-for="i in 4" :key="`grid-${i}`"
            :x1="0" :y1="i * 50" :x2="width" :y2="i * 50"
            stroke="#e2e8f0" stroke-dasharray="5,5" stroke-width="1" />

      <!-- Filled Area -->
      <path :d="areaPath" fill="url(#chartGradient)" />

      <!-- Line -->
      <polyline :points="linePoints" fill="none" stroke="#135bec" 
                stroke-width="3" stroke-linecap="round" />

      <!-- Data Points -->
      <circle v-for="(point, idx) in scaledPoints" :key="`point-${idx}`"
              :cx="point.x" :cy="point.y" r="4" 
              fill="#135bec" stroke="white" stroke-width="2" />
    </svg>

    <!-- Legend -->
    <div class="absolute bottom-4 left-4 flex items-center gap-2">
      <div class="h-3 w-3 rounded-full bg-primary"></div>
      <span class="text-sm text-slate-600 dark:text-slate-400">
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  data: number[];
  label?: string;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Data Series',
  width: 1000,
  height: 200,
});

const minValue = computed(() => Math.min(...props.data));
const maxValue = computed(() => Math.max(...props.data));
const range = computed(() => maxValue.value - minValue.value || 1);

const scaledPoints = computed(() => {
  const xStep = props.width / (props.data.length - 1);
  return props.data.map((value, index) => ({
    x: index * xStep,
    y: props.height - ((value - minValue.value) / range.value) * props.height,
  }));
});

const linePoints = computed(() => 
  scaledPoints.value.map(p => `${p.x},${p.y}`).join(' ')
);

const areaPath = computed(() => {
  const points = scaledPoints.value;
  const bottom = props.height;
  
  let path = `M ${points[0].x},${points[0].y}`;
  points.forEach(p => {
    path += ` L ${p.x},${p.y}`;
  });
  path += ` L ${points[points.length - 1].x},${bottom}`;
  path += ` L ${points[0].x},${bottom} Z`;
  
  return path;
});
</script>
```

### 5. Progress Bar Component

**Usage**: Show progress with visual indicators.

```vue
<template>
  <div class="flex flex-col gap-2">
    <!-- Label -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-slate-900 dark:text-white">
        {{ label }}
      </span>
      <span class="text-sm font-bold text-slate-900 dark:text-white">
        {{ progress }}%
      </span>
    </div>

    <!-- Bar -->
    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 
                dark:bg-slate-700">
      <div class="h-full rounded-full transition-all"
           :style="{ width: progress + '%' }"
           :class="{
             'bg-emerald-500': status === 'success',
             'bg-amber-500': status === 'warning',
             'bg-red-500': status === 'danger',
             'bg-primary': !status,
           }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  progress: number;
  status?: 'success' | 'warning' | 'danger';
}

defineProps<Props>();
</script>
```

---

## Layout Patterns

### Main Layout with Sidebar

```vue
<template>
  <div class="flex h-screen w-full bg-background-light dark:bg-background-dark">
    <!-- Sidebar -->
    <aside class="w-64 hidden md:flex flex-col border-r border-slate-200 
                   bg-white dark:border-slate-800 dark:bg-slate-900">
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 border-b 
                   border-slate-200 dark:border-slate-800">
        <span class="text-2xl font-bold bg-gradient-to-br from-primary 
                     to-blue-400 bg-clip-text text-transparent">
          Dashboard
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <a v-for="item in navItems" :key="item.id"
           :href="item.href"
           class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm 
                  font-medium transition-colors"
           :class="item.active 
             ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white' 
             : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'">
          <span class="material-symbols-outlined">{{ item.icon }}</span>
          {{ item.label }}
        </a>
      </nav>

      <!-- User Profile -->
      <div class="border-t border-slate-200 p-4 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <img :src="user.avatar" class="h-10 w-10 rounded-full" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 dark:text-white 
                      truncate">
              {{ user.name }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {{ user.email }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <header class="sticky top-0 z-20 border-b border-slate-200 
                     bg-white/80 backdrop-blur-md dark:border-slate-800 
                     dark:bg-slate-900/80">
        <div class="flex items-center justify-between px-6 h-16">
          <!-- Mobile Menu -->
          <button class="md:hidden material-symbols-outlined text-slate-600 
                         dark:text-slate-400">
            menu
          </button>

          <!-- Title -->
          <h1 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ currentPage }}
          </h1>

          <!-- User Controls -->
          <div class="flex items-center gap-4">
            <button class="material-symbols-outlined text-slate-600 
                          dark:text-slate-400 hover:text-slate-900 
                          dark:hover:text-white">
              notifications
            </button>
            <button class="material-symbols-outlined text-slate-600 
                          dark:text-slate-400 hover:text-slate-900 
                          dark:hover:text-white">
              settings
            </button>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentPage = ref('Dashboard');
const user = ref({
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
});

const navItems = ref([
  { id: 1, label: 'Dashboard', icon: 'dashboard', href: '/', active: true },
  { id: 2, label: 'Analytics', icon: 'show_chart', href: '/analytics', active: false },
  { id: 3, label: 'Reports', icon: 'download', href: '/reports', active: false },
  { id: 4, label: 'Settings', icon: 'settings', href: '/settings', active: false },
]);
</script>
```

---

## Responsive Design

### Breakpoint Usage

```vue
<template>
  <!-- 4-column on desktop, 2 on tablet, 1 on mobile -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="i in 4" :key="i" class="bg-white p-4 rounded-lg">
      Card {{ i }}
    </div>
  </div>

  <!-- Hide on mobile, show on tablet+ -->
  <aside class="hidden md:block w-64">
    Sidebar content
  </aside>

  <!-- Different padding on different sizes -->
  <div class="p-4 md:p-6 lg:p-8">
    Responsive padding
  </div>
</template>
```

### Breakpoints:
- **sm**: 640px (tablets)
- **md**: 768px (small laptops)
- **lg**: 1024px (laptops)
- **xl**: 1280px (desktops)

---

## Dark Mode

### Toggling Dark Mode

```typescript
// In a composable: useTheme.ts
import { ref, watch } from 'vue';

export const useTheme = () => {
  const isDark = ref(false);

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      isDark.value = true;
    }
  };

  return { isDark, toggleDarkMode, initTheme };
};
```

### Using Dark Mode in Components

```vue
<template>
  <!-- Automatic dark mode support -->
  <div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
    <h1 class="text-2xl font-bold">Dark Mode Ready</h1>
  </div>

  <!-- Conditional rendering -->
  <img v-if="!isDark" src="logo-dark.svg" alt="Logo" />
  <img v-else src="logo-light.svg" alt="Logo" />
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark, toggleDarkMode } = useTheme();
</script>
```

---

## Typography

### Heading Hierarchy

```vue
<template>
  <!-- H1: Page titles -->
  <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
    Main Title
  </h1>

  <!-- H2: Section headers -->
  <h2 class="text-3xl font-bold text-slate-900 dark:text-white mt-8">
    Section Header
  </h2>

  <!-- H3: Subsection headers -->
  <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-6">
    Subsection
  </h3>

  <!-- H4: Widget titles -->
  <h4 class="text-xl font-bold text-slate-900 dark:text-white">
    Widget Title
  </h4>

  <!-- Body text -->
  <p class="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
    Body paragraph text
  </p>

  <!-- Small text -->
  <span class="text-sm text-slate-500 dark:text-slate-500">
    Helper text
  </span>

  <!-- Tiny text -->
  <span class="text-xs text-slate-400 dark:text-slate-600">
    Micro label
  </span>
</template>
```

---

## Interactive Elements

### Button States

```vue
<template>
  <!-- Default -->
  <button class="px-4 py-2 rounded-lg bg-primary text-white font-bold 
                 hover:bg-primary-dark transition-colors">
    Action
  </button>

  <!-- Disabled -->
  <button disabled class="px-4 py-2 rounded-lg bg-slate-300 text-slate-500 
                          cursor-not-allowed opacity-50">
    Disabled
  </button>

  <!-- Loading -->
  <button class="px-4 py-2 rounded-lg bg-primary text-white font-bold">
    <span class="animate-spin inline-block">⏳</span>
    Loading...
  </button>

  <!-- With Icon -->
  <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary 
                 text-white font-bold">
    <span class="material-symbols-outlined">save</span>
    Save Changes
  </button>
</template>
```

### Form Elements

```vue
<template>
  <!-- Text Input -->
  <input type="text" placeholder="Enter value..."
         class="h-11 px-4 py-2.5 rounded-lg border border-slate-200 
                bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary 
                focus:border-transparent dark:bg-slate-800 dark:text-white" />

  <!-- Select -->
  <select class="h-11 px-4 py-2.5 rounded-lg border border-slate-200 
                 bg-slate-50 text-slate-900 appearance-none 
                 dark:bg-slate-800 dark:text-white">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>

  <!-- Toggle Switch -->
  <label class="flex items-center cursor-pointer">
    <input type="checkbox" class="w-11 h-6 rounded-full appearance-none 
                                  bg-slate-200 peer dark:bg-slate-700 
                                  peer-checked:bg-primary cursor-pointer" />
    <span class="ms-3 text-sm font-medium text-slate-900 dark:text-white">
      Enable Feature
    </span>
  </label>

  <!-- Checkbox -->
  <label class="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" class="w-4 h-4 accent-primary rounded border-slate-300" />
    <span class="text-sm text-slate-700 dark:text-slate-300">
      Accept terms
    </span>
  </label>

  <!-- Range Slider -->
  <input type="range" min="0" max="100" value="50"
         class="w-full h-2 bg-slate-200 rounded-lg appearance-none 
                cursor-pointer accent-primary dark:bg-slate-700" />
</template>
```

---

## Implementation Examples

### Example: Energy Dashboard Screen

```vue
<template>
  <div class="space-y-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard v-for="stat in stats" :key="stat.id"
        :label="stat.label"
        :value="stat.value"
        :unit="stat.unit"
        :icon="stat.icon"
        :trend="stat.trend"
        :progress="stat.progress" />
    </div>

    <!-- Main Chart and Alerts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Card -->
      <div class="lg:col-span-2 rounded-xl border border-slate-200 
                  bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Active Power Consumption
          </h2>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1.5 rounded-lg text-sm font-medium 
                          bg-slate-100 text-slate-700 hover:bg-slate-200 
                          dark:bg-slate-800 dark:text-slate-300">
              Last 24h
            </button>
          </div>
        </div>
        <LineChart :data="chartData" label="Power (kW)" />
      </div>

      <!-- Alerts Sidebar -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 
                   dark:text-slate-400">
          Recent Alerts
        </h3>
        <AlertCard v-for="alert in alerts" :key="alert.id"
          :icon="alert.icon"
          :title="alert.title"
          :description="alert.description"
          :severity="alert.severity"
          :timestamp="alert.timestamp" />
      </div>
    </div>

    <!-- Equipment Table -->
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm 
                dark:border-slate-800 dark:bg-slate-900">
      <h3 class="mb-6 text-lg font-bold text-slate-900 dark:text-white">
        Equipment Status
      </h3>
      <DataTable :columns="equipmentColumns" :rows="equipmentData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StatCard from '@/components/StatCard.vue';
import AlertCard from '@/components/AlertCard.vue';
import DataTable from '@/components/DataTable.vue';
import LineChart from '@/components/LineChart.vue';

const stats = ref([
  {
    id: 1,
    label: 'Puissance Instantanée',
    value: '42.5',
    unit: 'kW',
    icon: 'bolt',
    trend: { value: 5.2, isPositive: false },
    progress: 65,
  },
  // ... more stats
]);

const chartData = ref([28, 35, 32, 45, 42, 38, 40, 45, 48, 42, 35, 30]);

const alerts = ref([
  {
    id: 1,
    icon: 'warning',
    title: 'High Frequency Deviation',
    description: 'Frequency exceeds 50.5 Hz',
    severity: 'warning' as const,
    timestamp: '2 minutes ago',
  },
  // ... more alerts
]);

const equipmentColumns = ref([
  { key: 'name', label: 'Equipment', width: '30%' },
  { key: 'status', label: 'Status', width: '20%' },
  { key: 'power', label: 'Power', width: '20%' },
  { key: 'efficiency', label: 'Efficiency', width: '30%' },
]);

const equipmentData = ref([
  { id: 1, name: 'HVAC System', status: 'Online', power: '8.5 kW', efficiency: '94%' },
  // ... more equipment
]);
</script>
```

---

## Accessibility

### ARIA Labels

```vue
<template>
  <!-- Buttons -->
  <button aria-label="Close dialog" @click="closeModal">
    <span class="material-symbols-outlined" aria-hidden="true">close</span>
  </button>

  <!-- Links -->
  <a href="/dashboard" aria-current="page">Dashboard</a>

  <!-- Forms -->
  <label for="email" class="block text-sm font-medium mb-2">Email Address</label>
  <input id="email" type="email" aria-describedby="email-help" />
  <p id="email-help" class="text-xs text-slate-500 mt-1">
    We'll never share your email
  </p>

  <!-- Alerts -->
  <div role="alert" class="bg-red-500/10 text-red-700 p-4 rounded-lg">
    This is an important alert
  </div>

  <!-- Custom Select -->
  <div role="combobox" aria-expanded="isOpen" aria-haspopup="listbox">
    <button aria-label="Select an option">
      {{ selectedValue }}
    </button>
    <ul v-if="isOpen" role="listbox">
      <li v-for="option in options" :key="option" role="option">
        {{ option }}
      </li>
    </ul>
  </div>
</template>
```

### Focus Management

```vue
<template>
  <!-- Clear focus indicator -->
  <button class="focus:ring-2 focus:ring-primary focus:outline-none">
    Action Button
  </button>

  <!-- Skip to main content -->
  <a href="#main" class="sr-only focus:not-sr-only">
    Skip to main content
  </a>

  <!-- Tab order -->
  <input type="text" tabindex="1" />
  <button tabindex="2">Save</button>
  <button tabindex="3">Cancel</button>
</template>
```

---

## Best Practices

1. **Color Contrast**: Ensure 4.5:1 contrast ratio for text
2. **Keyboard Navigation**: All interactive elements must be keyboard accessible
3. **ARIA Labels**: Use semantic HTML and ARIA attributes
4. **Performance**: Lazy load images and code split components
5. **Dark Mode**: Always support dark mode variants
6. **Responsive**: Test on mobile, tablet, and desktop sizes
7. **Accessibility**: Test with screen readers and keyboard navigation
8. **Type Safety**: Use TypeScript for all components
9. **Composition**: Create small, reusable components
10. **Documentation**: Document component props and usage

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Material Symbols](https://fonts.google.com/icons)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

