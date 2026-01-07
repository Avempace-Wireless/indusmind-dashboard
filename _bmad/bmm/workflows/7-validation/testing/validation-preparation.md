# Validation Preparation - Test Strategy & Open Questions

**BMAD Phase:** Validation (Phase 7) Preparation  
**Document Type:** Test Plan + Risk Catalog + Open Questions  
**Date:** January 7, 2026  
**Scope:** DashboardView, AlertsView, EquipmentView (partial), + All Planned Views

---

## Purpose

This document prepares for BMAD Validation Phase (7) by:

1. **Defining test scenarios** for performance, security, functional, accessibility validation
2. **Cataloging open questions** requiring stakeholder decisions
3. **Documenting risks** requiring mitigation plans
4. **Establishing acceptance criteria** for MVP readiness

**BMAD Compliance:** Validation phase cannot proceed until:
- ✅ View specifications documented (Phase 4 UX)
- ✅ Sprint delivery verified (Phase 6 Delivery)
- ✅ Traceability matrix complete (Cross-phase)
- ⏳ Backend integration ready (blocker for most tests)

---

## Test Strategy Overview

### Test Pyramid

```
                    Manual Exploratory (5%)
                  ┌─────────────────────┐
                  │  Usability Testing  │
                  └─────────────────────┘
           E2E Tests (15%)
      ┌──────────────────────────┐
      │   Integration Tests      │
      │   (API + WebSocket)      │
      └──────────────────────────┘
  Unit Tests (80%)
┌────────────────────────────────┐
│  Component Tests (Vue)         │
│  Store Tests (Pinia)           │
│  Utility Tests (TypeScript)    │
└────────────────────────────────┘
```

**Current Status:**
- Unit Tests: ❌ 0% coverage (not implemented)
- Integration Tests: ❌ 0% coverage (no backend)
- E2E Tests: ❌ 0% coverage (not written)
- Manual Testing: ⚠️ Ad-hoc only (no test cases)

**Validation Phase Goal:** Achieve 70% unit test coverage + critical path E2E tests before MVP launch

---

## Test Scenarios

### Category 1: Performance Testing (NFR1-4)

#### Scenario P1: Dashboard Initial Load Time
- **Objective:** Verify <2.5s load time (NFR1)
- **Preconditions:**
  - Production build deployed
  - Network throttled to "Fast 3G" (Chrome DevTools)
  - Browser cache cleared
- **Steps:**
  1. Navigate to `/dashboard`
  2. Measure time to interactive (TTI)
  3. Measure first contentful paint (FCP)
- **Success Criteria:**
  - TTI < 2.5 seconds
  - FCP < 1.5 seconds
  - Lighthouse Performance Score > 90
- **Tools:** Chrome DevTools, Lighthouse, WebPageTest
- **Status:** ⏳ Pending backend deployment
- **Risk:** Current build is 741KB minified; may exceed target on slow networks

#### Scenario P2: Real-Time Data Refresh Latency
- **Objective:** Verify <5s end-to-end latency (NFR2)
- **Preconditions:**
  - WebSocket server running
  - Modbus gateway polling equipment
  - 10+ equipment online
- **Steps:**
  1. Trigger anomaly on equipment (e.g., power spike)
  2. Measure time from Modbus read to dashboard UI update
  3. Record WebSocket message timestamp vs UI render timestamp
- **Success Criteria:**
  - Equipment → Modbus Gateway: <1s
  - Gateway → WebSocket Server: <1s
  - Server → Client WebSocket: <1s
  - Client WebSocket → UI Render: <2s
  - **Total: <5s**
- **Tools:** Custom logging, WebSocket inspector, high-speed camera (for UI)
- **Status:** 🚨 Blocked (no backend)
- **Risk:** Cannot validate critical NFR2 without backend

#### Scenario P3: Alert Detection Latency
- **Objective:** Verify <30s anomaly → notification (NFR3)
- **Preconditions:**
  - Alert detection engine running
  - WebSocket server broadcasting to `alerts:new`
  - SMS gateway configured
- **Steps:**
  1. Inject alert condition (e.g., voltage drop below threshold)
  2. Measure time to WebSocket broadcast
  3. Measure time to SMS delivery
  4. Measure time to UI notification
- **Success Criteria:**
  - Anomaly → Detection Engine: <5s
  - Engine → WebSocket Broadcast: <5s
  - Broadcast → UI Notification: <5s
  - Broadcast → SMS Delivery: <15s
  - **Total: <30s** (NFR3)
- **Tools:** Twilio SMS logs, WebSocket inspector
- **Status:** 🚨 Blocked (no backend)
- **Risk:** SMS delivery may be slowest link (Twilio SLA is ~3s)

