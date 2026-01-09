# Dashboard View Test Specifications

**BMAD Phase:** Validation (Phase 7)  
**Document Type:** Test Specifications (Derived from View Specification)  
**Date:** January 7, 2026  
**View:** DashboardView (`src/views/DashboardView.vue`)  
**Test Coverage Target:** 80% (unit + integration)

---

## Purpose

This document defines all tests required to validate the DashboardView implementation against its authoritative specification. Tests are organized by:
- **Functional Tests:** Core workflows and user interactions
- **State Tests:** Loading, empty, error, edge cases
- **Integration Tests:** API calls, WebSocket, store synchronization
- **Permission Tests:** Role-based access and restrictions
- **Performance Tests:** Real-time update efficiency
- **Accessibility Tests:** WCAG 2.1 AA compliance

All tests are **traceable to specification sections** (cross-referenced as Spec B.X, C.X, D.X, E.X).

---

## Test Framework & Setup

**Framework:** Vitest (Vite-native) + Vue Test Utils  
**E2E:** Playwright (for WebSocket and multi-component flows)  
**Mocking:** Mock data enabled (`MOCK_DATA_ENABLED = true`)  

**Test Fixtures:**
- Mock compteurs (12 available, 4 default selected)
- Mock equipment (linked to compteurs)
- Mock alert events
- Mock WebSocket responses

---

## 1. Functional Tests

### T1.1: Compteur Selection - Add Compteur

**Spec Reference:** B.2 (Compteur Selection UI), C.2 (Customize Widget Selection)

**Test Name:** `dashboard-compteur-selection-add`

**Preconditions:**
- Dashboard mounted with 4 default compteurs selected
- Total 12 compteurs available
- Selection modal not yet opened

**Steps:**
1. Click "+ Sélectionner des compteurs" button
2. Verify modal opens showing all 12 compteurs
3. Verify 4 compteurs are checked (default selected)
4. Locate unchecked compteur (e.g., "Compteur Bureaux")
5. Click checkbox to select it (5th compteur)
6. Click "Appliquer" button to save
7. Modal closes
8. Verify Dashboard now displays 5 widget cards
9. Verify 5th widget shows "Compteur Bureaux" name
10. Verify 5th widget initializes with "Instantanée" mode

**Expected Results:**
- ✅ Modal opens and displays all compteurs with proper checked states
- ✅ Clicking checkbox toggles selection
- ✅ "Appliquer" saves selection and updates localStorage
- ✅ Dashboard re-renders with 5 widgets
- ✅ 5th widget is functional (real-time data flowing)
- ✅ Selection persists across page reload (localStorage)

**Code Coverage:**
- `useCompteurSelection()` - Add to selected array
- `DashboardView.handleCompteurChange()` - Trigger re-render
- `DashboardView.persistCompteurSelection()` - localStorage write
- `useDashboardStore.updateSelectedCompteurs()` - Store update

**Related Specs:** B.2, C.2

---

### T1.2: Compteur Selection - Remove Compteur

**Spec Reference:** B.2, C.2

**Test Name:** `dashboard-compteur-selection-remove`

**Preconditions:**
- Dashboard with 5 compteurs selected (from T1.1)
- Selection modal open

**Steps:**
1. Modal is open showing 5 selected compteurs
2. Locate "Compteur Bureaux" checkbox (checked)
3. Click checkbox to deselect it
4. Click "Appliquer"
5. Modal closes
6. Verify Dashboard now displays 4 widget cards
7. Verify "Compteur Bureaux" widget is gone
8. Verify remaining 4 widgets are intact

**Expected Results:**
- ✅ Deselection works correctly
- ✅ Widget removed from DOM
- ✅ Aggregations recalculated (sum updated)
- ✅ Equipment table filtered (only equipment from 4 selected compteurs shown)
- ✅ localStorage updated with 4 compteur IDs

**Related Specs:** B.2, C.2, B.6

---

### T1.3: Widget Mode Switching - Instantanée to Jour

