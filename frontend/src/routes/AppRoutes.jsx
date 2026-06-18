import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const BeneficiarySelection = lazy(() => import('../pages/public/BeneficiarySelection'));
const Summary = lazy(() => import('../pages/public/Summary'));
const ThankYou = lazy(() => import('../pages/public/ThankYou'));
const AlreadyConfirmed = lazy(() => import('../pages/public/AlreadyConfirmed'));
const SupportRequest = lazy(() => import('../pages/public/SupportRequest'));

const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const Campaigns = lazy(() => import('../pages/admin/Campaigns'));
const Employees = lazy(() => import('../pages/admin/Employees'));
const BeneficiariesAdmin = lazy(() => import('../pages/admin/BeneficiariesAdmin'));
const Gifts = lazy(() => import('../pages/admin/Gifts'));
const Selections = lazy(() => import('../pages/admin/Selections'));
const SupportRequests = lazy(() => import('../pages/admin/SupportRequests'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));

import CampaignWelcome from '../pages/public/CampaignWelcome';
import EmployeeLogin from '../pages/public/EmployeeLogin';
import NotFound from '../pages/NotFound';

const withSuspense = (Component) => (
  <Suspense fallback={<div className="page-wrapper"><div className="page-content container"><div className="card" style={{ textAlign: 'center' }}><p style={{ color: 'var(--gray-500)' }}>Cargando...</p></div></div></div>}>
    <Component />
  </Suspense>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        <Route path="/campaign/:slug" element={<CampaignWelcome />} />
        <Route path="/campaign/:slug/login" element={<EmployeeLogin />} />
        <Route path="/campaign/:slug/select" element={withSuspense(BeneficiarySelection)} />
        <Route path="/campaign/:slug/summary" element={withSuspense(Summary)} />
        <Route path="/campaign/:slug/thank-you" element={withSuspense(ThankYou)} />
        <Route path="/campaign/:slug/already-confirmed" element={withSuspense(AlreadyConfirmed)} />
        <Route path="/campaign/:slug/support" element={withSuspense(SupportRequest)} />

        <Route path="/admin/login" element={withSuspense(AdminLogin)} />
        <Route path="/admin" element={withSuspense(AdminLayout)}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={withSuspense(AdminDashboard)} />
          <Route path="campaigns" element={withSuspense(Campaigns)} />
          <Route path="employees" element={withSuspense(Employees)} />
          <Route path="beneficiaries" element={withSuspense(BeneficiariesAdmin)} />
          <Route path="gifts" element={withSuspense(Gifts)} />
          <Route path="selections" element={withSuspense(Selections)} />
          <Route path="support-requests" element={withSuspense(SupportRequests)} />
          <Route path="users" element={withSuspense(AdminUsers)} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
