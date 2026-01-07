# BMAD Traceability Matrix - Indusmind Energy Dashboard

**BMAD Phase:** Cross-Phase Traceability  
**Document Type:** Solution Goals → Implementation → Validation Mapping  
**Date:** January 7, 2026  
**Scope:** All 19 Implemented Views + Planned Features

---

## Purpose

This matrix provides **end-to-end traceability** from business goals through implementation to validation requirements. It ensures:

1. Every view maps to **solution goals** (PRD business outcomes)
2. Every view identifies **downstream impacts** (architecture, validation, deployment)
3. Every assumption and risk is captured as **validation item** for BMAD Phase 7

**BMAD Compliance:** This document bridges Solution-Design (Phase 3), UX/Implementation (Phase 4), Architecture (Phase 5), Delivery (Phase 6), and Validation (Phase 7).

---

## Traceability Structure

Each view entry contains:

**A. Solution Goal Linkage**
- Business outcome from PRD
- User success metric
- Technical success metric

**B. Downstream Impacts**
- Architecture dependencies
- Validation requirements
- Deployment considerations

**C. Assumptions & Risks**
- Design assumptions requiring validation
- Technical risks
- Business risks

---

## VIEW 1: DashboardView

### A. Solution Goal Linkage

**Business Outcome (PRD):**
- **Goal:** Enable real-time situational awareness for energy operators
- **Success Metric:** 70% per-shift operator adoption by Month 3, 85% by Month 9
- **KPI:** Operators detect anomalies within 5 minutes of occurrence

**User Success:**
- FR1-8: Real-time energy monitoring with <5s refresh (NFR2)
- Reduce manual meter reading from 30min/shift to 0 (automation)

**Technical Success:**
- <2.5s initial load time (NFR1)
- <5s metric refresh rate (NFR2)
- Support 100+ concurrent dashboard users (NFR20)

### B. Downstream Impacts

**Architecture Dependencies:**
- **WebSocket Server:** `dashboard:site_a` channel for real-time broadcast
  - Schema: `{ power, consumption, voltage, powerFactor, cost_hour, timestamp }`
  - Broadcast frequency: Every 5 seconds (NFR2)
  - Backpressure handling for slow clients
- **Modbus Gateway:** Poll 10+ equipment every 5 seconds (NFR36-37)
  - Protocol: Modbus TCP/RTU
  - Registers: Power (kW), Voltage (V), Frequency (Hz), Power Factor
- **InfluxDB/TimescaleDB:** Store time-series data for chart
  - Retention: 24 months (24-month requirement)
  - Resolution: 15-minute aggregation for charts
- **Historical API:** `/api/historical/consumption` for export
  - Response time: <3s for 24-hour data (NFR4)

**Validation Requirements:**
- **Performance Testing:**
  - Load test: 100+ concurrent WebSocket connections (NFR20)
  - Latency test: Measure end-to-end 5s refresh compliance (NFR2)
  - Initial load: Verify <2.5s with network throttling (NFR1)
- **Functional Testing:**
  - Export CSV: Validate file format, data accuracy, timestamp formatting
  - Phase balance: Verify voltage imbalance detection algorithm
  - Connection indicator: Test WebSocket reconnect logic (network interruption simulation)
- **Accessibility Testing:**
  - Pulsing animation: Verify no WCAG 2.1 AA violations (motion sensitivity)
  - Screen reader: Validate all stat cards, chart labels, button text
  - Keyboard navigation: Test tab order, focus states

**Deployment Considerations:**
- **Azure WebSocket:** Configure sticky sessions for WebSocket affinity
- **CDN:** Cache static assets (Chart.js, Tailwind CSS bundles)
- **Monitoring:** Set up alerts for WebSocket disconnect rates >5%
- **Rollback Plan:** Fallback to polling if WebSocket server fails

### C. Assumptions & Risks

**Design Assumptions:**
1. **15-second client-side polling** is acceptable for mock data; production requires WebSocket push
   - **Validation:** Compare user-perceived latency (polling vs WebSocket)
2. **4 stat cards** are sufficient (plan called for 6); Power Factor and Frequency may be less critical
   - **Validation:** User feedback in Month 1 pilot (do operators miss other metrics?)