**Spec Reference:** B.3 (Widget Modes), C.3 (Monitor Real-Time Data)

**Test Name:** `dashboard-widget-mode-switch-instantanee-to-jour`

**Preconditions:**
- Dashboard displayed with 4 widgets
- Widget 1 in "Instantanée" mode (default)
- Widget 1 showing "12.5 kW" value

**Steps:**
1. Locate Widget 1 mode tabs (Instantanée | Jour | Hier)
2. Click "Jour" tab
3. Widget 1 updates to show today's consumption
4. Verify value changes to kWh unit (e.g., "145 kWh")
5. Verify other widgets (2, 3, 4) remain in their current modes
6. Click "Hier" tab on Widget 1
7. Verify value updates to yesterday's consumption (e.g., "142 kWh")

**Expected Results:**
- ✅ Mode switch is per-widget, not global
- ✅ Unit changes appropriately (kW → kWh)
- ✅ Value updates from store (correct historical data)
- ✅ Other widgets unaffected
- ✅ Tab visuals update (active tab highlighted)

**Code Coverage:**
- `DashboardView.widgetModes` - Local state management
- `useCompteurSelection.getCompteurValue(compteurId, mode)` - Mode-based data fetch
- Widget component - Re-render on mode change

**Related Specs:** B.3, C.3

---

### T1.4: Aggregated Power Calculation

**Spec Reference:** B.4 (Main Aggregated View), D (Aggregation Logic)

**Test Name:** `dashboard-aggregated-power-calculation`

**Preconditions:**
- Dashboard with 3 compteurs selected:
  - Widget 1: "Compteur Principal" (12.5 kW, Instantanée mode)
  - Widget 2: "Compteur Bureaux" (18.3 kW, Instantanée mode)
  - Widget 3: "Compteur Atelier" (21.8 kW, Jour mode → should not include in real-time sum)

**Steps:**
1. Verify aggregated power display shows sum of instantanée values
2. Expected: 12.5 + 18.3 = 30.8 kW (Widget 3 excluded, in Jour mode)
3. Switch Widget 3 to "Instantanée" mode
4. Verify aggregated power updates immediately
5. Expected: 12.5 + 18.3 + 21.8 = 52.6 kW

**Expected Results:**
- ✅ Aggregation correctly sums instantanée modes
- ✅ Modes mixed across widgets are handled properly
- ✅ Aggregation updates in real-time when mode changes
- ✅ Value displayed with 1 decimal precision

**Code Coverage:**
- `useCompteurSelection.calculateAggregatedPower()` - Aggregation logic
- `computed: aggregatedInstantaneous` - Reactivity

**Related Specs:** B.4, D

---

### T1.5: Equipment Table Filtering by Selected Compteurs

**Spec Reference:** B.6 (Equipment Table), C.5 (Identify Equipment Issues)

**Test Name:** `dashboard-equipment-table-filter`

**Preconditions:**
- System has 8 equipment items total:
  - Equipment A, B, C linked to "Compteur Principal"
  - Equipment D, E linked to "Compteur Bureaux"
  - Equipment F, G, H linked to "Compteur Atelier"
- Dashboard has "Compteur Principal" + "Compteur Bureaux" selected (A, B, C, D, E visible)

**Steps:**
1. Verify equipment table shows 5 rows (A, B, C, D, E)
2. Equipment F, G, H not visible
3. Remove "Compteur Bureaux" from selection
4. Verify table updates to show 3 rows (A, B, C only)
5. Re-add "Compteur Bureaux"
6. Verify table re-expands to 5 rows

**Expected Results:**
- ✅ Table filters by selected compteurs' linked equipment
- ✅ Filter updates immediately on compteur selection change
- ✅ Equipment appears/disappears without page reload
- ✅ Table sorting/order maintained

**Code Coverage:**
- `useCompteurSelection.getFilteredEquipment()` - Equipment filtering
- `DashboardView.filteredEquipment` - Computed property
- Equipment table component - Dynamic rendering