#### Scenario P4: Historical Query Performance
- **Objective:** Verify <3s query time for 30-day data (NFR4)
- **Preconditions:**
  - InfluxDB/TimescaleDB with 6 months of data
  - 10+ equipment with 15-min resolution
  - Query: 30-day consumption data
- **Steps:**
  1. Call `/api/historical/consumption` with 30-day range
  2. Measure API response time
  3. Measure chart rendering time
- **Success Criteria:**
  - API response: <2.5s
  - Chart render: <0.5s
  - **Total: <3s** (NFR4)
- **Tools:** Postman, Browser DevTools Network tab
- **Status:** ⏳ Pending backend + HistoryView implementation
- **Risk:** InfluxDB query optimization may be required

#### Scenario P5: WebSocket Concurrent Connections
- **Objective:** Verify 100+ concurrent users (NFR20)
- **Preconditions:**
  - WebSocket server deployed with load balancer
  - 100 simulated clients
- **Steps:**
  1. Connect 100 WebSocket clients to `dashboard:site_a`
  2. Broadcast message from server
  3. Verify all clients receive message within <5s
  4. Measure server CPU/RAM usage
- **Success Criteria:**
  - All 100 clients receive message
  - Message delivery < 5s
  - Server CPU < 80%
  - Server RAM < 2GB
- **Tools:** Artillery, k6, WebSocket load testing tool
- **Status:** 🚨 Blocked (no WebSocket server)
- **Risk:** May need Redis pub/sub for horizontal scaling

#### Scenario P6: Chart Rendering Performance
- **Objective:** Verify smooth chart updates with 100+ data points
- **Preconditions:**
  - DashboardView open
  - 100 data points in chart
  - Real-time updates every 15s
- **Steps:**
  1. Monitor chart re-render performance with Chrome DevTools
  2. Measure FPS during update
  3. Check for memory leaks (heap snapshots)
- **Success Criteria:**
  - FPS > 30 during re-render
  - No memory leaks after 100 updates
  - Render time < 100ms per update
- **Tools:** Chrome DevTools Performance tab
- **Status:** ⚠️ Can test with mock data (no backend required)
- **Risk:** Current implementation destroys/recreates chart; may cause lag

---

### Category 2: Security Testing (NFR9-16)

#### Scenario S1: TLS 1.3 Enforcement
- **Objective:** Verify TLS 1.3 only (NFR9)
- **Preconditions:**
  - Production deployment to Azure App Service
  - Custom domain with SSL certificate
- **Steps:**
  1. Run SSL Labs scan on production URL
  2. Attempt connection with TLS 1.2 client
  3. Verify rejection
- **Success Criteria:**
  - SSL Labs grade: A+
  - TLS 1.3 only accepted
  - No TLS 1.2 fallback
- **Tools:** SSL Labs, `openssl s_client`
- **Status:** ⏳ Pending production deployment
- **Risk:** Azure App Service may default to TLS 1.2; requires config

#### Scenario S2: OAuth 2.0 Compliance
- **Objective:** Verify RFC 6749 adherence (NFR14)
- **Preconditions:**
  - OAuth server deployed
  - Test user account created
- **Steps:**
  1. Authenticate with valid credentials
  2. Verify JWT token structure (header, payload, signature)
  3. Verify token expiry (1 hour)
  4. Test refresh token flow
  5. Test logout (token revocation)
- **Success Criteria:**
  - JWT conforms to RFC 7519
  - Token expires after 1 hour
  - Refresh token works
  - Logout invalidates token
- **Tools:** jwt.io, Postman, OAuth debugger
- **Status:** 🚨 Blocked (OAuth server not deployed)
- **Risk:** Mock JWT in development; real implementation may differ

#### Scenario S3: MFA Enforcement
- **Objective:** Verify MFA requirement (NFR11)
- **Preconditions:**
  - MFA implemented (TOTP or SMS)
  - Test user enrolled in MFA
- **Steps:**
  1. Login with email + password
  2. Verify MFA challenge prompt
  3. Enter invalid TOTP code → verify rejection
  4. Enter valid TOTP code → verify success
- **Success Criteria:**
  - MFA required for all users
  - Invalid code rejected
  - Valid code grants access
- **Tools:** Google Authenticator, manual testing
- **Status:** 🚨 Not Implemented (NFR11 violation)
- **Risk:** MFA missing is critical security gap

#### Scenario S4: RBAC Authorization
- **Objective:** Verify 6 roles enforced (NFR16)
- **Preconditions:**
  - 6 test users (Operator, Engineer, Manager, Admin, Maintenance, Compliance)
  - UsersView deployed
