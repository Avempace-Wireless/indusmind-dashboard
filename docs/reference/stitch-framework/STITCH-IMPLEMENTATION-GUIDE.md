# Stitch Design Implementation Guide

## Overview
This guide documents the proper implementation of the Indusmind Dashboard using the **actual Stitch design code** from Google Stitch (16 screens captured).

## Design System from Stitch

### Color Palette (Exact from Stitch)
```typescript
// tailwind.config.js
colors: {
  "primary": "#135bec",           // Blue primary
  "background-light": "#f6f6f8",
  "background-dark": "#101622",   // Main dark bg
  "surface-dark": "#1a2230",      // Card backgrounds
  "card-dark": "#1c2534",         // Raised cards  
  "border-dark": "#2a3649",       // Borders
  "sidebar-dark": "#111722",      // Sidebar bg
  "sidebar-hover": "#232f48",     // Hover states
  "text-muted": "#92a4c9",        // Muted text
}
```

### Typography (Exact from Stitch)
- **Font Family**: Inter (400, 500, 600, 700, 900 weights)
- **Mono**: For numbers and metrics
- **Icon Font**: Material Symbols Outlined

### Component Patterns from Stitch Designs

## 1. Dashboard Stat Cards (From tableau_de_bord_-_temps_réel_1)

### Design Specifications:
- Background: `#1c2534`
- Border: `1px solid #2a3649`
- Padding: `p-5` (1.25rem)
- Border radius: `rounded-xl`
- Decorative circle: Absolute positioned `bg-primary/5` that grows on hover to `/10`
- Icon: Top right, Material Symbols, `text-[#92a4c9]`
- Value: `text-3xl font-bold font-mono tracking-tight text-white`
- Trend badge: Rounded-full, colored background `/10`, with icon and percentage

### Vue Component Structure:
```vue
<template>
  <div class="flex flex-col gap-1 rounded-xl bg-[#1c2534] p-5 border border-[#2a3649] shadow-sm relative overflow-hidden group">
    <!-- Decorative background circle -->
    <div class="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
    
    <!-- Header with label and icon -->
    <div class="flex items-center justify-between z-10">
      <p class="text-[#92a4c9] text-sm font-medium">{{ label }}</p>
      <span class="material-symbols-outlined text-[#92a4c9]">{{ icon }}</span>
    </div>
    
    <!-- Value and trend -->
    <div class="flex items-end gap-3 mt-2 z-10">
      <p class="text-white text-3xl font-bold font-mono tracking-tight">{{ value }} {{ unit }}</p>
      <div :class="trendClasses" class="flex items-center gap-1 mb-1 rounded-full px-2 py-0.5">
        <span class="material-symbols-outlined text-sm">{{ trendIcon }}</span>
        <p class="text-xs font-bold">{{ trend }}</p>
      </div>
    </div>
  </div>
</template>
```

## 2. Main Chart Component (Real-time consumption chart)

### Design Specifications:
- Container: `bg-[#1c2534] border border-[#2a3649] rounded-xl`
- Header: `p-6 border-b border-[#2a3649]`
- Time range tabs: `bg-[#111722] rounded-lg p-1 border border-[#2a3649]`
- Active tab: `bg-[#232f48] text-white shadow-sm`
- Chart area: SVG with gradient fill `url(#chartGradient)`
- Grid lines: `stroke="#2a3649" stroke-dasharray="4 4"`
- Chart line: `stroke="#135bec" stroke-width="3"`
- Active point: Pulsing circle with white stroke

