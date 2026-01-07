# Sprint Plan: Indusmind Energy Dashboard Platform

**Project:** Indusmind Energy Dashboard Platform  
**Planning Date:** January 6, 2026  
**MVP Target:** January 31, 2026 (Sprint 4 completion)  
**ISO 50001 Audit:** July 15-17, 2026

---

## Overview

This sprint plan breaks down **90 Functional Requirements** from the PRD into actionable 2-week sprints. The plan prioritizes:

1. **Critical Path:** MVP launch by January 31 → 6 months data collection → ISO 50001 audit July 2026
2. **User Success:** 70% operator adoption Month 3, 85% Month 9
3. **Business Impact:** 15% energy cost reduction (phased: 3-5% M6, 8-10% M12, 15% M18)

### Sprint Structure

- **Sprint Duration:** 2 weeks (10 working days)
- **MVP:** Sprints 0-4 (10 weeks total, buffer for Jan 31 deadline)
- **Phase 2:** Sprints 5-8 (Multi-site coordination, mobile optimization)
- **Phase 3:** Sprints 9-10 (Advanced analytics, predictive maintenance)

### Team Assumptions

- **Frontend:** 2 Vue 3 developers
- **Backend:** 1 API + integration developer
- **DevOps:** 0.5 FTE (shared)
- **QA:** 1 tester (manual + automation)
- **UX Designer:** 0.5 FTE (Sprint 0-2)

---

## Sprint 0: Foundation & Infrastructure
**Duration:** 2 weeks  
**Goal:** Establish development environment, authentication, and core architecture  
**Velocity Target:** 25 story points

### Epic 0.1: Development Environment Setup
- **Story 0.1.1:** Configure Vue 3 + Vite + TypeScript project (3 pts)
  - Acceptance: `npm run dev` loads, TypeScript strict mode, ESLint configured
- **Story 0.1.2:** Setup Tailwind CSS with design tokens (2 pts)
  - Acceptance: Primary color `#135bec`, Inter font, dark mode default
- **Story 0.1.3:** Configure Pinia stores (Dashboard, Alerts, Equipment, User, Settings) (5 pts)
  - Acceptance: 5 stores with typed state, getters, actions
- **Story 0.1.4:** Setup Vue Router with lazy-loaded routes (3 pts)
  - Acceptance: `/dashboard`, `/alerts`, `/equipment`, `/reports` routes

### Epic 0.2: Authentication & Authorization (FR63-73)
- **Story 0.2.1:** Backend OAuth 2.0 login/logout API (8 pts)
  - Acceptance: JWT tokens, 1-hour expiry, refresh tokens, `NFR14`
  - **Depends on:** NFR9 (TLS 1.3), NFR12 (password policy)
- **Story 0.2.2:** Frontend login page + session management (5 pts)
  - Acceptance: Email/password form, auto-logout 30min inactivity, `FR63`
- **Story 0.2.3:** Implement RBAC middleware (6 roles) (8 pts)
  - Acceptance: Operator, Engineer, Manager, Admin, Maintenance, Compliance roles enforced at API layer, `NFR16`

### Epic 0.3: Core Layout Components
- **Story 0.3.1:** Create navigation sidebar with role-based menu (5 pts)
  - Acceptance: Dynamic menu items based on user role, collapsible
- **Story 0.3.2:** Build topbar with notifications icon + user profile (3 pts)
  - Acceptance: Bell icon, profile dropdown, theme toggle

**Definition of Done:**
- [ ] All code reviewed, merged to `main` branch
- [ ] TLS 1.3 HTTPS enforced on dev/staging (`NFR9`)
- [ ] Authentication tokens working with 1-hour expiry
- [ ] 6 RBAC roles testable via seed users
- [ ] Dark mode default applied (`Design Integration Plan`)

---

## Sprint 1: Real-Time Monitoring Core
**Duration:** 2 weeks  
**Goal:** Deliver FR1-8 (Real-Time Energy Monitoring) + critical alerts  
**Velocity Target:** 30 story points

