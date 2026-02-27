import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data until we aggregate historical orders in the backend API
const mockRevenueData = [
    { name: 'Mon', revenue: 4000, orders: 120 },
    { name: 'Tue', revenue: 3000, orders: 98 },
    { name: 'Wed', revenue: 5000, orders: 156 },
    { name: 'Thu', revenue: 4780, orders: 134 },
    { name: 'Fri', revenue: 6890, orders: 210 },
    { name: 'Sat', revenue: 8390, orders: 260 },
    { name: 'Sun', revenue: 7490, orders: 230 },
];

export default function Revenue() {
    const { fetchAnalytics } = useStore();

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">Revenue Analytics</h1>
                <p className="text-[#6B6B6B]">Global financial performance across all campuses</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Trend Area Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]">
                    <h2 className="text-lg font-bold text-[#1E1E1E] mb-6">Weekly Revenue Trend</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Global Orders Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]">
                    <h2 className="text-lg font-bold text-[#1E1E1E] mb-6">Global Orders Volume</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#F7F4F1' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [value, 'Orders']}
                                />
                                <Bar dataKey="orders" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
