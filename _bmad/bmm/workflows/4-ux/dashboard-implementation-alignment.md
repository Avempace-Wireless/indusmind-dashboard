# Dashboard View - Implementation Alignment & Gap Analysis

**BMAD Phase:** UX Concretization (Phase 4)  
**Document Type:** Implementation Alignment Report  
**Date:** January 7, 2026  
**View:** DashboardView (`src/views/DashboardView.vue`)

---

## Purpose

This document maps the **updated Dashboard specification** to the **current implementation**, identifying:
1. ✅ What is correctly implemented (matches spec)
2. ⚠️ What requires refinement (partial match)
3. ❌ What is missing (not implemented, needed for MVP)

Gaps are prioritized and assigned Phase/Sprint for resolution.

---

## Implementation Overview

**Current State:**
- **File:** `src/views/DashboardView.vue` (281 lines)
- **Status:** 60% complete (core structure present, features partial)
- **Tests:** 0 unit tests (T1-T7 must be created)
- **Dark Mode:** ✅ Implemented
- **Responsiveness:** ✅ Implemented
- **Real-time:** ⚠️ Mock data only

---

## Specification Alignment Matrix

### Section A: Identification

| Item | Spec | Implementation | Status | Notes |
|------|------|-----------------|--------|-------|
| Route | `/dashboard` | ✅ Correct | ✅ OK | Default redirect from `/` |
| View Name | DashboardView | ✅ Correct | ✅ OK | File: `DashboardView.vue` |
| Target Roles | All authenticated | ✅ Correct | ✅ OK | No role-based filtering |
| FR Mapping | FR1-8 | ✅ Correct | ✅ OK | Real-Time Energy Monitoring |
| Authentication | Required | ✅ Correct | ✅ OK | Route guard: `requiresAuth: true` |

---

### Section B: UI Structure

| Section | Spec | Implementation | Status | Gap |
|---------|------|-----------------|--------|-----|
| **B.1 Breadcrumb** | Accueil / Tableau de bord | ✅ Implemented | ✅ OK | Correct French text, proper structure |
| **B.2 Header - Title** | "Surveillance en temps réel" | ✅ Implemented | ✅ OK | Proper H1 styling |
| **B.2 Header - Connection Indicator** | Red/Green pulse | ✅ Implemented | ✅ OK | `.animate-pulse` class applied |
| **B.2 Header - Timestamp** | dd/mm/yyyy, HH:MM:SS French | ✅ Implemented | ✅ OK | Updates every 1 second |
| **B.2 Header - Buttons** | Imprimer, Exporter | ✅ Implemented | ✅ OK | Both functional |
| **B.2 NEW: Compteur Selection** | "+ Sélectionner des compteurs" button | ❌ Not Implemented | ❌ MISSING | **Gap 1:** Modal/panel not created |
| **B.2 NEW: Selection Display** | "X of Y compteurs sélectionnés" | ❌ Not Implemented | ❌ MISSING | **Gap 2:** Counter text missing |
| **B.3 Widget Grid** | 4 widgets responsive layout | ⚠️ Partial | ⚠️ INCOMPLETE | Currently 4 StatCards (KPIs), not compteur widgets |
| **B.3 Widget Model** | Per-widget mode switching | ❌ Not Implemented | ❌ MISSING | **Gap 3:** Widgets don't have mode tabs |
| **B.3 Widget Modes** | Instantanée/Jour/Hier tabs per widget | ❌ Not Implemented | ❌ MISSING | **Gap 4:** No mode UI |
| **B.3 Widget Data** | Compteur name, current value, unit | ❌ Not Implemented | ❌ MISSING | **Gap 5:** Widget structure wrong |
| **B.4 Aggregated View** | Sum display "Consommation Totale" | ⚠️ Partial | ⚠️ INCOMPLETE | Title says "Consommation en Direct" (single view) |
| **B.5 ConsumptionChart** | Aggregated over selected compteurs | ⚠️ Partial | ⚠️ INCOMPLETE | Works, but filters unclear |
| **B.5 Chart Tabs** | 1h/24h/7d/30d tabs | ✅ Visible | ⚠️ INCOMPLETE | Only 1h functional; others deferred (OK per spec) |
| **B.5 PhaseBalance Widget** | L1/L2/L3 voltage bars | ✅ Implemented | ✅ OK | Color-coded, proper values |
| **B.5 EventsWidget** | Last 3 events with severity | ✅ Implemented | ✅ OK | Pulls from alertsStore |
| **B.5 "Voir tout" Link** | Navigate to `/alerts` | ✅ Implemented | ✅ OK | Proper routing |
| **B.6 Equipment Table** | Show only selected compteurs' equipment | ⚠️ Partial | ⚠️ INCOMPLETE | Currently shows all equipment |
| **B.6 Table Columns** | Nom, Statut, Consommation, Charge %, Dernier event | ✅ Implemented | ✅ OK | All columns present |
| **B.6 Table Row Click** | Navigate to Equipment Detail | ❌ Not Implemented | ❌ MISSING | **Gap 6:** Click handler not wired |