### Epic 1.1: Real-Time Dashboard (FR1-8)
- **Story 1.1.1:** Backend Modbus TCP/RTU integration (10 pts)
  - Acceptance: Poll 10 equipment every 5 seconds, `NFR36-37`, store in InfluxDB/TimescaleDB
  - **Depends on:** Equipment registry seeded with 10 devices
- **Story 1.1.2:** WebSocket pub/sub server (`dashboard:site_a` channel) (8 pts)
  - Acceptance: Broadcast readings every 5 seconds, 500+ concurrent connections, `NFR26`, `NFR2`
- **Story 1.1.3:** Dashboard view with 6 gauges (Power, Consumption, Power Factor, Voltage, Cost, Status) (13 pts)
  - Acceptance: Color-coded (green/yellow/red), <5s refresh, `FR1-6`, Chart.js integration
  - **Depends on:** WebSocket client in Pinia `dashboardStore`
- **Story 1.1.4:** Real-time cost calculation (€/hour display) (5 pts)
  - Acceptance: Uses current tariff from settings, updates every 5 seconds, `FR5`

### Epic 1.2: Critical Alert Detection (FR9-14)
- **Story 1.2.1:** Backend alert detection engine (6 levels) (8 pts)
  - Acceptance: Evaluate thresholds every 5 seconds, classify Informational/Low/Medium/High/Critical/Emergency, `FR9-10`
  - **Depends on:** Default thresholds from Domain Requirements
- **Story 1.2.2:** Alert notification service (WebSocket + SMS) (8 pts)
  - Acceptance: Push to `alerts:new` channel, SMS for Critical/Emergency, <30s latency, `FR13`, `NFR3`
- **Story 1.2.3:** Alerts page with real-time list + filters (8 pts)
  - Acceptance: Filter by level/equipment/date, sort by time, `FR11-12`, color-coded badges

**Definition of Done:**
- [ ] Dashboard displays 6 real-time metrics with <5s refresh (`NFR2`)
- [ ] Alerts detected within <30s of anomaly (`NFR3`)
- [ ] SMS sent for Critical/Emergency alerts (`FR13`)
- [ ] WebSocket connections handle 100+ concurrent users (`NFR20`)
- [ ] Modbus polling stable for 48 hours without errors

---

## Sprint 2: Equipment & Historical Analysis
**Duration:** 2 weeks  
**Goal:** Deliver FR23-31 (Equipment Inventory) + FR32-38 (Historical Data)  
**Velocity Target:** 28 story points

### Epic 2.1: Equipment Management (FR23-31)
- **Story 2.1.1:** Equipment registration form (add/edit) (5 pts)
  - Acceptance: Name, type, model, serial, install date, specs, `FR23-24`
- **Story 2.1.2:** Equipment list with search + filter (3 pts)
  - Acceptance: Search by name/model, filter by type/location, `FR25-26`
- **Story 2.1.3:** Equipment detail page with photo upload (5 pts)
  - Acceptance: Display specs, upload photo (max 5MB), `FR27`
- **Story 2.1.4:** Maintenance history timeline (5 pts)
  - Acceptance: Add maintenance records, display chronologically, `FR28`

### Epic 2.2: Historical Data Analysis (FR32-38)
- **Story 2.2.1:** Backend time-series query API (24-month retention) (8 pts)
  - Acceptance: Query any metric, custom date range, 15-min/1-hour/daily resolution, <3s response for 30-day period, `NFR4`
- **Story 2.2.2:** Historical charts page (multi-metric line charts) (13 pts)
  - Acceptance: Select metrics, date range, zoom/pan, Chart.js, `FR32-35`
- **Story 2.2.3:** Export historical data to CSV/Excel (5 pts)
  - Acceptance: Download button, include all selected metrics/date range, `FR38`

### Epic 2.3: Alert Management Enhancements (FR15-22)
- **Story 2.3.1:** Alert acknowledgment + notes (5 pts)
  - Acceptance: Operators mark alerts as acknowledged, add notes, `FR15`
