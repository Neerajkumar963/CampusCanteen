import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Checkbox } from '../../components/ui/checkbox';
import { useStore } from '../../store/useStore';

interface Combo {
  id: number;
  name: string;
  items: number[];
  discount: number;
  enabled: boolean;
}

export default function Combos() {
  const menuItems = useStore((state) => state.menu);

  const [combos, setCombos] = useState<Combo[]>([
    {
      id: 1,
      name: 'Lunch Combo',
      items: [4, 8, 15], // Classic Burger, Fries, Cold Coffee
      discount: 10,
      enabled: true,
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newComboName, setNewComboName] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [discount, setDiscount] = useState('10');

  const handleCreateCombo = () => {
    if (!newComboName || selectedItems.length === 0) return;

    const newCombo: Combo = {
      id: Date.now(),
      name: newComboName,
      items: selectedItems,
      discount: parseInt(discount) || 0,
      enabled: true,
    };

    setCombos([...combos, newCombo]);
    setDialogOpen(false);
    setNewComboName('');
    setSelectedItems([]);
    setDiscount('10');
  };

  const toggleCombo = (id: number) => {
    setCombos(
      combos.map((combo) =>
        combo.id === id ? { ...combo, enabled: !combo.enabled } : combo
      )
    );
  };

  const deleteCombo = (id: number) => {
    setCombos(combos.filter((combo) => combo.id !== id));
  };

  const getComboItems = (itemIds: number[]) => {
    return menuItems.filter((item) => itemIds.includes(item.id));
  };

  const getComboPrice = (combo: Combo) => {
    const items = getComboItems(combo.items);
    const total = items.reduce((sum, item) => sum + item.price, 0);
    return Math.round(total * (1 - combo.discount / 100));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1E1E1E]">Combos & Offers</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8A00] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Combo
        </button>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos.map((combo) => {
          const items = getComboItems(combo.items);
          const originalPrice = items.reduce((sum, item) => sum + item.price, 0);
          const discountedPrice = getComboPrice(combo);

          return (
            <div
              key={combo.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] p-6 text-white relative">
                <button
                  onClick={() => deleteCombo(combo.id)}
                  className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-xl font-bold mb-2">{combo.name}</h3>
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  {combo.discount}% OFF
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-[#6B6B6B] mb-2">Includes:</p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="text-sm text-[#1E1E1E] flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></span>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-[#6B6B6B] line-through">
                    ₹{originalPrice}
                  </span>
                  <span className="text-xl font-bold text-[#FF6B00]">
                    ₹{discountedPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                  <span className="text-sm font-medium text-[#1E1E1E]">
                    Enable
                  </span>
                  <Switch
                    checked={combo.enabled}
                    onCheckedChange={() => toggleCombo(combo.id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Combo Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Combo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Combo Name
              </label>
              <input
                type="text"
                value={newComboName}
                onChange={(e) => setNewComboName(e.target.value)}
                placeholder="e.g., Lunch Combo"
                className="w-full px-4 py-2 bg-[#F7F4F1] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Select Items
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-2 bg-[#F7F4F1] rounded-lg">
                {menuItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-[#FFF5EE] transition-colors"
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(
                            selectedItems.filter((id) => id !== item.id)
                          );
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E1E1E]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">₹{item.price}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                Discount Percentage
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-[#F7F4F1] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            <button
              onClick={handleCreateCombo}
              disabled={!newComboName || selectedItems.length === 0}
              className="w-full py-3 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#FF8A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Combo
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
