import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LandingPage from './pages/Landing.jsx';
import LoginPage from './pages/Auth/Login.jsx';
import RegisterPage from './pages/Auth/Register.jsx';
import AdminSetupPage from './pages/Auth/AdminSetup.jsx';
import Unauthorized from './pages/Auth/Unauthorized.jsx';

import EmployeeDashboard from './pages/Employee/Dashboard.jsx';
import CreateTicketPage from './pages/Employee/CreateTicket.jsx';
import MyTicketsPage from './pages/Employee/MyTickets.jsx';
import TicketDetailsPage from './pages/Employee/TicketDetails.jsx';
import EmployeeKnowledgeBasePage from './pages/Employee/KnowledgeBase.jsx';

import SupportDashboard from './pages/Support/Dashboard.jsx';
import SupportTicketsPage from './pages/Support/AllTickets.jsx';
import SupportAnalyticsPage from './pages/Support/Analytics.jsx';
import EscalationsPage from './pages/Support/Escalations.jsx';
import ResolveTicketPage from './pages/Support/ResolveTicket.jsx';
import SupportProfilePage from './pages/Support/Profile.jsx';
import SupportKnowledgeBasePage from './pages/Support/KnowledgeBase.jsx';

import AdminDashboard from './pages/Admin/Dashboard.jsx';
import UserManagementPage from './pages/Admin/UserManagement.jsx';
import KnowledgeBasePage from './pages/Admin/KnowledgeBase.jsx';
import ReportsPage from './pages/Admin/Reports.jsx';
import SettingsPage from './pages/Admin/SystemSettings.jsx';
import TicketMonitoringPage from './pages/Admin/TicketMonitoring.jsx';

import ProtectedRoute from './components/ProtectedRoute/index.jsx';
import EmployeeLayout from './layouts/EmployeeLayout.jsx';
import SupportLayout from './layouts/SupportLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import CustomerChatWidget from './components/CustomerChatWidget/index.jsx';
import AdminLoginPage from './pages/Auth/AdminLogin.jsx';
import { useTheme } from './context/ThemeContext.jsx';


const App = () => {
  const { theme } = useTheme();
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-setup" element={<AdminSetupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute roles={['employee']} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/tickets/new" element={<CreateTicketPage />} />
            <Route path="/employee/tickets" element={<MyTicketsPage />} />
            <Route path="/employee/tickets/:id" element={<TicketDetailsPage />} />
            <Route path="/employee/knowledge-base" element={<EmployeeKnowledgeBasePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['support']} />}>
          <Route element={<SupportLayout />}>
            <Route path="/support" element={<SupportDashboard />} />
            <Route path="/support/tickets" element={<SupportTicketsPage />} />
           
            <Route path="/support/tickets/:id/resolve" element={<ResolveTicketPage />} />
            <Route path="/support/analytics" element={<SupportAnalyticsPage />} />
            <Route path="/support/escalations" element={<EscalationsPage />} />
            <Route path="/support/knowledge-base" element={<SupportKnowledgeBasePage />} />
            <Route path="/support/profile" element={<SupportProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/tickets" element={<TicketMonitoringPage />} />
            <Route path="/admin/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" theme={theme === 'light' ? 'light' : 'dark'} autoClose={3000} />
      <CustomerChatWidget />
    </>
  );
};

export default App;