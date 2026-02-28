import { useState, useEffect } from 'react';
import { useStore, API_URL } from '../../store/useStore';
import { Search } from 'lucide-react';

type FilterType = 'All' | 'Today' | 'Pending' | 'Completed' | 'Cancelled';

export default function CollegeOrders() {
    const orders = useStore((state) => state.orders);
    const currentVendor = useStore((state) => state.currentVendor);

    const [filter, setFilter] = useState<FilterType>('All');
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredOrders = orders.filter((order) => {
        // Only show orders for vendors in this campus
        if (!campusVendorIds.includes(order.vendorId || '')) {
            return false;
        }

        // Filter by status/time
        if (filter === 'Today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            if (orderDate.getTime() !== today.getTime()) return false;
        } else if (filter !== 'All') {
            if (order.status !== filter) return false;
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return order.tokenNumber.toString().includes(query) || (order.vendorId && order.vendorId.toLowerCase().includes(query));
        }

        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-[#FF6B00] text-white';
            case 'Preparing': return 'bg-[#3B82F6] text-white';
            case 'Ready': return 'bg-[#22C55E] text-white';
            case 'Completed': return 'bg-[#6B6B6B] text-white';
            case 'Cancelled': return 'bg-[#EF4444] text-white';
            default: return 'bg-[#E5E5E5] text-[#1E1E1E]';
        }
    };

    const filters: FilterType[] = ['All', 'Today', 'Pending', 'Completed', 'Cancelled'];

    if (loading) {
        return <div className="p-6 text-center text-[#6B6B6B]">Loading Orders...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E1E1E]">Campus Orders</h1>
                    <p className="text-[#6B6B6B]">View live orders across all your canteens (Read-only)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex gap-2 flex-wrap">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-[#FF6B00] text-white'
                                    : 'bg-[#FFFAF5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                        <input
                            type="text"
                            placeholder="Search token or vendor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-[#6B6B6B]">
                        No orders found for this campus.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#FFFAF5]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Token</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Canteen</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Items</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Type / Payment</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E5E5]">
                                {filteredOrders.slice().reverse().map((order) => (
                                    <tr key={order.orderId} className="hover:bg-[#FFFAF5] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-[#FF6B00]">#{order.tokenNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-[#1E1E1E]">
                                            {order.vendorId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[#1E1E1E]">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx}>
                                                        {item.item?.name || (item as any).name} x{item.quantity || (item as any).qty}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-[#1E1E1E]">
                                            ₹{order.total}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#6B6B6B]">
                                            {order.orderType}
                                            {order.orderType !== 'Pickup' && order.serviceId && ` (${order.serviceId})`}
                                            <br />
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-medium">{order.paymentMethod}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.paymentStatus === 'Paid' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706]'}`}>
                                                    {order.paymentStatus || 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#6B6B6B]">
                                            {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
