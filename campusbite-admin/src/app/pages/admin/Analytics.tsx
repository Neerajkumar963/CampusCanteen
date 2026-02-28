import { useStore } from '../../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, IndianRupee, ShoppingBag } from 'lucide-react';

export default function Analytics() {
  const orders = useStore((state) => state.orders);
  const getTodayRevenue = useStore((state) => state.getTodayRevenue);

  // Calculate hourly orders
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    orders: 0,
  }));

  orders.forEach((order) => {
    const dateVal = order.createdAt || (order as any).timestamp;
    if (!dateVal) return;
    const hour = new Date(dateVal).getHours();
    if (!isNaN(hour) && hourlyData[hour]) {
      hourlyData[hour].orders += 1;
    }
  });

  // Calculate top selling items
  const itemSales: Record<string, number> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const name = item.item.name;
      itemSales[name] = (itemSales[name] || 0) + item.quantity;
    });
  });

  const topItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const todayRevenue = getTodayRevenue();
  const totalOrders = orders.length;
  const averageOrder = totalOrders > 0 ? Math.round(todayRevenue / totalOrders) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#FFF5EE] rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-sm text-[#6B6B6B] mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-[#1E1E1E]">₹{todayRevenue}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#22C55E]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-sm text-[#6B6B6B] mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-[#1E1E1E]">{totalOrders}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#22C55E]" />
          </div>
          <p className="text-sm text-[#6B6B6B] mb-1">Average Order</p>
          <p className="text-3xl font-bold text-[#1E1E1E]">₹{averageOrder}</p>
        </div>
      </div>

      {/* Orders Per Hour Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-6">
          Orders Per Hour
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="hour" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="orders" fill="#FF6B00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1E1E1E] mb-6">
          Top Selling Items
        </h2>

        {topItems.length === 0 ? (
          <p className="text-center text-[#6B6B6B] py-8">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-4 p-4 bg-[#FFFAF5] rounded-xl"
              >
                <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1E1E1E]">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#FF6B00]">{item.count}</p>
                  <p className="text-xs text-[#6B6B6B]">sold</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