3. **French localization** is primary language; English/Arabic deferred
   - **Validation:** Confirm with stakeholders (Dr. Leila, Karim) if French-only MVP is acceptable
4. **Equipment table** shows all equipment (no pagination); assumes <50 equipment per site
   - **Validation:** Test with 100+ equipment; add virtualization if performance degrades
5. **Chart time range tabs** (15m, 1h, 24h, 7j) are visible but non-functional; only 1h data shown
   - **Validation:** Implement tab functionality or remove misleading UI

**Technical Risks:**
- **Risk T1:** Chart re-renders every 15 seconds may cause UI lag with large datasets
  - **Mitigation:** Use Chart.js `update()` method instead of destroying/recreating chart
  - **Validation:** Profile rendering performance with 100+ data points
- **Risk T2:** Export CSV with 24-hour data may timeout if historical API is slow
  - **Mitigation:** Add loading spinner, implement client-side timeout (30s)
  - **Validation:** Test export with 1-month data (worst case)
- **Risk T3:** WebSocket reconnection logic may enter infinite retry loop
  - **Mitigation:** Implement exponential backoff with max retry limit
  - **Validation:** Integration test with WebSocket server restarts

**Business Risks:**
- **Risk B1:** Operators may not trust real-time data if <5s refresh is not achieved
  - **Impact:** Low adoption, failure of 70% Month 3 metric
  - **Validation:** A/B test polling vs WebSocket, measure user trust survey
- **Risk B2:** French-only UI may limit international expansion
  - **Impact:** Cannot deploy to English/Arabic markets without i18n rework
  - **Validation:** Assess i18n effort for Phase 2

---

## VIEW 2: AlertsView

### A. Solution Goal Linkage

**Business Outcome:**
- **Goal:** Reduce energy anomaly response time from 2 hours to <30 seconds (NFR3)
- **Success Metric:** 90% of critical alerts acknowledged within 5 minutes
- **KPI:** Zero unacknowledged emergency alerts at shift end

**User Success:**
- FR9-14: Critical alert detection within <30s
- FR15-22: Alert lifecycle management (acknowledge, notes, search)

**Technical Success:**
- <30s end-to-end latency (anomaly detection → UI notification) (NFR3)
- SMS delivery for Critical/Emergency within 1 minute (FR13)
- Support 1000+ alerts in UI without performance degradation

### B. Downstream Impacts

**Architecture Dependencies:**
- **Alert Detection Engine (Backend):**
  - Evaluate thresholds every 5 seconds
  - Classify into 6 severity levels (Emergency → Informational)
  - Persist to database with immutable audit trail
- **WebSocket Server:** `alerts:new` channel
  - Broadcast new alerts to all connected clients
  - Schema: `{ id, level, equipment_id, message, timestamp }`
- **SMS Gateway Integration:**
  - Twilio or equivalent
  - Send SMS for Critical/Emergency only
  - Retry on failure (3 attempts)
- **Alert Rules Engine:**
  - Configurable thresholds (FR66: custom alert thresholds)
  - Rule priority and conflict resolution

**Validation Requirements:**
- **Performance Testing:**
  - Load test: 1000+ alerts in list, verify pagination performance
  - Latency test: Measure anomaly → UI display time (target <30s)
- **Functional Testing:**
  - Filter combinations: Test all 7 filter types (severity, equipment, status, date, search, pagination)
  - Acknowledge workflow: Single + bulk acknowledge, verify backend persistence
  - WebSocket push: Simulate alert creation, verify real-time list update
- **Security Testing:**
  - SQL injection on search input
  - XSS on alert message display
- **Accessibility Testing:**
  - Color-only severity indicators: Add icons/text labels
  - Screen reader: Test alert list navigation

**Deployment Considerations:**
- **Alert Storm Protection:** Rate-limit alert creation (max 100/min)
- **Database Indexing:** Index on timestamp, severity, equipment_id for fast filters
- **WebSocket Scaling:** Use Redis pub/sub for multi-instance WebSocket servers

### C. Assumptions & Risks

