import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tag,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import { useStore } from '../../store/useStore';

const vendorMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
  { icon: UtensilsCrossed, label: 'Menu Management', path: '/admin/menu' },
  { icon: Tag, label: 'Combos & Offers', path: '/admin/combos' },
  { icon: CreditCard, label: 'Payments & QR', path: '/admin/payments' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const collegeAdminMenuItems = [
  { icon: LayoutDashboard, label: 'Campus Dashboard', path: '/admin/college-dashboard' },
  { icon: UtensilsCrossed, label: 'Manage Canteens', path: '/admin/manage-canteens' },
  { icon: ShoppingBag, label: 'Campus Orders', path: '/admin/college-orders' },
  { icon: BarChart3, label: 'Campus Analytics', path: '/admin/college-analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentVendor, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = currentVendor?.role === 'collegeadmin' ? collegeAdminMenuItems : vendorMenuItems;

  return (
    <div className="min-h-screen bg-[#F7F4F1] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-[#E5E5E5] transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-[70px] flex items-center justify-between px-6 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="font-bold text-lg text-[#1E1E1E]">CampusBite</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                      ? 'bg-[#FF6B00] text-white'
                      : 'text-[#6B6B6B] hover:bg-[#FFF5EE]'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-[#E5E5E5]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-[70px] bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6 text-[#1E1E1E]" />
            </button>
            <h1 className="font-semibold text-lg text-[#1E1E1E]">
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] rounded-full">
              <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-[#22C55E]">LIVE</span>
            </div>
            <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center" aria-label={currentVendor?.name || 'Admin'}>
              <span className="text-white font-semibold text-sm">
                {currentVendor?.name ? currentVendor.name.substring(0, 2).toUpperCase() : 'AD'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
