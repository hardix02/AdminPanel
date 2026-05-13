---
name: add-or-update-algo-access-feature
description: Workflow command scaffold for add-or-update-algo-access-feature in AdminPanel.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-algo-access-feature

Use this workflow when working on **add-or-update-algo-access-feature** in `AdminPanel`.

## Goal

Implements or updates the Algo Access feature, including backend API, models, services, and corresponding frontend pages, services, and types.

## Common Files

- `backend/src/controllers/algoAccessController.js`
- `backend/src/models/AlgoAccess.js`
- `backend/src/routes/algoAccessRoutes.js`
- `backend/src/services/seedService.js`
- `frontend/src/pages/AlgoAccess.tsx`
- `frontend/src/services/algoAccessService.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update backend controller, model, and route for Algo Access
- Update or add backend service logic (e.g., seed data)
- Update frontend page for Algo Access
- Update or add frontend service and types for Algo Access
- Update frontend configuration if needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.