**Design Assumptions:**
1. **Pagination at 10 items/page** is acceptable; may need adjustment for high-alert scenarios
   - **Validation:** Usability testing with operators during alert storm
2. **7 filter types** cover all use cases; no custom saved filter sets
   - **Validation:** Gather operator feedback on filter usage patterns
3. **Alert details modal** is sufficient; no inline expansion or split-pane view
   - **Validation:** A/B test modal vs inline details
4. **Acknowledge action** is immediate without confirmation dialog; risk of accidental clicks
   - **Validation:** Add undo/confirmation for bulk acknowledge

**Technical Risks:**
- **Risk T4:** No virtualization for alert list; may lag with 10,000+ alerts
  - **Mitigation:** Implement virtual scrolling (react-window equivalent for Vue)
  - **Validation:** Load test with 50,000 alerts
- **Risk T5:** Date range filter UI incomplete (picker missing)
  - **Mitigation:** Integrate Vue date picker library
  - **Validation:** Test date range queries with backend API
- **Risk T6:** Audit trail for acknowledge actions not visible in UI
  - **Mitigation:** Add "Acknowledged by" and "Acknowledged at" fields to AlertItem
  - **Validation:** Verify NFR15 compliance (immutable audit logs)

**Business Risks:**
- **Risk B3:** Color-only severity coding may fail accessibility standards
  - **Impact:** WCAG 2.1 AA violation, potential legal risk
  - **Validation:** Add icons/labels, run automated accessibility scan
- **Risk B4:** SMS delivery failures may go unnoticed by users
  - **Impact:** Critical alerts missed, safety risk
  - **Validation:** Add SMS delivery status indicator in UI

---

## VIEW 3: EquipmentView

### A. Solution Goal Linkage

**Business Outcome:**
- **Goal:** Centralize equipment inventory for maintenance and performance tracking
- **Success Metric:** 100% equipment registered within Month 1
- **KPI:** Equipment downtime reduced by 20% via predictive maintenance (Phase 3)

**User Success:**
- FR23-31: Equipment registration, status monitoring, maintenance history

**Technical Success:**
- Real-time equipment status updates (online/offline/maintenance)
- 30-second refresh rate for equipment metrics

### B. Downstream Impacts

**Architecture Dependencies:**
- **Equipment Registry API:**
  - CRUD endpoints: `/api/equipment` (GET, POST, PUT, DELETE)
  - File upload: `/api/equipment/{id}/photo` (FR27)
  - Maintenance logs: `/api/equipment/{id}/maintenance` (FR28)
- **Real-Time Status:**
  - WebSocket or polling for equipment status changes
  - Modbus health checks (connectivity, response time)

**Validation Requirements:**
- **Functional Testing:**
  - CRUD operations: Create, Read, Update, Delete equipment
  - Photo upload: Test max 5MB file size, validate image formats (JPG, PNG)
  - Maintenance history: Add/edit/delete records, verify chronological display
- **Performance Testing:**
  - Grid rendering: Test with 100+ equipment cards
  - Search/filter: Verify <1s response time

**Deployment Considerations:**
- **File Storage:** Azure Blob Storage for equipment photos
- **Database:** Equipment table with foreign keys to maintenance_logs table

### C. Assumptions & Risks

**Design Assumptions:**
1. **Grid layout** (1-4 columns) is sufficient; no list view alternative
   - **Validation:** User testing with large equipment fleets (100+ devices)
2. **30-second refresh** is acceptable; real-time not critical for equipment status
   - **Validation:** Confirm with engineers if critical equipment needs faster updates
3. **No equipment grouping** (by type, location, zone); flat grid only
   - **Validation:** Assess if grouping is needed for multi-site (FR80-83)

**Technical Risks:**
- **Risk T7:** "Add Equipment" form not implemented; blocks FR23-24
  - **Mitigation:** Prioritize form creation in Sprint 2 recovery
  - **Validation:** Test form validation (required fields, duplicate IDs)
- **Risk T8:** Equipment detail page navigation undefined
  - **Mitigation:** Add router navigation on card click
  - **Validation:** Test deep-linking to equipment detail

