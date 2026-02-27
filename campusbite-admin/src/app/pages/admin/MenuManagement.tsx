import { useState } from 'react';
import { categories } from '../../data/mockMenu';
import { Switch } from '../../components/ui/switch';
import { useStore } from '../../store/useStore';

export default function MenuManagement() {
  const menuItems = useStore((state) => state.menu);
  const currentVendor = useStore((state) => state.currentVendor);
  const updateMenuItem = useStore((state) => state.updateMenuItem);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const vendorMenuItems = menuItems.filter(item => item.vendorId === currentVendor?.vendorId);

  const filteredItems =
    selectedCategory === 'All'
      ? vendorMenuItems
      : vendorMenuItems.filter((item) => item.category === selectedCategory);

  const handlePriceChange = (id: number, newPrice: string) => {
    const price = parseInt(newPrice) || 0;
    updateMenuItem(id, { price });
  };

  const handleAvailabilityToggle = (id: number, currentAvailable: boolean) => {
    updateMenuItem(id, { available: !currentAvailable });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Category Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#F7F4F1] text-[#6B6B6B] hover:bg-[#E5E5E5]'
              }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                ? 'bg-[#FF6B00] text-white'
                : 'bg-[#F7F4F1] text-[#6B6B6B] hover:bg-[#E5E5E5]'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="h-[140px] overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-[#1E1E1E]">{item.name}</h3>

              <div>
                <label className="text-sm text-[#6B6B6B] mb-1 block">
                  Price
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#1E1E1E]">₹</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F7F4F1] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1E1E1E]">
                  Available
                </span>
                <Switch
                  checked={item.available}
                  onCheckedChange={() => handleAvailabilityToggle(item.id, item.available)}
                />
              </div>

              <div className="pt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${item.available
                    ? 'bg-[#F0FDF4] text-[#22C55E]'
                    : 'bg-[#FEF2F2] text-[#EF4444]'
                    }`}
                >
                  {item.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
