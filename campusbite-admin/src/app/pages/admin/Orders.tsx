import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search } from 'lucide-react';

type FilterType = 'All' | 'Today' | 'Pending' | 'Completed' | 'Cancelled';

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const currentVendor = useStore((state) => state.currentVendor);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const updateOrderPaymentStatus = useStore((state) => state.updateOrderPaymentStatus);
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    // Only show orders for this vendor
    if (order.vendorId && order.vendorId !== currentVendor?.vendorId) {
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
      return order.tokenNumber.toString().includes(query);
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FF6B00] text-white';
      case 'Preparing':
        return 'bg-[#3B82F6] text-white';
      case 'Ready':
        return 'bg-[#22C55E] text-white';
      case 'Completed':
        return 'bg-[#6B6B6B] text-white';
      case 'Cancelled':
        return 'bg-[#EF4444] text-white';
      default:
        return 'bg-[#E5E5E5] text-[#1E1E1E]';
    }
  };

  const handleAccept = (orderId: number) => {
    updateOrderStatus(orderId, 'Preparing');
  };

  const handleComplete = (orderId: number) => {
    updateOrderStatus(orderId, 'Completed');
  };

  const handleCancel = (orderId: number) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'Cancelled');
    }
  };

  const handleTogglePayment = (orderId: number, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    updateOrderPaymentStatus(orderId, newStatus);
  };

  const filters: FilterType[] = ['All', 'Today', 'Pending', 'Completed', 'Cancelled'];

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
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
              placeholder="Search by token number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#6B6B6B]">
            No orders found
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4">
              {filteredOrders.slice().reverse().map((order) => (
                <div key={order.orderId} className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                    <span className="font-bold text-lg text-[#FF6B00]">#{order.tokenNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-[#1E1E1E]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.item?.name || (item as any).name} x{item.quantity || (item as any).qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B6B6B]">Amount: <span className="font-semibold text-[#1E1E1E]">₹{order.total}</span></span>
                      <button
                        onClick={() => handleTogglePayment(order.orderId, order.paymentStatus)}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706] cursor-pointer hover:opacity-80'}`}
                        title="Click to toggle payment status"
                      >
                        {order.paymentStatus || 'Pending'}
                      </button>
                    </div>
                    <span className="text-[#6B6B6B]">
                      {order.paymentMethod} • {order.orderType}
                      {order.orderType !== 'Pickup' && order.serviceId && ` (${order.serviceId})`}
                    </span>
                  </div>

                  <div className="text-xs text-[#6B6B6B] flex justify-between">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5] mt-2">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleAccept(order.orderId)}
                        className="px-4 py-2 bg-[#FF6B00] text-white text-sm font-medium rounded-lg hover:bg-[#FF8A00] transition-colors flex-1 text-center"
                      >
                        Accept
                      </button>
                    )}
                    {(order.status === 'Preparing' || order.status === 'Ready') && (
                      <button
                        onClick={() => handleComplete(order.orderId)}
                        className="px-4 py-2 bg-[#22C55E] text-white text-sm font-medium rounded-lg hover:bg-[#16A34A] transition-colors flex-1 text-center"
                      >
                        Complete
                      </button>
                    )}
                    {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancel(order.orderId)}
                        className="px-4 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#DC2626] transition-colors flex-1 text-center"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FFFAF5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredOrders.slice().reverse().map((order) => (
                    <tr key={order.orderId} className="hover:bg-[#FFFAF5] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#FF6B00]">
                          #{order.tokenNumber}
                        </span>
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
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[#1E1E1E]">
                          ₹{order.total}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-sm text-[#6B6B6B]">
                            {order.paymentMethod}
                          </span>
                          <button
                            onClick={() => handleTogglePayment(order.orderId, order.paymentStatus)}
                            className={`px-2 py-0.5 rounded text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#D97706] cursor-pointer hover:opacity-80'}`}
                            title="Click to toggle payment status"
                          >
                            {order.paymentStatus || 'Pending'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B6B6B]">
                          {order.orderType}
                          {order.orderType !== 'Pickup' && order.serviceId && <><br />({order.serviceId})</>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#6B6B6B]">
                          <div>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {order.status === 'Pending' && (
                            <button
                              onClick={() => handleAccept(order.orderId)}
                              className="px-3 py-1.5 bg-[#FF6B00] text-white text-sm rounded-lg hover:bg-[#FF8A00] transition-colors"
                            >
                              Accept
                            </button>
                          )}
                          {(order.status === 'Preparing' || order.status === 'Ready') && (
                            <button
                              onClick={() => handleComplete(order.orderId)}
                              className="px-3 py-1.5 bg-[#22C55E] text-white text-sm rounded-lg hover:bg-[#16A34A] transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancel(order.orderId)}
                              className="px-3 py-1.5 bg-[#EF4444] text-white text-sm rounded-lg hover:bg-[#DC2626] transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
