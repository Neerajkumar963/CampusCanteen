import { useState, useEffect } from 'react';
import { useStore, API_URL } from '../../store/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CollegeAnalytics() {
    const currentVendor = useStore((state) => state.currentVendor);
    const orders = useStore((state) => state.orders);

    const [campusVendorIds, setCampusVendorIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCanteens = async () => {
            if (!currentVendor || currentVendor.role !== 'collegeadmin') return;

            try {
                const campusId = typeof currentVendor.campusId === 'object' ? currentVendor.campusId._id : currentVendor.campusId;
                const res = await fetch(`${API_URL}/api/vendors?campusId=${campusId}`);
                const data = await res.json();
                if (data.success) {
                    setCampusVendorIds(data.vendors.map((v: any) => v.vendorId));
                }
            } catch (err) {
                console.error('Failed to fetch canteens:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCanteens();
    }, [currentVendor]);

    if (loading) {
        return <div className="p-6 text-center text-[#6B6B6B]">Loading Analytics...</div>;
    }

    // Calculate order volume over the last 7 days for this campus
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return d;
    }).reverse();

    const chartData = last7Days.map(date => {
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const dayOrders = orders.filter(o => {
            const oDate = new Date(o.createdAt);
            return campusVendorIds.includes(o.vendorId || '') &&
                oDate >= date && oDate < nextDate;
        });

        const revenue = dayOrders
            .filter(o => o.status === 'Completed')
            .reduce((sum, o) => sum + o.total, 0);

        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            Orders: dayOrders.length,
            Revenue: revenue
        };
    });

    return (
        <div className="p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1E1E1E]">Campus Analytics</h1>
                <p className="text-[#6B6B6B]">7-Day performance trends for your campus</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5] min-h-[400px]">
                <h2 className="text-lg font-semibold text-[#1E1E1E] mb-6">Orders & Revenue Trend</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B' }} dy={10} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B' }} dx={-10} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B' }} dx={10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#E5E5E5', strokeWidth: 2 }}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="Orders" stroke="#FF6B00" strokeWidth={3} dot={{ r: 4, fill: '#FF6B00', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