**Business Risks:**
- **Risk B5:** Equipment registration may be incomplete if form is too complex
  - **Impact:** <100% registration in Month 1
  - **Validation:** Simplify form, add import from CSV option

---

## VIEW 4-16: Analysis & Reporting Views (Placeholder Status)

### Common Solution Goals

**Business Outcomes:**
- FR32-38: Historical data analysis for trend identification
- FR39-47: EnPI/KPI tracking for ISO 50001 compliance
- FR48-54: Cost tracking and projection for 15% savings target
- FR55-62: Compliance reporting for July 2026 audit

### Common Downstream Impacts

**Architecture Dependencies:**
- **Time-Series Database:** InfluxDB/TimescaleDB with 24-month retention
- **Report Generation Engine:** PDF export for ISO 50001 evidence
- **Cost Calculation Service:** Tariff-based billing engine

**Validation Requirements:**
- **Compliance Testing:** Verify ISO 50001 Clause 6.3, 6.6, 9.1, 10.2 evidence
- **Data Accuracy:** Validate EnPI calculations, cost projections
- **Performance:** Test historical queries with 24-month datasets

### Common Assumptions & Risks

**Design Assumptions:**
1. **Placeholder views** indicate future implementation; not MVP-blocking
   - **Validation:** Confirm with stakeholders if defer to Phase 2 is acceptable
2. **Chart.js** is sufficient for all visualization needs; no D3.js required
   - **Validation:** Prototype complex charts (multi-metric overlays, forecasting)

**Technical Risks:**
- **Risk T9:** Placeholder proliferation creates false sense of progress
  - **Mitigation:** Remove placeholder routes from production build
  - **Validation:** Verify routing config excludes placeholders

**Business Risks:**
- **Risk B6:** ISO 50001 audit may fail if FR39-62 not implemented by June 2026
  - **Impact:** Certification delay, potential client loss
  - **Validation:** Create critical path timeline for compliance features

---

## VIEW 17: LoginView

### A. Solution Goal Linkage

**Business Outcome:**
- **Goal:** Secure access control with RBAC for 6 user roles
- **Success Metric:** Zero unauthorized access incidents
- **KPI:** 100% login audit trail compliance (NFR15)

**User Success:**
- FR63: Secure login with OAuth 2.0
- NFR9-16: Security requirements (TLS, MFA, password policy, RBAC)

**Technical Success:**
- <2s login response time
- 1-hour JWT token expiry (NFR14)
- 30-minute inactivity auto-logout (FR63)

### B. Downstream Impacts

**Architecture Dependencies:**
- **OAuth 2.0 Server:**
  - Token endpoint: `/api/auth/login`
  - Refresh endpoint: `/api/auth/refresh`
  - Logout endpoint: `/api/auth/logout`
- **MFA Service:**
  - TOTP (Google Authenticator) or SMS-based
  - Enrollment flow for new users
- **Session Management:**
  - Redis for session storage
  - Token blacklist for revoked JWTs

**Validation Requirements:**
- **Security Testing:**
  - Penetration test: Brute force, credential stuffing, session hijacking
  - OAuth 2.0 compliance: Verify RFC 6749 adherence
  - TLS 1.3 enforcement: Run SSL Labs scan
- **Functional Testing:**
  - MFA enrollment: Test TOTP and SMS flows
  - Password reset: Validate forgot password workflow
  - Auto-logout: Test 30-minute inactivity timeout

**Deployment Considerations:**
- **TLS Certificate:** Let's Encrypt or Azure-managed cert
- **Rate Limiting:** Max 5 login attempts per minute per IP
- **Monitoring:** Alert on failed login spikes (potential attack)

### C. Assumptions & Risks

**Design Assumptions:**
1. **MFA deferrable** to post-MVP; not blocking for Jan 31 launch
   - **Validation:** Assess security risk vs MVP timeline pressure
2. **Remember Me** stores JWT in localStorage (security trade-off)
   - **Validation:** Evaluate httpOnly cookie alternative
3. **No SSO integration** (SAML, LDAP); only local accounts
   - **Validation:** Confirm with enterprise clients if SSO is required

