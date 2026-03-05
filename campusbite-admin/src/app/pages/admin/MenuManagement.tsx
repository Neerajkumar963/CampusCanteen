import { useState, useEffect } from 'react';
import { categories } from '../../data/mockMenu';
import { Switch } from '../../components/ui/switch';
import { useStore, API_URL } from '../../store/useStore';
import { Plus, X, Image as ImageIcon, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'burger': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80',
    'https://images.unsplash.com/photo-1530469912745-a215c6b256ea?w=600&q=80',
  ],
  'sandwich (grilled)': [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
    'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&q=80',
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
    'https://images.unsplash.com/photo-1620914639083-8577a8d62c0d?w=600&q=80',
  ],
  'pizza': [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
  ],
  'fries': [
    'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600&q=80',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  ],
  'hot dog': [
    'https://images.unsplash.com/photo-1612392062631-94b7c6234e2c?w=600&q=80',
    'https://images.unsplash.com/photo-1619734086067-24bf8889ea7d?w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  ],
  'maggi & pasta': [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
  ],
  'chips & biscuits': [
    'https://images.unsplash.com/photo-1548041209-05e65c7be1e7?w=600&q=80',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80',
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80',
    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80',
  ],
  'cold beverages': [
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
    'https://images.unsplash.com/photo-1595981234058-a9302fb97229?w=600&q=80',
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
  ],
  'hot beverages': [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80',
  ],
  'mains': [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80',
  ],
  'chicken sides': [
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=600&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
  ],
  'eggs': [
    'https://images.unsplash.com/photo-1607690424560-35d967d421c2?w=600&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80',
  ],
  'paranthas': [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
  ],
  'stationery': ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80'],
  'books': ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
  'default': ['https://images.unsplash.com/photo-1567529854338-fc097b962123?w=600&q=80'],
};

const getItemImage = (item: any): string => {
  if (item.image && item.image.trim() !== '' && !item.image.includes('placeholder')) return item.image;
  const cat = (item.category || '').toLowerCase().trim();
  const pool = CATEGORY_IMAGE_POOLS[cat] || CATEGORY_IMAGE_POOLS['default'];
  // Simple string hash for indexing if numeric menuId is missing
  const seed = item.menuId || item.id || item.name || '0';
  const hash = String(seed).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const index = (Math.abs(hash) % pool.length);
  return pool[index];
};

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
    prepTime: '10',
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
      prepTime: parseInt(newItem.prepTime) || 10,
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
      prepTime: '10',
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

  const handlePrepTimeChange = (id: number, newTime: string) => {
    const prepTime = parseInt(newTime) || 0;
    updateMenuItem(id, { prepTime });
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

      {/* Category Filter Dropdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFFAF5] rounded-xl flex-shrink-0">
            <Filter size={20} color="#FF6B00" />
          </div>
          <div className="whitespace-nowrap">
            <h3 className="text-sm font-bold text-[#1A1A1A] leading-tight">Filter Menu</h3>
            <p className="text-[10px] text-[#6B6B6B] leading-tight">Select a category to view items</p>
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-[#FFFAF5] border-2 border-[#FFEBE0] text-[#1A1A1A] text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[#FF6B00] transition-all cursor-pointer w-full sm:min-w-[180px]"
          >
            <option value="All">All Items</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#FF6B00]">
            <Plus size={16} className="rotate-45" />
          </div>
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
                src={getItemImage(item)}
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

              {item.category !== 'Stationery' && item.category !== 'Books' && (
                <div>
                  <label className="text-sm text-[#6B6B6B] mb-1 block">
                    Prep Time (e.g. {item.prepTime || 10}-{(item.prepTime || 10) + 5} mins)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.prepTime || 10}
                      onChange={(e) => handlePrepTimeChange(item.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
              )}

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

                    {newItem.category !== 'Stationery' && newItem.category !== 'Books' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Base Prep Time (Mins)</label>
                          <input
                            type="number"
                            required
                            value={newItem.prepTime}
                            onChange={e => setNewItem({ ...newItem, prepTime: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none transition-all"
                            placeholder="10"
                          />
                        </div>
                        <div className="flex items-end pb-3">
                          <span className="text-xs text-gray-400 italic">Shows as {newItem.prepTime || '10'}-{parseInt(newItem.prepTime || '10') + 5} mins</span>
                        </div>
                      </div>
                    )}

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