- **Story 2.3.2:** Alert timeline view (single alert history) (3 pts)
  - Acceptance: Show detection → acknowledgment → resolution, `FR17`
- **Story 2.3.3:** Alert search with advanced filters (3 pts)
  - Acceptance: Search by keyword, filter by equipment/date/level, `FR16`

**Definition of Done:**
- [ ] Equipment inventory has 10+ registered devices
- [ ] Historical charts load 30-day data in <3 seconds (`NFR4`)
- [ ] CSV export tested with 1,000+ records
- [ ] Alert acknowledgment reduces unacknowledged count
- [ ] Maintenance history tracks 5+ records per equipment

---

## Sprint 3: ISO 50001 Compliance Core
**Duration:** 2 weeks  
**Goal:** Deliver FR39-47 (EnPI/KPI), FR48-54 (Cost Tracking), FR55-62 (Compliance)  
**Velocity Target:** 32 story points

### Epic 3.1: EnPI & KPI Tracking (FR39-47)
- **Story 3.1.1:** Define custom EnPIs (Energy Performance Indicators) (5 pts)
  - Acceptance: Admin creates EnPI with formula, unit, target value, `FR39`
- **Story 3.1.2:** EnPI automated daily calculation (8 pts)
  - Acceptance: Calculate at midnight, store result, trend chart, `FR41-42`
- **Story 3.1.3:** KPI dashboard page (gauges + trend charts) (8 pts)
  - Acceptance: Display 5 key KPIs, 30-day trend, target comparison, `FR40, FR43`
- **Story 3.1.4:** Energy baseline management (immutable) (5 pts)
  - Acceptance: Set baseline once, version if updated, display on KPI page, `FR44-45`, `NFR49`

### Epic 3.2: Cost Tracking & Billing (FR48-54)
- **Story 3.2.1:** Daily/monthly cost calculation (5 pts)
  - Acceptance: Auto-calculate from consumption + tariff, display table, `FR48`
- **Story 3.2.2:** Tariff breakdown view (peak/off-peak hours) (3 pts)
  - Acceptance: Chart showing cost by tariff period, `FR49`
- **Story 3.2.3:** Cost projection model (next 30 days) (5 pts)
  - Acceptance: Linear regression based on last 90 days, confidence interval, `FR50`
- **Story 3.2.4:** Energy savings tracker (vs baseline) (5 pts)
  - Acceptance: Display cumulative savings, % reduction, €/month chart, `FR51-52`

### Epic 3.3: ISO 50001 Compliance Reporting (FR55-62)
- **Story 3.3.1:** Generate ISO 50001 evidence reports (8 pts)
  - Acceptance: PDF export for Clauses 6.3, 6.6, 9.1, 10.2, include charts/tables, `FR55`
  - **Depends on:** EnPI data, corrective actions, audit logs
- **Story 3.3.2:** Scheduled compliance reports (weekly/monthly email) (5 pts)
  - Acceptance: Admins configure schedule, auto-send PDF via email, `FR56`
- **Story 3.3.3:** Corrective action lifecycle workflow (8 pts)
  - Acceptance: Create issue → assign action → verify → close, traceability, `FR57-59`, `NFR50`
- **Story 3.3.4:** Compliance dashboard (audit readiness status) (5 pts)
  - Acceptance: Traffic light indicators for ISO 50001 clauses, missing data alerts, `FR60`

**Definition of Done:**
- [ ] 3+ EnPIs defined and calculating daily
- [ ] Energy baseline set and immutable (`NFR49`)
- [ ] Cost projections tested against actual data (±10% accuracy)
- [ ] ISO 50001 PDF report generated successfully
- [ ] Corrective action workflow tested end-to-end
- [ ] Compliance dashboard shows green for MVP clauses

---

## Sprint 4: User Management & MVP Polish
**Duration:** 2 weeks  
**Goal:** Deliver FR63-73 (User Management), FR74-79 (Personalization), MVP launch readiness  
**Velocity Target:** 26 story points