**B Section Summary:**
- ✅ **Fully Implemented:** 10 items (header, buttons, connection, timestamp, chart tabs, phase balance, events, table columns)
- ⚠️ **Partially Implemented:** 6 items (widgets, aggregation labeling, equipment filtering)
- ❌ **Missing:** 6 items (compteur selector, widget modes, mode tabs, selection display, table navigation, data structure)

---

### Section C: Functional Intent

| Workflow | Spec | Implementation | Status | Gap |
|----------|------|-----------------|--------|-----|
| **C.1 Initialize Dashboard** | Load default 4 compteurs | ⚠️ Partial | ⚠️ INCOMPLETE | Loads, but compteur model not present |
| **C.2 Customize Selection** | Modal to select/deselect compteurs | ❌ Not Implemented | ❌ MISSING | **Gap 7:** No modal component |
| **C.3 Monitor Real-Time** | Widget mode switching, aggregation | ❌ Not Implemented | ❌ MISSING | **Gap 8:** Widget modes missing |
| **C.4 Analyze Trends** | Time range tabs, historical data | ⚠️ Partial | ⚠️ INCOMPLETE | 1h works, 24h/7d/30d deferred (OK for MVP) |
| **C.5 Identify Issues** | Equipment table, navigation | ⚠️ Partial | ⚠️ INCOMPLETE | **Gap 9:** Navigation not wired |
| **C.6 Export Data** | CSV with timestamp, metadata | ✅ Implemented | ✅ OK | Working, format validated |
| **C.7 Print Dashboard** | Browser print dialog | ✅ Implemented | ✅ OK | Uses default print |

**C Section Summary:**
- ✅ **Working:** 2 workflows (Export, Print)
- ⚠️ **Partial:** 3 workflows (Initialize, Trends, Issues)
- ❌ **Missing:** 2 workflows (Customize, Monitor)

---

### Section D: Data & Logic Assumptions

| Component | Spec | Implementation | Status | Gap |
|-----------|------|-----------------|--------|-----|
| **Stores** | dashboardStore, equipmentStore, alertsStore | ✅ Present | ✅ OK | All 3 stores used correctly |
| **Composables** | useRealtimeData() | ✅ Present | ✅ OK | Orchestrates updates |
| **NEW: useCompteurSelection()** | Manage selection, persistence | ❌ Not Implemented | ❌ MISSING | **Gap 10:** Composable missing |
| **API: getCompteurs()** | List available compteurs | ❌ Not Implemented | ❌ MISSING | **Gap 11:** API call missing |
| **API: getCompteurValues()** | Per-compteur instantaneous + daily | ❌ Not Implemented | ❌ MISSING | **Gap 12:** Per-compteur API missing |
| **API: getEquipmentByCompteurs()** | Filter equipment by selected | ❌ Not Implemented | ❌ MISSING | **Gap 13:** Equipment filter missing |
| **Computed: selectedCompteurs** | User-selected compteur objects | ❌ Not Implemented | ❌ MISSING | **Gap 14:** Computed property missing |
| **Computed: aggregatedInstantaneous** | Sum of selected kW values | ❌ Not Implemented | ❌ MISSING | **Gap 15:** Aggregation logic missing |
| **Computed: filteredEquipment** | Equipment by selected compteurs | ❌ Not Implemented | ❌ MISSING | **Gap 16:** Filter logic missing |
| **Computed: chartDataAggregated** | Time-series sum | ⚠️ Partial | ⚠️ INCOMPLETE | Works, but unclear if correctly aggregated |
| **Local State: widgetModes** | Per-widget mode tracking | ❌ Not Implemented | ❌ MISSING | **Gap 17:** Local state missing |
| **Local State: localStorage** | Persist compteur selection | ❌ Not Implemented | ❌ MISSING | **Gap 18:** Persistence missing |
| **WebSocket: dashboard:site_a** | Subscribe to real-time updates | ✅ Implemented | ✅ OK | Working in mock mode |
| **Mock Data** | MOCK_DATA_ENABLED flag | ✅ Implemented | ✅ OK | Simulates 5s updates |

