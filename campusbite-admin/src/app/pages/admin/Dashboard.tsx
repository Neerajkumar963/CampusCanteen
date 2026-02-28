import { useStore } from '../../store/useStore';
import { ShoppingBag, IndianRupee, UtensilsCrossed, Clock } from 'lucide-react';
import { mockMenuItems } from '../../data/mockMenu';
import { motion } from 'motion/react';

export default function Dashboard() {
  const orders = useStore((state) => state.orders);
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
      icon: IndianRupee,
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
    </div>
  );
}