**Related Specs:** B.6, C.5, D

---

### T1.6: Equipment Table Row Navigation

**Spec Reference:** B.6 (Equipment Table), C.5 (Identify Equipment Issues)

**Test Name:** `dashboard-equipment-row-click-navigation`

**Preconditions:**
- Dashboard displayed with equipment table visible
- Equipment row: "Transformateur Principal" (Equipment A)

**Steps:**
1. Click on equipment row (any column except Actions)
2. Verify router navigation is called
3. Verify route is `/equipment/:equipmentId`
4. Verify correct equipment ID passed to next view
5. Equipment Detail view loads with correct equipment data

**Expected Results:**
- ✅ Row click triggers navigation
- ✅ Equipment ID passed correctly
- ✅ Equipment Detail view receives correct context
- ✅ No errors in console

**Code Coverage:**
- `DashboardView.goToEquipmentDetail()` - Navigation handler
- Vue Router navigation

**Related Specs:** B.6, C.5

---

### T1.7: Recent Events Link Navigation

**Spec Reference:** B.5 (EventsWidget), C.5 (Identify Equipment Issues)

**Test Name:** `dashboard-events-widget-navigation`

**Preconditions:**
- Dashboard displayed
- EventsWidget showing 3 recent events
- "Voir tout" link visible at bottom

**Steps:**
1. Click "Voir tout" link on EventsWidget
2. Verify router navigation called
3. Verify route is `/alerts`
4. Verify AlertsView loads

**Expected Results:**
- ✅ "Voir tout" navigates to `/alerts`
- ✅ AlertsView fully loaded
- ✅ No state lost on Dashboard (can navigate back)

**Code Coverage:**
- `DashboardView.goToAlerts()` or router link

**Related Specs:** B.5, C.5

---

### T1.8: Export Data to CSV

**Spec Reference:** C.6 (Export Data)

**Test Name:** `dashboard-export-csv`

**Preconditions:**
- Dashboard displayed with 4 compteurs selected
- Current time: 2026-01-08 14:30:00

**Steps:**
1. Click "Exporter les données" button
2. Verify "Export en cours…" text appears
3. Wait for download (mock: immediate)
4. Verify button returns to "Exporter les données"
5. Verify CSV file downloaded with name: `export-donnees-[timestamp].csv`
6. Parse CSV and verify content:
   - Compteur names and current values
   - Aggregated sum
   - Equipment table snapshot
   - 24h consumption history (if available)
7. Verify headers in French

**Expected Results:**
- ✅ Export button shows loading state
- ✅ CSV file downloads with proper naming
- ✅ CSV contains all expected data sections
- ✅ CSV headers in French
- ✅ Data values match displayed values
- ✅ No double-download on rapid clicks

**Code Coverage:**
- `DashboardView.handleExport()` - Export handler
- `historicalAPI.exportData()` - API call
- CSV generation and Blob API

**Related Specs:** C.6

---

### T1.9: Print Dashboard

**Spec Reference:** C.7 (Print Dashboard)

**Test Name:** `dashboard-print`

**Preconditions:**
- Dashboard displayed
- Browser print API available

**Steps:**
1. Click "Imprimer" button
2. Verify browser print dialog opens
3. Verify print preview shows:
   - Dashboard title
   - All 4 widgets
   - Aggregated chart
   - Equipment table
   - Footer with timestamp
4. Cancel print dialog
5. Verify Dashboard still functional

**Expected Results:**
- ✅ Print dialog opens correctly
- ✅ All critical content visible in preview
- ✅ Layout renders properly (A4 landscape)
- ✅ No console errors

**Code Coverage:**
- `DashboardView.handlePrint()` - Print handler
- Browser print API (`window.print()`)

**Related Specs:** C.7

---

## 2. State Tests

### T2.1: Loading State - Initial Load

**Spec Reference:** E (States & Edge Cases)

