import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Login from './pages/Login';
import SuperAdminLayout, { ProtectedRoute } from './pages/SuperAdminLayout';
import Dashboard from './pages/Dashboard';
import Campuses from './pages/Campuses';
import VendorManagement from './pages/VendorManagement';
import Subscriptions from './pages/Subscriptions';
import Revenue from './pages/Revenue';
import SystemSettings from './pages/SystemSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/superadmin" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/superadmin"
          element={
            <ProtectedRoute>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="campuses" element={<Campuses />} />
          <Route path="canteens" element={<VendorManagement />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="users" element={<div className="p-6">Users & Admins Management (Coming Soon)</div>} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