**Technical Risks:**
- **Risk T10:** MFA not implemented; NFR11 requirement violated
  - **Mitigation:** Fast-track MFA in Sprint 4 or immediate post-MVP
  - **Validation:** Security audit to quantify risk
- **Risk T11:** Account lockout missing; vulnerable to brute force
  - **Mitigation:** Add lockout after 5 failed attempts
  - **Validation:** Penetration test login endpoint

**Business Risks:**
- **Risk B7:** No self-service password reset; increases support burden
  - **Impact:** User frustration, admin workload
  - **Validation:** Add forgot password flow in Sprint 4

---

## VIEW 18: NotFoundView

### Solution Goal: Graceful error handling (no specific business outcome)

### Downstream Impacts: None (standalone view)

### Assumptions & Risks: None (low complexity)

---

## VIEW 19: UsersView

### A. Solution Goal Linkage

**Business Outcome:**
- **Goal:** Enable Admin to manage user access and roles (FR64-73)
- **Success Metric:** 100% user invitations accepted within 24 hours
- **KPI:** Zero unauthorized role escalations

**User Success:**
- FR64-73: User invitation, profile editing, role assignment, audit logs

**Technical Success:**
- User CRUD operations with RBAC enforcement
- Immutable audit log (NFR15)

### B. Downstream Impacts

**Architecture Dependencies:**
- **User Management API:**
  - `/api/users` (GET, POST, PUT, DELETE)
  - `/api/users/invite` (email invitation)
  - `/api/users/{id}/sessions` (active session viewer)
- **Email Service:**
  - SendGrid or Azure Email for invitations
  - Activation link with 24-hour expiry

**Validation Requirements:**
- **Security Testing:**
  - RBAC bypass attempts (privilege escalation)
  - Audit log immutability (verify no deletions/edits)
- **Functional Testing:**
  - Email invitation: Test delivery, activation link
  - Role change: Verify impact on active sessions

**Deployment Considerations:**
- **Audit Log Storage:** Separate table with append-only constraint
- **Email Deliverability:** Configure SPF/DKIM records

### C. Assumptions & Risks

**Design Assumptions:**
1. **Admin-only access** to UsersView; no self-service user directory
   - **Validation:** Confirm with stakeholders if operators need user search
2. **No bulk user import** (CSV upload); manual one-by-one invitation only
   - **Validation:** Assess if bulk import needed for large deployments

**Technical Risks:**
- **Risk T12:** Role change may not invalidate active sessions immediately
  - **Mitigation:** Force re-authentication on role change
  - **Validation:** Test session revocation logic

**Business Risks:**
- **Risk B8:** Email invitations may be flagged as spam
  - **Impact:** Low user onboarding rate
  - **Validation:** Test email deliverability, add SPF/DKIM

---

## Cross-View Traceability

### Solution Goals → View Mapping

| Business Goal | Primary Views | Supporting Views | Success Metric |
|---------------|---------------|------------------|----------------|
| Real-time monitoring | DashboardView | EquipmentView, AlertsView | 70% operator adoption M3 |
| Anomaly detection | AlertsView | DashboardView (events widget) | <30s alert latency |
| Equipment management | EquipmentView | - | 100% registration M1 |
| Historical analysis | HistoryView | ConsumptionView, AnalysisView | <3s query time |
| ISO 50001 compliance | ReportsView | KPI views, BaseLoadView | Audit pass July 2026 |
| Cost reduction | CostAnalysisView | ConsumptionView | 15% savings M18 |
| User access control | LoginView, UsersView | SettingsView | 0 unauthorized incidents |

### Downstream Impact Summary

**Architecture Phase (5) Handoff:**
- WebSocket server requirements: 2 channels (`dashboard:site_a`, `alerts:new`)
- API endpoint requirements: 12 endpoints documented in API-ENDPOINTS-SPECIFICATION.md
- Database schema requirements: 8 tables (users, equipment, alerts, readings, etc.)
- Integration requirements: Modbus, SMS, Email, File Storage

**Validation Phase (7) Inputs:**
- Performance test scenarios: 8 scenarios (WebSocket load, query latency, etc.)
- Security test scenarios: 6 scenarios (penetration test, OWASP scan, etc.)
- Functional test scenarios: 15 scenarios (CRUD, filters, exports, etc.)
- Accessibility test scenarios: 4 scenarios (WCAG scan, screen reader, keyboard nav)

