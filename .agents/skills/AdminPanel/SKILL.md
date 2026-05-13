```markdown
# AdminPanel Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill covers the core development patterns and workflows for the **AdminPanel** TypeScript codebase. The repository is organized into backend and frontend folders, with no specific framework detected. It documents conventions for file naming, imports/exports, commit messages, and outlines the main workflows for feature development and UI updates. Use this guide to quickly get up to speed with the project's structure and processes.

## Coding Conventions

### File Naming

- **CamelCase** is used for file names:
  - Example: `algoAccessController.js`, `DashboardLayout.tsx`

### Import Style

- **Relative imports** are preferred:
  ```typescript
  import { getUser } from '../services/userService';
  ```

### Export Style

- **Mixed**: Both named and default exports are used.
  ```typescript
  // Named export
  export function getUser() { ... }

  // Default export
  export default DashboardLayout;
  ```

### Commit Messages

- **Prefixes:** `feat`, `chore`
- **Example:**  
  `feat: add frontend service and types for Algo Access`
- **Average length:** ~86 characters

## Workflows

### Add or Update Algo Access Feature

**Trigger:** When you need to add or modify the Algo Access functionality (API, data model, frontend integration).  
**Command:** `/add-algo-access-feature`

1. **Backend**
   - Create or update the controller:  
     `backend/src/controllers/algoAccessController.js`
   - Update or create the model:  
     `backend/src/models/AlgoAccess.js`
   - Update or add the route:  
     `backend/src/routes/algoAccessRoutes.js`
   - Update backend services as needed (e.g., seed data):  
     `backend/src/services/seedService.js`
2. **Frontend**
   - Update or add the Algo Access page:  
     `frontend/src/pages/AlgoAccess.tsx`
   - Update or add the service for Algo Access:  
     `frontend/src/services/algoAccessService.ts`
   - Update or add the types:  
     `frontend/src/types/algoAccess.ts`
   - Update frontend configuration if needed

**Example: Adding a new API route**
```typescript
// backend/src/routes/algoAccessRoutes.js
const express = require('express');
const router = express.Router();
const { getAlgoAccess } = require('../controllers/algoAccessController');

router.get('/', getAlgoAccess);

module.exports = router;
```

---

### Dashboard Layout or Component Update

**Trigger:** When you want to change the dashboard layout, simplify UI, or remove unused dashboard components.  
**Command:** `/update-dashboard-layout`

1. Update or remove dashboard layout file(s):  
   `frontend/src/layouts/DashboardLayout.tsx`
2. Update or remove related dashboard/page components:  
   `frontend/src/pages/dashboard/Dashboard.tsx`,  
   `frontend/src/pages/users/Users.tsx`
3. Update main App entry if necessary:  
   `frontend/src/App.tsx`

**Example: Removing a legacy component**
```typescript
// frontend/src/pages/dashboard/Dashboard.tsx
// Remove unused import and component
// import LegacyWidget from '../../components/LegacyWidget';

// ...rest of the Dashboard code
```

## Testing Patterns

- **Framework:** Unknown (not detected)
- **Test file pattern:** Files are named with `.test.` in the filename, e.g., `userService.test.ts`
- **Example:**
  ```typescript
  // frontend/src/services/algoAccessService.test.ts
  import { fetchAlgoAccess } from './algoAccessService';

  test('fetchAlgoAccess returns expected data', async () => {
    const data = await fetchAlgoAccess();
    expect(data).toBeDefined();
  });
  ```

## Commands

| Command                   | Purpose                                                        |
|---------------------------|----------------------------------------------------------------|
| /add-algo-access-feature  | Add or update the Algo Access backend and frontend feature      |
| /update-dashboard-layout  | Update or clean up dashboard layout and related components      |
```
