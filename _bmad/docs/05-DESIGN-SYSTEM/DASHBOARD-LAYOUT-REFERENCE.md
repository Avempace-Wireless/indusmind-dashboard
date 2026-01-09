# Dashboard Widget Layout Reference

## Widget Anatomy

### Vertical KPI Card Structure

```
┌──────────────────────────────────────────────┐
│  HEADER (colored border-top)                 │
│  ⚡ [Name] – Conso instantanée      [color]  │
│  [Subtitle text]                             │
├──────────────────────────────────────────────┤
│  KPI ROW 1: INSTANTANEOUS                    │
│  Instantanée               Maintenant        │
│  [VALUE] kW                          [3xl]   │
│  ▂▃▅▆▇█  (sparkline)                         │
├──────────────────────────────────────────────┤
│  KPI ROW 2: TODAY                            │
│  Conso du jour            10m ago            │
│  [VALUE] kWh                         [2xl]   │
├──────────────────────────────────────────────┤
│  KPI ROW 3: YESTERDAY                        │
│  Conso d'hier             1d ago             │
│  [VALUE] kWh                         [2xl]   │
└──────────────────────────────────────────────┘
```

---

## Color Mapping

| Category | Color | Border | Text | Background (sparkline) |
|----------|-------|--------|------|----------------------|
| TGBT | Red | `border-red-500` | `text-red-600/500` | `bg-red-500` |
| Compresseurs | Green | `border-green-500` | `text-green-600/500` | `bg-green-500` |
| Clim | Blue | `border-blue-500` | `text-blue-600/500` | `bg-blue-500` |
| Éclairage | Yellow | `border-yellow-500` | `text-yellow-600/500` | `bg-yellow-500` |

---

## Responsive Grid Behavior

### 1 Compteur Selected
```
Mobile:       Desktop:
┌────────┐    ┌────────┐
│  TGBT  │    │  TGBT  │
└────────┘    └────────┘
```

### 2 Compteurs Selected
```
Mobile:       Tablet+:
┌────────┐    ┌────────┬────────┐
│  TGBT  │    │  TGBT  │ Comp.  │
├────────┤    └────────┴────────┘
│ Comp.  │
└────────┘
```

### 3 Compteurs Selected
```
Mobile:       Tablet:         Desktop:
┌────────┐    ┌────────┬────┐  ┌───┬───┬────┐
│  TGBT  │    │  TGBT  │Comp│  │TGB│Com│Clim│
├────────┤    ├────────┼────┤  └───┴───┴────┘
│ Comp.  │    │  Clim  │    │
├────────┤    └────────┴────┘
│  Clim  │
└────────┘
```

### 4+ Compteurs Selected
```
Mobile:       Tablet:         Desktop:        XL:
┌────────┐    ┌────┬────┐     ┌──┬──┬──┐     ┌─┬─┬─┬─┐
│  TGBT  │    │TGB │Comp│     │TB│Co│Cl│     │T│C│C│E│
├────────┤    ├────┼────┤     ├──┼──┼──┤     │G│o│l│c│
│ Comp.  │    │Clim│Ecl │     │Ec│   │  │     │B│m│i│l│
├────────┤    └────┴────┘     └──┴──┴──┘     └─┴─┴─┴─┘
│  Clim  │
├────────┤
│  Écl.  │
└────────┘

grid-cols-1     grid-cols-2    grid-cols-3    grid-cols-4
```

---

## Selector Modal Layout

### Item Structure (Two-Column Grid)

```
┌─────────────────────────────────────────────────────┐
│  [Search box]  [Tout sélectionner] [Tout désél.]    │
│  [ 4 sur 6 compteurs sélectionnés ]                 │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ ☑ TGBT    [TGBT]  │  │ ☐ Comp. 2  [COMP] │    │
│  │   6479.5 kW  ·    │  │   2156.3 kW  ·     │    │
│  │   PM2200-TGBT...  │  │   Compress. sec.   │    │
│  │               ✓   │  │                    │    │
│  └────────────────────┘  └────────────────────┘    │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ ☑ Compr.  [COMP]  │  │ ☐ Clim Bur [CLIM] │    │
│  │   4605.0 kW  ·    │  │   1245.7 kW  ·     │    │
│  │   Compress. ind.  │  │   Clim bureaux     │    │
│  │               ✓   │  │                    │    │
│  └────────────────────┘  └────────────────────┘    │
│  ┌────────────────────┐                            │
│  │ ☑ Clim    [CLIM]  │                            │
│  │   3785.5 kW  ·    │                            │
│  │   Clim générale   │                            │
│  │               ✓   │                            │
│  └────────────────────┘                            │
├─────────────────────────────────────────────────────┤
│  [Annuler]                    [Appliquer (4)]      │
└─────────────────────────────────────────────────────┘
```

