import { useStore } from '../../store/useStore';
import { ShoppingBag, DollarSign, UtensilsCrossed, Clock } from 'lucide-react';
import { mockMenuItems } from '../../data/mockMenu';
import { motion } from 'motion/react';

export default function Dashboard() {
  const orders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const getTodayOrders = useStore((state) => state.getTodayOrders);
  const getTodayRevenue = useStore((state) => state.getTodayRevenue);

  const todayOrders = getTodayOrders();
  const todayRevenue = getTodayRevenue();
  const pendingOrders = orders.filter((order) => order.status === 'Pending');
  const activeItems = mockMenuItems.filter((item) => item.available).length;

  const stats = [
    {
      icon: ShoppingBag,
      label: "Today's Orders",
      value: todayOrders.length.toString(),
      bgColor: 'bg-[#FFF5EE]',
      iconColor: 'text-[#FF6B00]',
    },
    {
      icon: DollarSign,
      label: "Today's Revenue",
      value: `₹${todayRevenue}`,
      bgColor: 'bg-[#F0FDF4]',
      iconColor: 'text-[#22C55E]',
    },
    {
      icon: UtensilsCrossed,
      label: 'Active Items',
      value: activeItems.toString(),
      bgColor: 'bg-[#EFF6FF]',
      iconColor: 'text-[#3B82F6]',
    },
    {
      icon: Clock,
      label: 'Pending Orders',
      value: pendingOrders.length.toString(),
      bgColor: 'bg-[#FEF2F2]',
      iconColor: 'text-[#EF4444]',
    },
  ];

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

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <p className="text-sm text-[#6B6B6B] mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-[#1E1E1E]">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Live Orders */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E5E5]">
          <h2 className="font-semibold text-lg text-[#1E1E1E]">Live Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-[#6B6B6B]">
            No orders yet
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4 bg-[#F7F4F1]">
              {orders.slice().reverse().map((order) => (
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
                    <span className="text-[#6B6B6B]">Amount: <span className="font-semibold text-[#1E1E1E]">₹{order.total}</span></span>
                    <span className="text-[#6B6B6B]">
                      {order.paymentMethod} • {order.orderType}
                      {order.orderType !== 'Pickup' && order.serviceId && ` (${order.serviceId})`}
                    </span>
                  </div>

                  <div className="text-xs text-[#6B6B6B] flex justify-between">
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
                <thead className="bg-[#F7F4F1]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E1E1E]">
                      Payment
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
                  {orders.slice().reverse().map((order) => (
                    <tr key={order.orderId} className="hover:bg-[#F7F4F1] transition-colors">
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
                        <span className="text-sm text-[#6B6B6B]">
                          {order.orderType}
                          {order.orderType !== 'Pickup' && order.serviceId && <><br />({order.serviceId})</>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#1E1E1E]">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B6B6B]">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
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