**Test Name:** `dashboard-loading-state-initial`

**Preconditions:**
- Component not yet mounted
- WebSocket not connected
- API call not completed

**Steps:**
1. Mount DashboardView
2. Verify loading indicator appears (skeleton loaders or spinners)
3. Verify widgets show placeholder content
4. Wait for data to load (mock: 100ms delay)
5. Verify loading indicator disappears
6. Verify widgets populate with real data

**Expected Results:**
- ✅ Loading state visible immediately after mount
- ✅ Clear visual feedback (spinners, shimmer effect)
- ✅ Loading state dismissed when data arrives
- ✅ No uninitialized data displayed

**Code Coverage:**
- `DashboardView.isLoading` - Local state
- Loading component rendering

**Related Specs:** E

---

### T2.2: Empty State - No Compteurs Selected

**Spec Reference:** E (States)

**Test Name:** `dashboard-empty-state-no-compteurs`

**Preconditions:**
- User has no compteurs (or deselects all)
- localStorage: `dashboard_selected_compteurs` = []

**Steps:**
1. Navigate to `/dashboard`
2. Verify empty state displayed
3. Empty state text: "Aucun compteur sélectionné"
4. Verify CTA button: "+ Sélectionner des compteurs"
5. Click CTA button
6. Verify compteur selection modal opens

**Expected Results:**
- ✅ Empty state renders instead of widgets
- ✅ Clear message and CTA visible
- ✅ CTA button functional
- ✅ No errors in console

**Code Coverage:**
- `DashboardView.selectedCompteurs.length === 0` - Condition
- Empty state component rendering

**Related Specs:** E

---

### T2.3: Empty State - No Equipment Linked

**Spec Reference:** E (States), B.6

**Test Name:** `dashboard-empty-state-no-equipment`

**Preconditions:**
- Compteurs selected
- No equipment linked to selected compteurs

**Steps:**
1. Dashboard rendered with widgets (but no equipment)
2. Scroll to equipment table
3. Verify empty state in equipment table: "Aucun équipement pour les compteurs sélectionnés"
4. Rest of Dashboard (widgets, chart) still functional

**Expected Results:**
- ✅ Equipment table shows empty state message
- ✅ Widgets unaffected
- ✅ No console errors

**Related Specs:** E, B.6

---

### T2.4: Error State - WebSocket Disconnection

**Spec Reference:** E (States)

**Test Name:** `dashboard-error-state-websocket-disconnect`

**Preconditions:**
- Dashboard mounted and displaying data
- WebSocket connected (`isConnected: true`)
- Real-time updates flowing

**Steps:**
1. Simulate WebSocket disconnect (mock: `mockWebSocket.disconnect()`)
2. Verify connection indicator changes to red (pulsing)
3. Verify "Déconnecté" text appears
4. Verify lastUpdateTime stops advancing
5. Wait 10 seconds
6. Simulate WebSocket reconnection (`mockWebSocket.connect()`)
7. Verify indicator changes back to green
8. Verify "Connecté" text appears
9. Verify data resumes flowing

**Expected Results:**
- ✅ Disconnect visually indicated (red pulsing indicator)
- ✅ "Déconnecté" message displayed
- ✅ Reconnection detected and displayed
- ✅ Data resumes after reconnection
- ✅ No stale data shown

**Code Coverage:**
- `useDashboardStore.isConnected` - State
- Connection indicator component
- WebSocket reconnection logic

**Related Specs:** E

---

### T2.5: Error State - Partial Data Availability

**Spec Reference:** E (States)

**Test Name:** `dashboard-error-state-partial-data`

**Preconditions:**
- Dashboard mounted
- Widget 1 data loads successfully
- Widget 2 API call fails (500 error)

**Steps:**
1. Verify Widget 1 displays data normally
2. Verify Widget 2 shows error state: "Impossible de charger les données"
3. Verify retry button visible on Widget 2
4. Click retry button
5. Mock API succeeds
6. Verify Widget 2 loads data

