import { useState, useEffect } from 'react';
import { categories } from '../../data/mockMenu';
import { Switch } from '../../components/ui/switch';
import { useStore, API_URL } from '../../store/useStore';
import { Plus, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MenuManagement() {
  const menuItems = useStore((state) => state.menu);
  const currentVendor = useStore((state) => state.currentVendor);
  const updateMenuItem = useStore((state) => state.updateMenuItem);
  const addMenuItem = useStore((state) => state.addMenuItem);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockImages, setStockImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0],
    image: '',
  });

  useEffect(() => {
    const fetchStockImages = async () => {
      setIsLoadingImages(true);
      try {
        const res = await fetch(`${API_URL}/api/stock-images`);
        const data = await res.json();
        setStockImages(data);
      } catch (err) {
        console.error('Failed to fetch stock images:', err);
      } finally {
        setIsLoadingImages(false);
      }
    };
    fetchStockImages();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.image) return;

    await addMenuItem({
      name: newItem.name,
      description: newItem.description,
      price: parseInt(newItem.price),
      category: newItem.category,
      image: newItem.image,
      available: true,
      vendorId: currentVendor?.vendorId,
    });

    setIsModalOpen(false);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: categories[0],
      image: '',
    });
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#1E1E1E]">Menu Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E65C00] transition-colors shadow-lg shadow-[#FF6B00]/20"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#FFFAF5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
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
                : 'bg-[#FFFAF5] text-[#6B6B6B] hover:bg-[#E5E5E5]'
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
                    className="flex-1 px-3 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
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

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-[#1E1E1E]">Add New Item</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Input Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                      <input
                        type="text"
                        required
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none transition-all"
                        placeholder="e.g. Special Masala Dosa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none transition-all h-24 resize-none"
                        placeholder="Describe your item..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={newItem.price}
                          onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select
                          value={newItem.category}
                          onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none transition-all appearance-none"
                        >
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Image URL</label>
                      <input
                        type="text"
                        required
                        value={newItem.image}
                        onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none transition-all text-sm"
                        placeholder="Paste URL or select from gallery -->"
                      />
                    </div>
                  </div>

                  {/* Right: Stock Gallery */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">Choose HD Stock Photo</label>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold">PREMIUM HD</span>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200 min-h-[400px]">
                      {isLoadingImages ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                          {stockImages.map((img) => (
                            <button
                              key={img._id}
                              type="button"
                              onClick={() => setNewItem({ ...newItem, image: img.image })}
                              className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all group ${newItem.image === img.image ? 'border-[#FF6B00]' : 'border-transparent hover:border-orange-200'
                                }`}
                            >
                              <img src={img.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={img.name} />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm grayscale opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white font-medium truncate">{img.name}</p>
                              </div>
                              {newItem.image === img.image && (
                                <div className="absolute top-2 right-2 bg-[#FF6B00] text-white p-1 rounded-full shadow-lg">
                                  <Check size={12} strokeWidth={4} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-[#FF6B00] text-white rounded-2xl font-bold hover:bg-[#E65C00] transition-all shadow-xl shadow-orange-200 order-1 sm:order-2"
                  >
                    Add Item to Menu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