### Implementation:
```vue
<div class="flex flex-col rounded-xl bg-[#1c2534] border border-[#2a3649]">
  <!-- Header -->
  <div class="flex items-center justify-between p-6 border-b border-[#2a3649]">
    <div class="flex flex-col gap-1">
      <h2 class="text-white text-lg font-bold">Consommation en Direct</h2>
      <p class="text-[#92a4c9] text-sm">Visualisation sur la dernière heure (60 mins)</p>
    </div>
    
    <!-- Time range selector -->
    <div class="flex bg-[#111722] rounded-lg p-1 border border-[#2a3649]">
      <button class="px-3 py-1 rounded text-xs font-medium text-[#92a4c9] hover:text-white hover:bg-[#232f48]">15m</button>
      <button class="px-3 py-1 rounded text-xs font-bold bg-[#232f48] text-white shadow-sm">1h</button>
      <button class="px-3 py-1 rounded text-xs font-medium text-[#92a4c9] hover:text-white hover:bg-[#232f48]">24h</button>
      <button class="px-3 py-1 rounded text-xs font-medium text-[#92a4c9] hover:text-white hover:bg-[#232f48]">7j</button>
    </div>
  </div>
  
  <!-- Chart body -->
  <div class="p-6 flex flex-col gap-6">
    <!-- Current value -->
    <div class="flex items-baseline gap-4">
      <p class="text-white text-4xl font-bold font-mono tracking-tight">{{ currentValue }} kW</p>
      <span class="text-green-500 text-sm font-medium flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">arrow_upward</span>
        Pic atteint à {{ peakTime }}
      </span>
    </div>
    
    <!-- SVG Chart (use Chart.js with custom styling to match) -->
    <canvas ref="chartCanvas" class="w-full h-64"></canvas>
    
    <!-- X-axis labels -->
    <div class="flex justify-between text-xs font-mono text-[#92a4c9]">
      <span v-for="label in xLabels" :key="label">{{ label }}</span>
    </div>
  </div>
</div>
```

## 3. Phase Balance Widget

### Design Specifications:
- Background: `bg-[#1c2534] border border-[#2a3649] rounded-xl p-6`
- Progress bars: `h-2 w-full rounded-full bg-[#111722]`
- Fill colors: `bg-blue-500`, `bg-cyan-500`, `bg-indigo-500`
- Values: `font-mono text-white`
- Labels: `text-sm text-[#92a4c9]`

```vue
<div class="flex flex-col rounded-xl bg-[#1c2534] border border-[#2a3649] p-6 gap-4">
  <div class="flex items-center justify-between">
    <h3 class="text-white text-base font-bold">Équilibrage des phases</h3>
    <span class="material-symbols-outlined text-[#92a4c9]">equalizer</span>
  </div>
  
  <div class="flex flex-col gap-4">
    <!-- Phase 1 -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between text-sm">
        <span class="text-[#92a4c9]">Phase L1</span>
        <span class="text-white font-mono">230.1 V</span>
      </div>
      <div class="h-2 w-full rounded-full bg-[#111722]">
        <div class="h-full rounded-full bg-blue-500" :style="{width: '75%'}"></div>
      </div>
    </div>
    <!-- Repeat for L2, L3 -->
  </div>
</div>
```

## 4. Events Widget (Recent Alerts)

### Design Specifications:
- Container: `bg-[#1c2534] border border-[#2a3649] rounded-xl overflow-hidden`
- Header: `p-4 border-b border-[#2a3649]`
- List items: `p-4 border-b border-[#2a3649] hover:bg-[#232f48] transition-colors cursor-pointer`
- Icon container: `h-8 w-8 rounded-full flex items-center justify-center`
- Icon bg colors: `bg-red-500/10 text-red-500`, `bg-orange-500/10 text-orange-500`, `bg-green-500/10 text-green-500`

```vue
<div class="flex flex-col rounded-xl bg-[#1c2534] border border-[#2a3649] overflow-hidden">
  <div class="flex items-center justify-between p-4 border-b border-[#2a3649]">
    <h3 class="text-white text-base font-bold">Derniers Événements</h3>
    <button class="text-primary text-xs font-bold uppercase tracking-wider hover:text-blue-400">
      Voir tout
    </button>
  </div>
  
  <div class="flex flex-col overflow-y-auto max-h-[300px]">
    <div v-for="event in events" :key="event.id" 
         class="flex gap-3 p-4 border-b border-[#2a3649] hover:bg-[#232f48] transition-colors cursor-pointer">
      <div :class="eventIconClasses(event.severity)" 
           class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <span class="material-symbols-outlined text-lg">{{ event.icon }}</span>
      </div>
      <div class="flex flex-col gap-0.5">
        <p class="text-white text-sm font-medium">{{ event.message }}</p>
        <p class="text-[#92a4c9] text-xs">{{ event.time }} • {{ event.location }}</p>
      </div>
    </div>
  </div>
</div>
```