**Expected Results:**
- ✅ Partial failure handled gracefully
- ✅ Successful widgets still display
- ✅ Failed widget shows error message
- ✅ Retry functionality works

**Code Coverage:**
- `useCompteurSelection.getCompteurValue()` - Error handling
- Widget error state component
- Retry logic

**Related Specs:** E

---

## 3. Integration Tests

### T3.1: Real-Time WebSocket Data Flow

**Spec Reference:** D (Data & Logic), C.3 (Monitor Real-Time Data)

**Test Name:** `dashboard-websocket-realtime-flow`

**Framework:** Playwright (WebSocket-aware)

**Preconditions:**
- Dashboard mounted
- WebSocket connection established
- Mock server publishing updates to `dashboard:site_a` channel

**Steps:**
1. Subscribe to WebSocket channel in test
2. Send mock update: `{ power: 15.2, timestamp: ... }`
3. Verify widget receives update
4. Verify widget value changes to 15.2 kW
5. Wait 5 seconds
6. Send next update: `{ power: 14.8 }`
7. Verify widget updates (no flickering)
8. Verify lastUpdateTime updates (1-second granularity)

**Expected Results:**
- ✅ WebSocket updates received every 5 seconds
- ✅ Widget values update within 100ms of receiving data
- ✅ No duplicate updates
- ✅ Real-time accuracy maintained

**Code Coverage:**
- `useRealtimeData()` composable
- WebSocket subscription and message handling
- Store update logic

**Related Specs:** D, C.3

---

### T3.2: Store Synchronization Across Widgets

**Spec Reference:** D (Data & Logic)

**Test Name:** `dashboard-store-sync`

**Preconditions:**
- Dashboard with 2 widgets
- Both widgets displaying data from same store

**Steps:**
1. Verify Widget 1 and Widget 2 show correct initial values
2. Simulate data update in store (mock: `dashboardStore.updateCompteur(1, newValue)`)
3. Verify both Widget 1 and Widget 2 update synchronously
4. Add 3rd widget (via compteur selection)
5. Verify 3rd widget initializes with correct data (from store)
6. Update store data
7. Verify all 3 widgets update in sync

**Expected Results:**
- ✅ Store updates propagate to all widgets
- ✅ No race conditions or sync issues
- ✅ New widgets initialize with current store state
- ✅ Reactivity maintained

**Code Coverage:**
- Pinia store reactivity
- Computed property updates
- Component re-rendering

**Related Specs:** D

---

### T3.3: Compteur Selection Persistence

**Spec Reference:** D (localStorage persistence)

**Test Name:** `dashboard-compteur-persistence`

**Framework:** Playwright (cross-session)

**Preconditions:**
- Dashboard with default 4 compteurs

**Steps:**
1. Select compteurs: [Compteur 1, 3, 5, 7] (custom selection)
2. Close browser/reload page
3. Verify localStorage contains: `dashboard_selected_compteurs: [1, 3, 5, 7]`
4. Re-navigate to `/dashboard`
5. Verify same 4 compteurs (1, 3, 5, 7) are displayed
6. Verify widgets render with correct data

**Expected Results:**
- ✅ Selection saved to localStorage
- ✅ Selection restored on page reload
- ✅ Persists across browser sessions (within same origin)
- ✅ No data loss or corruption

**Code Coverage:**
- `localStorage.setItem('dashboard_selected_compteurs', ...)`
- `localStorage.getItem()` on mount
- Fallback to default if key missing

**Related Specs:** D

---

## 4. Permission Tests

### T4.1: Role-Based View Access

**Spec Reference:** A (Target Roles: All authenticated users)

**Test Name:** `dashboard-role-access`

**Test Cases:**

| Role | Expected Result |
|------|-----------------|
| Operator | ✅ Full access to Dashboard |
| Engineer | ✅ Full access to Dashboard |
| Manager | ✅ Full access to Dashboard |
| Admin | ✅ Full access to Dashboard |
| Maintenance | ✅ Full access to Dashboard |
| Compliance | ✅ Full access to Dashboard |
| Guest (unauthenticated) | ❌ Redirect to `/login` |

