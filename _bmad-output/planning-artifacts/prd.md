---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments: 
  - discovery-interview-q1-14
  - stitch-design-screens-16
  - competitor-analysis-screenshots-43
  - config-yaml
workflowType: 'prd'
lastStep: 11
projectName: "Indusmind Energy Dashboard Platform"
userName: "Hachiche"
communicationLanguage: "English"
documentOutputLanguage: "English"
discoveryDate: "2026-01-06"
---

# Product Requirements Document - Indusmind Energy Dashboard Platform

**Author:** Hachiche  
**Date:** January 6, 2026  
**Status:** In Progress (Step 1 of 11)

---

## 📋 Document Overview

This PRD synthesizes comprehensive discovery interview findings, design system analysis, and competitor research to define requirements for an industrial real-time energy monitoring dashboard.

**Input Sources:**
- 14-question discovery interview (WHO, WHY, WHAT, WHEN, WHERE, HOW)
- 16 Stitch design screens with HTML/CSS implementations
- 43 competitor screenshots (energy monitoring UIs)
- Technical context (Vue 3, TypeScript, Tailwind CSS, WebSocket, time-series DB)
- Business drivers (45K€ incident Nov 2024, 15% cost reduction, ISO 50001 compliance by July 2026)

---

## Executive Summary

### Vision

**Indusmind Energy Dashboard Platform** is a real-time industrial energy monitoring system that transforms fragmented Excel-based tracking into a unified, intelligent dashboard. It empowers operators with immediate anomaly detection, engineers with data-driven optimization, and managers with continuous energy cost reduction tracking aligned with ISO 50001 compliance requirements.

**Core Vision:** Real-time visibility + instant alerts + continuous improvement → 15% energy cost reduction + zero critical incidents

### The Problem We're Solving

**Current State (Broken):**
- Energy data scattered across 5 Excel files, manually compiled every 15 minutes
- Operators discover anomalies 1-3 hours late (or next morning)
- November 2024 incident: Undetected surconsumption for 3 hours → 45,000€ loss + 6-hour production halt
- No automated alerting → constant vigilance required without guaranteed catch
- Excel crashes with large datasets (>100K rows) → data loss risk
- Analysis of historical anomalies = 2-3 hours manual work

**Impact:** 
- Energy waste continues unchecked (13-19% preventable loss identified)
- Incident response time: Hours instead of minutes
- ISO 50001 compliance impossible without automated monitoring system
- Operator fatigue from constant manual surveillance

### The Solution

**Indusmind Dashboard** provides:

1. **Real-time Monitoring (<5s refresh)**
   - Live kW, kWh, Power Factor, cost/hour, voltage per phase
   - Color-coded gauges and alerts (Green → Orange → Red hierarchy)
   - Operator understands site status in under 3 seconds, even under stress

2. **Intelligent Alerting (6-level hierarchy)**
   - Critical alerts (>90% capacity) → immediate visual + SMS + escalation
   - Medium alerts (anomalies, PF drops) → email to engineer
   - Low alerts (nocturnal gaspillage) → next-day review
   - All alerts logged for ISO 50001 audit trail

3. **Operational Analytics**
   - 24-hour detailed history (operators assess shift-level trends)
   - 30-day engineering view (identify equipment drift)
   - 24-month compliance view (year-over-year comparisons, audits)
   - Instant export (CSV/PDF) for reporting and analysis

4. **Decision Support, Not Control**
   - Acknowledge alerts with annotations (cause, action taken)
   - Configure alert thresholds (engineers only, within safety bounds)
   - Generate KPI reports (PDF) for management reviews
   - No direct SCADA control (safety/compliance reasons)

### Business Impact

**Quantified Outcomes (12-month horizon):**

| Metric | Baseline | Target | Method |
|--------|----------|--------|--------|
| **Energy Costs** | 850,000€/year | 722,500€/year | Gaspillage detection + peak optimization |
| **Incident Detection** | 1-3 hours | <30 seconds | Real-time alerts + operator action |
| **Critical Incidents Prevented** | 1/year (45K€ each) | 0-1/year | Immediate surconsumption detection |
| **Analysis Time (per incident)** | 2-3 hours | 15 minutes | Instant historical drill-down |
| **Operator Training Time** | — | 2 hours | Simple, color-intuitive UI |
| **System Uptime** | — | 99.5% | Cloud infrastructure + failover |

**ROI Timeline:**
- Project cost: ~75,000€
- Year 1 savings: 127,500€ (energy) + 45,000€ (incident prevention) = 172,500€
- **Payback period: 5-6 months**
- Year 2-3: ~116,500€/year recurring benefit

**Compliance:**
- ISO 50001 certification → July 2026 (deadline)
- Energy Performance Indicator tracking → automated
- Corrective action logging → dashboard-driven
- Audit evidence → 24-month data retention

### What Makes This Special

Unlike commodity energy dashboards (Schneider Electric, Siemens), Indusmind is **purpose-built for small-to-medium industrial plants** with these differentiators:

1. **Hyper-Real-Time Focus** (not "every minute" like competitors)
   - <5s refresh on critical metrics
   - Designed for 24/7 shift operations, not periodic reviews
   - Operators can react in seconds, not hours

2. **Simplicity First for Non-Technical Users**
   - Operators are age 35-50, BTS-trained, comfortable with Excel and SCADA
   - Not data scientists
   - Large fonts, clear buttons, color-coded status (green/orange/red)
   - Zero cognitive load on "what do I do?"

3. **Multi-Site Coordination**
   - 2 sites (Tunis/Sfax) with shared KPI tracking
   - Cross-site comparison + unified alerting
   - Engineers can triage site-to-site patterns instantly

4. **Mobile-First for Field Engineers**
   - Smartphone access for on-site investigation (Modbus line status check)
   - Push notifications for alerts during astreinte
   - Offline PWA capability (phase 2)

5. **Compliance-Native (not bolted-on)**
   - Every action logged (who, when, why, outcome)
   - 24-month data retention by design
   - EnPI calculations automated
   - Audit reports (PDF) in 2 clicks

### Project Classification

**Technical Type:** Web Dashboard (Vue 3 + Time-Series Backend)  
**Domain:** Industrial Energy Management (B2B, mission-critical)  
**Complexity Level:** High (real-time constraints, multi-user, compliance)  
**Project Context:** Greenfield PRD (new system, not modifying existing SCADA)

**Classification Signals Detected:**
- Real-time data streaming (WebSocket) → low-latency requirement
- Multiple user roles (4 personas, RBAC) → complex state management
- Compliance-driven (ISO 50001) → audit logging + data retention
- Mission-critical (energy incidents = $$$ loss) → high availability required
- Industrial environment (shift work, plant floor) → robust mobile + offline

**Complexity Implications:**
- Time-series database (InfluxDB/TimescaleDB) essential
- Real-time pub/sub architecture (WebSocket)
- Complex alerting engine (6-level hierarchy, escalation rules)
- Role-based permissions (4 distinct user types)
- Mobile responsive + PWA considerations
- Compliance logging (every action traced)

---

## 👥 User Personas

### Operator Personas (Primary Users)

#### Persona 1: Ahmed - Senior Shift Operator

- **Age:** 48 years
- **Experience:** 18 years in industrial operations
- **Context:** Works 8-hour shifts at Tunis facility, responsible for 4 production lines, supervises 2 junior operators
- **Objectives:** 
  - Prevent unexpected shutdowns (costs 7,500€/hour)
  - Maintain stable power consumption within daily budget
  - Communicate clearly with engineer on-call if issues arise
  - Finish shift with zero surprises
- **Pain Points:**
  - Excel files crash when opening too many sheets simultaneously
  - Discovers equipment problems by looking at production metrics, not energy
  - Relies on memory ("the A-line usually uses 400kW, if it's higher something's wrong")
  - Currently needs to manually check 5 different files to get full site picture
- **Tech Comfort:** Comfortable with SCADA, Excel basics, smartphone; prefers simple, visually clear interfaces; doesn't want to learn complex analytics tools
- **Quote:** "If I could see in 5 seconds that something's wrong, instead of waiting 30 minutes or finding out next morning, we'd save thousands."
- **Success Criteria:** Detects anomalies within one shift before they escalate; alerts are trustworthy enough that he acts immediately

#### Persona 2: Fatima - Junior Operator (Entry Level)

- **Age:** 28 years
- **Experience:** 2 years in operations, 1.5 years at this plant
- **Context:** Works night shifts (22h-6h), handles alerts and logs; relies heavily on senior operators' guidance
- **Objectives:**
  - Be confident in identifying real problems vs false alarms
  - Feel supported by clear, obvious signals on screen
  - Hand off shift summaries to day team
  - Build confidence for promotion to shift lead
- **Pain Points:**
  - Excel interface is intimidating; too many columns and sheets
  - Worries about missing something important during quiet night hours
  - Lacks context to judge "is this normal or an emergency?"
- **Tech Comfort:** Smartphone-native, learns quickly if UI is intuitive, prefers color-coded guidance
- **Quote:** "I need the dashboard to tell me in no uncertain terms: 'this is OK' or 'call Ahmed.'"
- **Success Criteria:** Can confidently triage alerts and knows when to escalate without second-guessing

---

### Engineer Persona

#### Persona 3: Karim - Energy & Equipment Engineer

- **Age:** 42 years
- **Experience:** 14 years; 3 years as senior engineer responsible for Tunis + Sfax optimization
- **Context:** Analyzes consumption patterns, investigates anomalies, recommends equipment upgrades, manages preventive maintenance
- **Objectives:**
  - Root-cause analysis (what caused the consumption spike at 14h yesterday?)
  - Correlate energy patterns with production schedules and equipment maintenance
  - Identify under-performing equipment for replacement/tuning
  - Track energy efficiency improvements month-over-month
- **Pain Points:**
  - Currently spends 2-3 hours per incident recompiling Excel data to see trends
  - Can't correlate energy spikes with maintenance events or production planning
  - Difficult to track whether efficiency improvements are sticking or if consumption drifts back
  - No easy way to compare Site A vs Site B consumption patterns
- **Tech Comfort:** Advanced Excel user, familiar with technical dashboards, wants data access more than pretty visuals
- **Quote:** "If I could drill down from 'site consumed 10% more this week' to 'line 3 consumption drifted +12% starting day 5, correlated with maintenance window' in 5 minutes instead of 3 hours, I could actually do predictive maintenance instead of reactive."
- **Success Criteria:** Performs root-cause analysis in 15 minutes (vs 2-3 hours); identifies equipment drift before it becomes critical

---

### Manager Persona

#### Persona 4: Dr. Leila - Plant Manager

- **Age:** 55 years
- **Experience:** 25 years; 4 years as plant manager
- **Context:** Owns P&L for Tunis facility; reports to VP Operations; responsible for ISO 50001 compliance and energy KPI targets
- **Objectives:**
  - Track progress toward 15% energy cost reduction (127,500€/year impact)
  - Validate ROI of energy efficiency investments
  - Ensure ISO 50001 audit readiness and certification
  - Make data-driven capex decisions (equipment replacement priorities)
  - Monthly board reporting on energy cost vs budget
- **Pain Points:**
  - Currently receives manual reports from engineers; hard to get real-time view
  - Difficult to isolate impact of specific investments (did the new compressor actually save energy?)
  - Risk of audit failure due to incomplete historical data
  - Can't easily show investors/board evidence of continuous improvement
- **Tech Comfort:** Comfortable with dashboards and reports, prefers mobile summary view (on-the-go decision-making)
- **Quote:** "I need to see in 2 minutes on my phone: Are we on track to hit 15% by month 18? What's the biggest opportunity? What risks are we missing?"
- **Success Criteria:** Makes data-driven energy decisions monthly; ISO 50001 audit preparedness achieved by Month 9

---

## Success Criteria

### User Success

**Operator Success (Primary - Shift Operations)**

*Monthly Adoption Metrics:*
- **MVP Target (Month 2-3):** ≥70% of operators actively using dashboard at least once per shift
  - Definition: Operator logs in, views at least one KPI/alert, takes action (acknowledge, annotate, escalate)
  - Reason: Industrial shift work is dynamic; not all operators interact with energy every day
  - Success Condition: Dashboard becomes routine decision tool, not compliance obligation

- **Maturity Target (Month 9-12):** ≥85% daily active usage
  - Definition: Operator checks dashboard once at shift start, once mid-shift
  - Success Condition: Anomaly detection is now operator's primary method of identifying issues

*Behavioral Success:*
- **Alert Response Time:** Operators act on critical alerts within 2 minutes (from notification to action: acknowledge, investigate, escalate)
- **Confidence in Alerts:** Zero false-positive fatigue; operators trust alert system enough to act immediately
- **Shift Handoff Quality:** Night shift can concisely brief day shift on anomalies using dashboard data (no manual Excel compilation)

---

**Engineer Success (Analysis & Root-Cause)**

- **Analysis Speed:** Reduce incident root-cause analysis from 2-3 hours → 15 minutes
  - Definition: From "consumption spike detected" to "root cause identified and corrective action recommended"
  - Enabled by: Instant historical drill-down, event correlation, equipment performance trends

- **Predictive Capability:** Identify equipment drift before failure
  - Example: Detect that compressor consumption drifted +12% over 30 days, recommend maintenance before breakdown
  - Success: Shift from reactive to 1-week-ahead predictive actions

- **Cross-Site Pattern Recognition:** Identify inefficiencies at one site and transfer lessons to second site within 5 days
  - Example: Discover night cooling optimization at Sfax, apply same parameters to Tunis
  - Success: Unified engineering practices across 2 sites

