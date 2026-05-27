import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CampaignWelcome from '../pages/public/CampaignWelcome';
import EmployeeLogin from '../pages/public/EmployeeLogin';
import BeneficiarySelection from '../pages/public/BeneficiarySelection';
import Summary from '../pages/public/Summary';
import ThankYou from '../pages/public/ThankYou';
import AlreadyConfirmed from '../pages/public/AlreadyConfirmed';
import SupportRequest from '../pages/public/SupportRequest';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Campaigns from '../pages/admin/Campaigns';
import Employees from '../pages/admin/Employees';
import BeneficiariesAdmin from '../pages/admin/BeneficiariesAdmin';
import Gifts from '../pages/admin/Gifts';
import Selections from '../pages/admin/Selections';
import SupportRequests from '../pages/admin/SupportRequests';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        <Route path="/campaign/:slug" element={<CampaignWelcome />} />
        <Route path="/campaign/:slug/login" element={<EmployeeLogin />} />
        <Route path="/campaign/:slug/select" element={<BeneficiarySelection />} />
        <Route path="/campaign/:slug/summary" element={<Summary />} />
        <Route path="/campaign/:slug/thank-you" element={<ThankYou />} />
        <Route path="/campaign/:slug/already-confirmed" element={<AlreadyConfirmed />} />
        <Route path="/campaign/:slug/support" element={<SupportRequest />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="employees" element={<Employees />} />
          <Route path="beneficiaries" element={<BeneficiariesAdmin />} />
          <Route path="gifts" element={<Gifts />} />
          <Route path="selections" element={<Selections />} />
          <Route path="support-requests" element={<SupportRequests />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