**Steps (for each role):**
1. Login as [Role]
2. Navigate to `/dashboard`
3. Verify access granted/denied per table
4. If granted: Verify all functionality available
5. If denied: Verify redirect to `/login`

**Expected Results:**
- ✅ All authenticated roles have access
- ✅ Unauthenticated users redirected
- ✅ No permission warnings displayed (all data accessible to all roles)

**Code Coverage:**
- Route guard: `requiresAuth: true`
- No role-based filtering (all roles see same data)

**Related Specs:** A

---

### T4.2: Read-Only vs Modify Permissions

**Spec Reference:** C (Actions Available)

**Test Name:** `dashboard-permission-export-modify`

**Preconditions:**
- All roles can view Dashboard (confirmed in T4.1)
- Export and Print are available actions

**Steps:**
1. Login as any role
2. Verify "Exporter les données" button visible and clickable
3. Verify "Imprimer" button visible and clickable
4. Execute export (verify succeeds)
5. Execute print (verify print dialog opens)

**Expected Results:**
- ✅ All roles can export data
- ✅ All roles can print dashboard
- ✅ No permission restrictions on read-only actions
- ✅ Modify actions (compteur selection) available to all

**Related Specs:** C

---

## 5. Performance Tests

### T5.1: Real-Time Update Efficiency (Chart Rendering)

**Spec Reference:** E (Risks: Performance)

**Test Name:** `dashboard-performance-chart-render`

**Framework:** Playwright with performance metrics

**Preconditions:**
- Dashboard mounted
- ConsumptionChart with 60 data points (1h, 1-minute granularity)
- WebSocket updates: 1 new point every 60 seconds

**Steps:**
1. Measure initial chart render time (must be < 200ms)
2. Receive WebSocket update with new data point
3. Measure chart update time (must be < 100ms)
4. Verify frame rate: 60 FPS during update
5. Repeat for 10 updates, average result

**Expected Results:**
- ✅ Initial render: < 200ms
- ✅ Update render: < 100ms
- ✅ No frame drops (60 FPS)
- ✅ No memory leaks (heap stable)

**Optimization:** Use Chart.js `.update()` method instead of destroy/recreate

**Related Specs:** E (Performance Risk)

---

### T5.2: Real-Time Update Efficiency (Multi-Widget Updates)

**Spec Reference:** E (Risks: Performance)

**Test Name:** `dashboard-performance-multi-widget`

**Preconditions:**
- Dashboard with 10 widgets selected
- WebSocket broadcasting updates to all 10 compteurs simultaneously

**Steps:**
1. Measure render time for 10 widgets with data (must be < 500ms initial)
2. Receive WebSocket update affecting all 10 widgets
3. Measure update time (must be < 200ms)
4. Verify no UI lag or jank
5. Open browser DevTools Performance tab
6. Record 30-second session with updates every 5s
7. Verify frame drops < 5% (95% steady state)

**Expected Results:**
- ✅ Initial render (10 widgets): < 500ms
- ✅ Simultaneous update: < 200ms
- ✅ Frame stability: > 95% at 60 FPS
- ✅ CPU usage: < 50% at idle

**Optimization Notes:** Consider debouncing updates, virtualization for large widget sets

**Related Specs:** E (Performance Risk)

---

### T5.3: Memory Leak Detection

**Spec Reference:** E (Risks)

**Test Name:** `dashboard-performance-memory-leak`

**Framework:** Playwright with memory profiling

**Preconditions:**
- Dashboard mounted
- WebSocket streaming data continuously

**Steps:**
1. Take heap snapshot (baseline)
2. Simulate 1000 WebSocket updates over 10 minutes
3. Take second heap snapshot
4. Compare: Heap should not increase > 10MB
5. Simulate 10 compteur selection/deselection cycles
6. Take third heap snapshot
7. Compare: No significant increase

