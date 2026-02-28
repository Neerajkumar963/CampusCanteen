import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Home, School, Utensils, Store, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';

type FilterType = 'All' | 'Today' | 'Pending' | 'Completed' | 'Cancelled';

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const currentVendor = useStore((state) => state.currentVendor);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const updateOrderPaymentStatus = useStore((state) => state.updateOrderPaymentStatus);
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  const toggleOrderDetails = (orderId: number) => {
    console.log('Toggling order:', orderId, typeof orderId);
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

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

                  <div className="space-y-3 pt-2">
                    {/* Amount & Payment Status Row */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#6B6B6B]">Amount:</span>
                          <span className="font-bold text-[#1E1E1E]">₹{order.total}</span>
                          {order.paymentMethod !== 'Cash' && (
                            order.paymentStatus === 'Paid' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D1FAE5] text-[#059669] uppercase">Paid</span>
                            ) : (
                              <button
                                onClick={() => handleTogglePayment(order.orderId, order.paymentStatus)}
                                className="text-[11px] text-[#FF6B00] font-bold hover:underline"
                              >
                                Mark as Paid
                              </button>
                            )
                          )}
                        </div>
                        <button
                          onClick={() => toggleOrderDetails(order.orderId)}
                          className="flex items-center gap-1 text-[11px] text-[#6B6B6B] font-medium hover:text-[#1E1E1E] transition-colors mt-1"
                        >
                          View Details {expandedOrders[order.orderId] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                      <div className="text-[11px] font-bold text-[#6B6B6B] bg-[#F3F4F6] px-2 py-0.5 rounded">
                        {order.paymentMethod}
                      </div>
                    </div>

                    {/* Expanded Items Section - Now below the toggle button */}
                    {expandedOrders[order.orderId] && (
                      <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#EEE] animate-in slide-in-from-top-2 duration-200">
                        <div className="text-[10px] font-bold text-[#999] uppercase tracking-wider mb-2 px-1">Order Items</div>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[#F0F0F0] last:border-0">
                              <span className="font-semibold text-sm text-[#1E1E1E]">
                                {item.item?.name || item.name || 'Unknown Item'}
                              </span>
                              <span className="text-[#FF6B00] font-black text-sm">
                                x{item.quantity || item.qty || 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivery Info Row */}
                    <div className="flex items-start gap-2 text-xs text-[#6B6B6B] bg-[#FFF8F3] p-2.5 rounded-xl border border-[#FFE8D1]">
                      <div className="mt-0.5 text-[#FF6B00]">
                        {order.orderType === 'Pickup' ? <Store size={14} /> :
                          order.orderType === 'Table' ? <Utensils size={14} /> :
                            order.orderType === 'Hostel' ? <Home size={14} /> : <School size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#1E1E1E]">
                          {order.orderType === 'Pickup' ? 'Counter Pickup' :
                            order.orderType === 'Table' ? 'Table Service' :
                              order.orderType === 'Hostel' ? 'Hostel Delivery' : 'Classroom Delivery'}
                        </div>
                        {order.serviceId && (
                          <div className="text-[12px] font-black text-[#FF6B00] mt-0.5 tracking-tight">
                            {order.orderType === 'Table' ? `Table No: ${order.serviceId}` :
                              (order.serviceId.toLowerCase().includes('room') ? order.serviceId : `Room: ${order.serviceId}`)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info Box */}
                    {(order.customerName || order.customerPhone || order.deliveryOtp) && (
                      <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#EEE] space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1E1E1E] truncate max-w-[120px]">{order.customerName || 'Customer'}</span>
                          </div>
                          {order.customerPhone && (
                            <a href={`tel:${order.customerPhone}`} className="text-[11px] font-bold text-[#FF6B00] flex items-center gap-1 hover:brightness-95">
                              📞 {order.customerPhone}
                            </a>
                          )}
                        </div>
                        {order.deliveryOtp && (
                          <div className="flex justify-between items-center pt-1.5 border-t border-[#EEE]">
                            <span className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-wider">Delivery OTP</span>
                            <span className="bg-[#FF6B00] text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-sm">{order.deliveryOtp}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-[#999] flex justify-between pt-1 font-medium italic">
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
                      Customer
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
                        <div className="text-sm flex flex-col">
                          <span className="font-bold text-[#1E1E1E]">{order.customerName || 'N/A'}</span>
                          {order.customerPhone && (
                            <a href={`tel:${order.customerPhone}`} className="text-[#FF6B00] hover:underline transition-all">
                              {order.customerPhone}
                            </a>
                          )}
                          {order.deliveryOtp && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-[10px] text-[#6B6B6B] font-bold uppercase">OTP:</span>
                              <span className="text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded font-black">{order.deliveryOtp}</span>
                            </div>
                          )}
                        </div>
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
                          {order.paymentMethod !== 'Cash' && (
                            order.paymentStatus === 'Paid' ? (
                              <button
                                onClick={() => handleTogglePayment(order.orderId, order.paymentStatus)}
                                className="px-2 py-0.5 rounded text-xs font-bold bg-[#D1FAE5] text-[#059669]"
                                title="Click to toggle payment status"
                              >
                                Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePayment(order.orderId, order.paymentStatus)}
                                className="text-xs text-[#FF6B00] hover:underline"
                                title="Mark as Paid"
                              >
                                Mark as Paid
                              </button>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-medium text-[#1E1E1E] leading-tight flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-[#FF6B00]">
                              {order.orderType === 'Pickup' ? <Store size={12} /> :
                                order.orderType === 'Table' ? <Utensils size={12} /> :
                                  order.orderType === 'Hostel' ? <Home size={12} /> : <School size={12} />}
                            </span>
                            {order.orderType === 'Pickup' ? 'Counter Pickup' :
                              order.orderType === 'Table' ? 'Table Service' :
                                order.orderType === 'Hostel' ? 'Hostel Delivery' : 'Classroom Delivery'}
                          </div>
                          {order.serviceId && (
                            <span className="text-[#FF6B00] font-black tracking-tight">
                              {order.orderType === 'Table' ? `Table No: ${order.serviceId}` :
                                (order.serviceId.toLowerCase().includes('room') ? order.serviceId : `Room: ${order.serviceId}`)}
                            </span>
                          )}
                        </div>
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
