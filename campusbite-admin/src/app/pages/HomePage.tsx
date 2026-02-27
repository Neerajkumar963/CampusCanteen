import { motion } from 'motion/react';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B00] to-[#FF8A00] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
        >
          <span className="text-5xl">🍔</span>
        </motion.div>

        <h1 className="text-6xl font-bold text-white mb-4">CampusBite</h1>
        <p className="text-xl text-white/90 mb-12">
          Fast & Delicious Campus Dining
        </p>

        <div className="grid gap-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin')}
            className="flex items-center justify-center gap-3 bg-white/10 text-white border-2 border-white px-8 py-5 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-colors"
          >
            <LayoutDashboard className="w-6 h-6" />
            Admin Panel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
