# Puissance View - Updated UI Design

## Design Updates ✨

The Puissance view now matches the CompteurSelector design system with consistent colors and styling.

### Color Scheme by Meter Type

| Category | Color | Hex Code |
|----------|-------|----------|
| **TGBT** | Red | `#ef4444` |
| **Compresseurs** | Green | `#22c55e` |
| **Clim** | Blue | `#3b82f6` |
| **Éclairage** | Yellow | `#eab308` |

### UI Components

#### 1. Category Filter Section
- **Location:** Top of control card
- **Design:** Colored pill-style buttons matching meter types
- **Interaction:**
  - Click category to filter → button shows gradient with meter color
  - Click again to toggle off filter
  - "All" button resets to neutral gray gradient
- **Styling:**
  - Active: Gradient background (category color to darker shade)
  - Inactive: White/dark background with colored border on hover
  - Smooth transitions and shadow effects
  - Border: slate-200 (light) / slate-700 (dark mode)

#### 2. Element Selection Checkboxes
- **Location:** Below view mode toggle
- **Design:** Card-style layout with icons, matching selector pattern
- **Elements:**
  - 📊 **KPIs** - Show key performance indicators
  - 📈 **Charts** - Display visual charts
  - 📋 **Summary** - Show detailed tables
- **Styling:**
  - Responsive grid (1 column mobile, 3 columns desktop)
  - Checkbox + icon + label in single card
  - Active state: Light background (slate-50/slate-800)
  - Hover: Smooth background transition
  - Dark mode: Full support with slate color palette

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────┐
│  White/Slate-900 Background (Full Card)            │
├─────────────────────────────────────────────────────┤
│  Category Filter (Colored Pills)                    │
│  [TGBT] [Compresseurs] [Clim] [Éclairage] [All]   │
├─────────────────────────────────────────────────────┤
│  Display Elements (Card Grid)                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │☑ KPIs     │ │☑ Charts    │ │☑ Summary   │     │
│  └────────────┘ └────────────┘ └────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Responsive Design

- **Mobile:** Elements stack vertically
- **Tablet:** Category filters wrap as needed
- **Desktop:** Full horizontal layout with 3-column element grid

### Dark Mode Support

- All colors adapt to dark mode
- Slate color palette: `dark:bg-slate-800`, `dark:text-slate-300`, etc.
- Proper contrast ratios maintained
- Smooth transitions between themes

### Interactive States

#### Category Buttons
- **Inactive:** Slate border, white background, dark text
- **Hover:** Slightly darker border
- **Active:** Gradient fill (category color), white text, shadow
- **All Button:** Neutral gray gradient when active

#### Element Checkboxes
- **Unchecked:** White card, slate border
- **Checked:** Light slate background, white checkmark
- **Hover:** Subtle background shift
- **Icon + Label:** Always visible and readable

### Animation & Transitions

- Smooth color transitions (200ms)
- Shadow effects on active states
- Hover effects for better affordance
- No jank or layout shifts

### Accessibility

- All inputs have proper labels
- Icons paired with text descriptions
- Good contrast ratios for readability
- Keyboard navigable
- Material symbols icons for visual clarity

---

**Status:** ✅ Complete and styled
**Design System:** Matches CompteurSelector
**Dark Mode:** ✅ Fully supported
**Mobile Friendly:** ✅ Responsive
