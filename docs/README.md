# Documentation Index

> Organized documentation for Indusmind Dashboard project

## 📁 Documentation Structure

```
docs/
├── architecture/     # System architecture and design decisions
├── guides/          # How-to guides and references
├── implementation/  # Feature implementation details
├── phases/          # Project phase documentation
├── reports/         # Status reports and tracking
└── reference/       # Reference materials (design system, frameworks, manifests)
```

---

## 🏗️ Architecture

System design, data architecture, and technical decisions.

- **[ARCHITECTURE-SPEC.md](architecture/ARCHITECTURE-SPEC.md)** - Complete system architecture specification (Sprint 0)
- **[ARCHITECTURE_AUDIT.md](architecture/ARCHITECTURE_AUDIT.md)** - System architecture audit and analysis
- **[MOCK-DATA-ARCHITECTURE.md](architecture/MOCK-DATA-ARCHITECTURE.md)** - Mock data system and data flow for all views
- **[IMPLEMENTATION-ARCHITECTURE-GUIDE.md](architecture/IMPLEMENTATION-ARCHITECTURE-GUIDE.md)** - Architecture patterns and best practices

---

## 📚 Guides

User guides, quick references, and how-to documentation.

- **[QUICK-START-GUIDE.md](guides/QUICK-START-GUIDE.md)** - Get started with the project quickly
- **[QUICK-REFERENCE.md](guides/QUICK-REFERENCE.md)** - Quick reference for common tasks
- **[METER-DATA-EXPORT-GUIDE.md](guides/METER-DATA-EXPORT-GUIDE.md)** - How to export meter data
- **[POWER-HISTORY-VIEWS-IMPLEMENTATION-GUIDE.md](guides/POWER-HISTORY-VIEWS-IMPLEMENTATION-GUIDE.md)** - Power and history views guide
- **[DARK-MODE-TESTING-GUIDE.md](guides/DARK-MODE-TESTING-GUIDE.md)** - Dark mode testing and validation
- **[DOCUMENTATION-ORGANIZATION-GUIDE.md](guides/DOCUMENTATION-ORGANIZATION-GUIDE.md)** - Documentation structure guide

---

## 🔧 Implementation

Feature-specific implementation details and technical specifications.

- **[PUISSANCE-VIEW-ENHANCEMENT.md](implementation/PUISSANCE-VIEW-ENHANCEMENT.md)** - Puissance view enhancements
- **[PUISSANCE-UI-DESIGN.md](implementation/PUISSANCE-UI-DESIGN.md)** - Puissance UI design specifications
- **[ENERGY_HISTORICAL_REFACTORING.md](implementation/ENERGY_HISTORICAL_REFACTORING.md)** - Energy historical view refactoring
- **[UX-WORK-PHASES-DOCUMENTATION.md](implementation/UX-WORK-PHASES-DOCUMENTATION.md)** - UX work phases breakdown
- **[FILE-INDEX.md](implementation/FILE-INDEX.md)** - Complete file structure index

---

## 📅 Phases

Project phase documentation, completion summaries, and handoff guides.

- **[BOOTSTRAP-SUMMARY.md](phases/BOOTSTRAP-SUMMARY.md)** - Sprint 0 bootstrap summary
- **[PHASE-1-SPEC.md](phases/PHASE-1-SPEC.md)** - Phase 1 specification (from BMAD)
- **[PHASE-1-IMPLEMENTATION-GUIDE.md](phases/PHASE-1-IMPLEMENTATION-GUIDE.md)** - Phase 1 implementation guide
- **[PHASE-1-COMPLETION-SUMMARY.md](phases/PHASE-1-COMPLETION-SUMMARY.md)** - Phase 1 completion summary
- **[PHASE-2-IMPLEMENTATION-SUMMARY.md](phases/PHASE-2-IMPLEMENTATION-SUMMARY.md)** - Phase 2 implementation summary
- **[PHASE-2-COMPLETION-REPORT.md](phases/PHASE-2-COMPLETION-REPORT.md)** - Phase 2 completion report
- **[PHASE-2-HANDOFF.md](phases/PHASE-2-HANDOFF.md)** - Phase 2 handoff documentation

---

## 📊 Reports

Status reports, tracking documents, and verification reports.