**D Section Summary:**
- ✅ **Implemented:** 4 items (stores, composables, WebSocket, mock)
- ⚠️ **Partial:** 1 item (aggregated chart)
- ❌ **Missing:** 13 items (new composable, API calls, computed properties, local state)

---

### Section E: Gaps & Observations

| Item | Spec | Implementation | Status | Priority |
|------|------|-----------------|--------|----------|
| **E1: Compteur Selection UI** | Modal/panel + checkbox list | ❌ Missing | P0 | CRITICAL (blocks widget model) |
| **E2: Widget Mode Switching** | Per-widget tabs (Instantanée/Jour/Hier) | ❌ Missing | P0 | CRITICAL (core feature) |
| **E3: Widget Data Model** | Compteur object per widget | ❌ Missing | P0 | CRITICAL (foundational) |
| **E4: Equipment Filtering** | Show only selected compteurs' equipment | ⚠️ Partial | P1 | HIGH (usability) |
| **E5: Table Navigation** | Row click → Equipment Detail | ❌ Missing | P1 | HIGH (user workflow) |
| **E6: useCompteurSelection() Composable** | Manage selection, aggregation, persistence | ❌ Missing | P0 | CRITICAL (needed by multiple components) |
| **E7: localStorage Integration** | Persist selection across sessions | ❌ Missing | P2 | MEDIUM (nice-to-have for MVP) |
| **E8: API Integration** | getCompteurs(), getCompteurValues() | ❌ Missing | P0 | CRITICAL (requires backend) |
| **E9: Per-Widget State** | widgetModes object, mode switching logic | ❌ Missing | P0 | CRITICAL (user interaction) |
| **E10: Accessibility - Motion** | Respect prefers-reduced-motion | ⚠️ Partial | P1 | HIGH (WCAG 2.1 AA) |
| **E11: Loading/Error States** | Skeleton loaders, error boundaries | ⚠️ Partial | P1 | MEDIUM (UX clarity) |

---

## Gap Priority & Implementation Plan

### Critical Gaps (P0) - Must Fix for MVP

**Gap 1: Compteur Selection UI**
- **Issue:** No modal/panel to select which compteurs display
- **Implementation:** Create `CompteurSelector.vue` component
- **Effort:** 2 days
- **Tests:** T1.1, T1.2
- **Acceptance:** Modal opens, checkboxes work, "Appliquer" saves to localStorage

**Gap 2: Widget Model & Data Structure**
- **Issue:** Currently 4 StatCards (generic KPIs), not compteur-specific widgets
- **Implementation:** 
  - Replace StatCard with new `CompteurWidget.vue` component
  - Accepts `compteur` prop (object with name, instantaneous, today, yesterday)
  - Includes mode tabs (Instantanée/Jour/Hier)
  - Shows current value + unit (kW/kWh)
  - Real-time updates on mode change
- **Effort:** 2-3 days
- **Tests:** T1.3, T1.4
- **Acceptance:** 4 widgets display, mode switching works, aggregation updates

**Gap 3: useCompteurSelection() Composable**
- **Issue:** No centralized logic for managing selected compteurs, aggregation, filtering
- **Implementation:**
  - New file: `src/composables/useCompteurSelection.ts`
  - Exports: `selectedCompteurs`, `aggregatedInstantaneous`, `aggregatedToday`, `aggregatedYesterday`, `filteredEquipment`, `addCompteur()`, `removeCompteur()`, `setMode()`
  - Manages localStorage persistence
  - Calculates aggregations reactively
- **Effort:** 2 days
- **Tests:** T1.4, T3.3, T4.2
- **Acceptance:** Selection persists, aggregation correct, equipment filters

**Gap 4: Widget Mode Switching Logic**
- **Issue:** No per-widget mode state or switching logic
- **Implementation:**
  - Local state in DashboardView: `widgetModes: { [compteurId]: 'instantanée' | 'jour' | 'hier' }`
  - Handler: `setWidgetMode(compteurId, mode)`
  - Reactively update `aggregatedInstantaneous` based on widgetModes
  - Pass mode to useCompteurSelection().getCompteurValue(compteurId, mode)
- **Effort:** 1.5 days
- **Tests:** T1.3, T1.4
- **Acceptance:** Each widget can independently switch modes, aggregation updates

**Gap 5: Equipment Table Navigation**
- **Issue:** Clicking equipment row should navigate to detail, currently no handler
- **Implementation:**
  - Add click handler to EquipmentTable component
  - Handler: `goToEquipmentDetail(equipmentId)`
  - Router push: `/equipment/${equipmentId}`