**Expected Results:**
- ✅ Memory stable after data updates
- ✅ No detached DOM nodes
- ✅ Timers and listeners properly cleaned up
- ✅ Components unmount without leaks

**Code Coverage:**
- `onUnmounted()` cleanup (timers, subscriptions)
- Store subscription cleanup
- WebSocket listener cleanup

**Related Specs:** E

---

## 6. Accessibility Tests

### T6.1: WCAG 2.1 AA - Motion & Animation

**Spec Reference:** E (Risks: Accessibility - Pulsing indicator)

**Test Name:** `dashboard-accessibility-motion`

**Framework:** axe DevTools + Playwright

**Preconditions:**
- Dashboard displayed
- Connection indicator pulsing (green or red)

**Steps:**
1. Run axe accessibility scan
2. Check for issues: "Animation that is not essential is removed"
3. Test with `prefers-reduced-motion: reduce` media query
4. Verify pulsing indicator stops or uses alternative indicator
5. Verify connection status still visually distinct

**Expected Results:**
- ✅ No axe violations for motion
- ✅ Respects `prefers-reduced-motion` setting
- ✅ Connection status still clear without animation
- ✅ Alternative: Color change or static indicator

**Implementation:** Add CSS:
```css
@media (prefers-reduced-motion: reduce) {
  .connection-indicator {
    animation: none;
    opacity: 1;
  }
}
```

**Related Specs:** E (Accessibility Risk)

---

### T6.2: WCAG 2.1 AA - Color Contrast

**Spec Reference:** E (Risks: Accessibility)

**Test Name:** `dashboard-accessibility-color-contrast`

**Framework:** Lighthouse + axe

**Preconditions:**
- Dashboard in light mode and dark mode

**Steps:**
1. Run Lighthouse accessibility audit (target: 90+)
2. Check all text for contrast ratio >= 4.5:1 (normal text)
3. Check heading/large text: >= 3:1
4. Verify widget cards, buttons, labels meet ratios
5. Test in dark mode (Tailwind `dark:` classes)
6. Test in light mode (fallback, if implemented)

**Expected Results:**
- ✅ Lighthouse accessibility score >= 90
- ✅ All text has sufficient contrast
- ✅ No axe violations for color contrast
- ✅ Readable in both light/dark modes

**Related Specs:** E

---

### T6.3: WCAG 2.1 AA - Keyboard Navigation

**Spec Reference:** C (Actions)

**Test Name:** `dashboard-accessibility-keyboard`

**Framework:** Playwright (keyboard simulation)

**Preconditions:**
- Dashboard displayed
- All interactive elements enabled

**Steps:**
1. Press Tab key repeatedly
2. Verify focus order: Breadcrumb → Header buttons → Widget mode tabs → Equipment table rows
3. Verify focus visible (outline or highlight)
4. Press Enter on "Exporter les données" button
5. Verify export triggered
6. Press Enter on equipment table row
7. Verify navigation triggered
8. Test Shift+Tab (reverse order)
9. Verify all buttons/links accessible via keyboard

**Expected Results:**
- ✅ All interactive elements keyboard accessible
- ✅ Focus order logical and expected
- ✅ Focus indicator visible (WCAG contrast)
- ✅ No keyboard traps
- ✅ Links/buttons activate with Enter/Space

**Implementation:** Ensure all buttons and links have proper `tabindex` or are semantic HTML

**Related Specs:** C (Actions)

---

### T6.4: Screen Reader Testing

**Spec Reference:** B.UI Structure, C (User Workflows)

**Test Name:** `dashboard-accessibility-screen-reader`

**Framework:** Manual + NVDA/JAWS/VoiceOver

**Preconditions:**
- Dashboard displayed
- Screen reader enabled (VoiceOver, NVDA, or JAWS)

