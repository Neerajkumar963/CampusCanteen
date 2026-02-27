import { createBrowserRouter, Navigate } from 'react-router';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import MenuManagement from './pages/admin/MenuManagement';
import Combos from './pages/admin/Combos';
import Payments from './pages/admin/Payments';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import CollegeDashboard from './pages/admin/CollegeDashboard';
import ManageCanteens from './pages/admin/ManageCanteens';
import CollegeOrders from './pages/admin/CollegeOrders';
import CollegeAnalytics from './pages/admin/CollegeAnalytics';
import { useStore } from './store/useStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentVendor = useStore((state) => state.currentVendor);
  if (!currentVendor) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'orders',
        Component: Orders,
      },
      {
        path: 'menu',
        Component: MenuManagement,
      },
      {
        path: 'combos',
        Component: Combos,
      },
      {
        path: 'payments',
        Component: Payments,
      },
      {
        path: 'analytics',
        Component: Analytics,
      },
      {
        path: 'settings',
        Component: Settings,
      },
      {
        path: 'college-dashboard',
        Component: CollegeDashboard,
      },
      {
        path: 'manage-canteens',
        Component: ManageCanteens,
      },
      {
        path: 'college-orders',
        Component: CollegeOrders,
      },
      {
        path: 'college-analytics',
        Component: CollegeAnalytics,
      },
    ],
  },
]);
