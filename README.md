# Indusmind Energy Dashboard Platform

**Real-time industrial energy monitoring system transforming fragmented data into unified intelligence.**

## 📋 Project Overview

Indusmind is a comprehensive energy dashboard designed for small-to-medium industrial plants. It replaces manual Excel-based tracking with a real-time, automated system to detect anomalies, optimize energy consumption, and ensure ISO 50001 compliance.

**Key Goals:**
- ⚡ **Real-time Monitoring:** <5s refresh rate for critical metrics.
- 🚨 **Intelligent Alerting:** Immediate anomaly detection (vs. hours/days).
- 📉 **Cost Reduction:** Target 15% reduction in energy costs.
- ✅ **Compliance:** Built-in ISO 50001 audit readiness.

## 🚀 Quick Start

For developers setting up the project for the first time:

### Standard Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker Setup
```bash
# Run using the provided batch script (Windows)
start-frontend-local.bat

# OR manually using Docker Compose
docker-compose -f docker-compose.front-local.yml up --build
```

For detailed instructions, please refer to the **[Quick Start Guide](QUICK-START-GUIDE.md)**.

## 🛠️ Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Pinia
- **Visualization:** Chart.js / ApexCharts
- **Real-time:** WebSocket
- **Backend (Mocked in Phase 1):** TypeScript Service Layer

## 📂 Documentation

The project documentation is organized by implementation phases in the `_bmad/docs/` directory.

- **[Documentation Organization Guide](DOCS-ORGANIZATION-COMPLETE.md)** - **Start here** to understand the docs structure.
- **[UX Work Phases](UX-WORK-PHASES-DOCUMENTATION.md)** - Timeline of UX/UI work.

### Phase Documentation
- **Phase 0: Foundation** (`_bmad/docs/00-FOUNDATION/`)
- **Phase 1: Core Views** (`_bmad/docs/01-CORE-VIEWS/`) - *Current Implementation*
- **Phase 2: Internationalization** (`_bmad/docs/02-I18N/`)
- **Phase 3: Puissance View** (`_bmad/docs/03-PUISSANCE-VIEW/`)
- **Phase 4: Energy History** (`_bmad/docs/04-ENERGY-HISTORY/`)
- **Phase 5: Design System** (`_bmad/docs/05-DESIGN-SYSTEM/`)
- **Phase 8: Stitch Framework** (`_bmad/docs/08-STITCH-FRAMEWORK/`)

## 📅 Roadmap & Status

**Current Status:** Phase 1 (Core Views) - ✅ Complete

**Sprint Plan:**
- **Sprint 0-4 (MVP):** Foundation, Real-time Core, Compliance Features.
- **Sprint 5-8 (Phase 2):** Multi-site coordination, Mobile optimization.
- **Sprint 9-10 (Phase 3):** Predictive maintenance.

See the full **[Sprint Plan](_bmad-output/planning-artifacts/sprint-plan.md)** and **[PRD](_bmad-output/planning-artifacts/prd.md)** for details.

## 🏗️ Project Structure

```
indusmind-dashboard/
├── src/
│   ├── components/     # Vue components
│   ├── composables/    # Shared logic (hooks)
│   ├── services/       # API and Mock services
│   ├── stores/         # Pinia state stores
│   ├── views/          # Main page views
│   └── ...
├── _bmad/
│   └── docs/           # Phase-based documentation
└── ...
```

---
*Generated for Indusmind Energy Dashboard Platform*