- **Steps:**
  1. Login as Operator → verify cannot access UsersView
  2. Login as Admin → verify can access UsersView
  3. Test API endpoints with role-based restrictions
- **Success Criteria:**
  - Operator cannot access admin routes/APIs
  - Admin can access all routes/APIs
  - Role-based menu items displayed correctly
- **Tools:** Manual testing, API integration tests
- **Status:** ⚠️ Partial (route guards exist, API enforcement not verified)
- **Risk:** Frontend route guards can be bypassed; backend RBAC essential

#### Scenario S5: Audit Log Immutability
- **Objective:** Verify audit logs cannot be edited/deleted (NFR15)
- **Preconditions:**
  - Audit log table created with append-only constraint
  - Admin user attempts to modify log
- **Steps:**
  1. Trigger auditable action (e.g., acknowledge alert)
  2. Verify log entry created
  3. Attempt SQL UPDATE on log entry
  4. Attempt SQL DELETE on log entry
  5. Verify both fail
- **Success Criteria:**
  - UPDATE fails with database error
  - DELETE fails with database error
  - All user actions logged (login, logout, acknowledge, CRUD)
- **Tools:** Database client (Azure Data Studio), manual testing
- **Status:** 🚨 Blocked (no database schema)
- **Risk:** Immutability must be enforced at database level (triggers, constraints)

#### Scenario S6: Penetration Testing
- **Objective:** Identify OWASP Top 10 vulnerabilities (NFR18)
- **Preconditions:**
  - Production deployment or staging environment
  - Pen testing tool configured
- **Steps:**
  1. Run automated scan (OWASP ZAP, Burp Suite)
  2. Test for SQL injection (search inputs, filters)
  3. Test for XSS (alert messages, user inputs)
  4. Test for CSRF (state-changing API calls)
  5. Test for auth bypass (JWT tampering)
- **Success Criteria:**
  - 0 critical vulnerabilities
  - 0 high vulnerabilities
  - < 5 medium vulnerabilities (with mitigation plan)
- **Tools:** OWASP ZAP, Burp Suite Professional
- **Status:** ⏳ Pending production deployment
- **Risk:** Manual pen test may reveal issues not caught by automated scans

---

### Category 3: Functional Testing

#### Scenario F1: Dashboard Export CSV
- **Objective:** Verify export functionality and data accuracy
- **Preconditions:**
  - DashboardView loaded
  - 24 hours of historical data available
- **Steps:**
  1. Click "Exporter les données" button
  2. Verify loading state ("Export en cours…")
  3. Download CSV file
  4. Open CSV in Excel
  5. Verify columns: timestamp, power, voltage, frequency, power_factor
  6. Verify 24 hours of data (1440 rows at 1-min resolution)
  7. Verify timestamp format (ISO 8601)
- **Success Criteria:**
  - CSV downloaded successfully
  - All 5 metrics present
  - 1440 rows (or appropriate count for resolution)
  - No missing data
  - Timestamps sequential and accurate
- **Tools:** Excel, manual verification
- **Status:** ⚠️ Can test with mock data (no backend required)
- **Risk:** Export may fail with large datasets (>10,000 rows)

#### Scenario F2: Alert Filtering (All 7 Types)
- **Objective:** Verify all filter combinations work
- **Preconditions:**
  - AlertsView loaded
  - 100+ alerts in database (6 severity levels, 10+ equipment)
