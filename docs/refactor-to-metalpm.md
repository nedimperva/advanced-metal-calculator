# Construction Management Refactor Plan → Align Functionality with `MetalPM`

This plan refactors the current construction management domain to match `MetalPM` functionality, while preserving the existing UI design and routing. It focuses on data model alignment, IndexedDB persistence, context/state management, feature parity across projects, tasks, materials, dispatch, workforce, timeline, and reporting. Work is phased for safe rollout.

---

## Objectives
- Keep the current visual design and components.
- Make functionality equivalent to `MetalPM` (data models, flows, persistence, utilities).
- Avoid breaking routes: keep `app/management` as the primary entry.
- Use `lib/database.ts` IndexedDB schema and operations as the single source of truth.

---

## High-Level Architecture Alignment
- Data models: Use interfaces and enums from `lib/types.ts` used by `MetalPM` features (Projects, Materials, Tasks, Workforce, Dispatch, Timesheets).
- Persistence: Use `lib/database.ts` (IndexedDB) with stores defined in `STORES` and versioning.
- State: Use contexts in `contexts/` (`project-context.tsx`, `task-context.tsx`, `material-catalog-context.tsx`, `calculation-context.tsx`) with reducers where applicable.
- Utilities: Reuse `lib/project-utils.ts`, `lib/task-utils.ts`, `lib/work-log-utils.ts`, `lib/dispatch-materials-sync.ts`, etc., for computations and validations.
- Pages: Keep `app/management/page.tsx` as the orchestration surface (tabs: Projects, Materials, Dispatches, Workforce, Timeline/Tasks, Journal/Reports).

---

## Phase 0 — Assessment & Guardrails
- Verify `lib/types.ts` contains all interfaces required by `MetalPM` stores and operations.
- Verify `lib/database.ts` is v9 with all stores: projects, calculations, projectMaterials, projectTasks, projectMilestones, dailyWorkLogs, workEntries, workers, machinery, projectAssignments, dailyTimesheets, dispatchNotes, dispatchMaterials, materialCatalog, materialTemplates, materialStock, materialStockTransactions, settings.
- Ensure `contexts` are initialized on app mount via `app/layout.tsx` provider tree.
- Confirm `app/management/page.tsx` tabs already load the right feature surfaces.

---

## Phase 1 — Data Model Parity
- Update `lib/types.ts` to include (if missing):
  - `Project`, `ProjectMaterial`, `ProjectTask`, `DailyWorkLog`, `WorkEntry`, `Worker`, `Machinery`, `ProjectAssignment`, `DailyTimesheet`, `DispatchNote`, `DispatchMaterial`, `MaterialCatalog`, `MaterialTemplate`, `MaterialStock`, `MaterialStockTransaction`, and associated enums (`ProjectStatus`, `MaterialStatus`, `ProjectMaterialStatus`, `ProjectMaterialSource`, `DispatchStatus`, `DispatchMaterialStatus`, `TaskStatus`, `TaskType`, `TaskPriority`).
- Add cross-references: calculations reference `projectId?`, project materials reference `calculationId`, assignments reference `projectId`, etc.
- Validate schemas with `lib/validation.ts` where needed.

Deliverables:
- `lib/types.ts` aligned with `MetalPM` models.

Status: ✅ Completed (added milestones; verified `Calculation.projectId`; added `DispatchMaterial.materialCatalogId`).

---

## Phase 2 — Persistence & Migration
- Ensure `lib/database.ts` initializes all `STORES` and composite indexes used by queries (status, projectId, timestamps, etc.).
- Implement force-upgrade utility when schema changes (`forceDbUpgrade`).
- Migrate any legacy localStorage usage in materials/dispatch (e.g., `contexts/material-context.tsx`) to use IndexedDB via `lib/database.ts` operations.
- Verify exports/imports: `exportDatabase`, `importDatabase` for backup/restore.

Deliverables:
- All CRUD functions for Projects, Materials, Tasks, Dispatch, Workforce operating through IndexedDB.
- Removed localStorage fallbacks in contexts; replaced by IndexedDB queries.

Status: ✅ Completed for materials/dispatch (migrated `contexts/material-context.tsx` to IndexedDB). DB stores verified.

