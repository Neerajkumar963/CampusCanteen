import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';
import { useStore } from '../store/useStore';
import {
    LogOut,
    Building2,
    Menu,
    X,
    CreditCard,
    Settings,
    LayoutDashboard,
    MapPin,
    TrendingUp,
    Users,
    UserCheck
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/superadmin' },
    { icon: MapPin, label: 'Campuses', path: '/superadmin/campuses' },
    { icon: Building2, label: 'Canteens', path: '/superadmin/canteens' },
    { icon: CreditCard, label: 'Subscriptions', path: '/superadmin/subscriptions' },
    { icon: TrendingUp, label: 'Revenue Analytics', path: '/superadmin/revenue' },
    { icon: UserCheck, label: 'Volunteers', path: '/superadmin/volunteers' },
    { icon: Users, label: 'Users / Admins', path: '/superadmin/users' },
    { icon: Settings, label: 'System Settings', path: '/superadmin/settings' },
];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const currentVendor = useStore((state) => state.currentVendor);
    if (!currentVendor || currentVendor.role !== 'superadmin') {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

export default function SuperAdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentVendor, logout } = useStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#FFFAF5] flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#E5E5E5] flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E5E5]">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] bg-clip-text text-transparent">
                        CampusBite Admin
                    </h1>
                    <button
                        className="md:hidden text-[#6B6B6B]"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                    ? 'bg-[#FF6B00] text-white'
                                    : 'text-[#6B6B6B] hover:bg-[#FFFAF5] hover:text-[#1E1E1E]'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#E5E5E5]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-[#6B6B6B]"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-semibold text-[#1E1E1E] hidden sm:block">
                            {menuItems.find((item) => location.pathname === item.path)?.label || 'Super Admin'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F46E5]/10 rounded-full">
                            <span className="text-sm font-medium text-[#4F46E5]">{currentVendor?.role === 'superadmin' ? 'Super Admin' : ''}</span>
                        </div>
                        <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                SA
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
