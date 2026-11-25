import { RequireAuth } from '../../features/auth/RequireAuth';
import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage'));

const AnalysisPage = lazy(() => import('../../pages/analysis/AnalysisPage'));

const ExperimentsPage = lazy(() => import('../../pages/experiments/ExperimentsPage'));

const HistoryPage = lazy(() => import('../../pages/history/HistoryPage'));

const AccountPage = lazy(() => import('../../pages/account/AccountPage'));

const NotFoundPage = lazy(() => import('../../pages/not-found/NotFoundPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="experiments" element={<ExperimentsPage />} />
          <Route element={<RequireAuth />}><Route path="history" element={<HistoryPage />} /></Route>

          <Route path="account" element={<Navigate to="/login" replace />} />

          <Route path="login" element={<AccountPage />} />
          <Route path="register" element={<AccountPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