---

**Manager Success (Strategic & Compliance)**

- **Daily Decision Speed:** Review energy KPIs and make operational decisions in <2 minutes (mobile)
  - Definition: "Are we on track?" "What's the top issue today?" "Do we need to escalate?"

- **Monthly ROI Tracking:** Validate energy savings progress toward 15% target
  - Track: Actual savings vs projected savings, identify where initiatives are working vs stalling
  - Success: Accurate month-to-month trending that drives investment decisions

- **Audit Readiness:** Demonstrate ISO 50001 compliance through dashboard data and action logs
  - Example: Auditor asks "Show me corrective actions from last 12 months" → PDF report in 2 clicks

---

### Business Success

**Energy Cost Reduction (Primary KPI)**

| Timeline | Savings Target | Mechanism | Status |
|----------|---|---|---|
| **Month 6** | 3-5% (25,500€ - 42,500€) | Visibility-driven behavioral change + quick wins | Early signal |
| **Month 12** | 8-10% (68,000€ - 85,000€) | Equipment optimization + baseline tuning | Intermediate validation |
| **Month 18** | 15% (127,500€ - proven) | Sustained improvements + capex investments | Full-year impact |

**Rationale:** Industrial energy savings depend on maintenance windows, equipment cycles, and capex approval timelines. Claiming 15% by Month 12 weakens credibility with stakeholders. This phased approach preserves early value signal while maintaining audit-proof realism.

---

**Cost Avoidance (Beyond Energy Savings)**

| Cost Driver | Metric | Target | Example |
|---|---|---|---|
| **Unplanned Incident Prevention** | €/incident avoided | ≥1 critical incident prevented Year 1 (45K€) | Surconsumption caught in <1 minute vs 3-hour delay |
| **Demand Peak Shaving** | kW peak reduction | -5% peak (from 1600kW → 1520kW) | Avoid high-tier tariff penalties (€2-3K/month) |
| **Energy Overrun Penalties** | PF/tariff compliance | Eliminate PF penalties | Currently 15% surcharge; dashboard keeps PF >0.92 consistently |
| **Unplanned Maintenance** | Downtime hours avoided | -20% emergency calls Year 1 | Predictive maintenance identifies drift before failure |

**Total Business Impact:** Energy savings (127.5K) + cost avoidance (70K+) = 197K+ annual benefit by Month 18

---

**Adoption & Engagement**

- **Operator Adoption:** 70% per-shift usage by Month 3 (MVP), 85% daily by Month 9 (proof)
- **Engineer Engagement:** 100% of engineers using for weekly analysis (required, not optional)
- **Manager Visibility:** Monthly KPI review meeting uses dashboard as primary source (governance integration)

---

**Compliance & Risk Mitigation**

- **ISO 50001 Audit Readiness:** Month 9 (3 months before certification deadline)
  - Energy baseline established and versioned
  - EnPIs calculated and tracked continuously
  - Corrective actions logged and linked to outcomes
  - 24-month data retention verified
  
- **Certification Achieved:** July 2026 (regulatory requirement met)

---

### Technical Success

| Metric | Target | Why It Matters |
|--------|--------|---|
| **Real-time Refresh** | <5 seconds on critical metrics (kW, alerts) | Operator can detect issues within shift |
| **Alert Detection Latency** | <30 seconds from event trigger to notification | Prevents cascading failures |
| **WebSocket Stability** | 99%+ connection uptime, <200ms latency | Multi-site real-time sync |
| **Data Retention** | 24 months, searchable, exportable | ISO 50001 compliance + trend analysis |
| **Concurrent Users** | 100+ simultaneous sessions | 2 sites × multiple shifts × engineers × managers |
| **Mobile Responsiveness** | iPhone/Android + tablet, responsive design | Field engineer use (on-site assessment) |
| **System Uptime** | 99.5% availability (SLA) | <4 hours unplanned downtime per year |
| **Data Accuracy** | <1% reporting error (vs Excel ~5-8%) | Credible KPIs for decisions |
| **Query Performance** | 30-day historical chart loads in <2s | Engineers don't abandon analysis |

---

## Product Scope & Roadmap

### MVP - Minimum Viable Product (Weeks 1-4)

**Goal:** Enable operators to detect anomalies in real-time; provide baseline compliance evidence for ISO 50001.

**Features:**