---

## Phase 3 — Contexts & State Management
- Projects: `contexts/project-context.tsx`
  - Use `initializeDatabase()` on mount.
  - Use `dbGetAllProjects`, `dbCreateProject`, `dbUpdateProject`, `dbDeleteProjectCascade`.
  - Maintain `currentProject`, filters, sorting, statistics (`calculateProjectStatistics`).
  - Maintain `projectMaterials` cache per project.
- Tasks: `contexts/task-context.tsx`
  - CRUD via `createTask`, `updateTask`, `deleteTask`, `getProjectTasks`, `getAllTasks`.
  - Sorting/filtering via `lib/task-utils.ts`.
- Materials Catalog: `contexts/material-catalog-context.tsx`
  - Load `MaterialCatalog`, `MaterialTemplates` from DB.
- Calculations: `contexts/calculation-context.tsx`
  - Ensure `projectId` linkage and loading from DB.
- Materials/Dispatch: unify into DB flows (`dispatchNotes`, `dispatchMaterials`, and `projectMaterials`).

Deliverables:
- Contexts read/write via DB. No lingering direct localStorage usage.

Status: ✅ Completed (Projects/Tasks already DB-backed; Materials/Dispatch now DB-backed and unified with contexts).

---

## Phase 4 — Feature Parity by Surface

1) Projects (tab: Projects)
- `components/project-dashboard.tsx` and `components/mobile-project-dashboard.tsx` should:
  - List projects with status filters (`PROJECT_STATUS_LABELS`).
  - Create/edit projects via `ProjectCreationModal` and `EditProjectModal`.
  - Select a `currentProject` that persists across tabs.
- `components/unified-project-details.tsx` should:
  - Show project summary with `getProjectSummary(projectId)` (projects, materials, tasks, timesheets, dispatch notes).
  - Provide actions to add materials, tasks, and view timeline/dispatch.

2) Materials (tab: Materials)
- `components/material-stock-management.tsx` should:
  - Use `MATERIAL_STOCK` and `MATERIAL_STOCK_TRANSACTIONS` stores.
  - Support in/out transactions, current stock, and project allocations.
- `components/material-catalog-browser.tsx` and `components/material-selector.tsx`:
  - Browse catalog and templates, add to project (creates `ProjectMaterial`).

3) Dispatches (tab: Dispatches)
- `components/dispatch-manager.tsx` and `components/dispatch/`:
  - Create/manage `DispatchNote` linked to `projectId` with `DispatchMaterial` entries referencing `ProjectMaterial`.
  - Track statuses and dates; integrate with stock allocation when dispatched/arrived.

4) Workforce (tab: Workforce)
- `components/global-workers.tsx`, `components/global-machinery.tsx`, `components/workforce-management.tsx`, `components/workforce-overview.tsx`:
  - Manage workers/machinery and assignments to projects.
  - Track time via `DailyTimesheet` and work entries.

5) Timeline & Tasks (tab: Timeline/Tasks)
- `components/tasks/*` and `lib/timeline-events.ts` / `lib/timeline-storage.ts`:
  - Ensure tasks are persisted in DB and timeline events tie to `projectId`.
  - Critical path, dependencies via `lib/task-utils.ts`.

6) Journal & Reports
- `components/daily-journal.tsx` + `lib/work-log-utils.ts`:
  - Daily journal entries per project.
- Exports/Reports via `exportProjectData` and `generateProjectReport` in `lib/project-utils.ts`.

Deliverables:
- Each surface wired to DB and contexts using `MetalPM`-like flows.

Status: ✅ Dispatch surfaces updated (create/edit/status, "Sync now"). ✅ Materials tab shows DB-backed stock (including dispatch-linked), reservations, and history. 🔶 Remaining: wire task completion to auto-mark related project materials installed (affects stock OUT flow).

---

## Phase 5 — Data Sync and Cross-Domain Operations
- When `DispatchMaterial` status is updated to ARRIVED, create stock IN transaction.
- When project allocates material, create stock OUT reservation, reduce available quantity.
- When task is completed requiring materials, mark corresponding `ProjectMaterial` as installed and synchronize status.
- When workforce timesheet is logged, update project statistics and cost summaries.

