import { useState, useEffect } from 'react';
import {
  ShoppingBasket,
  Utensils,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Check,
  Smartphone,
  CreditCard,
  Banknote,
  Star,
  Zap,
  Coffee,
  Trash2,
  Minus,
  X,
  FileText,
  Clock,
  ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useStore } from './store/useStore';

const socket = io(import.meta.env.VITE_API_URL || '');

// --- Types ---
interface MenuItem {
  menuId: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  vendorId?: string;
  badge?: string;
  isCombo?: boolean;
  available?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

type ServiceType = 'counter' | 'table' | 'hostel' | 'classroom';
type Screen = 'welcome' | 'canteen-selector' | 'menu' | 'service' | 'verify' | 'checkout' | 'success';

interface Vendor {
  id: string;
  name: string;
  description: string;
  image: string;
  campus: string;
}

// --- Data ---
const VENDORS: Vendor[] = [
  { id: 'canteen-a', name: 'Main Canteen', description: 'Burgers, Sandwiches & Beverages', image: 'https://images.unsplash.com/photo-1567529854338-fc097b962123?w=800', campus: 'GGI' },
  { id: 'canteen-b', name: 'South Side Cafe', description: 'Coffee & Snacks', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', campus: 'GGI' },
  { id: 'stationery', name: 'Stationery', description: 'Pens, Books & more', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800', campus: 'GGI' },
  { id: 'canteen-c', name: 'LPU Mega Canteen', description: 'North & South Indian', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', campus: 'LPU' },
];



const SERVICE_FEES: Record<ServiceType, number> = {
  counter: 0,
  table: 10,
  hostel: 20,
  classroom: 15,
};

// --- App Component ---
export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [serviceType, setServiceType] = useState<ServiceType>('counter');
  const [serviceId, setServiceId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Combos');
  const [upsellItem, setUpsellItem] = useState<MenuItem | null>(null);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [campusCode, setCampusCode] = useState<string>('');
  const [isInvalidUrlModalOpen, setIsInvalidUrlModalOpen] = useState(false);

  const menuItems = useStore(state => state.menu);
  const fetchMenu = useStore(state => state.fetchMenu);
  const myOrders = useStore(state => state.myOrders);
  const addOrder = useStore(state => state.addOrder);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('campus');
    if (code) {
      setCampusCode(code.toUpperCase());
    }

    fetchMenu();
    socket.on('order_status_update', (data: any) => {
      // Check against orderId which is what the backend sends as 'id', or other common ID fields
      const matches = lastOrder && (
        data.id === lastOrder.orderId ||
        data.id === lastOrder.id ||
        data.id === lastOrder._id
      );

      if (matches) {
        setLastOrder((prev: any) => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socket.off('order_status_update');
    };
  }, [lastOrder]);

  const handleOrderConfirm = async (paymentMethod: 'UPI' | 'Cash', razorpayDetails?: any) => {
    const orderData = {
      vendorId: selectedVendor?.id,
      vendorName: selectedVendor?.name,
      items: cart.map(i => ({ item: i, quantity: i.quantity })),
      total: total,
      orderType: serviceType === 'counter' ? 'Pickup' : (serviceType === 'table' ? 'Table' : 'Delivery'),
      serviceId: serviceId,
      paymentMethod,
      customerName,
      customerPhone,
      timestamp: new Date(), // Add timestamp for local display consistency
      ...(razorpayDetails || {})
    };

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const order = await response.json();
      if (response.ok) {
        setLastOrder(order);
        addOrder(order);
        setScreen('success');
      } else {
        throw new Error(order.error || 'Server rejected order');
      }
    } catch (err) {
      console.error('Order submission failed:', err);
      alert('Order failed to reach server. Please check your connection and try again.');
      // Do NOT set screen to success
    }
  };

  const addToCart = (item: MenuItem, triggerUpsell = true) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuId === item.menuId);
      if (existing) {
        return prev.map(i => i.menuId === item.menuId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    if (triggerUpsell && item.category === 'Burgers') {
      const combo = menuItems.find((i: MenuItem) => i.isCombo);
      if (combo) {
        setUpsellItem(combo);
        setPendingItem(item);
      }
    }
  };

  const updateQuantity = (menuId: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menuId === menuId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + SERVICE_FEES[serviceType];

  const activeOrders = myOrders.filter(o => ['Pending', 'Preparing', 'Ready', 'Cancelled'].includes(o.status));

  return (
    <div className="kiosk-container relative">
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <WelcomeScreen key="welcome" onStart={() => {
            if (!campusCode) {
              setIsInvalidUrlModalOpen(true);
              return;
            }
            setScreen('canteen-selector');
          }} />
        )}
        {screen === 'canteen-selector' && (
          <CanteenSelectorScreen
            key="selector"
            campusCode={campusCode}
            vendors={VENDORS.filter(v => v.campus === campusCode)}
            onSelect={(vendor: Vendor) => {
              setSelectedVendor(vendor);
              setCart([]); // Reset cart on canteen change
              setScreen('menu');
            }}
          />
        )}
        {screen === 'menu' && (
          <MenuScreen
            key="menu"
            vendorName={selectedVendor?.name || 'Canteen'}
            vendorId={selectedVendor?.id}
            onBack={() => setScreen('canteen-selector')}
            onNext={() => setScreen('service')}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddToCart={addToCart}
            cartCount={cart.length}
            cartTotal={subtotal}
            menuItems={menuItems}
          />
        )}
        {screen === 'service' && (
          <ServiceScreen
            key="service"
            cart={cart}
            selected={serviceType}
            serviceId={serviceId}
            onSelect={setServiceType}
            onIdChange={setServiceId}
            onBack={() => setScreen('menu')}
            onNext={() => {
              if (serviceType === 'hostel' || serviceType === 'classroom') {
                setScreen('verify');
              } else {
                setScreen('checkout');
              }
            }}
            vendorName={selectedVendor?.name}
            onUpdateQty={updateQuantity}
          />
        )}
        {screen === 'verify' && (
          <UserDetailsScreen
            key="verify"
            name={customerName}
            phone={customerPhone}
            onNameChange={setCustomerName}
            onPhoneChange={setCustomerPhone}
            isVerified={isVerified}
            onVerified={() => setIsVerified(true)}
            onBack={() => setScreen('service')}
            onNext={() => setScreen('checkout')}
          />
        )}
        {screen === 'checkout' && (
          <CheckoutScreen
            key="checkout"
            cart={cart}
            serviceFee={SERVICE_FEES[serviceType]}
            total={total}
            serviceType={serviceType}
            serviceId={serviceId}
            onBack={() => {
              if (serviceType === 'hostel' || serviceType === 'classroom') {
                setScreen('verify');
              } else {
                setScreen('service');
              }
            }}
            onConfirm={handleOrderConfirm}
          />
        )}
        {screen === 'success' && (
          <SuccessScreen key="success"
            serviceType={serviceType}
            tokenNumber={lastOrder?.tokenNumber || '??'}
            status={lastOrder?.status || 'Preparing'}
            onReset={() => {
              setCart([]);
              setScreen('welcome');
              setSelectedVendor(null);
              setServiceType('counter');
              setServiceId('');
              setCustomerName('');
              setLastOrder(null);
              setCustomerPhone('');
              setIsVerified(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating My Orders Widget */}
      {screen !== 'success' && activeOrders.length > 0 && !isMyOrdersOpen && (
        <button
          onClick={() => setIsMyOrdersOpen(true)}
          style={{
            position: 'fixed',
            top: '0.25rem',
            right: '1rem',
            backgroundColor: 'white',
            boxShadow: '0 20px 25px -5px rgba(255, 107, 0, 0.2), 0 8px 10px -6px rgba(255, 107, 0, 0.2)',
            width: '2.8rem',
            height: '2.8rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            border: '2px solid #FF6B00',
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <ChefHat color="#FF6B00" size={20} />
            <span style={{
              position: 'absolute',
              top: '-0.3rem',
              right: '-0.4rem',
              backgroundColor: '#EF4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              width: '1rem',
              height: '1rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeOrders.length}
            </span>
          </div>
        </button>
      )}

      {/* My Orders Overlay */}
      <AnimatePresence>
        {isMyOrdersOpen && (
          <MyOrdersScreen
            key="my-orders"
            orders={activeOrders}
            onClose={() => setIsMyOrdersOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Upsell Modal */}
      <AnimatePresence>
        {upsellItem && (
          <div className="modal-backdrop">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="upsell-modal"
            >
              <button className="close-modal" onClick={() => setUpsellItem(null)}><X /></button>
              <div className="upsell-badge">SPECIAL OFFER</div>
              <h2 style={{ marginTop: '1rem' }}>Smart Choice! 🍔</h2>
              <p>Why not upgrade to a combo and save ₹40?</p>

              <div className="upsell-card" style={{ margin: '2rem 0', background: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', gap: '1.5rem', textAlign: 'left', border: '2px solid var(--primary)' }}>
                <img src={upsellItem.image} style={{ width: '120px', borderRadius: '16px' }} />
                <div>
                  <h3 className="primary-text">{upsellItem.name}</h3>
                  <p style={{ fontSize: '0.9rem' }}>Burger + Fries + Cold Drink</p>
                  <div style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>₹{upsellItem.price}</div>
                </div>
              </div>

              <div className="flex-col gap-1">
                <button className="primary-btn" style={{ width: '100%' }} onClick={() => {
                  if (pendingItem) {
                    setCart(prev => prev.filter(i => i.menuId !== pendingItem.menuId));
                    addToCart(upsellItem, false);
                  }
                  setUpsellItem(null);
                  setPendingItem(null);
                }}>YES, UPGRADE ME!</button>
                <button
                  className="glass-btn"
                  style={{ width: '100%', marginTop: '0.5rem', border: 'none' }}
                  onClick={() => {
                    const original = menuItems.find((i: MenuItem) => i.menuId === 1);
                    if (original) addToCart(original, false);
                    setUpsellItem(null);
                  }}
                >No thanks, I'll take the burger</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invalid URL Modal */}
      <AnimatePresence>
        {isInvalidUrlModalOpen && (
          <div className="modal-backdrop">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="upsell-modal"
              style={{ textAlign: 'center', maxWidth: '350px' }}
            >
              <div style={{ margin: '0 auto 1.5rem auto', width: '80px', height: '80px', background: '#FFF0F0', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={40} strokeWidth={2.5} />
              </div>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>Invalid Campus Code</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', lineHeight: '1.5' }}>
                We couldn't detect your campus. Please scan a valid QR code on a campus table to start your order.
              </p>
              <button
                className="primary-btn"
                style={{ width: '100%', padding: '1rem' }}
                onClick={() => setIsInvalidUrlModalOpen(false)}
              >
                Okay, got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Screens ---

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="welcome-screen"
    >
      <div className="welcome-logo-box">
        <Utensils size={60} color="var(--primary)" />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#000', letterSpacing: '-0.02em' }}>CampusBite</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '300px' }}>
        Fresh food from your favorite campus canteens.
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="start-button-white"
        onClick={onStart}
      >
        Order Now
      </motion.button>
    </motion.div>
  );
}

function CanteenSelectorScreen({ onSelect, campusCode, vendors }: { onSelect: (v: Vendor) => void, campusCode: string, vendors: Vendor[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="screen"
      style={{ padding: '2rem 1rem 8rem 1rem', overflowY: 'auto' }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>{campusCode} Campus</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '2rem' }}>Select a canteen to browse menu</p>

      <div className="canteen-grid">
        {vendors.map(vendor => (
          <motion.div
            key={vendor.id}
            className="vendor-card"
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(vendor)}
          >
            <img src={vendor.image} className="vendor-card-img" alt={vendor.name} />
            <div style={{ padding: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{vendor.name}</h2>
              <p style={{ color: 'var(--text-dim)', marginTop: '0.25rem', fontSize: '0.8rem' }}>{vendor.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function MenuScreen({ vendorName, vendorId, onBack, onNext, selectedCategory, onSelectCategory, onAddToCart, cartCount, cartTotal, menuItems }: any) {
  // Dynamically filter items by vendorId from the backend
  const vendorItems = menuItems.filter((item: MenuItem) => item.vendorId === vendorId);

  const vendorCategories = Array.from(new Set(vendorItems.map((item: MenuItem) => item.category))) as string[];

  const categoryIcons: any = {
    'Combos': <Zap size={20} />,
    'Burgers': <Utensils size={20} />,
    'Snacks': <ShoppingBasket size={20} />,
    'Sides': <Star size={20} />,
    'Drinks': <Coffee size={20} />,
    'Books': <ShoppingBasket size={20} />,
    'Stationery': <Utensils size={20} />,
    'Electronics': <Zap size={20} />
  };

  const categories = vendorCategories.map(cat => ({
    name: cat,
    icon: categoryIcons[cat] || <ShoppingBasket size={20} />
  }));

  // Ensure selected category is valid for this vendor
  useEffect(() => {
    if (vendorCategories.length > 0 && !vendorCategories.includes(selectedCategory)) {
      onSelectCategory(vendorCategories[0]);
    }
  }, [vendorId, vendorCategories, selectedCategory, onSelectCategory]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="screen">
      <header className="app-header">
        <button className="back-circle" onClick={onBack}><ArrowLeft size={18} /></button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{vendorName}</h2>
          <span style={{ fontSize: '0.7rem', color: '#0C831F', fontWeight: 700 }}>● Live</span>
        </div>
      </header>

      <div className="menu-layout">
        <aside className="category-sidebar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`cat-button ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
            >
              <div className="cat-icon-box">{cat.icon}</div>
              <span>{cat.name}</span>
            </button>
          ))}
        </aside>

        <div className="menu-grid">
          {vendorItems.filter((i: MenuItem) => i.category === selectedCategory).map((item: MenuItem) => (
            <div key={item.menuId} className={`menu-item-card ${!item.available ? 'grayscale opacity-60' : ''}`}>
              <div className="item-img-container">
                <img src={item.image} alt={item.name} />
                {item.badge && <div className="card-floating-badge" style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>{item.badge}</div>}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 font-bold rounded-lg transform -rotate-12 border-2 border-white shadow-lg text-sm">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>
              <div className="item-details">
                <h3 className="bold">{item.name}</h3>
                <p className="item-desc">{item.description}</p>
              </div>
              <div className="item-footer">
                <span className="price-now">₹{item.price}</span>
                <button
                  className={`add-item-btn ${!item.available ? 'bg-gray-400 cursor-not-allowed text-gray-200 border-none' : ''}`}
                  onClick={() => item.available && onAddToCart(item)}
                  disabled={!item.available}
                >
                  {item.available ? 'ADD' : 'UNAVAILABLE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="cart-overlay"
          onClick={onNext}
        >
          <div className="cart-left">
            <div className="cart-icon-white">
              <ShoppingBasket size={20} />
            </div>
            <div className="cart-info">
              <span className="count">{cartCount} items</span>
              <span className="total">₹{cartTotal}</span>
            </div>
          </div>
          <div className="view-cart-btn">
            <span>View Cart</span>
            <ChevronRight size={20} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ServiceScreen({ cart, selected, serviceId, onSelect, onIdChange, onBack, onNext, vendorName, onUpdateQty }: any) {
  const allOptions = [
    { id: 'counter', title: 'Self Pickup', price: 'FREE', icon: <Utensils size={24} /> },
    { id: 'table', title: 'Table Service', price: 'FREE', icon: <MapPin size={24} /> },
    { id: 'hostel', title: 'Hostel Delivery', price: '+ ₹20', icon: <Smartphone size={24} /> },
    { id: 'classroom', title: 'Classroom Delivery', price: '+ ₹15', icon: <Smartphone size={24} /> },
  ];

  // Logic: Show Classroom only for food canteens, not stationery
  const options = vendorName?.toLowerCase().includes('stationery')
    ? allOptions.slice(0, 3)
    : allOptions;

  const [blockNum, setBlockNum] = useState('');
  const [roomNum, setRoomNum] = useState('');
  const handleBlockChange = (val: string) => {
    // Only letters allowed for Block
    if (/^[a-zA-Z]*$/.test(val) && val.length <= 2) {
      setBlockNum(val.toUpperCase());
    }
  };

  const handleRoomChange = (val: string) => {
    // Only numbers allowed for Room
    if (/^\d*$/.test(val) && val.length <= 4) {
      setRoomNum(val);
    }
  };

  const handleTableChange = (val: string) => {
    // Only numbers allowed for Table
    if (/^\d*$/.test(val) && val.length <= 3) {
      onIdChange(val);
    }
  };

  return (
    <motion.div initial={{ x: '100vw' }} animate={{ x: 0 }} className="screen" style={{ background: '#FFFAF5', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header sticky">
        <button className="back-circle" onClick={onBack}><ArrowLeft size={18} /></button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Order Details</h2>
      </header>

      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', paddingBottom: '100px' }}>
        {/* "NOW" Item Card at the top with interactive controls */}
        <div className="flex-col gap-1" style={{ marginBottom: '2rem' }}>
          {cart.map((item: any) => (
            <div key={item.menuId} className="item-mini-card">
              <img src={item.image} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} alt={item.name} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{item.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 800, margin: '4px 0 0', fontSize: '0.9rem' }}>₹{item.price}</p>
              </div>
              <div className="qty-control" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F5F0EA', padding: '0.4rem 0.8rem', borderRadius: '99px' }}>
                <button onClick={() => onUpdateQty(item.menuId, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}>
                  {item.quantity > 1 ? (
                    <Minus size={14} color="var(--primary-dark)" />
                  ) : (
                    <Trash2 size={14} color="var(--primary-dark)" />
                  )}
                </button>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.menuId, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={14} color="var(--primary-dark)" /></button>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#1A1A1A' }}>
          How would you like to receive your order?
        </h3>

        <div className="flex-col gap-05" style={{ marginBottom: '2.5rem' }}>
          {options.map(opt => (
            <div
              key={opt.id}
              className={`service-option ${selected === opt.id ? 'active' : ''}`}
              onClick={() => {
                onSelect(opt.id);
              }}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: selected === opt.id ? 'var(--primary)' : 'var(--text-dim)' }}>
                  {opt.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>{opt.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>{opt.price}</p>
                </div>
              </div>
              {selected === opt.id && <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color="var(--primary)" strokeWidth={3} />
              </div>}
            </div>
          ))}
        </div>

        {selected !== 'counter' && (
          <div className="flex-col" style={{ alignItems: 'center', marginBottom: '2.5rem', gap: '1rem' }}>
            {(selected === 'hostel' || selected === 'classroom') ? (
              <>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.75rem' }}>Enter Block Name</h3>
                  <input
                    className="dashed-input-box"
                    placeholder="e.g. A"
                    value={blockNum}
                    onChange={(e) => handleBlockChange(e.target.value)}
                    style={{ width: '100%', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}
                  />
                </div>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.75rem' }}>Enter Room Number</h3>
                  <input
                    className="dashed-input-box"
                    placeholder="e.g. 101"
                    type="number"
                    value={roomNum}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    style={{ width: '100%', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}
                  />
                </div>
              </>
            ) : (
              <div style={{ width: '100%' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '0.75rem' }}>
                  Enter Table Number
                </h3>
                <input
                  className="dashed-input-box"
                  placeholder="e.g. 5"
                  type="number"
                  value={serviceId}
                  onChange={(e) => handleTableChange(e.target.value)}
                  style={{ width: '100%', textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '1rem 1.5rem 1.5rem 1.5rem',
        background: 'linear-gradient(to top, #FFFAF5 80%, transparent)',
        zIndex: 10
      }}>
        <button
          className="primary-btn"
          style={{
            width: '100%',
            padding: '1.25rem',
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'white',
            background: (selected !== 'counter' && (selected === 'table' ? !serviceId : (!blockNum || !roomNum))) ? '' : '#10B981'
          }}
          onClick={() => {
            const finalId = (selected === 'hostel' || selected === 'classroom')
              ? `Block ${blockNum}, Room ${roomNum}`
              : serviceId;
            onIdChange(finalId);
            onNext();
          }}
          disabled={selected !== 'counter' && (
            selected === 'table' ? !serviceId : (!blockNum || !roomNum)
          )}
        >
          Pay Now
        </button>
      </div>
    </motion.div>
  );
}

function UserDetailsScreen({ name, phone, onNameChange, onPhoneChange, isVerified, onVerified, onBack, onNext }: any) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (!name || phone.length < 10) {
      setError('Please enter valid name and 10-digit phone number');
      return;
    }
    setError('');
    setOtpSent(true);
    // Mock OTP delivery
    alert("Verification Code Sent! (Use 1234 for testing)");
  };

  const handleVerify = () => {
    if (otp === '1234') {
      onVerified();
      setError('');
    } else {
      setError('Invalid verification code');
    }
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="screen" style={{ background: '#FFFAF5' }}>
      <header className="app-header sticky">
        <button className="back-circle" onClick={onBack}><ArrowLeft size={18} /></button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Delivery Details</h2>
      </header>

      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#FFEBE0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Smartphone size={32} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Verify Your Number</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Required for Hostel/Classroom deliveries</p>
        </div>

        <div className="flex-col" style={{ gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4B5563' }}>Full Name</label>
            <input
              className="dashed-input-box"
              style={{ width: '100%', padding: '1rem', background: 'white', fontSize: '1rem' }}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isVerified}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4B5563' }}>Phone Number</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input
                className="dashed-input-box"
                style={{ flex: 1, padding: '1rem', background: 'white', fontSize: '1rem', minWidth: 0 }}
                placeholder="10-digit number"
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
                disabled={isVerified}
              />
              {!isVerified && (
                <button
                  className="primary-btn"
                  style={{ padding: '0 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap', minWidth: '80px' }}
                  onClick={handleSendOtp}
                  disabled={!name || phone.length < 10}
                >
                  {otpSent ? 'Resend' : 'Send'}
                </button>
              )}
            </div>
          </div>

          {otpSent && !isVerified && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#4B5563' }}>Enter Code</label>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input
                  className="dashed-input-box"
                  style={{ flex: 1, padding: '1rem', background: 'white', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.5rem', minWidth: 0 }}
                  placeholder="----"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  className="primary-btn"
                  style={{ padding: '0 1rem', fontSize: '0.85rem', background: '#10B981', whiteSpace: 'nowrap', minWidth: '80px' }}
                  onClick={handleVerify}
                  disabled={otp.length < 4}
                >
                  Verify
                </button>
              </div>
            </motion.div>
          )}

          {isVerified && (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
              <CheckCircle2 size={20} /> Number Verified Successfully!
            </div>
          )}

          {error && (
            <p style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{error}</p>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
          <button
            className="primary-btn"
            style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem' }}
            onClick={onNext}
            disabled={!isVerified}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CheckoutScreen({ cart, serviceFee, total, serviceType, serviceId, onBack, onConfirm }: any) {
  const getServiceLabel = (id: string) => {
    switch (id) {
      case 'table': return 'Table Service Charge';
      case 'hostel': return 'Hostel Delivery Service Charge';
      case 'classroom': return 'Classroom Delivery Service Charge';
      default: return 'Service Charge';
    }
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="screen" style={{ background: '#FFFAF5' }}>
      <header className="app-header sticky">
        <button className="back-circle" onClick={onBack}><ArrowLeft size={18} /></button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Review Order</h2>
      </header>

      <div className="checkout-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', padding: 0 }}>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* "NOW" Bill Summary at the top of Review Order */}
          <div className="bill-card-v2" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className="bill-summary-icon"><ShoppingBasket size={20} /></div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Bill Summary</h3>
              </div>
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>{cart.length} Items</span>
            </div>

            <div className="flex-col gap-05">
              {cart.map((item: any) => (
                <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              {serviceFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <span>{getServiceLabel(serviceType)}</span>
                  <span>₹{serviceFee}</span>
                </div>
              )}
              {serviceId && (
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {serviceType === 'table' ? `Table Number: ${serviceId}` : serviceId}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Receipt Block at the bottom */}
        <div className="checkout-bottom-v2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A1A1A' }}>Amount to Pay</span>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)' }}>₹{total}</span>
            </div>
          </div>

          <div className="flex-col gap-05">
            <button className="btn-black-border" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }} onClick={async () => {
              try {
                const baseUrl = import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${baseUrl}/api/ordering/create-kiosk-order`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ amount: total })
                });
                const order = await response.json();

                const options = {
                  key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SL82HYZ95efW68',
                  amount: order.amount,
                  currency: order.currency,
                  name: "CampusBite Kiosk",
                  description: "Campus Food Order",
                  order_id: order.id,
                  prefill: {
                    name: "Campus Student",
                    contact: "9999999999",
                    email: "student@campusbite.com",
                  },
                  handler: function (response: any) {
                    onConfirm('UPI', response);
                  },
                  theme: { color: "#FF6B00" },
                  config: {
                    display: {
                      blocks: {
                        custom_methods: {
                          name: 'Payment Methods',
                          instruments: [
                            { method: 'upi' },
                            { method: 'card' },
                            { method: 'netbanking' }
                          ]
                        }
                      },
                      sequence: ['block.custom_methods'],
                      preferences: {
                        show_default_blocks: false
                      }
                    }
                  }
                };

                const loadRazorpay = () => {
                  return new Promise((resolve) => {
                    if ((window as any).Razorpay) {
                      resolve(true);
                      return;
                    }
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                  });
                };

                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                  alert("Failed to load Razorpay SDK. Please check your connection.");
                  return;
                }

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
              } catch (err) {
                console.error('Payment Error:', err);
                alert("Payment initialization failed. Please try again or pay in cash.");
              }
            }}>
              <CreditCard size={20} /> PAY ONLINE
            </button>
            {(serviceType !== 'hostel' && serviceType !== 'classroom') ? (
              <button className="btn-ghost-border" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} onClick={() => onConfirm('Cash')}>
                <Banknote size={20} /> PAY BY CASH
              </button>
            ) : (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Cash on delivery is currently unavailable for delivery orders.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ serviceType, onReset, tokenNumber, status }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="welcome-screen">
      <div className="success-animation" style={{ transform: 'scale(0.8)', marginBottom: '-1rem' }}>
        <CheckCircle2 size={70} />
      </div>
      <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }}>Order Placed!</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Your meal is being prepared with love.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', width: '100%', maxWidth: '300px' }}>
        <div className="otp-card" style={{ background: 'white', color: 'black', width: '100%', padding: '1.25rem', borderRadius: '16px', border: '2px solid #EEE5DD', textAlign: 'center' }}>
          <p style={{ fontWeight: 700, opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.25rem' }}>TOKEN NUMBER</p>
          <div className="otp-number primary-text" style={{ fontSize: '2.5rem', fontWeight: 900 }}>#{tokenNumber}</div>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{status.toUpperCase()}</p>
        </div>

        {(serviceType === 'hostel' || serviceType === 'classroom') && (
          <div className="otp-card" style={{ background: 'var(--secondary)', color: 'white', width: '100%', padding: '1.25rem', borderRadius: '16px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, opacity: 0.8, fontSize: '0.8rem', marginBottom: '0.25rem' }}>DELIVERY OTP</p>
            <div className="otp-number" style={{ fontSize: '2rem', fontWeight: 900 }}>8241</div>
          </div>
        )}
      </div>

      <button className="start-button-white" style={{ marginTop: '2rem', background: 'white', color: 'var(--primary)', border: 'none', padding: '1rem 3rem', borderRadius: '99px', fontWeight: 800, fontSize: '1.1rem' }} onClick={onReset}>
        Place New Order
      </button>
    </motion.div>
  );
}

function MyOrdersScreen({ orders, onClose }: any) {
  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="screen" style={{ background: '#FFFAF5', zIndex: 300, position: 'fixed', inset: 0 }}>
      <header className="app-header sticky" style={{ borderBottom: '1px solid #E5E5E5' }}>
        <button className="back-circle" onClick={onClose}><X size={18} /></button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My active orders</h2>
      </header>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-dim)' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>You have no active orders.</p>
          </div>
        ) : (
          <div className="flex-col gap-1">
            {orders.slice().reverse().map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border-2" style={{ borderColor: order.status === 'Cancelled' ? '#EF4444' : '#FFEBE0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>#{order.tokenNumber}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: '2px' }}>{order.vendorName}</p>
                    <div style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: order.paymentStatus === 'Paid' ? '#DCFCE7' : '#FFEDD5',
                      color: order.paymentStatus === 'Paid' ? '#16A34A' : '#EA580C'
                    }}>
                      {order.paymentStatus === 'Paid' ? 'PAID' : 'PAYMENT PENDING'}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.375rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    ...(order.status === 'Pending' ? { backgroundColor: '#FFEDD5', color: '#EA580C' } :
                      order.status === 'Preparing' ? { backgroundColor: '#DBEAFE', color: '#2563EB' } :
                        order.status === 'Ready' ? { backgroundColor: '#DCFCE7', color: '#16A34A' } :
                          order.status === 'Cancelled' ? { backgroundColor: '#FEE2E2', color: '#DC2626' } :
                            { backgroundColor: '#F3F4F6', color: '#4B5563' })
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {order.status === 'Cancelled' && (
                  <div style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    border: '1px solid #FECACA'
                  }}>
                    <X size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#991B1B', margin: 0 }}>
                      This order was cancelled by the canteen. Please visit the counter or contact support.
                    </p>
                  </div>
                )}

                <div className="flex-col gap-05" style={{ marginBottom: '1rem' }}>
                  {order.items.map((i: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{i.quantity}x {i.item.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px dashed #E5E5E5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} color="var(--text-dim)" style={{ marginTop: '-1px' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 600, lineHeight: 1 }}>
                      {new Date(order.createdAt || order.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1A1A' }}>₹{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
