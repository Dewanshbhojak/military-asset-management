import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BasesPage } from './pages/BasesPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { TransfersPage } from './pages/TransfersPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ExpendituresPage } from './pages/ExpendituresPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route
              path="/bases"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <BasesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'LOGISTICS_OFFICER']}>
                  <EquipmentPage />
                </ProtectedRoute>
              }
            />

            <Route path="/inventory" element={<InventoryPage />} />

            <Route
              path="/purchases"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'LOGISTICS_OFFICER']}>
                  <PurchasesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transfers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'LOGISTICS_OFFICER']}>
                  <TransfersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/assignments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/expenditures"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
                  <ExpendituresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
