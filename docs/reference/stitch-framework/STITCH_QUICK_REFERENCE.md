# Stitch Dashboard - Quick Reference Guide

## 🎨 Color Palette Quick Reference

```typescript
// Primary Brand Colors
#135bec  - Primary Blue (buttons, links, active states)
#0f4bc9  - Primary Dark (hover states)
#39E079  - Energy Green (success indicators)
#0bda5e  - Bright Green (online status, positive trends)

// Alert/Status Colors
#fa6238  - Warning Orange (anomalies, warnings)
#fbbf24  - Amber (caution alerts)
#ef4444  - Error Red (critical alerts, stop states)
#EA2831  - System Red (important info)

// Background Colors
#101622  - Dark Mode Background
#f6f6f8  - Light Mode Background
#ffffff  - Light Mode Surface
#1e293b  - Dark Mode Card Surface
#111722  - Sidebar Dark

// Borders & Text
#324467  - Dark Border Color
#92a4c9  - Secondary Text
#64748b  - Tertiary Text
```

## 📏 Spacing Scale

```
Gap Sizes:   0.5rem, 1rem, 1.5rem, 2rem, 2.5rem, 3rem
Padding:     1.25rem (cards), 1.5rem (sections), 2rem (containers)
Border R:    0.25rem (sm), 0.5rem (md), 0.75rem (lg), 9999px (full)
Shadow:      shadow-sm (default), shadow-md (hover), shadow-xl (modals)
```

## 🔤 Typography Quick Snippets

```html
<!-- Headings -->
<h1 class="text-4xl font-black">Page Title</h1>
<h2 class="text-3xl font-bold">Section Header</h2>
<h3 class="text-2xl font-bold">Subsection</h3>
<h4 class="text-xl font-bold">Widget Title</h4>

<!-- Body Text -->
<p class="text-base font-normal">Body paragraph</p>
<p class="text-sm font-medium">Secondary label</p>
<span class="text-xs font-medium">Tiny label</span>

<!-- All with dark mode support -->
class="text-slate-900 dark:text-white"
```

## 🎯 Component Templates

### Stat Card
```html
<div class="group flex flex-col gap-1 rounded-xl border border-slate-200 
            bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Label</span>
    <span class="material-symbols-outlined text-slate-400">icon_name</span>
  </div>
  <div class="flex items-baseline gap-2">
    <span class="text-2xl font-bold text-slate-900 dark:text-white">42.5</span>
    <span class="text-lg text-slate-400">kW</span>
  </div>
</div>
```

### Alert Card (Red/Critical)
```html
<div class="flex items-center gap-4 rounded-lg border-l-4 border-l-red-500 
            bg-red-500/10 px-4 py-3 dark:bg-red-900/20">
  <div class="flex h-10 w-10 shrink-0 items-center justify-center 
              rounded-full bg-red-500/20 text-red-500">
    <span class="material-symbols-outlined">error</span>
  </div>
  <div class="flex-1">
    <h3 class="font-semibold text-slate-900 dark:text-white">Alert Title</h3>
    <p class="text-sm text-slate-600 dark:text-slate-400">Alert message</p>
  </div>
</div>
```

### Progress Bar
```html
<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-slate-900 dark:text-white">Power Usage</span>
    <span class="text-sm font-bold text-slate-900 dark:text-white">65%</span>
  </div>
  <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
    <div class="h-full bg-primary transition-all" style="width: 65%"></div>
  </div>
</div>
```

### Button Variants
```html
<!-- Primary -->
<button class="inline-flex items-center justify-center px-4 py-2 h-10 rounded-lg
               bg-primary hover:bg-primary-dark text-white font-bold text-sm
               transition-all active:scale-95">Action</button>

<!-- Secondary -->
<button class="inline-flex items-center justify-center px-4 py-2 h-10 rounded-lg
               border border-slate-200 bg-white hover:bg-slate-50
               text-slate-700 font-medium text-sm
               dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Secondary</button>

<!-- Ghost -->
<button class="text-primary hover:text-primary-dark hover:underline
               font-medium text-sm">Ghost Action</button>
```

### Data Table Row
```html
<tr class="border-b border-slate-200 transition-colors 
           hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
  <td class="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
    Cell content
  </td>
  <td class="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
    <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs 
                 font-medium bg-green-500/10 text-green-700 dark:bg-green-900/20 
                 dark:text-green-400">
      Online
    </span>
  </td>
</tr>
```

## 🔌 Icon Reference

```typescript
// Navigation
dashboard, menu, home, settings, person, logout, language

// Actions  
add, edit, delete, save, download, upload, print, refresh, search

// Alerts
warning, error, info, check_circle, notifications, close, block

// Data
show_chart, trending_up, trending_down, equalizer, pie_chart, bar_chart

// Energy
bolt, electric_bolt, electric_meter, waves, power_settings_new

// Equipment
ac_unit, mode_fan, dns, conveyor_belt, precision_manufacturing

// Time
schedule, calendar_today, calendar_month, history, timer

// Utility
tune, filter_list, more_vert, more_horiz, expand_more, expand_less
```