- **[FRONTEND-VIEW-IMPLEMENTATION-STATUS.md](reports/FRONTEND-VIEW-IMPLEMENTATION-STATUS.md)** - Frontend views status
- **[IMPLEMENTATION-STATUS-REPORT.md](reports/IMPLEMENTATION-STATUS-REPORT.md)** - Overall implementation status
- **[SPECIFICATION-VERIFICATION-REPORT.md](reports/SPECIFICATION-VERIFICATION-REPORT.md)** - Spec verification report
- **[DAILY-TIME-TRACKING.md](reports/DAILY-TIME-TRACKING.md)** - Daily time tracking
- **[DOCS-ORGANIZATION-COMPLETE.md](reports/DOCS-ORGANIZATION-COMPLETE.md)** - Documentation organization completion
- **[IMPLEMENTATION-SUMMARY-BMAD.md](reports/IMPLEMENTATION-SUMMARY-BMAD.md)** - Implementation summary (BMAD)
- **[IMPLEMENTATION-COMPLETE-BMAD.md](reports/IMPLEMENTATION-COMPLETE-BMAD.md)** - Implementation complete (BMAD)
- **[COMPLETION-SUMMARY-BMAD.md](reports/COMPLETION-SUMMARY-BMAD.md)** - Completion summary (BMAD)
- **[COMPLETION-REPORT-BMAD.md](reports/COMPLETION-REPORT-BMAD.md)** - Completion report (BMAD)

---

## � Reference Materials

Design systems, frameworks, and technical references.

- **[design-system/](reference/design-system/)** - Design system specifications and patterns
- **[stitch-framework/](reference/stitch-framework/)** - Stitch UI framework documentation
- **[FILES-MANIFEST.md](reference/FILES-MANIFEST.md)** - Complete file structure manifest
- **[EXTRACTION_SUMMARY.md](reference/EXTRACTION_SUMMARY.md)** - Data extraction and migration summary

---

## �🔍 Quick Access

### For Developers
- Start here: [QUICK-START-GUIDE.md](guides/QUICK-START-GUIDE.md)
- Architecture: [ARCHITECTURE-SPEC.md](architecture/ARCHITECTURE-SPEC.md)
- Data architecture: [MOCK-DATA-ARCHITECTURE.md](architecture/MOCK-DATA-ARCHITECTURE.md)
- API integration: `src/services/api.ts` (mock data for MVP)
- Quick reference: [QUICK-REFERENCE.md](guides/QUICK-REFERENCE.md)

### For Project Managers
- Latest status: [IMPLEMENTATION-STATUS-REPORT.md](reports/IMPLEMENTATION-STATUS-REPORT.md)
- Phase 2 handoff: [PHASE-2-HANDOFF.md](phases/PHASE-2-HANDOFF.md)
- Time tracking: [DAILY-TIME-TRACKING.md](reports/DAILY-TIME-TRACKING.md)

### For New Team Members
1. Read [QUICK-START-GUIDE.md](guides/QUICK-START-GUIDE.md)
2. Review [ARCHITECTURE-SPEC.md](architecture/ARCHITECTURE-SPEC.md)
3. Check [MOCK-DATA-ARCHITECTURE.md](architecture/MOCK-DATA-ARCHITECTURE.md) for data flow
4. Browse [FILES-MANIFEST.md](reference/FILES-MANIFEST.md) for codebase structure
5. Check `src/services/api.ts` for API integration (currently mock data)

---

## 📝 Additional Documentation

Detailed phase-by-phase implementation docs remain in `_bmad/docs/`:
- **00-FOUNDATION/** - Initial setup and foundation
- **01-CORE-VIEWS/** - Core dashboard views implementation
- **02-INTERNATIONALIZATION/** - i18n implementation
- **03-PUISSANCE-VIEW/** - Puissance view details
- **04-ENERGY-HISTORY/** - Energy history implementation
- **06-COMPARISON-VIEW/** - Comparison view details
- **10-THERMAL-MANAGEMENT-VIEW/** - Thermal management implementation

Root files:
- **README.md** - Project root README (setup, installation, development)

---

## 🔄 Recent Updates

- **Jan 16, 2026**: Documentation reorganized into structured folders
- **Jan 16, 2026**: Added MOCK-DATA-ARCHITECTURE.md with comprehensive data flow guide
- **Jan 16, 2026**: Created unified mock data system (mockData.ts)

---

## 📞 Contributing

When adding new documentation:
1. Place it in the appropriate folder based on content type
2. Update this index file with a link
3. Use clear, descriptive filenames
4. Follow existing markdown formatting conventions
