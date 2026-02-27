import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MapPin, Building2, Receipt, CreditCard, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { analytics, fetchAnalytics } = useStore();

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (!analytics) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-[#6B6B6B] font-medium text-lg">Loading analytics...</div>
            </div>
        );
    }

    const widgets = [
        {
            title: 'Total Campuses',
            value: analytics.totalCampuses,
            icon: MapPin,
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            title: 'Active Canteens',
            value: analytics.totalCanteens,
            icon: Building2,
            color: 'bg-[#FF6B00]/10 text-[#FF6B00]',
        },
        {
            title: 'Orders Today (Global)',
            value: analytics.totalOrdersToday,
            icon: Receipt,
            color: 'bg-green-500/10 text-green-600',
        },
        {
            title: 'Active Subscriptions',
            value: analytics.activeSubscriptions,
            icon: CreditCard,
            color: 'bg-purple-500/10 text-purple-600',
        },
        {
            title: 'Monthly GMV',
            value: `₹${analytics.monthlyRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-rose-500/10 text-rose-600',
        }
    ];

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">Platform Overview</h1>
                <p className="text-[#6B6B6B]">Global metrics across all {analytics.totalCampuses} campuses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {widgets.map((widget, idx) => {
                    const Icon = widget.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5] flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${widget.color}`}>
                                <Icon size={28} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-[#1E1E1E]">{widget.value}</p>
                                <p className="text-sm font-medium text-[#6B6B6B] mt-1">{widget.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