### Epic 4.1: User Management (FR63-73 continued)
- **Story 4.1.1:** User invitation via email (5 pts)
  - Acceptance: Admin sends invite, user activates via link, `FR64`
- **Story 4.1.2:** User profile editing (name, email, password) (3 pts)
  - Acceptance: Users update own profile, password policy enforced, `FR65`, `NFR12`
- **Story 4.1.3:** Custom alert threshold configuration (5 pts)
  - Acceptance: Users set personal thresholds (overrides defaults), `FR66`
- **Story 4.1.4:** Audit log viewer (Admin/Compliance only) (5 pts)
  - Acceptance: View all user actions, filter by user/date, export CSV, `FR67`, `NFR15`
- **Story 4.1.5:** Session management (view active sessions, logout) (3 pts)
  - Acceptance: Users see active devices, remote logout, `FR68`

### Epic 4.2: Personalization & UI Polish (FR74-79)
- **Story 4.2.1:** Light/dark theme toggle (3 pts)
  - Acceptance: Persist preference, apply globally, `FR74`
- **Story 4.2.2:** Notification preference settings (email/SMS/push) (3 pts)
  - Acceptance: Users enable/disable channels per alert level, `FR75-76`
- **Story 4.2.3:** Dashboard widget customization (drag/drop layout) (8 pts)
  - Acceptance: Reorder gauges, hide/show widgets, save layout, `FR77-78`
- **Story 4.2.4:** Language selector (English default, Arabic Phase 2) (2 pts)
  - Acceptance: English working, Arabic placeholder, `FR79`

### Epic 4.3: MVP Launch Readiness
- **Story 4.3.1:** Performance optimization (bundle size) (5 pts)
  - Acceptance: <300KB initial bundle, <50KB lazy routes, <20KB CSS, `NFR57-59`
- **Story 4.3.2:** Accessibility audit (WCAG 2.1 AA) (5 pts)
  - Acceptance: Keyboard navigation, ARIA labels, color contrast, screen reader tested
- **Story 4.3.3:** Browser compatibility testing (Chrome/Firefox/Safari/Edge) (3 pts)
  - Acceptance: All features work on browsers 90+, `NFR53`
- **Story 4.3.4:** Security hardening (OWASP scan, pen test prep) (5 pts)
  - Acceptance: No critical/high vulnerabilities, `NFR18`
- **Story 4.3.5:** Production deployment + monitoring setup (8 pts)
  - Acceptance: Azure deployment, health checks, uptime monitoring, `NFR32-33`

**Definition of Done:**
- [ ] All 90 FRs in MVP scope completed (FR1-FR79)
- [ ] Performance metrics met: <2.5s load, <5s refresh, <30s alerts (`NFR1-3`)
- [ ] Security requirements met: TLS 1.3, MFA, RBAC, audit logs (`NFR9-16`)
- [ ] 10 seed users with diverse roles for stakeholder demo
- [ ] 24 hours of real-time data collected for demo
- [ ] **MVP LAUNCHED:** January 31, 2026 target hit

---

## Phase 2: Multi-Site & Mobile Optimization

## Sprint 5: Multi-Site Coordination (Phase 2)
**Duration:** 2 weeks  
**Goal:** Deliver FR80-83 (Multi-Site Coordination)  
**Velocity Target:** 24 story points

### Epic 5.1: Multi-Site Infrastructure (FR80-83)
- **Story 5.1.1:** Site registry (add/edit/delete sites) (5 pts)
  - Acceptance: Admin manages multiple sites (Tunis, Sfax), `FR80`
- **Story 5.1.2:** Consolidated metrics view (all sites summary) (8 pts)
  - Acceptance: Dashboard shows total power/consumption across sites, site selector, `FR81`
- **Story 5.1.3:** Site comparison charts (side-by-side metrics) (8 pts)
  - Acceptance: Compare power/cost/EnPIs between sites, identify inefficiencies, `FR82`
- **Story 5.1.4:** Unified alert stream (all sites) (5 pts)
  - Acceptance: Alerts page shows all sites, filter by site, `FR83`

