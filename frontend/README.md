# Distributed Military Asset Management System — Frontend

A responsive React & Vite dashboard application built with Tailwind CSS v4, Axios, and React Router v6.

## Features

- **Authentication**: JWT login portal with automatic claim parsing (`userId`, `email`, `role`, `baseId`) and quick seed accounts.
- **API Gateway Routing**: Single endpoint communication via `http://localhost:8080`.
- **Role-Based UI (RBAC)**:
  - `ADMIN`: Full access to Dashboard, Bases, Equipment, Inventory, Purchases, Transfers, Assignments, Expenditures, Audit Logs, and User Management.
  - `BASE_COMMANDER`: Access to assigned base inventory, assignments, expenditures, purchases, and transfers.
  - `LOGISTICS_OFFICER`: Access to inventory, purchase creation, and inter-base transfer execution.
- **Executive Dashboard**: Opening Balance, Net Movement breakdown (Purchases + Transfers In - Transfers Out), Closing Balance, Assigned, Expended, and filters (Base, Equipment).
- **Error & Loading States**: Dedicated components for zero-state data, 401 handling, 403 Access Denied, and 404 Route Not Found.

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build production bundle
npm run build
```

Development server runs on `http://localhost:5173`.