- **Effort:** 0.5 days
- **Tests:** T1.6
- **Acceptance:** Row click navigates, equipment ID passed correctly

**Gap 6: API Integration (Backend Dependency)**
- **Issue:** No backend, mock data only
- **Implementation:**
  - Wait for backend team to deploy API endpoints (architecture-handoff.md provides spec)
  - Update `api.ts` to call: `realtimeAPI.getCompteurs()`, `realtimeAPI.getCompteurValues()`
  - Remove MOCK_DATA_ENABLED flag (or keep for fallback)
  - Implement error handling for API failures
- **Effort:** 2 days (after backend ready)
- **Tests:** T3.1, T3.2, T4.2
- **Acceptance:** Real data flows from backend, no mock data

### High Gaps (P1) - Should Fix Before Validation

**Gap 7: Equipment Filtering**
- **Issue:** Equipment table shows all equipment, should filter by selected compteurs
- **Implementation:**
  - Computed property: `filteredEquipment` in useCompteurSelection()
  - Map selected compteur IDs to linked equipment
  - Pass filtered list to EquipmentTable component
- **Effort:** 1 day
- **Tests:** T1.5
- **Acceptance:** Table updates when compteur selection changes

**Gap 8: Accessibility - Motion**
- **Issue:** Pulsing connection indicator may violate WCAG for motion sensitivity
- **Implementation:**
  - Add CSS: `@media (prefers-reduced-motion: reduce)` → disable animation
  - Alternative: Use color change + opacity instead of pulse
- **Effort:** 0.5 days
- **Tests:** T6.1
- **Acceptance:** Passes axe accessibility scan for motion

**Gap 9: Loading & Error States**
- **Issue:** No skeleton loaders or error boundaries
- **Implementation:**
  - Add `isLoading` computed property (based on store)
  - Show skeleton cards during load
  - Add error boundary for failed compteur loads
  - Show "Chargement…" placeholder
- **Effort:** 1.5 days
- **Tests:** T2.1, T2.5
- **Acceptance:** UX clear during loading/errors

### Medium Gaps (P2) - Nice-to-Have for MVP+

**Gap 10: localStorage Persistence**
- **Issue:** Compteur selection lost on page reload
- **Implementation:** Already in `useCompteurSelection()`, just needs tested
- **Effort:** Included in Gap 3
- **Tests:** T3.3
- **Acceptance:** Selection persists across sessions

---

## Implementation Roadmap

### Phase 1: Foundational (Days 1-2)

**Priority:** P0 Gaps 1, 2, 3, 6

1. **Create CompteurWidget.vue component**
   - Props: `compteur`, `mode`, `onModeChange`
   - Display: Name, value, unit, mode tabs
   - Time to implement: 1 day
   - Includes: T1.3 test cases

2. **Create CompteurSelector.vue modal**
   - Props: `availableCompteurs`, `selectedIds`
   - Emit: `select(ids)`
   - Time to implement: 1 day
   - Includes: T1.1, T1.2 test cases

3. **Create useCompteurSelection() composable**
   - State: selectedCompteurs, widgetModes
   - Computations: aggregatedInstantaneous, filteredEquipment
   - Persistence: localStorage save/load
   - Time to implement: 2 days
   - Includes: T3.3 test cases

4. **Update DashboardView.vue**
   - Replace StatCard grid with CompteurWidget grid
   - Add CompteurSelector modal toggle
   - Integrate useCompteurSelection()
   - Wire mode switching
   - Time to implement: 1 day

### Phase 2: Refinement (Days 3-4)

**Priority:** P1 Gaps 7, 8, 9

5. **Add equipment filtering**
   - Use filteredEquipment from useCompteurSelection()
   - Update EquipmentTable component
   - Time to implement: 0.5 days

6. **Fix table row navigation**
   - Wire click handler to goToEquipmentDetail()
   - Test navigation
   - Time to implement: 0.5 days

7. **Add loading & error states**
   - Skeleton loaders for widgets
   - Error boundaries for failed loads
   - Time to implement: 1 day

8. **Accessibility fixes**
   - Motion preference detection
   - Color contrast verification
   - Keyboard navigation testing
   - Time to implement: 1 day

### Phase 3: Backend Integration (Days 5-6, After Backend Ready)

**Priority:** P0 Gap 6

9. **Switch from mock to real API**
   - Call `realtimeAPI.getCompteurs()` on mount
   - Call `getCompteurValues()` per widget per 5s
   - Handle network errors gracefully
   - Time to implement: 2 days