### Epic 5.2: Mobile Optimization
- **Story 5.2.1:** Responsive design for mobile (320px-768px) (8 pts)
  - Acceptance: All pages usable on iOS 14+/Android 10+, touch-optimized, `NFR54`
- **Story 5.2.2:** Mobile-first alert triage (5 pts)
  - Acceptance: Quick acknowledge/dismiss on smartphone, <2 minutes, Innovation Area 5

**Definition of Done:**
- [ ] 2 sites configured (Tunis primary, Sfax secondary)
- [ ] Consolidated dashboard shows accurate totals
- [ ] Mobile tested on iOS 14+ and Android 10+
- [ ] Site comparison identifies 10% variance between sites

---

## Sprint 6: Offline Capability & PWA
**Duration:** 2 weeks  
**Goal:** Deliver PWA features, offline mode  
**Velocity Target:** 22 story points

### Epic 6.1: Progressive Web App (PWA)
- **Story 6.1.1:** Service Worker for offline caching (8 pts)
  - Acceptance: Cache 24-hour data locally, show cached data when offline, `NFR56`
- **Story 6.1.2:** IndexedDB for offline storage (5 pts)
  - Acceptance: Store last 24 hours of metrics, sync when online
- **Story 6.1.3:** PWA manifest + install prompt (3 pts)
  - Acceptance: Users can install as app on mobile/desktop
- **Story 6.1.4:** Push notifications (web push API) (8 pts)
  - Acceptance: Critical/Emergency alerts sent as push notifications

**Definition of Done:**
- [ ] PWA installable on mobile devices
- [ ] Offline mode tested with 24-hour cached data
- [ ] Push notifications working on Chrome/Firefox

---

## Sprint 7: Advanced Analytics & Webhooks
**Duration:** 2 weeks  
**Goal:** Deliver advanced historical analysis, webhook integrations  
**Velocity Target:** 20 story points

### Epic 7.1: Advanced Historical Analysis
- **Story 7.1.1:** Anomaly detection (statistical outliers) (8 pts)
  - Acceptance: Highlight unusual consumption patterns in historical charts
- **Story 7.1.2:** Energy consumption forecasting (30-day ML model) (8 pts)
  - Acceptance: Predict next 30 days with confidence intervals
- **Story 7.1.3:** Comparative period analysis (year-over-year) (5 pts)
  - Acceptance: Compare current month to same month last year

### Epic 7.2: Webhook Integrations (FR Phase 2)
- **Story 7.2.1:** Webhook management UI (add/edit/test) (5 pts)
  - Acceptance: Admin configures webhook URLs, event triggers, `NFR41`
- **Story 7.2.2:** Webhook delivery system (alerts/EnPI updates) (8 pts)
  - Acceptance: POST JSON to external systems, retry on failure

**Definition of Done:**
- [ ] Anomaly detection identifies 3+ historical outliers
- [ ] Forecasting model tested with ±15% accuracy
- [ ] Webhook tested with Slack integration

---

## Sprint 8: Multi-Language & Accessibility
**Duration:** 2 weeks  
**Goal:** Arabic language support, enhanced accessibility  
**Velocity Target:** 18 story points

### Epic 8.1: Internationalization (i18n)
- **Story 8.1.1:** Arabic translation (RTL support) (8 pts)
  - Acceptance: All UI strings translated, RTL layout working, `FR79`
- **Story 8.1.2:** French translation (5 pts)
  - Acceptance: French option available (Tunisian context)

### Epic 8.2: Enhanced Accessibility
- **Story 8.2.1:** Screen reader optimization (5 pts)
  - Acceptance: NVDA/JAWS tested, all interactive elements accessible
- **Story 8.2.2:** Keyboard shortcuts (dashboard navigation) (3 pts)
  - Acceptance: Operators navigate without mouse

**Definition of Done:**
- [ ] Arabic translation 100% complete
- [ ] RTL layout tested on all pages
- [ ] WCAG 2.1 AAA compliance (upgrade from AA)

