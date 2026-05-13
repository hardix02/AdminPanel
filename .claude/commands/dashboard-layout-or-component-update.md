---
name: dashboard-layout-or-component-update
description: Workflow command scaffold for dashboard-layout-or-component-update in AdminPanel.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /dashboard-layout-or-component-update

Use this workflow when working on **dashboard-layout-or-component-update** in `AdminPanel`.

## Goal

Updates or cleans up dashboard layout and related components, often in response to feature changes or to remove legacy code.

## Common Files

- `frontend/src/layouts/DashboardLayout.tsx`
- `frontend/src/pages/dashboard/Dashboard.tsx`
- `frontend/src/pages/users/Users.tsx`
- `frontend/src/App.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update or remove dashboard layout file(s)
- Update or remove related dashboard/page components
- Update main App entry if necessary

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.