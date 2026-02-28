import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useStore } from '../store/useStore';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const cart = useStore((state) => state.cart);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const navigate = useNavigate();

  const total = getCartTotal();

  const handleCheckout = (paymentMethod: 'UPI' | 'Cash') => {
    onOpenChange(false);
    navigate(`/payment?method=${paymentMethod}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-[#E5E5E5]">
          <SheetTitle className="text-xl font-semibold text-[#1E1E1E]">
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[#6B6B6B]">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {cart.map((cartItem) => (
                  <motion.div
                    key={cartItem.item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-[#FFFAF5] p-3 rounded-xl"
                  >
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1E1E1E] mb-1">
                        {cartItem.item.name}
                      </h4>
                      <p className="text-sm text-[#6B6B6B] mb-2">
                        ₹{cartItem.item.price}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              cartItem.item.id,
                              cartItem.quantity - 1
                            )
                          }
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#E5E5E5] transition-colors"
                        >
                          <Minus className="w-4 h-4 text-[#1E1E1E]" />
                        </button>
                        <span className="w-8 text-center font-semibold text-[#1E1E1E]">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              cartItem.item.id,
                              cartItem.quantity + 1
                            )
                          }
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-[#E5E5E5] transition-colors"
                        >
                          <Plus className="w-4 h-4 text-[#1E1E1E]" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      className="self-start p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#EF4444]" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5E5E5] px-6 py-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#1E1E1E]">
                  Total
                </span>
                <span className="text-2xl font-bold text-[#1E1E1E]">
                  ₹{total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckout('UPI')}
                  className="bg-[#FF6B00] text-white py-3 rounded-full font-semibold hover:bg-[#FF8A00] transition-colors"
                >
                  Pay Online
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckout('Cash')}
                  className="bg-[#1E1E1E] text-white py-3 rounded-full font-semibold hover:bg-[#3E3E3E] transition-colors"
                >
                  Pay Cash
                </motion.button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