---

## Phase 3: Predictive Maintenance & Advanced Features

## Sprint 9: Predictive Maintenance
**Duration:** 2 weeks  
**Goal:** Deliver predictive maintenance workflows  
**Velocity Target:** 16 story points

### Epic 9.1: Predictive Maintenance Engine
- **Story 9.1.1:** Equipment health scoring (based on vibration/temperature) (8 pts)
  - Acceptance: Calculate health score 0-100, trend chart
- **Story 9.1.2:** Maintenance predictions (time-to-failure estimates) (8 pts)
  - Acceptance: Predict next maintenance date, confidence interval
- **Story 9.1.3:** Maintenance scheduling integration (5 pts)
  - Acceptance: Create maintenance tasks from predictions

**Definition of Done:**
- [ ] Health scores calculated for 10+ equipment
- [ ] 3+ maintenance predictions validated

---

## Sprint 10: Advanced Reporting & Business Intelligence
**Duration:** 2 weeks  
**Goal:** Deliver executive dashboards, custom reports  
**Velocity Target:** 14 story points

### Epic 10.1: Executive Dashboards
- **Story 10.1.1:** Executive summary page (high-level KPIs) (5 pts)
  - Acceptance: Energy savings, cost trends, ROI, uptime
- **Story 10.1.2:** Custom report builder (drag/drop widgets) (8 pts)
  - Acceptance: Managers create custom reports, save templates
- **Story 10.1.3:** Scheduled PDF reports (weekly executive summary) (5 pts)
  - Acceptance: Auto-send to stakeholders every Monday

**Definition of Done:**
- [ ] Executive dashboard shows 15% energy reduction metric
- [ ] 5+ custom report templates created

---

## Summary & Milestones

### Key Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| Sprint 0 Complete | Jan 15, 2026 | Auth + infrastructure ready |
| Sprint 1 Complete | Jan 22, 2026 | Real-time dashboard + alerts working |
| Sprint 2 Complete | Jan 29, 2026 | Equipment + historical analysis done |
| Sprint 3 Complete | Feb 5, 2026 | ISO 50001 compliance features ready |
| **MVP Launch** | **Jan 31, 2026** | **10 MVP screens live, 12 operators trained** |
| Phase 2 Complete | Mar 15, 2026 | Multi-site + mobile optimized |
| Phase 3 Complete | Apr 30, 2026 | Predictive maintenance live |
| **ISO 50001 Audit** | **Jul 15-17, 2026** | **6 months data collected, certification achieved** |

### Success Metrics by Sprint

| Sprint | User Success | Business Success | Technical Success |
|--------|--------------|------------------|-------------------|
| 4 (MVP) | 5 operators using daily | Baseline data collection started | <5s refresh, 99.5% uptime |
| 5-6 (Phase 2) | 70% per-shift adoption | 3-5% cost reduction | Multi-site working |
| 7-8 (Phase 2) | 80% daily adoption | 8-10% cost reduction | PWA installed on 10+ devices |
| 9-10 (Phase 3) | 85% daily adoption | 15% cost reduction | Predictive maintenance 90% accuracy |

### Total Effort

- **MVP (Sprints 0-4):** ~140 story points (~10 weeks with 4-person team)
- **Phase 2 (Sprints 5-8):** ~84 story points (~6 weeks)
- **Phase 3 (Sprints 9-10):** ~30 story points (~3 weeks)
- **Total:** ~254 story points (~19 weeks)

---

## Next Steps

1. **Sprint 0 Kickoff:** Schedule for week of January 6, 2026
2. **Backlog Refinement:** Break down stories into tasks (4-8 hours each)
3. **UX Design:** Finalize Figma prototypes for Sprints 0-1 screens
4. **DevOps Setup:** Configure Azure staging/production environments
5. **Stakeholder Review:** Present sprint plan to Dr. Leila (Manager) and Karim (Lead Engineer)

---

**Questions or feedback on sprint priorities? Let me know if you'd like to adjust story point estimates, sprint sequencing, or add/remove features!**
