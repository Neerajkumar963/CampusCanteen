import { motion } from 'motion/react';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
        >
          <span className="text-5xl">🍔</span>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl font-black text-[#1A1A1A] mb-4 tracking-tight">CampusBite</h1>
        <p className="text-lg sm:text-xl text-[#666666] mb-12 font-medium">
          Fast & Delicious Campus Dining
        </p>

        <div className="grid gap-4 max-w-sm mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin')}
            className="flex items-center justify-center gap-3 bg-[#FF6B00] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#E65C00] transition-colors shadow-lg"
          >
            <LayoutDashboard className="w-6 h-6" />
            Admin Panel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