Source: **Material Symbols Outlined** (Google Fonts)

## 📱 Responsive Grid Patterns

```html
<!-- 4-column on desktop, 2 on tablet, 1 on mobile -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Card items -->
</div>

<!-- 2-column on desktop, 1 on mobile -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Items -->
</div>

<!-- 3-column on medium screens -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <!-- Items -->
</div>

<!-- Complex layout with different spans -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2">Main content</div>
  <div>Sidebar</div>
</div>
```

## 🌙 Dark Mode Implementation

### In Template
```html
<!-- Automatic dark mode support -->
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content that adapts to dark mode
</div>

<!-- Conditional rendering -->
<img v-if="!isDark" src="logo-dark.svg" />
<img v-else src="logo-light.svg" />
```

### Toggle Function
```typescript
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark.value ? 'light' : 'dark');
  isDark.value = !isDark.value;
};
```

## ✅ Common CSS Classes Cheat Sheet

```css
/* Layout */
.flex flex-col gap-4                    /* Vertical stack */
.grid grid-cols-4 gap-6                 /* 4-column grid */
.flex items-center justify-between      /* Horizontal space-between */

/* Text */
.text-2xl font-bold text-slate-900      /* Large bold heading */
.text-sm font-medium text-slate-600     /* Secondary label */
.uppercase tracking-wider                /* Uppercase with letter spacing */

/* Styling */
.rounded-lg border border-slate-200     /* Rounded border */
.bg-white dark:bg-slate-900             /* Light/dark background */
.shadow-md hover:shadow-lg               /* Shadow with hover */
.transition-all                         /* Smooth animation */

/* Colors */
.text-primary                           /* Primary blue */
.bg-red-500/10 text-red-700             /* Red alert styling */
.bg-emerald-500/10 text-emerald-700     /* Green success styling */

/* States */
.hover:bg-slate-50                      /* Hover background */
.focus:ring-2 focus:ring-primary        /* Focus ring */
.active:scale-95                        /* Active click state */
.disabled:opacity-50 disabled:cursor-not-allowed  /* Disabled state */
```

## 🎭 Component Props TypeScript

```typescript
// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: { value: number; isPositive: boolean };
  progress?: number;
}

// Alert Card
interface AlertCardProps {
  icon: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  badgeText?: string;
  timestamp?: string;
}

// Table Column
interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => string;
}
```

## 🚀 Quick Component Creation Template

```vue
<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm
              dark:border-slate-800 dark:bg-slate-900">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ title }}
      </h2>
      <button class="material-symbols-outlined text-slate-400 hover:text-slate-600
                     dark:hover:text-slate-300">more_horiz</button>
    </div>

    <!-- Content -->
    <div class="space-y-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>
```

## 💡 Utility Function Snippets

```typescript
// Format currency
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);

// Format large numbers
const formatNumber = (value: number) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toFixed(0);
};

// Get badge color classes
const getBadgeClasses = (severity: string) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium';
  const variants = {
    critical: 'bg-red-500/10 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    warning: 'bg-orange-500/10 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    info: 'bg-blue-500/10 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    success: 'bg-green-500/10 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  };
  return `${base} ${variants[severity]}`;
};
```

## 📋 Checklist for New Components

- [ ] All text colors support dark mode (dark: prefix)
- [ ] Colors use exact hex values from palette
- [ ] Shadows and borders are consistent
- [ ] Font sizes follow typography hierarchy
- [ ] Spacing uses scale values (gap-4, p-6, etc.)
- [ ] Icons use Material Symbols Outlined
- [ ] Responsive breakpoints tested (sm, md, lg)
- [ ] Hover and active states defined
- [ ] Accessibility features present (aria-label, role, etc.)
- [ ] Component is properly typed with TypeScript

## 📚 File References

| File | Purpose |
|------|---------|
| `STITCH_COMPONENT_PATTERNS.json` | Complete design specifications (1100+ lines) |
| `src/utils/StitchPatterns.ts` | TypeScript utilities & helpers (600+ lines) |
| `STITCH_IMPLEMENTATION_GUIDE_UPDATED.md` | Full implementation guide (800+ lines) |
| `EXTRACTION_SUMMARY.md` | This summary & overview |

## 🔗 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vue 3 Docs](https://vuejs.org/)
- [Material Symbols](https://fonts.google.com/icons)
- [WCAG Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2024
**Framework**: Vue 3 + Tailwind CSS + TypeScript
**Screens Analyzed**: 16 unique dashboard screens