Deliverables:
- Cohesive flows across dispatch, materials, stock, tasks, and cost metrics.

Status: ✅ On ARRIVED: creates stock IN and reserves against selected catalog material; updates existing catalog stock when `materialCatalogId` present. ✅ Manual assign creates RESERVED transactions. 🔶 Partial: OUT/unreserve on INSTALL is implemented in service, pending UI trigger via tasks/materials workflow.

---

## Phase 6 — Performance & Stability
- Use `getProjectSummary` to batch load project dashboard.
- Add composite indexes where high-cardinality queries exist.
- Handle DB versioning upgrades via `onupgradeneeded` and `forceDbUpgrade` helper.
- Add defensive error handling with toasts and fallbacks in contexts.

Deliverables:
- Smooth UX with IndexedDB-backed features.

---

## Phase 7 — Migration Steps
- Identify any legacy data in localStorage for dispatch/materials; write one-time migration to IndexedDB.
- Provide export/import (JSON) UI for backup and verification.
- Ensure all date fields are serialized/deserialized consistently.

---

## File-by-File Instructions (Edits Only)

- `app/layout.tsx`
  - Ensure providers wrap the tree: `I18nProvider`, `ProjectProvider`, `TaskProvider`, `MaterialCatalogProvider`, `CalculationProvider`.

- `app/management/page.tsx`
  - Keep design and tabs. Ensure handlers call context actions (select project, create/edit, navigate tabs) and pass `currentProject` to detail views.

- `contexts/project-context.tsx`
  - Replace any non-DB reads with `initializeDatabase`, `dbGetAllProjects`, `dbCreateProject`, `dbUpdateProject`, `dbDeleteProjectCascade`.
  - Cache `projectMaterials` per project with `getProjectMaterials(projectId)`.

- `contexts/task-context.tsx`
  - Confirm reducer and actions call DB functions and derive views with `task-utils`.

- `contexts/material-context.tsx`
  - Remove localStorage reads. Load and persist via DB operations for `DispatchNote`/`DispatchMaterial` and project materials.

- `components/dispatch-manager.tsx` and `components/dispatch/*`
  - Wire CRUD to DB operations; integrate with stock transactions and project materials.

- `components/material-stock-management.tsx`
  - Query `MATERIAL_STOCK` and `MATERIAL_STOCK_TRANSACTIONS`, provide in/out flows.

- `components/project-dashboard.tsx` / `components/mobile-project-dashboard.tsx`
  - Use `getProjectSummary` for fast aggregation. Keep UI; connect actions to context.

- `components/unified-project-details.tsx`
  - Read summary from context/DB; show materials, tasks, dispatch, and timesheets linked to `currentProject`.

- `lib/database.ts`
  - Verify stores, indexes, and CRUD exist for all domains. Add missing composite indexes for filters used in UI.

- `lib/project-utils.ts`, `lib/task-utils.ts`, `lib/work-log-utils.ts`, `lib/dispatch-materials-sync.ts`
  - Ensure helper functions match DB models (IDs, statuses) and are used by contexts and components.

---

## Acceptance Criteria Checklist
- Projects: create/edit/select/list with filters and statistics; data persisted in IndexedDB.
- Materials: project materials, catalog, templates, and stock with transaction history.
- Dispatch: notes and materials linked to projects; statuses update stock on arrival.
- Tasks: CRUD with dependencies, sorting, filtering, and progress metrics.
- Workforce: workers/machinery CRUD; assignments and daily timesheets.
- Timeline/Journal: per-project events and daily logs persisted.
- Export/Import: project-level and global JSON working.
- Performance: summary loads use batched queries; no blocking UI.

---

## Rollout Strategy
- Implement feature-by-feature behind a runtime flag in contexts (if needed) to flip from legacy to IndexedDB-backed functions.
- Migrate data once per user using a `migration-service` to avoid regressions.
- Smoke test each tab after wiring to DB and contexts.

---

## Notes
- UI stays the same; only data flows and behaviors change to match `MetalPM`.
- Follow existing code style and avoid mass reformatting.
- Maintain TypeScript strictness and avoid `any` types.