---

## Sparkline Visualization

### 7-Bar Gradient (Showing Trend)

```
Height %:  40% 55% 65% 50% 75% 85% 100%
Opacity:   40% 50% 60% 70% 80% 90% 100%

Visual:    ▂   ▃   ▅   ▃   ▆   ▇   █
```

**Implementation:**
- 7 vertical bars (1px wide)
- Heights vary to simulate data trend
- Opacity increases left-to-right (oldest to newest)
- Background color matches category semantic color
- Container: `h-8 bg-slate-100 dark:bg-slate-800`

---

## Typography Scale

| Element | Size | Weight | Color (Light) | Color (Dark) |
|---------|------|--------|---------------|--------------|
| Widget title | base | bold | slate-900 | slate-100 |
| Subtitle | xs | normal | slate-600 | slate-400 |
| KPI label | xs | medium | slate-600 | slate-400 |
| Timestamp | xs | normal | slate-500 | slate-500 |
| Instant value | 3xl | bold | [semantic] | [semantic] |
| Today/Yesterday | 2xl | bold | slate-900 | slate-100 |
| Unit | sm | medium | slate-600 | slate-400 |

---

## Spacing System

### Widget Internal
- **Header padding:** `px-4 py-3`
- **KPI row padding:** `px-4 py-4`
- **Section divider:** `divide-y divide-slate-200/700`
- **Value gap:** `gap-1` (value + unit)

### Grid
- **Gap between widgets:** `gap-6`

### Selector Modal
- **Item padding:** `p-3`
- **Grid gap:** `gap-2`
- **Footer padding:** `px-6 py-5`

---

## States & Interactions

### Widget Hover
- **Default:** `shadow-sm`
- **Hover:** `shadow-md`
- **Transition:** `transition-shadow`

### Selector Item
- **Unselected:**
  - Border: `border-slate-200/700`
  - Background: `bg-white / bg-slate-900`
- **Selected:**
  - Border: `border-slate-300/700`
  - Background: `bg-slate-50 / bg-slate-800/40`
  - Checkmark visible (right side)
- **Hover:** `hover:bg-slate-50 / hover:bg-slate-800`

### Loading Overlay
- **Background:** `bg-white/80 dark:bg-slate-900/80`
- **Backdrop:** `backdrop-blur-sm`
- **Icon:** Spinning sync icon, `animate-spin`

---

## Accessibility Features

### ARIA Labels
- Checkboxes: `id="compteur-{id}"`
- Labels: `for="compteur-{id}"`

### Focus States
- Buttons: `focus:ring-2 focus:ring-slate-300/700`
- Checkboxes: `focus:ring-2 focus:ring-slate-300/700`

### Keyboard Navigation
- Tab through all interactive elements
- Space/Enter to toggle checkboxes
- Escape to close modal

---

## Empty States

### No Compteurs Selected (Dashboard)
```
┌─────────────────────────────────────────┐
│                                         │
│          📊  (Large icon)               │
│                                         │
│     Aucun compteur sélectionné          │
│     Sélectionnez des compteurs pour     │
│     afficher les données                │
│                                         │
│     [+ Ajouter des compteurs]           │
│                                         │
└─────────────────────────────────────────┘
```

### No Search Results (Selector)
```
┌──────────────────────────────┐
│     🔍  (Filter icon)        │
│                              │
│  Aucun résultat pour "xyz"   │
└──────────────────────────────┘
```

---

## Implementation Notes

### Theme Variables Used
- **Backgrounds:** `white`, `slate-50/900`
- **Borders:** `slate-200/700`
- **Text primary:** `slate-900/100`
- **Text secondary:** `slate-600/400`
- **Text muted:** `slate-500`

### Dark Mode Strategy
- All classes use Tailwind's `dark:` variant
- No custom CSS variables needed
- Automatic theme detection via parent class

### Performance Considerations
- Static sparklines (no chart library overhead)
- Computed grid classes (minimal re-renders)
- Local state in selector (optimistic updates)

---

**Last Updated:** January 7, 2026  
**Component Version:** 2.0 (Vertical KPI Layout)
