import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/login/LoginPage';
import { DashboardHome } from './pages/app/DashboardHome';
import { ProfilePage } from './pages/app/settings/ProfilePage';
import { UsersAdminPage } from './pages/app/settings/UsersAdminPage';
import { MachinesListPage } from './pages/app/machines/MachinesListPage';
import { AlarmsListPage } from './pages/app/alarms/AlarmsListPage';
import { AlarmDetailsPage } from './pages/app/alarms/AlarmDetailsPage';
import { PatiosPublicPage } from './pages/app/patios/PatiosPublicPage';
import { PatiosListPage } from './pages/app/patios/PatiosListPage';
import { PatioDetailsPage } from './pages/app/patios/PatioDetailsPage';
import { PatioMachinesPage } from './pages/app/patios/PatioMachinesPage';
import { DashboardShell } from './ui/layout/DashboardShell';
import { RequireAuth } from './lib/auth/requireAuth';
import {MachineDetailsRoute} from "./pages/app/machines/MachineDetailsPage.tsx";

function AppLayout() {
  return (
      <RequireAuth>
        <DashboardShell>
          <Outlet />
        </DashboardShell>
      </RequireAuth>
  );
}

function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardHome />} />

            {/* Machines routes */}
            <Route path="machines" element={<MachinesListPage />} />
              <Route path="machines/:id" element={<MachineDetailsRoute />} />

            {/* Alarms routes */}
            <Route path="alarms" element={<AlarmsListPage />} />
            <Route path="alarms/:id" element={<AlarmDetailsPage />} />

            {/* Patios routes */}
            <Route path="patios/public" element={<PatiosPublicPage />} />
            <Route path="patios" element={<PatiosListPage />} />
            <Route path="patios/:id" element={<PatioDetailsPage />} />
            <Route path="patios/:id/machines" element={<PatioMachinesPage />} />

            {/* Settings routes */}
            <Route path="settings/profile" element={<ProfilePage />} />
            <Route
                path="settings/users"
                element={
                  <RequireAuth allowedRoles={['admin']}>
                    <UsersAdminPage />
                  </RequireAuth>
                }
            />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
