import { motion } from 'motion/react';
import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFAF5] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '32px',
            boxShadow: '0 12px 32px rgba(255, 107, 0, 0.2)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '60px', lineHeight: 1 }}>🍔</span>
        </motion.div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#000' }}>
          CampusBite
        </h1>

        <p style={{ color: '#666666', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '300px' }}>
          Fast & Delicious Campus Dining
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin')}
          style={{
            background: '#FF6B00',
            color: 'white',
            border: 'none',
            padding: '1rem 3rem',
            borderRadius: '99px',
            fontSize: '1.25rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'center'
          }}
        >
          <LayoutDashboard size={24} />
          Admin Panel
        </motion.button>
      </motion.div>
    </div>
  );
}