**Dashboard & Navigation (Core)**
- Real-time KPI display: kW (gauge), kWh (today's total), PF (status), cost/hour (€)
- Voltage per phase (L1, L2, L3) with phase balance indicator
- Alert panel (critical/high/medium) with acknowledge & annotate actions
- Sidebar navigation: Dashboard, History, Alerts, Reports, Admin (if authorized)
- Responsive mobile view for smartphone/tablet

**Real-time Data & Alerts (Critical)**
- WebSocket connection to time-series backend (InfluxDB/TimescaleDB)
- 6-level alert hierarchy: Critical (SMS+visual), High (email), Medium (email), Low (dashboard), Info (dashboard), System
- Alert triggers: Capacity >90%, PF <0.85, Voltage anomaly, Consumption spike >20%, Nocturnal gaspillage, Sensor offline
- Alert routing: Operators (critical), Engineers (all), Managers (high+medium)
- All alerts logged with who/when/outcome (ISO compliance)

**Historical Data (24-hour window)**
- Last 24h consumption chart (line graph, drill-down by hour)
- Shift-level comparison (today vs yesterday, this week vs last week)
- Export functionality: CSV for Excel analysis

**User & Role Management (Admin)**
- 4 roles: Operator, Engineer, Manager, Admin
- Role-based dashboard variants (simplified for operators, detailed for engineers)
- User CRUD, password reset, audit log access

**System Requirements:**
- Deploy on Azure (cloud infrastructure as per tech stack)
- Database: Time-series DB (InfluxDB or TimescaleDB) for 24+ month retention
- Frontend: Vue 3 + TypeScript + Tailwind CSS + Chart.js
- Backend: REST API + WebSocket (Node.js or Python)
- SSL/HTTPS enforced, JWT authentication

**NOT in MVP (Defer to Phase 2):**
- Heatmaps, advanced analytics, EnPI calculations
- PWA offline mode, push notifications
- Multi-site side-by-side comparison (single-site focus)
- Machine learning / predictive algorithms

---

### Growth Features (Weeks 5-8, Phase 2)

**Goal:** Add decision-support and compliance features; enable multi-site oversight.

**Features:**

**Advanced Historical Analysis**
- 30-day detailed view (day-by-day, hour-by-hour drill-down)
- Equipment-level consumption (if SCADA data available)
- Correlation analysis: Production schedule vs consumption
- Energy Performance Indicator (EnPI) auto-calculation and tracking

**Multi-Site Coordination**
- Dashboard toggle: Site A ↔ Site B or unified view
- KPI comparison: Site A 15% below target, Site B 2% above
- Best-practice transfer (engineer can document optimization from one site, recommend to another)

**Reporting & Compliance**
- PDF report generation: Monthly KPI summary, ISO 50001 evidence
- Audit readiness checklist: All data retention verified, corrective actions linked
- Graphical trend reports (trend = confidence in improvements)

**Mobile & Offline**
- PWA installation (home screen icon)
- Push notifications for critical alerts
- Offline cache of last 7 days (read-only, no connectivity)

**Engineer Tools**
- Anomaly annotations (root cause library)
- Maintenance correlation (link alerts to maintenance events)
- Equipment performance dashboard (kW, efficiency ratio over time)

---

### Vision / Future (Phase 3+, Post-MVP)

**Goal:** Autonomous optimization and predictive operations.

**Features:**

**Advanced Analytics**
- Heatmaps: hour-of-day × day-of-week consumption patterns
- Anomaly detection (statistical, ML-assisted)
- Forecasting: Expected consumption vs actual (early warning for process changes)

**Automation & Control Integration**
- Suggested actions (e.g., "Reduce night cooling by 2°C → est. 8€/night savings")
- Integration with SCADA for read-only monitoring of specific equipment
- Automatic demand-response (shift non-critical loads when peak rates detected)

**Sustainability & ESG**
- CO₂ emissions tracking and reporting
- Scope 2 emissions calculation
- ESG report generation for investor/stakeholder communication

**Mobile Native Apps**
- iOS/Android apps (if PWA adoption insufficient)
- Offline-first architecture with local caching

---

## Product Scope Summary

| Feature | MVP | Phase 2 | Phase 3 | Notes |
|---------|-----|---------|---------|-------|
| Real-time dashboard | ✅ | — | — | Core MVP |
| 6-level alerts | ✅ | — | — | Critical for incident prevention |
| 24-hour history | ✅ | — | — | MVP compliance baseline |
| 30-day engineering history | — | ✅ | — | Phase 2 |
| 24-month compliance history | ✅ | — | — | ISO required |
| Mobile responsive | ✅ | — | — | Basic responsive, enhanced Phase 2 |
| PWA + offline | — | ✅ | — | Phase 2 enhancement |
| Multi-site comparison | — | ✅ | — | Post-MVP optimization |
| Heatmaps & ML anomaly detection | — | — | ✅ | Vision feature |
| ESG reporting | — | — | ✅ | Future sustainability |
| SCADA control integration | — | — | ✅ | Risk-managed future |

---

## MVP Success Definition

**MVP is considered successful when:**

1. ✅ **Operators** are using dashboard for anomaly detection (≥70% per-shift adoption by Month 3)
2. ✅ **Engineers** can perform root-cause analysis in 15 minutes (vs 2-3 hours with Excel)
3. ✅ **Managers** have monthly KPI visibility and can validate savings progress
4. ✅ **Compliance** evidence: 24-month data retained, all alerts logged, audit-ready by Month 9
5. ✅ **Cost avoidance:** At least 1 critical incident prevented or significant peak-demand spike caught early
6. ✅ **Technical:** System uptime ≥99%, alert latency <30s, mobile access working

**If all 6 criteria met → Move to Phase 2 (Growth features)**

---

## 👥 User Personas Continued

*(To be completed in Step 4 - Requirements Mapping)*

---

## ⚙️ Functional Requirements

*(To be completed in Step 5 - Feature Definition)*

---

## 🔧 Technical Requirements

*(To be completed in Step 6 - Architecture Alignment)*

---

## 📊 Success Metrics

*(To be completed in Step 7 - Measurement Framework)*

---

## User Journeys

### Journey 1: Ahmed's Day Shift - Detecting Anomaly Before It Cascades

**Persona:** Ahmed - Senior Shift Operator, 48 years old, 18 years experience

**The Opening Scene (07:00 AM):**
Ahmed arrives for his shift and opens the Indusmind dashboard. Live gauge shows **1,120 kW (70% capacity) — GREEN**. No alerts. He makes coffee and feels confident.

**The Rising Action (10:30 AM):**
Production ramps up. Ahmed expects ~1,300 kW. Instead, dashboard shows **1,380 kW (86%) — ORANGE**. Alert badge appears: *"⚠️ Consumption 8% above baseline for this time/production level."*

Instead of ignoring it, Ahmed clicks into **Detailed History**:
- Last 4 hours show steady drift (not a spike)
- 09:00: 1,200 kW
- 09:30: 1,280 kW  
- 10:00: 1,330 kW
- 10:30: 1,380 kW

**His insight:** "This is a drift, not a spike. If it continues, we hit emergency threshold in 2-3 hours."

**The Climax (10:45 AM):**
Ahmed calls engineer Karim. They check: Production schedule is normal, no maintenance windows, but... external weather dashboard shows ambient temp spiked from 22°C to 28°C at 08:50. The cooling system is overworking.

Karim confirms: "This is temporary. Consumption should normalize by 14:00 as it cools down."

Ahmed **acknowledges the alert** with a note: *"Confirmed: High ambient temp driving cooling load. Temporary drift expected until 14:00."*

**The Resolution:**
- 11:00 AM: 1,390 kW (plateauing)
- 12:30 PM: 1,350 kW (decreasing)
- 15:00 PM: 1,200 kW (normalized)
- Alert auto-resolves. Day team is briefed. Crisis averted.

**Requirements Revealed:**
- Real-time live gauges with color coding
- Mini sparklines (1-hour trends)
- Medium/low severity alerts (not just critical)
- Detailed history with hour-by-hour drill-down
- Alert acknowledge + annotate capability
- Integration with external data (weather, production schedule)

---

### Journey 2: Fatima's Night Alert - Building Confidence in Critical Decision

**Persona:** Fatima - Junior Operator, 28 years old, night shift, 2 years experience

**The Alert (02:16 AM):**
Dashboard **screams red** with unmissable visual + sound alerts:
- **Screen filled with RED**
- **3 sharp beeps**
- Live gauge: **1,520 kW (95% capacity) — EMERGENCY**
- Alert banner: *"🚨 CRITICAL: Consumption 1,520 kW. Risk of disjoncteur. Immediate action required."*

**Fatima's First Reaction:** "Is this real or a false alarm?"

**The Dashboard Helps Her:**
Alert panel shows:
- Consumption spiked from 800 kW → 1,520 kW in 60 seconds
- Last 1-hour chart shows everything was stable
- Context: "Last similar event: Nov 15 2024 (3h undetected = 45K€ loss)"

**Her Decision:** "This is real. It's a sudden spike, something turned on that shouldn't be."

**The Escalation (02:17 AM):**
Dashboard auto-notified Karim (SMS). Fatima calls him anyway.

Fatima: *"Karim, critical alert—consumption at 1,520 kW at 02:15. No schedule change. Can you check SCADA?"*

Karim (from home): *"Checking now... I see it! Backup chiller just powered on automatically. Shouldn't be online. Resetting remotely."*

**Within 2 minutes:**
- Karim resets backup chiller remotely
- Consumption drops to 850 kW immediately
- Alert auto-resolves on Fatima's screen
- SMS confirmation sent

**Fatima's Confidence:**
She handled the alert correctly without panicking. She called the right person. She documented the incident. Crisis resolved.

**Requirements Revealed:**
- High-contrast alert styling (unmissable when tired)
- Sound alerts differentiated by severity
- Alert context (trend, history, last similar event)
- Auto-escalation to engineer (SMS with alert details)
- Rapid resolution feedback (green checkmark)
- Alert history log (day shift knows what happened)

---

### Journey 3: Karim's Investigation - From Alert to Recommendation

**Persona:** Karim - Energy Engineer, 42 years old, 14 years experience

**The Setup (Wednesday 09:00 AM):**
Karim has been seeing alerts all week from Sfax site—slightly elevated consumption, nothing critical but concerning. He opens the dashboard and switches to **30-Day Historical View** and asks: *"What's really going on?"*

**The Investigation:**
- Week 1-3: On target
- Week 4 (this week): **+7% above baseline and climbing**
- 4-day period shows: Steady increase starting Tuesday 15:00

**Finding the Culprit:**
Cross-reference with **Maintenance Log**: Tuesday 15:00, "Compressor B maintenance completed, unit back online."

Equipment-level consumption shows: **Compressor B consuming +15% vs baseline** (not normal wear)

**Root Cause:** Compressor filters likely clogged post-maintenance, or belt tension issue.

**The Recommendation (10:30 AM):**
Karim creates a **New Recommendation** in the dashboard:

**Title:** "Compressor B efficiency loss - post-maintenance"

**Analysis:**
- Consumption increased 15% immediately after maintenance
- No improvement over 3 days (not a break-in period)
- Estimated impact: 120€/day wasted

**Recommended Action:**
1. Check compressor filters
2. Verify belt tension
3. If issue persists, schedule diagnostics

**Cost Impact:** Fix it (200€) vs ignore it (3,600€/month waste)

Karim **tags this for Sfax maintenance team** and generates a PDF with graphs.

**Follow-Up (3 Days Later):**
Maintenance team replaces filters. Consumption drops back to baseline. Karim **closes the recommendation** with verification.

**Requirements Revealed:**
- 30-day detailed history with drill-down
- Equipment-level consumption (if SCADA integration)
- Maintenance event correlation
- Recommendation system with context
- PDF report generation (for team communication)
- Cross-site comparison capability
- Task assignment and follow-up tracking

---

### Journey 4: Dr. Leila's Monthly Review - Strategic Decision-Making

**Persona:** Dr. Leila - Plant Manager, 55 years old, 25 years experience

**The Setup (Friday, end of month):**
Dr. Leila needs to answer: *"Are we on track for 15% energy reduction?"*

In the old world: Email Karim, wait 2 hours for Excel report, answer board questions with yesterday's data.

**Today: Dashboard Approach (3 seconds to load)**

**Executive Summary View:**
```
ENERGY COST: 71,200€ (vs budget 72,000€) ✅ UNDER BUDGET
Savings vs Jan 2025: 7,850€ (12% reduction)
Progress toward 15% goal: 80% achieved in Month 1

PEAK CONSUMPTION: 1,480 kW (target 1,520 kW) ✅ UNDER TARGET
Improvement: -40 kW vs last year

EFFICIENCY TREND: Steady improvement
Projected Year 1: 785,000€ (vs baseline 850,000€)

INCIDENTS: 0 critical, avg alert response 12 minutes
```

**Detailed Breakdown (for Board Credibility):**
- Peak demand reduction: -850€ (shift scheduling optimization)
- Consumption efficiency: -4,200€ (equipment maintenance)
- Nocturnal gaspillage: -2,800€ (operators catching idle equipment)
- PF penalties: -1,000€ (capacitor bank installed)

**Total savings:** -8,850€ vs January 2025

**Dr. Leila's Insight:** "Operators catching gaspillage is paying for itself. Dashboard adoption is working."

**Board Presentation (15:00):**
Dr. Leila generates a **Board Report** (PDF) and presents:

*"We achieved 12% reduction in Month 1, putting us 80% toward our monthly target. The breakdown shows which levers are working: operator vigilance, equipment optimization, and peak-shift scheduling. At this rate, we'll exceed 15% by year-end."*

**The Decision:**
VP approves Phase 2 budget (75K€) for advanced analytics. Investment justified by Month 1 ROI proof.

**Requirements Revealed:**
- Executive summary dashboard (4-5 KPIs, mobile-friendly)
- Variance analysis (cost driver breakdown)
- Year-over-year comparison (context for board)
- Trend visualization (direction + magnitude)
- PDF report generation (board-ready formatting)
- Mobile-optimized view (review on-the-go)
- Real-time data credibility ("as of 10:47 AM today")
- Risk/outlook projection (if trend continues...)

---

### Journey 5: Maintenance Technician - Predictive Maintenance Trigger

**Persona:** Ali - Maintenance Technician, 35 years old, Sfax site

**The Old Approach:**
- Follow rigid 90-day calendar
- Maintain whether needed or not
- Miss subtle equipment degradation

**The New Approach:**
Ali logs into the dashboard (Maintenance role) and sees:

```
⚠️ ATTENTION: Compressor B Efficiency Drift
Status: +15% consumption vs baseline
Impact: 120€/day wasted
Recommended: Filter inspection & replacement
Priority: HIGH
```

**Ali's Decision:**
Schedule filter replacement for Wednesday—not based on calendar, but on **data-driven evidence**.

**The Outcome:**
- Wednesday AM: Filter replacement (45 min, 150€)
- Immediately: Consumption drops from 230 kW → 202 kW (baseline)
- Dashboard: **Alert auto-resolves** with "Filter replacement completed, consumption normalized"
- Ali sees his work improved efficiency

**Requirements Revealed:**
- Maintenance role with equipment-level data
- Efficiency drift alerts (threshold-based)
- Equipment performance trends + service history
- Maintenance alert assignment workflow
- Auto-resolution when fixed
- Impact metrics (cost saved by this action)
- Maintenance-engineer handoff

---

### Journey 6: Admin Setup - Onboarding New Operator

**Persona:** Youssef - System Administrator, IT support

**The Task:**
New operator Nadia starts Monday. Youssef needs to set her up with:
1. User account
2. Operator role
3. Tunis site only
4. Training access

**In Admin Panel:**

Youssef creates user:
```
Full Name: Nadia Bennani
Email: nadia.bennani@indusmind.local
Role: Operator (Tunis site)
Permissions:
  ✓ View real-time dashboard
  ✓ Acknowledge alerts
  ✓ Add alert annotations
  ✗ Modify thresholds
  ✗ Access history >24h
  ✗ Admin panel
```

**Training Mode:**
- Assigns "Operator Onboarding" course (2 hours, interactive)
- Includes: Dashboard walkthrough, alert types, escalation procedures
- Includes: Practice scenarios (safe, simulated alerts)

**Her View:**
- Dashboard shows only Tunis site
- Only alerts affecting her assigned lines
- History limited to current shift + 24h
- Admin features hidden

**Monday 08:00 AM:**
Nadia logs in. **Welcome: "Training mode active. Complete the 2-hour onboarding."**

By 10:00 AM:
- Completed interactive training
- Practiced alert responses
- Earned achievement badges
- Ready for production use
- Youssef removes training flag

**Requirements Revealed:**
- Admin user management (CRUD)
- Role-based access control (Operator, Engineer, Manager, Admin, Maintenance, Compliance)
- Site-level permissions
- Training mode (simulated dashboard, practice alerts)
- Interactive onboarding course
- Achievement tracking (badges)
- Audit logging (full trail of user actions)
- Role permission templates

---

### Journey 7: Compliance Officer - ISO 50001 Audit Evidence

**Persona:** Zahra - Quality & Compliance Officer, 38 years old

**The Deadline:**
ISO 50001 audit scheduled July 15-17. Zahra must compile evidence of:
1. Energy baseline established
2. EnPIs tracked continuously
3. Corrective actions taken + verified
4. 24-month data retention

**In Dashboard - Compliance View:**

**Section 1: Energy Baseline & Monitoring**
```
BASELINE ESTABLISHED
Period: Jan 2025 - Dec 2025
Consumption: 850,000 kWh/year
Cost: 850,000€/year
Peak: 1,600 kW

CONTINUOUS MONITORING (ACTIVE)
Start: Jan 2026
Collection: Automated (real-time)
Data Retention: 24 months
Verification: All sensors calibrated Dec 2025

✅ COMPLIANT
```

**Section 2: Energy Performance Indicators**

| EnPI | Baseline 2025 | Current June 2026 | Change |
|-----|---|---|---|
| Specific Consumption | 2.5 kWh/unit | 2.18 kWh/unit | **-12.8%** ✅ |
| Energy Cost/Unit | 2.50€/unit | 2.15€/unit | **-14%** ✅ |
| Peak Demand | 1,600 kW | 1,520 kW | **-80 kW** ✅ |
| Power Factor | 0.89 | 0.94 | **+0.05** ✅ |

**Section 3: Corrective Actions Log**

```
ACTION #CA-001: Compressor B Filter Replacement
Issue: Efficiency drift +15%
Root Cause: Clogged filters
Action: Filter replacement (Jan 29)
Impact: 3,600€/month savings
Result: ✅ VERIFIED

ACTION #CA-002: Night Cooling Optimization
Issue: Nocturnal gaspillage 180 kW idle
Root Cause: Oversized cooling for night
Action: Time-based reduction (Feb 15)
Impact: 2,160€/month savings
Result: ✅ VERIFIED

[... 9 more actions, all tracked with dates, costs, impact ...]
```

**Section 4: Audit Readiness Checklist**
```
✅ Energy Baseline (Clause 6.3) - COMPLETE
✅ Continuous Monitoring (Clause 6.6) - COMPLETE
✅ Energy Performance Indicators (Clause 9.1) - COMPLETE
✅ Corrective Actions (Clause 10.2) - COMPLETE
✅ Competence & Awareness (Clause 7.2) - COMPLETE
✅ Documentation (Clause 4.4) - COMPLETE
```

**Generating Audit Report:**
Zahra clicks **Generate ISO 50001 Audit Report** (PDF, 15 pages):
- Executive summary
- Baseline & EnPI tables with 6-month trends
- Corrective actions log (all verifications)
- Energy performance graph (clear improvement)
- Audit trail (system uptime, calibrations, user access logs)
- Training records, energy register, sensor specs

**Report is audit-ready in 2 clicks.**

**Pre-Audit Meeting (June 28):**
Auditors ask: *"Show me your corrective actions and verification."*

Zahra: *"Here's action CA-001. Alert detected → Engineer analyzed → Maintenance fixed → Consumption verified. See the before/after graph?"*

**Within 10 seconds:** Auditor sees full traceability from issue to resolution.

**After 2 hours:** Auditors are satisfied. *"World-class ISO 50001 system. Certified."*

**July 17: Audit Passed ✅**

**Requirements Revealed:**
- Compliance role with audit-ready data
- Energy baseline definition & tracking
- Energy Performance Indicator calculation
- Corrective action log with full traceability
- Audit readiness checklist
- PDF audit report generation
- Data retention verification
- Audit trail/system logs
- Sensor calibration records
- Training record documentation

---

## User Journey Requirements Summary

**Real-Time Monitoring & Alerting:**
- Live KPI gauges (kW, kWh, PF, cost/hour, voltage)
- Color-coded status (Green/Orange/Red)
- 6-level alert hierarchy with smart routing
- Alert acknowledgment + annotation

**Historical Analysis:**
- 24-hour view (operators)
- 30-day view (engineers)
- 24-month view (compliance)
- Equipment-level consumption (if SCADA)
- Maintenance event correlation

**Decision Support:**
- Executive dashboard (4-5 KPIs)
- Variance analysis (cost driver breakdown)
- Recommendation system (engineer → maintenance)
- PDF report generation (multiple formats)
- Trend visualization

**User & Role Management:**
- Role-based access (Operator, Engineer, Manager, Admin, Maintenance, Compliance)
- Site-level permissions
- Training mode with practice scenarios
- Audit logging

**Compliance:**
- Energy baseline tracking
- EnPI calculation
- Corrective action log with traceability
- 24+ month data retention
- Audit report generation

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**Indusmind Energy Dashboard** introduces five genuinely novel patterns that differentiate it from existing industrial energy solutions:

---

### Innovation 1: Real-Time Hyper-Focus (<5 Second Response)

**The Insight:**
Industrial energy dashboards typically refresh every **1-5 minutes**. This works for *analysis* but fails for *incident prevention*. The November 2024 incident (45K€ loss) proved that a 3-hour detection lag is unacceptable.

**Indusmind Approach:**
- **Critical metric refresh: <5 seconds** (kW, alerts, voltage per phase)
- **Alert detection latency: <30 seconds** (from anomaly event to notification)
- **Designed for shift operators** running 24/7 operations, not periodic reviews
- **Operator reaction time: <2 minutes** (acknowledge, escalate, or investigate)

**Why This Is Innovation:**

| Aspect | Competitors (Schneider, Siemens) | Indusmind |
|--------|---|---|
| **Refresh Rate** | 1-5 minutes (analysis focus) | <5 seconds (incident prevention) |
| **Alert Latency** | 5-10 minutes (email/notification delay) | <30 seconds (SMS + visual) |
| **Target User** | Plant engineers (periodic review) | Shift operators (continuous monitoring) |
| **Incident Prevention** | Reactive (analyze after failure) | Proactive (prevent before failure) |

**Market Context:**
- Competitor case studies (Schneider Electric, Siemens Energy Systems) focus on **efficiency optimization** (monthly/quarterly reviews)
- None optimize for **real-time incident prevention** in small industrial plants
- Gap: Operators at SMB plants (<100M€ revenue) lack tools for **shift-level anomaly detection**
- Indusmind fills this gap with operator-first design

**Validation Approach:**

1. **Technical Validation:**
   - Benchmark <5s refresh against cloud latency (Azure, network, WebSocket)
   - Prove alert detection <30 seconds end-to-end (event trigger → notification delivery)
   - Load test: 100+ concurrent operators without degradation

2. **Operational Validation:**
   - Month 1-2: Track alert accuracy (% of critical alerts that were real incidents)
   - Month 2-3: Measure detection speed (time from actual anomaly to operator awareness)
   - Month 3-6: Compare to baseline: "How much earlier are incidents detected now vs Excel?"
   - Success metric: 80%+ of critical anomalies detected <10 minutes (vs 1-3 hours with Excel)

3. **Business Validation:**
   - Incident prevention (at least 1 incident avoided year 1 = 45K€ value)
   - Operator confidence (survey: "I trust the alerts to tell me if something's wrong")
   - Shift hand-off quality (shift notes are shorter, more focused)

**Risk & Fallback:**
- Risk: If <5s refresh creates alert fatigue (too many false positives)
- Fallback: Tune alert thresholds to reduce noise; add "trusted baseline" mode for experienced operators
- Mitigation: Alert tuning rules in Phase 2 (adaptive thresholds based on time-of-day, production schedule)

---

### Innovation 2: Simplicity-First Design for Non-Technical Operators

**The Insight:**
Industrial dashboards are designed by engineers *for engineers*. But shift operators (age 35-50, BTS-educated, Excel-comfortable) are not data scientists. They need to understand site status in **<3 seconds**, not 3 minutes of chart analysis.

**Indusmind Approach:**
- **Large, color-coded gauges** (green = OK, orange = warning, red = critical)
- **One glance understands status** (no context switching, no legend needed)
- **Micro-interactions** (hover shows detail, click drills down, no cognitive load baseline)
- **Progressive disclosure** (basic view for operators, advanced view for engineers)
- **Designed for shift work** (bright colors for alertness, simple buttons for gloved hands)

**Why This Is Innovation:**

**Competitor UX Pattern:**
- Schneider Electric EcoStruxure: Complex dashboard with 10+ charts, drill-down menus, threshold configuration
- Siemens Energy: Enterprise UI with navigation hierarchy, role-based tabs
- PowerLogic: Technical interface designed for energy analysts
- **Result:** Operators spend 5-10 minutes to understand current status

**Indusmind UX Pattern:**
- Single dashboard view: kW gauge (live), last-hour sparkline, alert badges, KPI card (cost/PF)
- **Operator sees status in 2-3 seconds** (gauge color + alert presence)
- Advanced analysis hidden (engineers click "Detailed History" to access charts)
- **Result:** Ahmed (senior operator) can triage situation before coffee gets cold

**Market Context:**
- No energy dashboard optimizes for **shift operator simplicity**
- Most dashboards are "least common denominator" (everything visible, overwhelming)
- Gap: Operators need clarity; engineers need depth
- Indusmind provides **role-based simplicity** (Operator view vs Engineer view)

**Validation Approach:**

1. **UX Validation:**
   - Heuristic evaluation: "Can new operator understand status without training?"
   - User testing with actual operators (Ahmed, Fatima): "Tell me what you see in 5 seconds" (measure accuracy of status understanding)
   - A/B test: Simplified view vs traditional view (measure time-to-decision)
   - Success metric: New operators can read status correctly 95%+ of time in <3 seconds

2. **Adoption Validation:**
   - Training time: Goal is 2 hours (vs traditional 1-2 days for complex dashboards)
   - Usage metrics: % of operators accessing detailed history (should be <20% for operators)
   - Shift hand-off quality: Fewer questions/clarifications needed during shift change
   - Success metric: 70%+ adoption within first shift (operators actually using it, not just available)

3. **Operational Validation:**
   - Error rate: Fewer incorrect decisions (mistakes due to misreading dashboard)
   - Alert response time: Faster action on alerts
   - Operator confidence: "I understand what the dashboard is telling me"

**Risk & Fallback:**
- Risk: Operators find simplified view too simple; want more details immediately available
- Fallback: "Quick detail" mode (one-click drill-down to charts, doesn't replace main gauge view)
- Mitigation: Progressive onboarding (first week: gauge only, week 2: introduce history, week 3: full access to engineer features)

---

### Innovation 3: Compliance-Native Architecture (Not Bolted-On)

**The Insight:**
ISO 50001 compliance is typically added *after* building a product (compliance theater). This creates gaps: missing audit trails, insufficient data retention, no corrective action workflow.

**Indusmind Approach:**
- **Audit logging from day 1** (every action logged: who, what, when, why)
- **Baseline tracking as core feature** (not a reporting add-on)
- **Corrective action workflow embedded** (issue detection → engineer analysis → maintenance → verification)
- **Energy data as source-of-truth** (not Excel spreadsheets)
- **Auto-generated audit evidence** (PDF reports with full traceability)

**Why This Is Innovation:**

| Aspect | Traditional Approach | Indusmind |
|--------|---|---|
| **Compliance Timeline** | Bolted-on after product launched | Core architecture from MVP |
| **Audit Trail** | Manual logs (or missing) | Automatic (every action captured) |
| **Baseline Tracking** | Excel spreadsheet | Dashboard calculated + versioned |
| **Corrective Actions** | Email chains, scattered docs | Workflow with traceability |
| **Audit Reports** | Manual compilation (2-3 days) | PDF generated in 2 clicks (real-time) |
| **Data Integrity** | Risk of loss/corruption | Backed up, encrypted, searchable |
| **Certification Outcome** | Likely non-conformances found | Zero non-conformances expected |

**Market Context:**
- No industrial energy dashboard is explicitly designed for ISO 50001 compliance
- Most vendors treat compliance as a feature add-on (not foundational)
- Gap: Small-to-medium industrial plants struggle with ISO 50001 audit preparation
- Indusmind is **purpose-built for ISO 50001**, not retrofitted

**Validation Approach:**

1. **Compliance Validation:**
   - Pre-audit dry-run (internal team plays auditor, use dashboard to find evidence)
   - Checklist completeness: Verify all ISO clauses 6.3-10.2 have supporting evidence in dashboard
   - Success metric: Audit readiness = 100% (no gaps in required evidence)

2. **Audit Validation:**
   - External auditor pre-audit review (June 28, before July 15-17 audit)
   - Auditor feedback: "Is this dashboard sufficient proof of compliance?"
   - Success metric: Zero non-conformances in final audit (July 2026)

3. **Operational Validation:**
   - Compliance officer efficiency: Time to compile evidence (goal: <1 hour for monthly review)
   - Corrective action closure rate: % of actions completed per plan (should be >90%)
   - Baseline tracking accuracy: Variance between dashboard baseline and auditor re-calculation (<1%)

4. **Business Validation:**
   - Certification achieved on time (July 2026, no delays)
   - Audit costs: Should be lower than industry average (less manual evidence compilation)
   - Compliance confidence: Leadership feels assured of audit success

**Risk & Fallback:**
- Risk: Auditor finds gaps in audit trail or corrective action documentation
- Fallback: Phase 2 enhancement: Add missing audit capabilities, re-validate before annual renewal audit
- Mitigation: Engage external auditor in design review (April 2026) to catch gaps early

---

### Innovation 4: Multi-Site Real-Time Coordination (First for SMB)

**The Insight:**
Large enterprises (100K+ employees) have multi-site energy systems. But small-to-medium industrial plants (50-200 employees) operating 2-3 sites have **no coordinated energy dashboard**. They use separate Excel files or fragmented SCADA views.

**Indusmind Approach:**
- **Unified alerts across sites** (critical issue at Sfax alerts engineer assigned to Tunis)
- **Cross-site comparison** (Tunis consuming 8% above target, Sfax on target → investigate Tunis)
- **Best-practice transfer** (engineer discovers cooling optimization at Sfax, applies to Tunis)
- **Single executive view** (manager sees both sites with unified KPIs)
- **Site-level permissions** (Tunis operators see only Tunis, unless escalated)

**Why This Is Innovation:**

| Scenario | Without Coordination | With Indusmind |
|---|---|---|
| **Efficiency Drift** | Sfax cooling system drifts +12%, Tunis stays normal. Discovered separately (weeks later if at all) | Engineer immediately sees Sfax anomaly, cross-references Tunis baseline, recommends optimization to both sites |
| **Alert Response** | Alert at Sfax site, but local operator unfamiliar with cause. Calls office, waits for engineer from Tunis (1 hour) | Alert reaches engineer with Tunis context (baseline, similar patterns). Diagnoses remotely in 10 minutes |
| **Best Practice** | Innovation at one site (new cleaning process saves 5% energy). Other site unaware. Benefit lost. | Innovation documented in dashboard, engineer transfers to other site. Benefit multiplied |
| **Executive Visibility** | Manager gets 2 separate Excel reports (confusing, delayed) | Single board report showing both sites trending together toward 15% goal |

**Market Context:**
- **Competitor gap:** No energy dashboard designed for SMB multi-site operations
- **Enterprise solutions:** Overkill in features and cost for 2-3 site plants
- **Regional/local solutions:** Only single-site focus
- **Indusmind opportunity:** First purpose-built for 2-5 site SMB energy coordination

**Validation Approach:**

1. **Technical Validation:**
   - Real-time synchronization: Alerts from both sites delivered in <5 seconds (not delayed)
   - Cross-site comparison: Sfax vs Tunis baseline comparison accurate (±1%)
   - Load testing: 8 concurrent users across 2 sites without latency degradation

2. **Operational Validation:**
   - Best-practice transfer: Track engineer recommendations from one site applied to other (goal: 1+ per month)
   - Cross-site incident response: Time to diagnose incident affecting one site when engineer is assigned to other (goal: <15 min)
   - Executive clarity: Manager can make comparative decisions in <2 minutes (vs 20 min with separate reports)

3. **Business Validation:**
   - Multi-site optimization benefit: Identify and implement 2+ cross-site improvements in year 1
   - Site team morale: Both sites feel connected (not isolated), sharing energy goals
   - Scaling plan: If successful at 2 sites, is 5-site expansion planned?

4. **Expansion Validation:**
   - Phase 2 opportunity: If 2-site model works, position for 5-10 site enterprise customers
   - Licensing/pricing: Does multi-site model require higher pricing (vs single-site)?

**Risk & Fallback:**
- Risk: Cross-site comparison introduces complexity (Tunis and Sfax have different baselines, production mixes)
- Fallback: Show data with context (explain why Tunis might differ: hotter climate, different production mix)
- Mitigation: Smart baselining by site (not forced comparison); normalize for differences

---

### Innovation 5: Mobile-First for Field Triage (Not Just Responsive)

**The Insight:**
Industry trend is "mobile-responsive" (shrink web UI to fit phone). But engineers need **mobile-first decision support**: diagnose equipment issues on-site without laptop/office access.

**Indusmind Approach:**
- **Smartphone field triage:** Engineer gets SMS alert at 2 AM, uses phone to see consumption + trend + last maintenance, decides remotely
- **"2-minute diagnosis" workflow:** Consumption anomaly → last-known-good baseline → maintenance history → confident decision in 120 seconds
- **No blind dispatches:** Field engineer arrives at equipment with diagnosis (not guessing)
- **Offline capability (Phase 2):** PWA caching allows offline view of last 7 days if connection lost on plant floor
- **Push notifications:** Critical alerts delivered even if app is closed (doesn't rely on polling)

**Why This Is Innovation:**

| Scenario | Without Mobile | With Indusmind Mobile |
|---|---|---|
| **Night Alert (2 AM)** | Engineer wakes up, has to go to office or wait until morning. Production issue unresolved. | Engineer checks phone (2 min), diagnoses issue remotely, calls SCADA operator (if intervention needed). Issue resolved in 5 min |
| **Field Investigation** | Engineer drives to site, sees equipment, calls office for historical data. Guesses root cause. | Engineer checks phone before leaving office, arrives with diagnosis. Knows exactly what to look for. Saves 30 min |
| **Off-Hours Astreinte** | Engineer on call worries about emergency. Can't check status without being on-site or at office. | Engineer can check critical systems from home. Confidence in whether escalation needed. Sleep better. |
| **Plant Floor Visit** | Engineer needs laptop or tablet (bulky, not practical with gloves). | Smartphone in pocket. Glance at alert during floor walk. Real-time trending visible. |

**Market Context:**
- **Competitor mobile:** Responsive web views (not true mobile-first)
- **Industry gap:** No energy dashboard optimized for field engineer decision-making
- **User behavior:** Field engineers want phones (familiar, always-on), not tablets/laptops
- **Indusmind innovation:** Mobile is **primary decision interface**, not secondary feature

**Validation Approach:**

1. **Technical Validation:**
   - Mobile UX testing: "Can engineer diagnose issue in 2 minutes on smartphone?"
   - Offline capability: PWA caching works (last 7 days data available without connection)
   - Push notifications: Critical alerts delivered <30 seconds (even with app closed)
   - Success metric: Mobile load time <2 seconds on 4G, offline mode functional

2. **Operational Validation:**
   - Mobile adoption: % of engineers actively using mobile (goal: 80%+ within first month)
   - Dispatch efficiency: "Blind dispatches" (arrivals without diagnosis) should drop 50% (fewer wasted trips)
   - Decision speed: Time from alert to decision (goal: <5 minutes for critical alerts)
   - Success metric: Remote diagnosis prevents 3+ unnecessary on-site dispatches in month 1

3. **User Validation:**
   - Engineer feedback: "Mobile diagnosis gives me confidence in decisions"
   - On-call satisfaction: Astreinte engineers report better sleep (less worry)
   - Field worker NPS: "Would you recommend mobile to other engineers?" (goal: >8/10)

4. **Business Validation:**
   - Cost savings: Fewer unnecessary dispatch trips (1 trip = 2-3 hours + fuel + vehicle)
   - Incident response speed: Faster time-to-resolution (fewer delays waiting for office access)
   - Scalability: If mobile drives adoption, position for broader market (not just internal use)

**Risk & Fallback:**
- Risk: Engineers over-rely on mobile, miss context that requires detailed dashboard
- Fallback: Mobile shows "Get more details" button (redirects to full dashboard on laptop/desktop)
- Mitigation: Mobile shows only critical info (consumption, trend, last maintenance); complex analysis deferred to desktop

---

## Market & Competitive Context

### Competitive Landscape (Energy Dashboards)

| Competitor | Target | Approach | Weakness |
|---|---|---|---|
| **Schneider Electric EcoStruxure Energy** | Enterprise | Comprehensive analytics | Complex UI, 1-5 min refresh, design by engineers |
| **Siemens Energy Systems** | Large industrial | SCADA integration | Enterprise-scale (>500M€ revenue), expensive |
| **PowerLogic ION Enterprise** | Manufacturing plants | Power quality + energy | Specialized (utilities), not operator-friendly |
| **ABB Energy Manager** | Industrial facilities | Building/plant analytics | Generic (not energy-first), slow refresh |
| **Indusmind** | SMB industrial | Operator + compliance | Fast, simple, compliant, mobile-first **[NOVEL]** |

**Competitive Moat:**
1. **Operator-first design** (simplicity gives speed advantage over complex dashboards)
2. **Compliance-native** (ISO 50001 ready from day 1, hard to copy quickly)
3. **Multi-site SMB focus** (enterprise solutions overkill, local solutions too basic)
4. **Real-time incident prevention** (not optimization, prevents catastrophic failures)

### Defensibility & Sustainability

**How Indusmind defends against competitors copying these innovations:**

1. **Real-time refresh:** Technical challenge (cloud architecture, WebSocket optimization), gives 6-12 month lead
2. **Simplicity design:** User research + iterative testing (can't copy without learning your operators' needs)
3. **Compliance-native:** Legal/audit expertise required (barrier to entry)
4. **Multi-site coordination:** Domain knowledge (energy operations at SMB level, rare expertise)
5. **Mobile-first:** Product philosophy (not just feature), harder to retrofit into existing products

---

### Innovation Summary & Validation Plan

| Innovation | Differentiator | Validation Goal | Timeline |
|---|---|---|---|
| **Real-time <5s refresh** | Industry leads at 1-5 min | Incident detected 80%+ <10 min (vs 1-3h) | Month 3 |
| **Simplicity-first design** | Operators >3 second status grasp | 70%+ adoption, 2-hour training time | Month 2 |
| **Compliance-native** | ISO 50001 ready from MVP | Zero audit non-conformances | Month 9 |
| **Multi-site coordination** | First for SMB market | 2+ cross-site optimizations identified | Month 6 |
| **Mobile-first triage** | Field engineer confidence | 80% mobile adoption, 50% fewer blind dispatches | Month 2 |

---

## Domain-Specific Requirements

### Industrial Energy Management Compliance & Regulatory Overview

**Indusmind Energy Dashboard** operates in the **industrial energy management domain** with high regulatory complexity and mission-critical safety implications. The domain is characterized by:

- **Regulatory Framework:** ISO 50001 (Energy Management Systems) - mandatory for large industrial consumers in Tunisia
- **Safety Context:** Energy anomalies directly impact equipment protection and operational continuity (45K€ incident demonstrates financial and operational criticality)
- **Stakeholder Complexity:** Multiple user types with different access needs (operators, engineers, managers, maintenance, compliance, external auditors)
- **Data Sensitivity:** Energy consumption patterns are moderately sensitive (reveal production schedules, competitive information) and require controlled access
- **Compliance Deadline:** ISO 50001 certification required by July 2026 (6 months from MVP launch)

This domain shapes fundamental product decisions around data retention, audit logging, role-based access, and compliance reporting capabilities.

---

### Key Domain Concerns

#### 1. ISO 50001 Compliance (Mandatory Regulatory)

**Concern:** Tunisia's energy ministry requires ISO 50001 certification for industrial facilities consuming >500 MWh/year. Non-compliance results in:
- Government penalties (fines, restrictions on public contracts)
- Loss of competitive advantage in procurement tenders
- Inability to demonstrate energy management to clients

**Product Impact:**
- Dashboard must collect, store, and report data in ISO 50001-compliant format
- All corrective actions must be logged with traceability (who, what, when, why, outcome)
- Energy baseline and EnPIs must be continuously tracked for 24+ months
- Audit evidence must be automatically generated (PDF reports)

**Deadline Implication:**
- MVP must be operational and data collection active by April 2026 (3 months before audit)
- Historical data collection must show at least 2 months of baseline before audit
- All procedures must be documented and auditable by July 2026

#### 2. Energy Data Sensitivity & Access Control (Security)

**Concern:** Energy consumption patterns reveal:
- Production schedules (which products being manufactured when)
- Equipment efficiency (which machines are aging or failing)
- Shift-level performance (which team is more efficient)
- Cost structure (gross margins, production costs)

This information is **moderately sensitive** (internal competitive value, not client-facing unless ESG reporting).

**Product Impact:**
- Role-based access control (RBAC) mandatory (Operator < Engineer < Manager < Admin)
- Site-level permissions (Tunis vs Sfax operators see only their site)
- Audit logging mandatory (every access, modification, export logged with timestamp + user ID)
- Data export requires approval trail (who requested, who approved, timestamp, purpose)
- Encryption in transit (HTTPS/TLS) and at rest (database encryption) required

**Access Control Matrix:**
```
| Capability | Operator | Engineer | Manager | Compliance | Admin |
|---|---|---|---|---|---|
| View real-time dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View 24h history | ✓ | ✓ | ✓ | ✓ | ✓ |
| View 30-day history | ✗ | ✓ | ✓ | ✓ | ✓ |
| View 24-month history | ✗ | ✓ | ✓ | ✓ | ✓ |
| Export data (CSV) | ✗ | ✓ (requires log) | ✓ (requires log) | ✓ (requires log) | ✓ |
| Modify alert thresholds | ✗ | ✓ (within limits) | ✗ | ✗ | ✓ |
| View audit trail | ✗ | ✓ | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✗ | ✓ |
| Generate compliance reports | ✗ | ✗ | ✓ | ✓ | ✓ |
| Access ISO 50001 data | ✗ | ✓ | ✓ | ✓ | ✓ |
```

#### 3. Electrical Safety & Equipment Protection (Safety-Critical)

**Concern:** Industrial electricity systems are safety-critical. Overcurrent, overvoltage, phase imbalance, or power factor issues can:
- Trigger disjoncteurs (circuit breakers), halting production
- Damage expensive equipment (motors, transformers, chillers)
- Create fire hazards if equipment overheats
- Harm personnel if electrical fault occurs

**Product Impact:**
- Alert thresholds must be **safety-justified**, not arbitrary (e.g., 90% capacity is 1 step before disjoncteur trigger at 95%)
- Escalation paths must be clear and immediate (critical alerts → SMS + email + escalation)
- No operator can accidentally disable critical alerts
- Voltage phase balance monitoring mandatory (phase imbalance >3% damages motors)
- Power factor monitoring mandatory (PF <0.85 triggers tariff penalties AND indicates equipment distress)
- All equipment must have failsafe defaults (alerts default to ON, never to OFF)

**Safety-Critical Constraints:**
- Capacity thresholds tied to actual disjoncteur rating (1600 kW capacity = hardware limit, not configurable)
- Over-threshold behavior: Alert progression (Warning @ 80%, Medium @ 85%, Critical @ 90%, Emergency @ 95%)
- No "silence all alerts" function (can silence specific alert type only, with reason log)
- Maintenance windows require explicit documentation (to distinguish intentional shutdown from anomaly)

#### 4. Operational Resilience & Incident Response (Uptime-Critical)

**Concern:** If the dashboard becomes unavailable during peak production, operators lose visibility:
- Can't detect anomalies → problems discovered by equipment failure (expensive)
- Can't triage alerts → potential safety hazards
- Shift hand-off becomes difficult (no evidence of what happened during outage)

**Product Impact:**
- **Target Uptime:** 99.5% (allows <4.4 hours unplanned downtime per year)
- **Recovery Time Objective (RTO):** <30 minutes to restore dashboard functionality
- **Recovery Point Objective (RPO):** <5 minutes of data loss acceptable (can lose up to 5 min of recent readings)
- **Failover Strategy:** Data stored in time-series DB with backup (Azure managed backup)
- **Offline Capability:** Phase 2 enhancement—PWA caching last 7 days of data for offline view (read-only)
- **Alert Delivery Redundancy:** If dashboard is down, critical alerts still delivered via SMS (not dependent on web UI)

**Operational Resilience Requirements:**
- WebSocket connection monitoring (auto-reconnect within 30 seconds if connection lost)
- Graceful degradation: If real-time update fails, show last-known-good data with "stale data" warning
- Maintenance windows must be scheduled (pre-announced, not surprise outages)
- Health monitoring dashboard (for admins) showing system uptime, latency, data freshness
- Incident response runbook (what to do if dashboard down for >1 hour)

#### 5. Regulatory Reporting & External Stakeholders (Compliance & ESG)

**Concern:** Beyond ISO 50001, your organization may face demands from:
- **Clients:** ESG (Environmental, Social, Governance) questionnaires asking for energy efficiency data
- **Government:** Environmental ministry surveys on energy reduction
- **Investors:** Sustainability reporting (Scope 2 emissions, energy reduction progress)
- **Future Requirements:** Tunisia's potential carbon pricing, EU scope extension

**Product Impact:**
- **ISO 50001 Reports:** Energy baseline, EnPI trends, corrective actions (mandatory monthly for audit trail, annually for certification)
- **ESG Reports:** Energy consumption, CO₂ emissions, cost savings, efficiency improvements (may be requested by clients)
- **Energy Minister Surveys:** Actual vs target consumption, reduction percentage, initiatives (potential future requirement)
- **Internal Board Reports:** Monthly energy cost tracking, ROI of initiatives, risk assessment

**Reporting Requirement:**
```
| Report Type | Frequency | Audience | Format | Data Required |
|---|---|---|---|---|
| ISO 50001 Evidence | Monthly (until audit) | Internal audit team | PDF | Baseline, EnPI, corrective actions, audit trail |
| Audit Report | Quarterly (until certified) | External auditors | PDF | Full compliance checklist, historical data |
| Board Report | Monthly | Executive leadership | PDF + dashboard | Energy cost, savings, trend, ROI |
| ESG Report | Annual (on-demand) | Clients/investors | PDF | Energy consumption, CO₂, efficiency gains |
| Energy Minister | Annual (if required) | Government | Excel/API | Consumption, reduction %, initiatives |
```

---

### Compliance Requirements

#### ISO 50001 Mandatory Requirements (Clause-Specific)

**Clause 4.4.4 - Documentation Management**
- ✅ All procedures documented (in dashboard or linked documents)
- ✅ Change history maintained (audit trail of every modification)
- ✅ Access control to documentation (sensitive docs restricted)
- **Dashboard Implementation:** All configuration changes logged with timestamp, user, before/after values

**Clause 6.3 - Energy Baseline & Review**
- ✅ Energy baseline established for 12 months (January-December 2025)
- ✅ Baseline approved by management and documented
- ✅ Baseline can be recalculated if significant changes occur (justified, documented)
- **Dashboard Implementation:** Baseline shown on every historical chart, updates logged

**Clause 6.6 - Measurement, Analysis & Evaluation of Energy**
- ✅ Data collection automated (no manual Excel)
- ✅ Sensors calibrated before baseline collection (done Dec 2025)
- ✅ Data retained for 24 months minimum
- ✅ Data accuracy validated (sensor health monitoring)
- **Dashboard Implementation:** Auto-collection via WebSocket, data quality indicators, calibration record tracking

**Clause 9.1 - Monitoring & Measurement**
- ✅ Energy Performance Indicators (EnPIs) defined (5 minimum recommended)
- ✅ EnPI targets set based on baseline
- ✅ EnPI trend tracked monthly
- ✅ Results reported to management
- **Dashboard Implementation:** EnPI calculation dashboard, trend visualization, monthly report generation

**Clause 10.2 - Nonconformity, Corrective & Preventive Action**
- ✅ Nonconformities identified (consumption above target, equipment inefficiency)
- ✅ Root cause analysis documented
- ✅ Corrective actions taken and logged
- ✅ Effectiveness verified (before/after data compared)
- **Dashboard Implementation:** Corrective action workflow, issue→action→verification→closure tracking

**Clause 7.2 - Competence & Awareness**
- ✅ All users trained on energy awareness (operators, engineers, managers)
- ✅ Training records maintained
- ✅ Competence assessment done
- **Dashboard Implementation:** Training mode, competence tracking, certificate generation

---

### Industry Standards & Best Practices

#### Energy Management Standards
- **ISO 50001:** International standard for energy management systems (primary compliance framework)
- **ISO 50002:** Energy audit standard (potential future external audit requirement)
- **EN 50001:** European implementation (reference for best practices)

#### Electrical Safety Standards (Tunisian & International)
- **IEC 60364:** Low-voltage electrical installation standards (defines safe operating ranges)
- **CEI (Italian):** Referenced in Tunisia for electrical installations
- **NFPA 70 (US):** Electrical code (reference for failsafe alert thresholds)

**Key Safety Thresholds from Standards:**
```
| Parameter | Safe Range | Warning Range | Critical Range | Emergency Range |
|---|---|---|---|---|
| Voltage (per phase) | 380-420V | 360-380V or 420-440V | <360V or >440V | <300V or >500V |
| Phase Imbalance | <2% | 2-3% | >3% | >5% |
| Power Factor | >0.92 | 0.85-0.92 | <0.85 | <0.75 |
| Frequency | 49.5-50.5 Hz | 49-49.5 or 50.5-51 Hz | <49 or >51 Hz | <48 or >52 Hz |
| Current Symmetry | <10% | 10-15% | >15% | >25% |
```

#### Energy Performance Best Practices (from Schneider Electric, Siemens case studies)
- **Consumption Baseline:** Establish using 12 consecutive months of stable operation
- **EnPI Selection:** Use 3-5 primary indicators (consumption/unit, cost/unit, peak demand, efficiency ratio, emissions)
- **Corrective Action Thresholds:** Trigger investigation when deviation >10% from trend (not just >target)
- **Monitoring Frequency:** Real-time for critical parameters (<5s refresh), hourly for analysis metrics
- **Review Cadence:** Daily operational review (shift lead), weekly engineering review, monthly executive review

---

### Required Expertise & Validation

#### Domain Expertise Needed (Team Composition)

**During MVP Development:**
1. **Energy Engineer** (on staff: Karim or equivalent)
   - Sets alert thresholds based on equipment specs and safety standards
   - Validates baseline calculation methodology
   - Approves EnPI definitions
   - Estimated involvement: 20 hours during development, 5 hours/month maintenance

2. **Quality/Compliance Officer** (on staff: Zahra or equivalent)
   - Ensures ISO 50001 data requirements met
   - Designs corrective action workflow
   - Validates audit report generation
   - Estimated involvement: 15 hours during development, 3 hours/month after

3. **IT Security Officer** (may need external consultant)
   - Defines access control matrix (RBAC implementation)
   - Specifies encryption standards (HTTPS, at-rest encryption)
   - Designs audit logging system
   - Estimated involvement: 10 hours during development, 2 hours/month audit

4. **Systems Architect** (dev team)
   - Designs data retention and archival strategy (24-month storage)
   - Implements WebSocket resilience (failover, reconnection)
   - Plans disaster recovery and backups
   - Estimated involvement: 40 hours during development

#### Validation & Testing Required

**Pre-Launch Validation (Critical):**
- ✅ Baseline calculation verified by energy engineer (accurate ±2%)
- ✅ Alert thresholds validated by engineer (safety-correct)
- ✅ RBAC tested thoroughly (no unauthorized access)
- ✅ Audit logging tested (every action captured)
- ✅ Data retention verified (24+ months available and searchable)
- ✅ Disaster recovery tested (restore from backup, data integrity verified)
- ✅ Pre-audit checklist completed with external auditor review (July 1, before July 15-17 audit)

**Post-Launch Monitoring:**
- Weekly system health checks (uptime, data freshness, alert accuracy)
- Monthly audit log review (ensure all required events captured)
- Quarterly data quality audit (sensor calibration status, data gaps)
- Annual ISO 50001 compliance review (before certification renewal)

---

### Energy Data Security & Access Control

#### Data Classification & Protection

**Energy Consumption Data - Classification: Internal Sensitive**

| Data Type | Sensitivity | Protection Level | Access Control | Retention |
|---|---|---|---|---|
| **Real-time consumption (kW, kWh)** | Medium | TLS in transit, DB encrypted | Role-based (Operator sees site only) | 24 months |
| **Historical consumption (30-day+)** | Medium-High | TLS in transit, DB encrypted | Engineers/Managers/Compliance only | 24 months |
| **Equipment-level consumption** | Medium-High | TLS in transit, DB encrypted | Engineers only (cross-site needs approval) | 24 months |
| **Cost data (€/kWh, tariffs)** | High | TLS in transit, DB encrypted, masked for operators | Managers/Compliance only | 24 months |
| **Audit logs (who accessed what)** | High | TLS in transit, DB encrypted, write-once append-only | Compliance/Admin only | 24 months |
| **Maintenance events (linked to consumption)** | Medium | TLS in transit, DB encrypted | Engineers/Maintenance/Compliance | 24 months |
| **Corrective action logs** | Medium-High | TLS in transit, DB encrypted | Engineers/Managers/Compliance/Auditors | 24 months |

#### Authentication & Authorization

**Authentication:**
- ✅ User accounts with strong passwords (minimum 12 characters, complexity required)
- ✅ Session timeout: 30 minutes of inactivity (security for shared terminals)
- ✅ Future Phase 2: SSO integration with Azure AD (enterprise security)
- ✅ Future Phase 2: Multi-factor authentication (for privileged accounts)
- ⚠️ Mobile: Touch ID / Face ID (for smartphone access, Phase 2)

**Authorization (RBAC):**
- ✅ Four base roles defined: Operator, Engineer, Manager, Admin
- ✅ Site-level scoping: Tunis vs Sfax vs multi-site access
- ✅ Role escalation workflow: Junior operator → Senior operator → Lead operator (optional)
- ✅ Time-limited roles: Temporary guest access for external auditors (24-hour window, auto-revoke)

**Audit Logging (All Access):**
- ✅ Login: User ID, timestamp, IP address, success/failure
- ✅ Data access: User ID, what data accessed, timestamp, duration, purpose (if applicable)
- ✅ Modifications: User ID, what changed, before/after values, timestamp
- ✅ Exports: User ID, what data exported, format, timestamp, approval status
- ✅ Permission changes: Admin user, role changed, timestamp, reason
- ✅ Retention: 24 months (tied to data retention policy)

#### Encryption Standards

**In Transit (WebSocket, API, Web):**
- ✅ TLS 1.2 minimum (or TLS 1.3 preferred)
- ✅ HTTPS required (no HTTP)
- ✅ Certificate pinning (optional, for enhanced mobile security, Phase 2)

**At Rest (Database):**
- ✅ Database encryption (Azure SQL Database with Transparent Data Encryption, or InfluxDB encryption)
- ✅ Backup encryption (backup files encrypted)
- ✅ Key management: Azure Key Vault (or equivalent) for key storage and rotation

**Password Storage:**
- ✅ Bcrypt or similar (never plaintext, never reversible hashing)
- ✅ Salted hash (unique salt per user)

---

### Electrical Safety Constraints

#### Alert Threshold Justification (Safety-Based)

**Capacity-Based Alerts (kW):**

| Threshold | Status | Action | Reason |
|---|---|---|---|
| 0-1200 kW | GREEN | No action | Normal operation (75% capacity) |
| 1200-1280 kW (80%) | YELLOW | Monitor, check baseline | Trending high, but safe margin |
| 1280-1440 kW (85-90%) | ORANGE | Engineer notification, investigate | Approaching danger zone, demand reduction recommended |
| 1440-1520 kW (90-95%) | RED | Critical alert, SMS escalation, immediate action required | One step before emergency, risk of disjoncteur |
| 1520+ kW (95%+) | EMERGENCY | Alarm + SMS + email, escalate to manager | Imminent circuit breaker trip, production halt likely |

**Rationale:** 1600 kW is the disjoncteur rating (hard limit). At 90% (1440 kW), there's only 160 kW headroom for transients. System is at physical edge.

**Voltage Phase Balance (Safety for Motors):**

| Imbalance | Status | Action | Reason |
|---|---|---|---|
| <2% | GREEN | Normal | Within tolerance, equipment safe |
| 2-3% | ORANGE | Engineer notification | Approaching damage threshold, inspect for unbalanced load |
| >3% | RED | Critical alert | Motors at risk of overheating, shutdown recommended |

**Rationale:** Motors are damaged by >3% imbalance (causes asymmetric heating, insulation failure over weeks).

**Power Factor (Equipment Health & Tariff):**

| PF Value | Status | Action | Reason |
|---|---|---|---|
| >0.92 | GREEN | Normal | Efficient, no tariff penalty |
| 0.85-0.92 | ORANGE | Engineer notification | Approaching penalty threshold (15% surcharge), check for inductive loads |
| <0.85 | RED | Critical alert | Tariff penalty active (costs €1K+/month), investigate motor/transformer issues |

**Rationale:** Distributor (STEG) charges penalties for PF <0.90. Low PF indicates equipment distress (aging motors, reactors).

#### Failsafe Defaults

- ✅ All critical alerts default to **ON** (cannot be disabled, only acknowledged)
- ✅ Alert thresholds default to **conservative values** (prefer false positives over missed warnings)
- ✅ Maintenance windows require **explicit start/end time** (to distinguish intentional downtime)
- ✅ No "mute all alerts" function (can mute specific type with reason log)
- ✅ Operator cannot silence critical alerts (engineer or above can, with audit log)

---

### Operational Resilience & High Availability

#### Uptime SLA & Recovery Targets

| Metric | Target | Justification |
|---|---|---|
| **Availability (SLA)** | 99.5% per month | Allows <4.4 hours unplanned downtime/year (industry standard for mission-critical) |
| **Recovery Time (RTO)** | <30 minutes | Dashboard restored within shift window, data collection paused but alertable |
| **Recovery Point (RPO)** | <5 minutes | Can lose up to 5 min of recent data; acceptable given WebSocket stream continues |
| **Data Recovery** | 24 hours max | Restore from backup if data corruption; historical data always available |

#### High Availability Architecture

**Primary Deployment (Azure Cloud):**
- ✅ VM/App Service: Auto-scaling (add replicas if CPU >70%)
- ✅ Database: Managed Azure SQL Database with automatic failover (geo-redundant option)
- ✅ WebSocket: Connection pooling, reconnect logic (auto-reconnect within 30 seconds)
- ✅ Backup: Daily automated backup, 30-day retention
- ✅ Disaster Recovery: Point-in-time restore available (RPO <5 min)

**Failover & Degradation:**
- ✅ If WebSocket down: Show last-known-good data (marked "stale, last update X minutes ago")
- ✅ If database down: Serve from read-only replica (no modifications allowed)
- ✅ If entire region down: Manual failover to secondary region (RTO <30 min, requires admin action)

**Offline Capability (Phase 2):**
- ✅ PWA caching: Last 7 days of data cached locally (read-only access, no data entry)
- ✅ Offline alerts: Critical alerts still sent via SMS (independent of app)
- ✅ Auto-sync: When connection restored, queue flushed and data synced

#### Monitoring & Alerting (For Admins)

Admin Dashboard displays:
- ✅ System uptime (green/red status)
- ✅ API latency (milliseconds, warn if >500ms)
- ✅ WebSocket connection health (active connections, drop rate)
- ✅ Database CPU/memory usage
- ✅ Data freshness (last update timestamp for each sensor)
- ✅ Alert queue depth (pending notifications)
- ✅ Error rate (% of failed API calls, should be <0.1%)

**Alert Triggers (for IT):**
- 🔴 Uptime <99% in past hour → page on-call engineer
- 🔴 API latency >500ms consistently → investigate bottleneck
- 🔴 Data freshness >2 minutes old → sensor connection problem
- 🟠 Error rate >0.5% → investigate application logs

#### Maintenance Windows (Scheduled)

- ✅ Scheduled maintenance announced 24 hours in advance
- ✅ Maintenance windows during low-activity hours (e.g., 02:00-04:00 AM)
- ✅ During maintenance: Dashboard shows "Scheduled Maintenance in Progress" (not an alarm)
- ✅ Critical alerts still route via SMS during maintenance
- ✅ Max maintenance window: 1 hour (SLA maintenance duration)
- ✅ Post-maintenance: Full system health check before users reconnected

---

### Regulatory Reporting & External Stakeholder Management

#### ISO 50001 Audit Evidence (Mandatory)

**Evidence Type 1: Energy Baseline & Monitoring Data**
- **Format:** PDF report with tables and charts
- **Audience:** External ISO 50001 auditor (annual)
- **Data Included:** 
  - Baseline year (Jan-Dec 2025) with monthly aggregates
  - Current monitoring period (Jan 2026 onwards) with trends
  - Comparison: Actual vs baseline (variance analysis)
  - Completeness: % of data collected (target 99%, gaps justified)
- **Generation:** One-click PDF from dashboard (Compliance Officer role)
- **Frequency:** Monthly (for ISO team tracking), formally submitted quarterly to auditor

**Evidence Type 2: Corrective Actions Log**
- **Format:** PDF report, one corrective action per page with full traceability
- **Audience:** External auditor
- **Data Included (per action):**
  - Nonconformity description (what was wrong)
  - Date detected (from alert or review)
  - Root cause analysis (why it happened)
  - Corrective action taken (what we did)
  - Implementation date (when action started)
  - Effectiveness verification (before/after data, success criteria met?)
  - Follow-up date (when we'll check it hasn't regressed)
- **Traceability:** Every action linked to baseline data, engineer notes, and outcome
- **Frequency:** Monthly review (rolling 12-month window shown to auditor)

**Evidence Type 3: EnPI Performance Report**
- **Format:** PDF with charts showing trends
- **Audience:** External auditor, internal management
- **Data Included:**
  - Five key EnPIs (consumption/unit, cost/unit, peak demand, efficiency ratio, emissions)
  - Baseline values (from 2025)
  - Current trends (12-month rolling chart)
  - Target vs actual (are we hitting our goals?)
  - Root causes of variance (if underperforming)
  - Outlook (on track to achieve annual target?)
- **Frequency:** Monthly calculation, quarterly report to management, annual report to auditor

#### ESG / Sustainability Reporting (On-Demand)

**Audience:** Clients (procurement questionnaires), investors (sustainability reports), future government reporting

**Report Type 1: Energy Efficiency Progress (Client ESG Questionnaire)**
- Content: 
  - % energy reduction vs baseline (YTD)
  - CO₂ emissions reduction (Scope 2)
  - Initiatives undertaken (efficiency improvements, equipment upgrades)
  - Outlook (projected reduction by year-end)
- Format: PDF, 2-3 pages, client-friendly
- Data sources: Dashboard EnPI calculations + corrective action log
- Frequency: On-demand (typically requested in Q4 for next year's proposal)

**Report Type 2: Annual Sustainability Report (Internal / Investor)**
- Content:
  - Energy consumption trend (last 3 years)
  - Cost savings achieved (€ and %)
  - CO₂ emissions reduction (kg CO₂ avoided)
  - List of major initiatives (equipment investments, process changes)
  - Commitment to future targets (ISO 50001 renewal, new reduction goals)
- Format: PDF (executive summary) + dashboard link (detailed data)
- Frequency: Annual (year-end or fiscal year close)

**Report Type 3: Government Energy Ministry (Potential Future Requirement)**
- Content (placeholder for potential requirement):
  - Actual consumption (kWh)
  - Baseline consumption (kWh)
  - Reduction % (15% target)
  - Initiatives (list of corrective actions with costs)
  - Projected future savings
- Format: Excel/CSV export (government standard)
- Frequency: Annual (if requirement enacted)

#### Data Sharing with External Parties

**External Auditors (ISO 50001)**
- Access: Read-only, limited to compliance data (baseline, EnPIs, corrective actions)
- Duration: 1 week (during audit, July 15-21)
- Authentication: Temporary guest account (auto-revokes after 1 week)
- Audit Trail: All auditor access logged and reviewed post-audit
- Data exported: PDF reports + dashboard screenshots (not raw data export)

**Clients (ESG Questionnaires)**
- Access: None (they receive PDF reports only, no direct dashboard access)
- Data shared: Energy reduction %, CO₂ savings, initiatives (not detailed consumption)
- Frequency: On-demand, typically Q4 for RFP responses

**Government (If Energy Ministry Reporting Required)**
- Access: None (data submitted via annual Excel/API)
- Data shared: Aggregated consumption, reduction %, initiatives
- Frequency: Annual (if requirement enacted)
- Security: Data encrypted, submitted via secure channel

**Internal Board / Executive:**
- Access: Dashboard + monthly PDF report
- Data visible: Energy cost, savings vs budget, trend, risk alerts
- Frequency: Monthly board meeting

---

### Implementation Considerations & Timeline

#### Critical Path Dependencies

**Must be completed for ISO 50001 audit (July 15, 2026):**
1. ✅ Energy baseline established and verified (done: Dec 2025)
2. ✅ Continuous monitoring active (must be: January 2026 MVP launch)
3. ✅ 6+ months of historical data collected (April 2026, 3 months before audit)
4. ✅ All staff trained on dashboard (by May 2026, 2 months before audit)
5. ✅ Audit-readiness checklist completed (by July 1, 2026)
6. ✅ Pre-audit review with external auditor (June 28, 2026)

**If MVP delayed beyond January 31:**
- Historical data collection period shortened
- Audit preparation timeline compressed
- Risk of missing ISO 50001 deadline increases exponentially
- Recommendation: MVP launch by January 31, 2026 (absolute deadline)

#### Phase-Based Compliance Implementation

**MVP (Weeks 1-4, January 2026):**
- ✅ Real-time data collection (no data loss)
- ✅ Baseline display (reference baseline, not yet verified)
- ✅ Basic alerts (5-level hierarchy, safety-critical only)
- ✅ Simple audit logging (who accessed when)
- ✅ Role-based access (4 roles)
- ❌ EnPI calculations (deferred to Phase 2)
- ❌ Corrective action workflow (deferred to Phase 2)

**Phase 2 (Weeks 5-8, February-March 2026):**
- ✅ EnPI calculations (baseline vs actual, trend tracking)
- ✅ Corrective action workflow (issue → action → verification)
- ✅ Advanced audit logging (what changed, before/after values)
- ✅ Multi-site comparison (Tunis vs Sfax)
- ✅ PDF report generation (ISO 50001 evidence)
- ✅ Training mode (simulated alerts for onboarding)
- ❌ ESG reporting (deferred to Phase 3)

**Phase 3 (Weeks 9-12, April-May 2026):**
- ✅ ESG reporting (CO₂, efficiency gains, client-ready)
- ✅ Heatmaps & anomaly detection (pattern recognition)
- ✅ Compliance checklist (automated, shows audit readiness %)
- ✅ Data export controls (approval workflow for sensitive exports)
- ✅ Advanced access control (time-limited guest accounts)

**Pre-Audit (Weeks 13-16, June 2026):**
- ✅ Final audit readiness review
- ✅ Data quality verification
- ✅ Staff competence confirmation
- ✅ Dry-run audit (internal team plays auditor role)
- ✅ External auditor pre-audit meeting (June 28)

---

**Domain Requirements Summary:**

Your product must be **ISO 50001-compliant from day one** (not bolted on later). This means:
- Real-time data collection with high integrity
- 24-month data retention
- Comprehensive audit logging
- Role-based access control
- Clear energy baseline and EnPI tracking
- Corrective action traceability
- Automated compliance reporting

These are not "nice-to-haves"—they're **mandatory for business success** in the industrial energy management domain. The July 2026 ISO 50001 deadline creates a hard timeline constraint that must be managed carefully.

---

## � Web Application-Specific Requirements

### Application Architecture

**Single Page Application (SPA) with Real-Time Reactivity**

The Indusmind dashboard is architected as a modern SPA using Vue 3's Composition API and Pinia state management. This choice is **critical for the <5-second refresh requirement** on critical metrics. Traditional multi-page applications cannot achieve the sub-5-second alert latency needed for operator incident prevention.

**Architectural Pattern:** Event-driven SPA with WebSocket pub/sub

- Real-time metrics pushed from backend via WebSocket (not polled)
- Vue 3 reactive state updates propagate to UI in <100ms (WebSocket latency + Vue reactivity typically 50-150ms)
- Pinia store maintains single source of truth for energy metrics, alerts, and user state
- Vite build process provides <100ms HMR for developer experience
- ES2020+ JavaScript with TypeScript strict mode for type safety

### Browser Support & Device Compatibility

**Minimum Target:**
- Chrome 90+ (2021), Firefox 88+, Safari 14+, Edge 90+
- Mobile browsers: Chrome/Safari on iOS 14+, Android 10+
- Excluded: Internet Explorer (EOL as of June 2022)

**Justification:** Industrial operators use smartphones and tablets for field triage. Modern browser APIs required:
- WebSocket (for real-time metrics)
- CSS Grid/Flex (responsive design on 5" phones to 27" monitors)
- CSS Logical Properties (i18n readiness)
- Local Storage (offline mode for 15-minute caching)
- Service Worker API (PWA capability for offline access)

### Real-Time Data Streaming

**WebSocket Implementation (Critical)**

The <5-second critical metric refresh requirement mandates WebSocket instead of traditional polling:

| Metric | Polling (1s interval) | WebSocket Push | Requirement |
|--------|------|------|---|
| Message overhead | 1 req/sec × 50 bytes header = 50 bytes/sec per user | 1 connection × ~5KB handshake, then 50 bytes per event | Critical: <5s |
| Latency | 500-1000ms (varies) | <200ms (typical) | Operator alert detection |
| Concurrent Users | N users = N connections (exhausts server) | N users = N connections (optimized, multiplexed) | 100+ users |
| Scalability | ~10 users per server core | ~100+ users per server core | Cost efficiency |

**Implementation Details:**
- Client: Vue 3 WebSocket composable with auto-reconnect (exponential backoff: 1s → 2s → 4s → max 30s)
- Server: Socket.IO or ws.js library with pub/sub channels per facility/site
- Payload: JSON, ~200 bytes per metric update (metric_name, value, timestamp, status)
- Heartbeat: Client sends keep-alive every 30s, server responds within 5s (detects dead connections)
- Fallback: HTTP long-polling if WebSocket unavailable (e.g., corporate proxy restrictions)

**Data Flow:**
1. SCADA/Modbus → InfluxDB/TimescaleDB (ingestion, <1s)
2. Time-Series DB → Alert Engine (detection, <2s)
3. Alert Engine → WebSocket Server (broadcast, <1s)
4. WebSocket Server → Vue 3 State (Vue reactivity, <100ms)
5. Vue 3 State → DOM Rendering (Vue 3 virtual DOM diff, <100ms)
6. **Total Latency: <5 seconds**

### Performance Targets

**Core Web Vitals (Google Lighthouse Standards):**

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint (FCP) | <1.5s | Quick initial dashboard load |
| Largest Contentful Paint (LCP) | <2.5s | Charts and gauge components load quickly |
| Cumulative Layout Shift (CLS) | <0.1 | Prevents alert list re-layouts that distract operators |
| First Input Delay (FID) | <50ms | Instant response to alert clicks/filters |
| Time to Interactive (TTI) | <3.5s | Full dashboard interactivity within 3.5s |

**Optimization Strategies:**
- Code splitting: Lazy-load Energy Analyzer, Compliance Report modules (not needed on initial load)
- Image optimization: SVG icons (scale infinitely), WebP gauge background images
- Font optimization: System font stack + fallback (no Google Fonts API call)
- Vendor library tree-shaking: Chart.js modules, date-fns utility functions
- Caching strategy: IndexedDB for 24 hours of historical metric data (reduces API calls)

### Responsive Design

**Breakpoints (Tailwind CSS):**

| Breakpoint | Device | Use Case |
|-----------|--------|----------|
| 320px (sm) | iPhone SE / Android | Field triage, SMS alert confirmation |
| 640px (md) | iPhone 12/13 | Secondary operator phone, detail view |
| 1024px (lg) | iPad / 2-monitor operator station | Primary dashboard, side-by-side charts |
| 1280px (xl) | Dual-monitor operator workstation | Full real-time monitoring (2 columns) |

**Layout Strategy:**
- **Mobile-first cascading:** Base styles for 320px, progressively enhance
- **Touch-optimized:** Alert buttons ≥48px tall, swipe gestures for chart navigation
- **Desktop-enhanced:** Keyboard shortcuts (Ctrl+R = refresh, Ctrl+E = export), hover tooltips
- **Gauge design:** Responsive SVG viewBox (scales perfectly 320-1920px)

### Accessibility (WCAG 2.1 Level AA)

Industrial operators span ages 28-55 with varying technical comfort. Accessibility is **business critical**, not compliance checkbox:

**Color Contrast:**
- All text ≥4.5:1 contrast ratio (AA standard)
- Alert status indicators not color-only: use icons + color (red alert = red + ⚠️ icon)
- Color-blind safe palette: No red-green combos without additional indicators

**Keyboard Navigation:**
- Full keyboard control: Tab through sidebar → main charts → alert list → action buttons
- Keyboard shortcuts: Ctrl+1/2/3 = facility filters, Ctrl+E = export, Ctrl+A = acknowledge all alerts
- Skip links: "Skip to main content" for screen readers

**Screen Reader Support:**
- ARIA labels on all interactive elements: `<button aria-label="Acknowledge alert for Pump A7">`
- Chart descriptions: Table summary accessible to screen readers (alternative to chart visualization)
- Form labels: `<label for="facility-select">Select Facility</label>` (not placeholder-only)

**Motion & Animation:**
- Respect `prefers-reduced-motion` media query: Disable gauge spin animations for accessibility
- Alert toast notifications auto-dismiss after 10s for screen readers (doesn't trap users)

### Search Engine Optimization (SEO)

**Not Required for Product Dashboard**

The Indusmind dashboard is an **internal B2B web application behind authentication**. SEO is not applicable:
- No public URLs indexed by Google (requires login)
- No landing page optimization needed (product is for existing customers)
- No keyword targeting or organic search strategy

**Optional:** If a public marketing landing page exists (separate from dashboard), standard practices apply (meta tags, structured data, performance optimization).

### Progressive Web App (PWA) Readiness

**Offline-First Capability (Phase 2 Enhancement)**

While MVP is online-only, architecture supports offline PWA:

- Service Worker: Cache app shell (HTML/CSS/JS) on first load
- IndexedDB: Cache 24 hours of metric history locally
- Offline Mode: Display cached metrics, queue alerts for sync
- Sync API: Batch upload queued actions when connectivity returns

**Implementation Triggers (Phase 2):**
- Operators work in areas with poor WiFi (warehouse, outdoor equipment)
- Field engineers need 2-hour offline diagnosis capability before connectivity restored
- Requirement: <500KB app shell + <5MB IndexedDB for 24-hour cache

---

#
## 
## Functional Requirements

### Real-Time Energy Monitoring

- **FR1:** Operators can view instant power consumption (kW) for monitored equipment with <5-second refresh
- **FR2:** Operators can view cumulative energy consumption (kWh) for current day, week, month
- **FR3:** Operators can view power factor (PF) for overall facility and per-phase
- **FR4:** Operators can view voltage and current per electrical phase (L1, L2, L3)
- **FR5:** Operators can view cost-per-hour based on current consumption and tariff rates
- **FR6:** Operators can view system status indicator (Normal / Warning / Critical)
- **FR7:** Operators can select which site/facility to monitor (Site A, Site B, All Sites)
- **FR8:** Operators can see last update timestamp to verify data freshness

### Alert Management & Notification

- **FR9:** System can detect energy consumption anomalies exceeding configured thresholds within 30 seconds
- **FR10:** System can classify alerts into 6 severity levels (Critical, High, Medium, Low, Info, Maintenance)
- **FR11:** Operators can view list of active alerts sorted by severity and timestamp
- **FR12:** Operators can filter alerts by status (All, Unhandled, Acknowledged, Resolved)
- **FR13:** Operators can filter alerts by severity level
- **FR14:** Operators can search alerts by equipment name, alert type, or timestamp range
- **FR15:** Operators can acknowledge individual alerts with timestamp and user attribution
- **FR16:** Operators can acknowledge multiple alerts in bulk
- **FR17:** Operators can add comments to alerts for audit trail and shift handoff
- **FR18:** Engineers can assign alerts to specific users for investigation
- **FR19:** Operators can receive SMS notifications for critical-severity alerts
- **FR20:** Operators can configure quiet hours to suppress non-critical notifications
- **FR21:** Operators can view alert event timeline (detected  acknowledged  resolved)
- **FR22:** System can display related equipment metrics at time of alert detection

### Equipment Inventory Management

- **FR23:** Admins can register equipment with metadata (name, type, location, rated power, voltage)
- **FR24:** Admins can edit equipment specifications and configuration
- **FR25:** Admins can deactivate equipment no longer monitored
- **FR26:** Users can search equipment by name, ID, type, or location
- **FR27:** Users can filter equipment by type, site, operational status, or criticality level
- **FR28:** Users can view equipment photo or fallback icon
- **FR29:** Users can view last reading timestamp for equipment
- **FR30:** Users can view maintenance history for equipment
- **FR31:** Users can view active alerts assigned to specific equipment

### Historical Data Analysis

- **FR32:** Engineers can query historical energy data for any 24-month period (ISO 50001 retention)
- **FR33:** Engineers can select multiple metrics to overlay on time-series chart (power, voltage, PF, cost)
- **FR34:** Engineers can choose data resolution (1-minute, 15-minute, 1-hour, 1-day aggregation)
- **FR35:** Engineers can zoom and pan on historical charts for detailed investigation
- **FR36:** Engineers can annotate timeline with alert events for correlation analysis
- **FR37:** Engineers can export historical data to CSV or Excel with custom date ranges
- **FR38:** Engineers can view equipment efficiency trends over custom time periods

### Energy Performance Indicators (EnPI) & KPI Tracking

- **FR39:** Managers can define custom Energy Performance Indicators per ISO 50001 requirements
- **FR40:** Managers can set target values for each EnPI
- **FR41:** Users can view current EnPI values with progress toward targets
- **FR42:** Users can view EnPI status (On Track, At Risk, Off Track)
- **FR43:** Users can view 30-day EnPI trend via sparkline charts
- **FR44:** System can calculate EnPI values automatically on daily schedule
- **FR45:** Managers can manually trigger on-demand EnPI recalculation
- **FR46:** Managers can track energy baseline as required by ISO 50001
- **FR47:** Managers can compare actual consumption vs baseline with variance calculation

### Cost Tracking & Billing

- **FR48:** Managers can view daily, monthly, and yearly energy costs
- **FR49:** Managers can view cost breakdown by tariff zone (Peak, Off-Peak, Night)
- **FR50:** Managers can view projected monthly cost based on current consumption trends
- **FR51:** Managers can compare current period cost vs previous period
- **FR52:** Managers can track energy savings vs baseline (15% target tracking)
- **FR53:** Managers can view phased savings achievement (M6: 3-5%, M12: 8-10%, M18: 15%)
- **FR54:** Managers can export monthly billing summaries to PDF

### Compliance & Reporting (ISO 50001)

- **FR55:** Compliance officers can generate ISO 50001 compliance reports (energy baseline, EnPI, corrective actions)
- **FR56:** Compliance officers can schedule automated monthly compliance reports
- **FR57:** Compliance officers can download saved reports from report library
- **FR58:** Admins can track corrective action lifecycle (issue  action  verification  closure)
- **FR59:** Admins can link corrective actions to specific alerts or energy anomalies
- **FR60:** Admins can view corrective action status (Open, In Progress, Verified, Closed)
- **FR61:** System can generate PDF reports with compliance evidence for ISO 50001 audits
- **FR62:** System can generate ESG (Environmental, Social, Governance) reports on-demand

### User Management & Access Control

- **FR63:** Admins can create user accounts with email invitation
- **FR64:** Admins can assign users to one of 6 RBAC roles (Operator, Engineer, Manager, Admin, Maintenance, Compliance)
- **FR65:** Admins can edit user profile information (name, email, phone, role)
- **FR66:** Admins can deactivate user accounts
- **FR67:** Users can upload and update profile photo
- **FR68:** Users can change password
- **FR69:** Admins can configure alert thresholds per equipment (kW, voltage, PF limits)
- **FR70:** Admins can configure alert escalation rules (auto-escalate if unacknowledged after X minutes)
- **FR71:** Admins can view audit log of all user actions (ISO 50001 requirement)
- **FR72:** Admins can view active user sessions (device, last activity, IP address)
- **FR73:** Admins can revoke user sessions remotely (force logout)

### Display & Personalization

- **FR74:** Users can toggle between Light and Dark theme
- **FR75:** Users can configure notification preferences (Email, SMS, In-App, Push)
- **FR76:** Users can select which alert severities trigger notifications
- **FR77:** Users can customize dashboard widget layout (drag-and-drop)
- **FR78:** Operators can view simplified real-time gauges for shift monitoring
- **FR79:** Engineers can view detailed 3-phase power quality metrics (voltage, current, PF per phase)

### Multi-Site Coordination (Phase 2)

- **FR80:** Managers can view consolidated metrics across all sites (total power, total cost, total alerts)
- **FR81:** Managers can compare energy performance between sites
- **FR82:** Managers can view unified alert feed from all sites with site labels
- **FR83:** Managers can filter global view by specific sites

### Security & Audit (ISO 50001 Compliance)

- **FR84:** System can log all user login attempts (successful and failed) with timestamp, IP, device
- **FR85:** System can log all data modifications with user attribution (who, what, when, why)
- **FR86:** System can log all alert acknowledgments and comments with full audit trail
- **FR87:** Admins can configure password complexity policy (length, special characters, expiry)
- **FR88:** Admins can configure session timeout (auto-logout after X minutes inactivity)
- **FR89:** Admins can restrict access by IP whitelist (optional)
- **FR90:** System can encrypt sensitive data in transit (TLS) and at rest (database encryption)

---
## Non-Functional Requirements

### Performance

Real-time energy monitoring is the core differentiator. Performance directly impacts operator ability to detect anomalies.

- **NFR1:** Dashboard initial load: <2.5 seconds (Largest Contentful Paint)
- **NFR2:** Real-time metric refresh: <5 seconds (critical metrics: power, alerts)
- **NFR3:** Alert detection latency: <30 seconds from anomaly to notification
- **NFR4:** Historical data query response: <3 seconds for 30-day period, 15-min resolution
- **NFR5:** User action response time: <1 second (click to acknowledgment)
- **NFR6:** Chart rendering (100 data points): <500ms
- **NFR7:** API response time (95th percentile): <200ms under normal load
- **NFR8:** API response time (95th percentile): <500ms under peak load

### Security

ISO 50001 compliance and industrial data sensitivity require strict controls.

- **NFR9:** All data in transit: TLS 1.3 encryption (HTTPS enforced)
- **NFR10:** Sensitive data at rest: AES-256 encryption in database
- **NFR11:** Authentication: MFA for admin/compliance users
- **NFR12:** Password policy: 12+ chars, complexity, 90-day expiry
- **NFR13:** Session security: Auto-logout 30min inactivity, HTTP-only cookies
- **NFR14:** API authentication: OAuth 2.0 with 1-hour token expiry
- **NFR15:** Audit logging: All actions logged (user/timestamp/IP)
- **NFR16:** RBAC enforcement: At API layer, not just UI
- **NFR17:** Sensitive field masking: IP addresses, passwords not in logs
- **NFR18:** Security scanning: Weekly OWASP Top 10 automated scan
- **NFR19:** Penetration testing: Annual third-party test

### Scalability

Multi-site support (Phase 2) and growth from 12 to 100+ concurrent users.

- **NFR20:** Support 100+ concurrent users per facility, <5% degradation
- **NFR21:** Ingest 1,000 energy readings/minute (Modbus polling)
- **NFR22:** Database query performance: <1 second for <1M records
- **NFR23:** 24-month historical data without degradation (archive strategy)
- **NFR24:** Concurrent report generation for 5+ users without blocking
- **NFR25:** API rate limiting: 100 req/min per user, 200/min burst
- **NFR26:** WebSocket connections: 500+ concurrent per server

### Reliability & Availability

ISO 50001 audit readiness and production stability.

- **NFR27:** System availability: 99.5% uptime SLA (<4.4 hours downtime/year)
- **NFR28:** Data durability: Zero data loss (append-only audit logs)
- **NFR29:** Backup strategy: Daily automated, 30-day retention, monthly off-site
- **NFR30:** Recovery Time Objective (RTO): <15 minutes from infrastructure failure
- **NFR31:** Recovery Point Objective (RPO): <5 minutes data loss tolerance
- **NFR32:** Monitoring & alerting: Database/API/WebSocket/disk space alerts
- **NFR33:** Health check endpoint: Response within 1 second
- **NFR34:** Error handling: Graceful degradation (cached data if real-time unavailable)
- **NFR35:** Circuit breaker: Modbus timeout 30s with exponential retry backoff

### Integration

Modbus protocol and future integrations.

- **NFR36:** Modbus TCP/RTU: Support up to 10 concurrent connections
- **NFR37:** Modbus timeout: 5 seconds, automatic retry with backoff
- **NFR38:** Data validation: Range checks against equipment specs
- **NFR39:** Equipment discovery: New devices available within 60 seconds
- **NFR40:** API versioning: Maintain 2 major versions for 6 months
- **NFR41:** Webhook support (Phase 2): Outbound integrations

### Data Retention & Compliance

ISO 50001 mandate and audit requirements.

- **NFR42:** Energy metrics: Minimum 24-month retention
- **NFR43:** Audit logs: Minimum 12-month retention
- **NFR44:** Alert records: Minimum 24-month retention
- **NFR45:** Corrective actions: Permanent retention
- **NFR46:** Data export: Users export in standard CSV format
- **NFR47:** Data deletion: Only historical >24mo (never delete audit logs)

### Regulatory Compliance

ISO 50001 audit preparation.

- **NFR48:** ISO 50001 evidence: Full traceability reports
- **NFR49:** Energy baseline: Immutable once set (versioned)
- **NFR50:** Corrective action traceability: Issue  action  verification
- **NFR51:** Append-only audit logs: No update/delete (append only)
- **NFR52:** Time synchronization: NTP 1 second accuracy

### Browser & Device Support

Industrial operators use diverse devices.

- **NFR53:** Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **NFR54:** Mobile support: iOS 14+, Android 10+, responsive/touch-optimized
- **NFR55:** Network resilience: Function with 2G fallback (degraded mode)
- **NFR56:** Offline capability (Phase 2): Cache 24-hour data locally

### Bundle Size & Performance

Vue 3 SPA optimization for industrial networks.

- **NFR57:** Initial bundle: <300KB (gzipped)
- **NFR58:** Lazy-loaded route chunks: <50KB each (gzipped)
- **NFR59:** CSS footprint: <20KB (gzipped, Tailwind purge)
- **NFR60:** Chart.js bundle: <40KB (tree-shaken)

---Design Integration Plan

All 16 Stitch design screens mapped to Vue 3 components - implementation-ready specifications.

MVP Screens (10): Dashboard, Real-Time View, Alerts, KPI/EnPI, Billing, History, Inventory, Settings, Reports, Security

Phase 2 (5): Model Analysis, Comparison, Receipt, Global Multi-Site, Power Quality

Component hierarchies, Tailwind patterns, Pinia stores, WebSocket channels, responsive strategies, and accessibility requirements fully documented.

Frontend team ready to implement without additional UX/UI decisions.
## Design Integration Plan

All 16 Stitch design screens mapped to Vue 3 components.

MVP (10 screens): Dashboard, Real-Time, Alerts, KPI, Billing, History, Inventory, Settings, Reports, Security

Phase 2 (5): Model Analysis, Comparison, Receipt, Multi-Site, Power Quality

Phase 3 (1): Equipment Control

Component hierarchies, Tailwind patterns, Pinia stores (10), WebSocket channels, responsive strategies (320px-1920px), WCAG 2.1 AA, performance targets (<300KB bundle, LCP <2.5s) - all fully specified.

Frontend team ready to implement.

---



---# �🏆 Competitor Insights

*(To be completed in Step 9 - Competitive Analysis)*

---

## 📅 Implementation Roadmap

*(To be completed in Step 10 - Phase Planning)*

---

**Document Status:** Initialized - Ready for Step 2 (Discovery Synthesis)