**Deployment Phase (6) Considerations:**
- Infrastructure: Azure App Service, WebSocket support, Redis, Blob Storage
- Monitoring: Application Insights, WebSocket disconnect alerts, error rate tracking
- Rollback plan: Blue-green deployment, feature flags for WebSocket fallback

---

## Assumptions Registry

**Total Assumptions:** 20+

**High-Risk Assumptions (Validation Required):**
1. **A1:** 15-second polling acceptable for mock; production requires WebSocket
2. **A2:** 4 stat cards sufficient (vs 6 planned)
3. **A3:** French-only UI acceptable for MVP
4. **A4:** <50 equipment per site (no virtualization needed)
5. **A5:** 10 alerts/page pagination sufficient
6. **A6:** No saved filter sets needed (AlertsView)
7. **A7:** Grid layout sufficient for equipment (no list view)
8. **A8:** 30s equipment refresh acceptable
9. **A9:** MFA deferrable to post-MVP
10. **A10:** localStorage JWT acceptable (vs httpOnly cookie)

**Medium-Risk Assumptions:**
11. **A11:** Chart.js sufficient for all charts (no D3.js)
12. **A12:** No equipment grouping needed
13. **A13:** Modal sufficient for alert details (vs inline)
14. **A14:** No bulk user import needed
15. **A15:** No SSO integration required

---

## Risk Registry

**Total Risks:** 25+

**Critical Risks (🚨 BMAD Escalation Required):**
- **R1:** MVP deadline (Jan 31) at risk - only 24% FR complete
- **R2:** ISO 50001 audit (July 2026) at risk - FR39-62 not started
- **R3:** Backend integration 0% - all Epic stories blocked

**High Risks (⚠️ Mitigation Required):**
- **R4:** Chart re-render performance (T1)
- **R5:** Alert list virtualization missing (T4)
- **R6:** MFA not implemented (T10)
- **R7:** Audit trail not visible (T6)
- **R8:** Color-only severity coding (B3)

**Medium Risks (⚠️ Monitor):**
- **R9:** Export CSV timeout (T2)
- **R10:** WebSocket infinite retry (T3)
- **R11:** Equipment form missing (T7)
- **R12:** Date range picker incomplete (T5)
- **R13:** User trust in real-time data (B1)

---

## Validation Item Catalog

**For BMAD Phase 7 (Validation):**

### Performance Tests
1. WebSocket load test (100+ concurrent connections)
2. Dashboard initial load (<2.5s)
3. Real-time refresh latency (<5s end-to-end)
4. Historical query performance (<3s for 30-day data)
5. Alert list with 10,000+ items
6. Chart rendering with 100+ data points

### Security Tests
7. Penetration test (login, WebSocket, APIs)
8. OWASP Top 10 scan
9. TLS 1.3 enforcement verification
10. RBAC bypass attempts
11. Audit log immutability verification
12. SQL injection on search inputs

### Functional Tests
13. Export CSV accuracy (timestamp, data format)
14. Alert filter combinations (all 7 types)
15. Equipment CRUD operations
16. User invitation email delivery
17. WebSocket reconnection logic
18. Phase balance calculation accuracy

### Accessibility Tests
19. WCAG 2.1 AA automated scan
20. Screen reader navigation (NVDA, JAWS)
21. Keyboard-only navigation
22. Color contrast verification
23. Motion sensitivity (pulsing indicators)

---

## Document Control

**Version:** 1.0  
**Date:** January 7, 2026  
**BMAD Phase:** Cross-Phase Traceability (Phases 3-7)  
**Next Update:** After Sprint 2 recovery

**Traceability Completeness:**
- Solution Goals: ✅ Mapped for all 19 views
- Downstream Impacts: ✅ Identified for all views
- Assumptions: ✅ 20+ catalogued
- Risks: ✅ 25+ catalogued
- Validation Items: ✅ 23+ test scenarios defined

---

**END OF BMAD TRACEABILITY MATRIX**
