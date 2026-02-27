import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Building2, Store, ShoppingBag, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface CollegeAnalytics {
    totalCampuses: number;
    totalCanteens: number;
    totalOrdersToday: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
}

export default function CollegeDashboard() {
    const currentVendor = useStore((state) => state.currentVendor);
    const [analytics, setAnalytics] = useState<CollegeAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!currentVendor || currentVendor.role !== 'collegeadmin') return;

            try {
                const campusId = typeof currentVendor.campusId === 'object' ? currentVendor.campusId._id : currentVendor.campusId;
                const res = await fetch(`http://localhost:5000/api/superadmin/analytics?campusId=${campusId}`);
                const data = await res.json();
                if (data.success) {
                    setAnalytics(data.analytics);
                }
            } catch (err) {
                console.error('Failed to fetch college analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [currentVendor]);

    if (loading) {
        return <div className="p-6 text-center text-[#6B6B6B]">Loading Dashboard...</div>;
    }

    const stats = [
        {
            icon: Store,
            label: 'Active Canteens',
            value: analytics?.totalCanteens || 0,
            bgColor: 'bg-[#EFF6FF]',
            iconColor: 'text-[#3B82F6]',
        },
        {
            icon: ShoppingBag,
            label: "Campus Orders Today",
            value: analytics?.totalOrdersToday || 0,
            bgColor: 'bg-[#FFF5EE]',
            iconColor: 'text-[#FF6B00]',
        },
        {
            icon: DollarSign,
            label: "Campus Monthly Revenue",
            value: `₹${analytics?.monthlyRevenue || 0}`,
            bgColor: 'bg-[#F0FDF4]',
            iconColor: 'text-[#22C55E]',
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1E1E1E]">Campus Dashboard</h1>
                <p className="text-[#6B6B6B]">Overview of all canteens in your campus</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]"
                        >
                            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <p className="text-sm font-medium text-[#6B6B6B] mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-[#1E1E1E]">{stat.value}</p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