## 5. Equipment Table (Bottom section)

### Design Specifications:
- Container: `bg-[#1c2534] border border-[#2a3649] rounded-xl overflow-hidden`
- Header: `p-6 border-b border-[#2a3649]`
- Search input: `bg-[#111722] border border-[#324467] rounded-lg pl-10`
- Table header: `bg-[#1a2333] text-xs uppercase text-[#92a4c9]`
- Table rows: `hover:bg-[#232f48] transition-colors`
- Status badges: `rounded-full bg-{color}-500/10 px-2.5 py-0.5 text-xs font-medium text-{color}-500`
- Progress bars: Mini version, `h-1.5 w-24 rounded-full bg-[#111722]`

## 6. Alerts Page (From alertes_et_notification)

### Stats Cards with Color Accent:
```vue
<div class="bg-white dark:bg-[#1a2230] p-5 rounded-xl border border-slate-200 dark:border-[#324467] shadow-sm relative overflow-hidden">
  <!-- Vertical accent bar -->
  <div class="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
  
  <div class="flex justify-between items-start mb-2">
    <p class="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">{{ label }}</p>
    <span class="material-symbols-outlined text-red-500 bg-red-500/10 p-1.5 rounded-md">{{ icon }}</span>
  </div>
  
  <div class="flex items-baseline gap-2">
    <h3 class="text-3xl font-bold text-slate-900 dark:text-white">{{ value }}</h3>
    <span class="text-emerald-500 text-sm font-medium flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
      <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
      {{ trend }}
    </span>
  </div>
</div>
```

### Filter Tabs:
```vue
<div class="flex bg-slate-100 dark:bg-[#111722] p-1 rounded-lg">
  <button class="px-4 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-[#232f48] text-primary shadow-sm">
    En cours
  </button>
  <button class="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white">
    Historique
  </button>
</div>
```

## Implementation Steps

### Step 1: Update Tailwind Config
Copy exact colors from Stitch:
```javascript
// tailwind.config.js
colors: {
  primary: '#135bec',
  'background-light': '#f6f6f8',
  'background-dark': '#101622',
  'surface-dark': '#1a2230',
  'card-dark': '#1c2534',
  'border-dark': '#2a3649',
  'sidebar-dark': '#111722',
  'sidebar-hover': '#232f48',
  'text-muted': '#92a4c9',
}
```

### Step 2: Add Material Symbols Font
```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Step 3: Recreate Components with Exact Styling
- Use exact class names from Stitch code
- Match spacing, colors, borders precisely
- Copy animation patterns (pulse, transitions, hover states)

### Step 4: Replace Current Implementation
- DashboardView.vue → Use Stitch layout structure
- AlertsView.vue → Use Stitch alerts table
- All gauge components → Match Stitch stat card style

## Key Design Patterns

1. **Decorative Elements**: Floating circles with primary color at low opacity
2. **Hover States**: Consistent `hover:bg-[#232f48]` transitions
3. **Status Indicators**: Color-coded with `/10` opacity backgrounds
4. **Monospace Numbers**: All metrics use `font-mono` class
5. **Icon Consistency**: Material Symbols with hover scale effects
6. **Card Structure**: Always `bg-[#1c2534] border border-[#2a3649]`

## Next Actions

1. Review all 16 Stitch screens to extract component patterns
2. Create component library matching Stitch exactly
3. Replace basic implementations with Stitch-styled versions
4. Test dark mode consistency across all views