**Steps:**
1. Tab through Dashboard
2. Verify screen reader announces:
   - Page title: "Surveillance en temps réel - Tableau de bord"
   - Headings: "Heading 2: Surveillance en temps réel"
   - Buttons: "Exporter les données, button" or "Imprimer, button"
   - Widget names: "Compteur Principal" (landmark or region)
   - Connection status: "Connecté" or "Déconnecté"
3. Navigate to equipment table
4. Verify table headers announced
5. Verify row content read correctly: "Transformateur Principal, En ligne, 12.5 kW"

**Expected Results:**
- ✅ All content readable by screen reader
- ✅ Proper semantic HTML (headings, landmarks, tables)
- ✅ Labels associated with form inputs (if any)
- ✅ No content hidden from screen readers (unless decorative)
- ✅ Live regions properly announced (connection status changes)

**Implementation:** 
- Use semantic HTML (`<header>`, `<main>`, `<table>`)
- Add ARIA labels where needed: `aria-label`, `aria-describedby`
- Mark decorative elements: `aria-hidden="true"`

**Related Specs:** B, C

---

## 7. Dark Mode Tests

### T7.1: Dark Mode - Component Visibility

**Spec Reference:** B (Layout)

**Test Name:** `dashboard-dark-mode-visibility`

**Preconditions:**
- Stitch dark mode enabled (Tailwind `dark:` class applied to root)

**Steps:**
1. Toggle dark mode on
2. Verify all text readable (contrast OK)
3. Verify widget cards visible (dark background + light text)
4. Verify chart visible (no color clashes)
5. Verify phase balance widget visible (bars visible)
6. Verify equipment table visible (rows distinguishable)
7. Verify buttons visible and clickable
8. Verify indicators (green/red connection) visible

**Expected Results:**
- ✅ All components readable in dark mode
- ✅ No white-on-white or black-on-black text
- ✅ Chart colors adjusted for dark background
- ✅ Buttons have visible dark mode styling
- ✅ No text cutoff or overflow issues

**Related Specs:** B (Responsive layout)

---

## Test Coverage Summary

| Category | Test Count | Coverage Target |
|----------|-----------|-----------------|
| Functional Tests | 9 | Core workflows |
| State Tests | 5 | Loading, empty, error |
| Integration Tests | 3 | API, WebSocket, store |
| Permission Tests | 2 | Role-based access |
| Performance Tests | 3 | Real-time efficiency |
| Accessibility Tests | 4 | WCAG 2.1 AA |
| Dark Mode Tests | 1 | Visual clarity |
| **Total** | **27** | **80%+ code coverage** |

---

## Validation Acceptance Criteria

**Before marking Dashboard view as "Validation Complete" (Phase 7):**

- ✅ All 27 tests passing
- ✅ Code coverage >= 80%
- ✅ No console errors or warnings
- ✅ Performance benchmarks met (< 200ms render, < 100ms update)
- ✅ Accessibility audit score >= 90 (Lighthouse)
- ✅ No unresolved issues in axe scan
- ✅ Cross-browser testing: Chrome, Firefox, Safari (latest)
- ✅ Responsive testing: Mobile (375px), Tablet (768px), Desktop (1920px)
- ✅ Security: No XSS, CSRF, injection vulnerabilities

**Traceability:**
- Each test maps to specification sections (A/B/C/D/E)
- Each test covers one or more user workflows (C)
- Each test verifies data correctness (D)
- Each test addresses gaps or risks (E)

---

## Post-Validation Follow-Up

**If validation finds issues:**
1. Log defect with test name, severity (Critical/High/Medium/Low)
2. Assign to development team
3. Fix and re-test
4. If Critical/High: Block MVP release until fixed
5. If Medium/Low: Log as backlog item for Sprint 5+

**If validation passes:**
1. Mark Dashboard view as "Production Ready" in BMAD documentation
2. Move to next view (AlertsView) for refinement/testing
3. Proceed to deployment preparation (Phase 6)

---

**END OF DASHBOARD VIEW TEST SPECIFICATIONS**