### Phase 4: Testing & Validation (Days 7-8)

10. **Write and execute all tests**
    - Unit tests: T1.1-T1.9, T2.1-T2.5, T4.1-T4.2
    - Integration tests: T3.1-T3.3
    - Performance tests: T5.1-T5.3
    - Accessibility tests: T6.1-T6.4
    - Dark mode tests: T7.1
    - Time to implement: 2 days
    - Coverage target: 80%+

---

## Current Code Analysis

### What's Working Well ✅

**DashboardView.vue (Strengths):**
- ✅ Proper AdminLayout structure
- ✅ Real-time clock updates (1s interval)
- ✅ Export functionality complete
- ✅ WebSocket subscription pattern correct
- ✅ Dark mode classes applied throughout
- ✅ Responsive grid layouts
- ✅ Proper store usage (dashboardStore, equipmentStore, alertsStore)
- ✅ French localization applied
- ✅ Error handling for export

### What Needs Refactoring ⚠️

**DashboardView.vue (Issues):**
- ⚠️ StatCard grid model doesn't match compteur widget spec (lines 48-67)
- ⚠️ No compteur selection modal or state (missing entirely)
- ⚠️ No widgetModes local state (can't switch per-widget)
- ⚠️ Equipment table shows all equipment, not filtered (line 132)
- ⚠️ No equipment row click handler (line 132)
- ⚠️ Aggregation logic implicit, not explicit
- ⚠️ localStorage not used for persistence

**Recommendation:** Keep existing structure, but refactor widget grid and add missing features (don't rewrite).

---

## Dependencies & Blockers

### Blocking MVP Completion

| Blocker | Status | Impact | Timeline |
|---------|--------|--------|----------|
| **Backend API** | ❌ Not Ready | Blocks real data flow | Waiting on backend team |
| **Compteur Selection UI** | ❌ Not Implemented | Blocks core feature | 2 days to implement |
| **Widget Mode Logic** | ❌ Not Implemented | Blocks user control | 2 days to implement |
| **useCompteurSelection() Composable** | ❌ Not Implemented | Blocks state management | 2 days to implement |

**Path to Unblocking:**
1. Implement Gaps 1-3 (3 days, frontend-only)
2. Await backend API (depends on backend team timeline)
3. Integrate backend (1 day after available)
4. Test & validate (2 days)

**Estimated Time to MVP-Ready:** 6-8 days (depending on backend timeline)

---

## Acceptance Criteria for "Phase 4 Complete"

### Must-Have (Spec Compliance)
- ✅ Compteur selection UI functional (add/remove compteurs)
- ✅ Per-widget mode switching (Instantanée/Jour/Hier)
- ✅ Widget aggregation math correct
- ✅ Equipment table filtered by selected compteurs
- ✅ Equipment row navigation functional
- ✅ localStorage persistence working
- ✅ All 27 tests passing (80%+ coverage)
- ✅ No console errors or warnings
- ✅ Lighthouse accessibility score >= 90
- ✅ axe DevTools scan: 0 violations

### Should-Have (UX Polish)
- ⚠️ Loading & error states clear
- ⚠️ Accessibility motion-safe
- ⚠️ Dark mode visually correct
- ⚠️ Performance optimized (< 200ms render)

### Nice-to-Have (Post-MVP)
- ⏳ Custom PDF print template
- ⏳ Time range tabs 24h/7d/30d functional
- ⏳ English localization (FR79, Sprint 8)

---

## Recommendation

**Proceed with implementation of Gap priorities:**

1. **Immediately (Next 2 Days):**
   - Gap 1: CompteurSelector component
   - Gap 3: useCompteurSelection() composable
   - Gap 2: CompteurWidget component replacement
   - **Tests:** T1.1-T1.4, T3.3

2. **Next 2 Days:**
   - Gap 4: Widget mode switching logic
   - Gap 5: Equipment table navigation
   - Gap 7: Equipment filtering
   - Gap 8: Accessibility fixes
   - **Tests:** T1.3, T1.5, T1.6, T6.1

3. **After Backend Ready:**
   - Gap 6: API integration
   - Real data flow testing
   - **Tests:** T3.1, T3.2, T4.2

4. **Final 2 Days:**
   - All remaining tests (T1.7-T1.9, T2.1-T2.5, T5.1-T5.3, T6.2-T6.4, T7.1)
   - Validation & sign-off
   - Mark Phase 4 complete

---

**END OF DASHBOARD IMPLEMENTATION ALIGNMENT REPORT**