- **Steps:**
  1. Filter by severity (Emergency only) → verify count
  2. Filter by equipment (Equipment #1) → verify filtered list
  3. Filter by status (Unacknowledged) → verify filtered list
  4. Filter by date range (last 7 days) → verify filtered list
  5. Search by keyword ("voltage") → verify filtered list
  6. Combine filters (Critical + Equipment #1 + Last 24h) → verify AND logic
  7. Clear filters → verify full list restored
- **Success Criteria:**
  - Each filter works independently
  - Combined filters use AND logic (not OR)
  - Filter count matches displayed results
  - Pagination adjusts to filtered count
- **Tools:** Manual testing
- **Status:** ⚠️ Can test with mock data
- **Risk:** Complex filter combinations may have edge cases (e.g., no results)

#### Scenario F3: Alert Acknowledgment (Single + Bulk)
- **Objective:** Verify acknowledge actions persist to backend
- **Preconditions:**
  - AlertsView loaded
  - 10+ unacknowledged alerts
  - Current user ID known
- **Steps:**
  1. Click acknowledge on single alert
  2. Verify API call to `/api/alerts/{id}/acknowledge`
  3. Verify alert status changes to "Acknowledged"
  4. Verify "Acknowledged by" displays current user
  5. Click "Acknowledge All"
  6. Verify bulk API call
  7. Verify all alerts marked as acknowledged
- **Success Criteria:**
  - Single acknowledge: API called with correct alert ID + user ID
  - Bulk acknowledge: API called with array of alert IDs
  - UI updates immediately (optimistic update)
  - Backend persists acknowledgment
  - Audit log entry created (NFR15)
- **Tools:** Network tab, API testing
- **Status:** 🚨 Blocked (backend API not deployed)
- **Risk:** Optimistic UI update may show acknowledged before backend confirms

#### Scenario F4: Equipment CRUD Operations
- **Objective:** Verify equipment registration form (FR23-24)
- **Preconditions:**
  - EquipmentView loaded
  - Admin user logged in
- **Steps:**
  1. Click "Add Equipment" button
  2. Fill form: name, type, model, serial, install date, specs
  3. Submit form
  4. Verify API call to `POST /api/equipment`
  5. Verify new equipment appears in grid
  6. Click equipment card → verify detail page
  7. Edit equipment → verify `PUT /api/equipment/{id}`
  8. Delete equipment → verify `DELETE /api/equipment/{id}` with confirmation
- **Success Criteria:**
  - Form validation works (required fields, date format)
  - API calls successful
  - Grid updates after CRUD operations
  - Delete confirmation prevents accidental deletion
- **Tools:** Manual testing, Network tab
- **Status:** 🚨 Blocked (form not implemented)
- **Risk:** Form complexity may lead to validation errors

#### Scenario F5: WebSocket Reconnection
- **Objective:** Verify auto-reconnect on disconnect
- **Preconditions:**
  - DashboardView loaded
  - WebSocket connected
- **Steps:**
  1. Verify green connection indicator
  2. Stop WebSocket server
  3. Verify red connection indicator + "Déconnecté" text
  4. Restart WebSocket server
  5. Verify auto-reconnect within 30s
  6. Verify green connection indicator restored
  7. Verify real-time data resumes
- **Success Criteria:**
  - Disconnect detected within 5s
  - Auto-reconnect attempts start immediately
  - Exponential backoff (1s, 2s, 4s, 8s, max 30s)
  - Reconnect successful within 30s of server restart
  - No data loss (queued messages delivered)
- **Tools:** WebSocket inspector, manual server restart
- **Status:** 🚨 Blocked (no WebSocket server)
- **Risk:** Infinite retry loop if server permanently down (need max retry limit)

#### Scenario F6: Phase Balance Calculation
- **Objective:** Verify voltage imbalance detection
- **Preconditions:**
  - DashboardView loaded
  - 3-phase voltage data available (L1, L2, L3)
- **Steps:**
  1. Inject balanced voltages (L1=230.0V, L2=230.0V, L3=230.0V)
  2. Verify phase balance widget shows ~75% for all (balanced)
  3. Inject imbalanced voltages (L1=235V, L2=225V, L3=230V)
  4. Verify widget shows L1=80%, L2=70%, L3=75% (example)
  5. Verify color coding (green for balanced, yellow/red for imbalance)
- **Success Criteria:**
  - Imbalance calculated correctly (percentage relative to nominal 230V)
  - Color thresholds: green (±2%), yellow (±5%), red (>5%)
  - Tooltip shows exact voltage value on hover
- **Tools:** Manual testing with mock data
- **Status:** ⚠️ Can test algorithm with mock data
- **Risk:** Imbalance threshold (±2%, ±5%) not documented; need stakeholder confirmation

---

### Category 4: Accessibility Testing (WCAG 2.1 AA)

#### Scenario A1: Automated WCAG Scan
- **Objective:** Identify accessibility violations
- **Preconditions:**
  - DashboardView, AlertsView, EquipmentView deployed
- **Steps:**
  1. Run axe DevTools on each view
  2. Run Lighthouse Accessibility audit
  3. Run WAVE extension scan
  4. Catalog all violations (critical, serious, moderate, minor)
- **Success Criteria:**
  - 0 critical violations
  - 0 serious violations
  - < 5 moderate violations (with fix plan)
- **Tools:** axe DevTools, Lighthouse, WAVE
- **Status:** ⏳ Can run immediately (no backend required)
- **Risk:** Pulsing animations may violate motion sensitivity (WCAG 2.3.3)

#### Scenario A2: Screen Reader Navigation
- **Objective:** Verify screen reader compatibility
- **Preconditions:**
  - NVDA or JAWS installed
  - DashboardView loaded
- **Steps:**
  1. Navigate dashboard with keyboard only (no mouse)
  2. Verify all interactive elements reachable via Tab key
  3. Verify form labels announced correctly
  4. Verify button purpose announced (e.g., "Export data button")
  5. Verify chart data accessible (alt text or table alternative)
- **Success Criteria:**
  - All buttons, links, form inputs reachable and announced
  - Tab order logical (top to bottom, left to right)
  - Focus visible (outline or highlight)
  - No keyboard traps (can Tab out of all elements)
- **Tools:** NVDA, JAWS, manual testing
- **Status:** ⏳ Can test immediately
- **Risk:** Charts may be inaccessible to screen readers (need text alternative)

#### Scenario A3: Color Contrast Verification
- **Objective:** Verify 4.5:1 contrast ratio (WCAG 2.1 AA)
- **Preconditions:**
  - All views deployed in light and dark mode
- **Steps:**
  1. Run contrast checker on all text elements
  2. Verify body text (gray-900 on white) has 4.5:1 ratio
  3. Verify buttons (white on blue-600) have 4.5:1 ratio
  4. Verify dark mode (white on #1c2534) has 4.5:1 ratio
  5. Test severity color coding (red, orange, yellow, green, blue) for contrast
- **Success Criteria:**
  - All text: ≥ 4.5:1 contrast
  - Large text (18pt+): ≥ 3:1 contrast
  - UI components (buttons, form borders): ≥ 3:1 contrast
- **Tools:** axe DevTools, WebAIM Contrast Checker
- **Status:** ⏳ Can test immediately
- **Risk:** Yellow severity badges (AlertsView) may fail contrast on white background

#### Scenario A4: Keyboard Navigation
- **Objective:** Verify 100% keyboard-accessible
- **Preconditions:**
  - All views deployed
  - Mouse disconnected (force keyboard-only)
- **Steps:**
  1. Tab through all interactive elements (buttons, links, form inputs)
  2. Test dropdown menus with arrow keys
  3. Test modal dialogs (open with Enter, close with Esc)
  4. Test table navigation (arrow keys for rows/columns)
  5. Verify focus never lost (no keyboard traps)
- **Success Criteria:**
  - All interactive elements reachable via keyboard
  - Enter key activates buttons/links
  - Esc key closes modals
  - Arrow keys navigate dropdowns/tables (if applicable)
  - Focus visible at all times
- **Tools:** Manual testing
- **Status:** ⏳ Can test immediately
- **Risk:** Custom components (ConsumptionChart, PhaseBalance) may not support keyboard nav

---

### Category 5: Usability Testing

#### Scenario U1: Operator Onboarding (5-Minute Task)
- **Objective:** Verify new operator can monitor energy within 5 minutes
- **Preconditions:**
  - New user (no prior training)
  - DashboardView deployed with real data
- **Steps:**
  1. Give user task: "Check current power consumption"
  2. Observe user navigation
  3. Record time to find answer
  4. Ask user to export data
  5. Record time to complete export
  6. Interview user on ease of use (1-10 scale)
- **Success Criteria:**
  - User finds power stat card within 30 seconds
  - User completes export within 2 minutes
  - User rates ease of use ≥ 7/10
- **Tools:** User observation, timer, interview questions
- **Status:** ⏳ Pending real data deployment
- **Risk:** French-only UI may confuse non-French speakers

#### Scenario U2: Alert Triage Speed Test
- **Objective:** Verify operator can acknowledge critical alert within 2 minutes
- **Preconditions:**
  - Operator trained on system
  - 50+ alerts in AlertsView (including 3 critical)
- **Steps:**
  1. Inject new critical alert
  2. Measure time for operator to notice (dashboard event widget or alert notification)
  3. Measure time to navigate to AlertsView
  4. Measure time to filter to critical alerts
  5. Measure time to acknowledge
- **Success Criteria:**
  - Notice within 30 seconds (via WebSocket push or manual refresh)
  - Navigate to AlertsView within 15 seconds
  - Filter to critical within 15 seconds
  - Acknowledge within 30 seconds
  - **Total: < 2 minutes**
- **Tools:** User observation, timer
- **Status:** ⏳ Pending AlertsView + backend integration
- **Risk:** WebSocket push may not be obvious to user (need sound/popup notification)

---

## Dark Mode Testing Coverage

**Views with Dark Mode Implemented:**
- ✅ DashboardView (full support, Stitch colors)
- ✅ AlertsView (full support)
- ✅ EquipmentView (full support)
- ✅ ConsumptionView (full support, placeholder)
- ✅ BaseLoadView (full support, placeholder)
- ✅ All analysis views (placeholders with dark mode)

**Dark Mode Test Checklist:**

| Component | Light Mode | Dark Mode | Contrast Verified | Notes |
|-----------|------------|-----------|-------------------|-------|
| StatCard | ✅ White bg | ✅ #1c2534 bg | ⏳ Pending | - |
| ConsumptionChart | ✅ White bg | ✅ #1c2534 bg | ⏳ Pending | Chart.js colors may need adjustment |
| PhaseBalance | ✅ White bg | ✅ #1c2534 bg | ⏳ Pending | Progress bars use fixed colors |
| EventsWidget | ✅ White bg | ✅ #1c2534 bg | ⏳ Pending | - |
| EquipmentTable | ✅ White bg | ✅ #1c2534 bg | ⏳ Pending | Search input needs dark mode border |
| AlertItem | ✅ White bg | ✅ Gray-800 bg | ⏳ Pending | Severity badges verified |
| AlertFilters | ✅ White bg | ✅ Gray-800 bg | ⏳ Pending | Form inputs verified |
| AdminLayout Sidebar | ✅ White bg | ✅ #111722 bg | ⏳ Pending | - |
| AdminLayout Topbar | ✅ White bg | ✅ #1c2534 bg | ⏳ Pending | Theme toggle button verified |

**Dark Mode Validation Tasks:**
1. ⏳ Run contrast checker on all dark mode text
2. ⏳ Verify chart colors visible in dark mode (Chart.js config)
3. ⏳ Test theme toggle persistence (localStorage)
4. ⏳ Verify theme applies globally (all views)
5. ⏳ Test print styles (dark mode should not print black background)

---

## Open Questions

### Category: Requirements Clarification

**Q1: MVP Scope Decision**
- **Question:** Which FR scope for Jan 31 MVP launch?
  - Option A: FR1-22 only (Real-Time + Alerts)
  - Option B: FR1-38 (add Equipment + History)
  - Option C: Full 90 FRs (requires timeline extension)
- **Impact:** Sprint planning, team allocation, stakeholder expectations
- **Owner:** Dr. Leila (Manager), Karim (Lead Engineer)
- **Status:** 🚨 **CRITICAL DECISION REQUIRED**

**Q2: French vs English UI**
- **Question:** Is French-only acceptable for MVP, or must English be included?
- **Context:** Only DashboardView has French; rest are English
- **Impact:** i18n effort, consistency, user experience
- **Owner:** Dr. Leila
- **Status:** ⏳ Pending

**Q3: MFA Requirement**
- **Question:** Can MFA (NFR11) be deferred to post-MVP, or is it launch-blocking?
- **Context:** MFA not implemented; security gap exists
- **Impact:** Security posture, compliance, MVP timeline
- **Owner:** Security team, Dr. Leila
- **Status:** ⏳ Pending

**Q4: ISO 50001 Audit Readiness**
- **Question:** Is July 2026 audit firm, or can it be deferred to 2027?
- **Context:** 6 months data collection requires Jan 31 MVP; FR39-62 not started
- **Impact:** Compliance timeline, resource allocation
- **Owner:** Compliance role, Dr. Leila
- **Status:** ⏳ Pending

**Q5: Backend Development Timeline**
- **Question:** When will backend API be ready for integration?
- **Context:** All Epic stories with backend are blocked; 0% integration
- **Impact:** Sprint 2-4 timeline, NFR validation, MVP readiness
- **Owner:** Backend developer, Karim
- **Status:** 🚨 **CRITICAL BLOCKER**

### Category: Technical Decisions

**Q6: Chart Time Range Tabs**
- **Question:** Should visible-but-non-functional tabs (15m, 1h, 24h, 7j) be removed or implemented?
- **Context:** DashboardView shows 4 tabs but only 1h data works
- **Impact:** User confusion, development effort
- **Owner:** Frontend team, UX designer
- **Status:** ⏳ Pending

**Q7: Phase Balance Thresholds**
- **Question:** What voltage imbalance % triggers yellow/red alerts?
- **Context:** PhaseBalance widget shows colors but thresholds not documented
- **Options:** ±2% green, ±5% yellow, >5% red (proposed)
- **Impact:** Alert accuracy, operator response
- **Owner:** Karim (electrical engineer)
- **Status:** ⏳ Pending

**Q8: Equipment Table Pagination**
- **Question:** Should equipment table support pagination, or assume <50 equipment per site?
- **Context:** Current implementation shows all equipment (no pagination)
- **Impact:** Performance with 100+ equipment, scalability
- **Owner:** Frontend team
- **Status:** ⏳ Pending

**Q9: Alert List Virtualization**
- **Question:** Is virtualization needed for alert list, or is 1000-alert hard limit acceptable?
- **Context:** No virtualization implemented; may lag with large datasets
- **Impact:** Performance, user experience
- **Owner:** Frontend team
- **Status:** ⏳ Pending

**Q10: Export File Format**
- **Question:** Is CSV sufficient for export, or are Excel/PDF required?
- **Context:** Only CSV export implemented
- **Impact:** User workflow, ISO 50001 evidence requirements
- **Owner:** Dr. Leila, Compliance role
- **Status:** ⏳ Pending

### Category: Validation & Testing

**Q11: Test Coverage Target**
- **Question:** What % unit test coverage is required for MVP launch?
- **Context:** Currently 0% coverage
- **Options:** 70% (industry standard), 50% (pragmatic), 90% (high assurance)
- **Impact:** Testing effort, code quality, MVP timeline
- **Owner:** QA team, Karim
- **Status:** ⏳ Pending

**Q12: Penetration Testing Scope**
- **Question:** Should pen test be automated-only, or include manual testing?
- **Context:** NFR18 requires OWASP compliance; manual testing is more thorough
- **Impact:** Security assurance, cost, timeline
- **Owner:** Security team
- **Status:** ⏳ Pending

**Q13: Accessibility Standard**
- **Question:** Is WCAG 2.1 AA sufficient, or is AAA required?
- **Context:** WCAG 2.1 AA is industry standard; AAA is stricter
- **Impact:** Development effort, legal compliance
- **Owner:** Legal team, Dr. Leila
- **Status:** ⏳ Pending (assumed AA)

**Q14: Browser Support**
- **Question:** Which browser versions must be supported?
- **Context:** NFR53 says Chrome/Firefox/Safari/Edge 90+
- **Clarification:** Does "90+" mean version 90 or last 90 days of releases?
- **Impact:** Testing matrix, polyfill requirements
- **Owner:** Frontend team
- **Status:** ⏳ Pending (assumed last 2 major versions)

---

## Risk Catalog (Consolidated from Traceability Matrix)

### Critical Risks (🚨 Immediate Mitigation Required)

**R1: MVP Deadline Unachievable**
- **Description:** Only 24% FR complete; Jan 31 target impossible
- **Impact:** Stakeholder trust, ISO 50001 timeline, business goals
- **Mitigation:**
  - Reduce scope to FR1-22 (Real-Time + Alerts only)
  - Extend timeline to March 2026
  - Add 2 developers to team
- **Owner:** Dr. Leila, Karim
- **Status:** 🚨 Open

**R2: ISO 50001 Audit Failure**
- **Description:** FR39-62 (Compliance) not started; 6 months data needed
- **Impact:** Certification delay, client loss, revenue impact
- **Mitigation:**
  - Fast-track Sprint 3 (parallel with Sprint 2)
  - Hire compliance specialist
  - Defer audit to 2027 (requires stakeholder approval)
- **Owner:** Compliance role, Dr. Leila
- **Status:** 🚨 Open

**R3: Backend Integration Blocker**
- **Description:** 0% backend; all Epic stories blocked
- **Impact:** Cannot validate NFRs, cannot complete Sprint 2-4
- **Mitigation:**
  - Deploy mock backend with OpenAPI compliance
  - Parallel backend sprint (dedicated backend developer)
  - Use BaaS (Firebase, Supabase) for rapid prototyping
- **Owner:** Backend developer, Karim
- **Status:** 🚨 Open

**R4: MFA Security Gap**
- **Description:** NFR11 not implemented; violates security requirements
- **Impact:** Security breach risk, compliance violation
- **Mitigation:**
  - Fast-track MFA in Sprint 4
  - Defer MVP launch until MFA ready
  - Accept risk with documented waiver
- **Owner:** Security team, Dr. Leila
- **Status:** 🚨 Open

### High Risks (⚠️ Monitor & Plan)

**R5: Chart Rendering Performance**
- **Description:** Re-render every 15s may cause lag
- **Impact:** Poor UX, operator frustration
- **Mitigation:** Use Chart.js `update()` method instead of destroy/recreate
- **Owner:** Frontend team
- **Status:** ⏳ Planned

**R6: Alert List Scalability**
- **Description:** No virtualization; may lag with 10,000+ alerts
- **Impact:** Poor performance during alert storms
- **Mitigation:** Implement virtual scrolling library
- **Owner:** Frontend team
- **Status:** ⏳ Planned

**R7: Accessibility Violations**
- **Description:** Color-only severity, pulsing animations may fail WCAG
- **Impact:** Legal risk, user exclusion
- **Mitigation:** Add icons/labels, disable animations option
- **Owner:** Frontend team, UX designer
- **Status:** ⏳ Planned

**R8: WebSocket Infinite Retry**
- **Description:** Reconnection may loop infinitely if server down
- **Impact:** Client performance, battery drain (mobile)
- **Mitigation:** Max retry limit (10 attempts), exponential backoff
- **Owner:** Frontend team
- **Status:** ⏳ Planned

---

## Acceptance Criteria for MVP Readiness

### Must-Have (Launch Blocking)

**Functional:**
- ✅ DashboardView: Real-time monitoring with <5s refresh (FR1-8)
- ✅ AlertsView: Alert management with acknowledge (FR9-22)
- ❌ HistoryView: Historical data analysis (FR32-38) **MISSING**
- ❌ EquipmentView: CRUD operations (FR23-31) **INCOMPLETE**
- ❌ LoginView: MFA enforcement (NFR11) **MISSING**

**Performance:**
- ⏳ <2.5s initial load (NFR1) **NOT TESTED**
- ⏳ <5s real-time refresh (NFR2) **NOT TESTED**
- ⏳ <30s alert latency (NFR3) **NOT TESTED**
- ⏳ <3s historical query (NFR4) **NOT TESTED**

**Security:**
- ⏳ TLS 1.3 enforced (NFR9) **NOT DEPLOYED**
- ❌ MFA implemented (NFR11) **MISSING**
- ⏳ RBAC enforced (NFR16) **NOT TESTED**
- ⏳ Audit logs immutable (NFR15) **NOT VERIFIED**

**Accessibility:**
- ⏳ WCAG 2.1 AA compliance **NOT AUDITED**
- ⏳ Screen reader compatible **NOT TESTED**
- ⏳ Keyboard navigation **NOT TESTED**

### Should-Have (Defer to Post-MVP if Needed)

- ⚠️ FR39-62: ISO 50001 compliance features
- ⚠️ FR74-79: Personalization (except theme toggle)
- ⚠️ FR64-73: User management (except login)
- ⚠️ Multi-language support (English/Arabic)

### Could-Have (Phase 2)

- FR80-83: Multi-site coordination
- Advanced analytics (forecasting, anomaly detection)
- PWA features (offline mode, push notifications)

---

## Next Steps (BMAD Validation Phase Entry)

### Prerequisite Tasks (Before Validation Phase)

1. **✅ Complete View Specifications** (Phase 4 UX) - DONE
2. **✅ Complete Sprint Review** (Phase 6 Delivery) - DONE
3. **✅ Complete Traceability Matrix** (Cross-phase) - DONE
4. **⏳ Resolve Open Questions Q1-Q5** (Critical decisions)
5. **🚨 Backend Integration** (blocker for most tests)

### Validation Phase Execution Plan

**Week 1: Test Environment Setup**
- Deploy staging environment (Azure App Service)
- Configure WebSocket server (mock or real)
- Set up test data (10+ equipment, 100+ alerts, 6 months historical)
- Install testing tools (Lighthouse, axe DevTools, OWASP ZAP)

**Week 2-3: Automated Testing**
- Write unit tests (70% coverage target)
- Write integration tests (API + WebSocket)
- Write E2E tests (Playwright/Cypress)
- Run automated accessibility scan

**Week 4: Manual Testing**
- Performance testing (NFR1-4)
- Security testing (penetration test)
- Usability testing (5 operators)
- Accessibility testing (screen reader, keyboard)

**Week 5: Defect Triage & Fixes**
- Categorize defects (critical, high, medium, low)
- Fix critical and high defects
- Retest fixed defects
- Accept medium/low defects as technical debt

**Week 6: MVP Readiness Review**
- Final checklist verification
- Stakeholder demo
- Go/No-Go decision for Jan 31 launch

---

## Document Control

**Version:** 1.0  
**Date:** January 7, 2026  
**BMAD Phase:** Validation Preparation (Phase 7)  
**Next Update:** After backend integration + Open Questions resolved

**Status Summary:**
- Test Scenarios Defined: ✅ 23 scenarios (6 performance, 6 security, 6 functional, 4 accessibility, 2 usability)
- Open Questions: ⏳ 14 questions catalogued (5 critical, 9 technical)
- Risk Catalog: ✅ 8 critical/high risks identified
- Acceptance Criteria: ⚠️ 60% must-have criteria met

**Validation Phase Readiness:** 🚨 **NOT READY**
- **Blockers:** Backend integration (R3), Open Questions Q1 & Q5
- **Estimated Time to Ready:** 2-4 weeks (depends on backend timeline)

---

**END OF VALIDATION PREPARATION DOCUMENT**
