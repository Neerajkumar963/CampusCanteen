import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  vendorId?: string;
  prepTime?: number;
}

export interface Combo {
  _id?: string;
  name: string;
  items: number[]; // menuIds
  discount: number;
  enabled: boolean;
  vendorId: string;
  image?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface Order {
  orderId: number;
  tokenNumber: number;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  orderType: 'Pickup' | 'Table' | 'Hostel' | 'Classroom';
  serviceId?: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  paymentStatus?: 'Pending' | 'Paid';
  createdAt: string;
  vendorId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryOtp?: string;
}

export interface Vendor {
  _id?: string;
  vendorId: string;
  name: string;
  description: string;
  image?: string;
  role: 'vendor' | 'superadmin';
  campusId?: string | { _id: string, name: string, code: string };
  supportedServices?: string[];
  deliveryCharge?: number;
  tableServiceCharge?: number;
  hostelServiceCharge?: number;
  subscription?: {
    status: 'Active' | 'Suspended';
    validUntil: string;
  };
}

interface StoreState {
  currentVendor: Vendor | null;
  login: (vendor: Vendor) => void;
  logout: () => void;
  cart: CartItem[];
  orders: Order[];
  menu: MenuItem[];
  combos: Combo[];
  settings: {
    deliveryCharge: number;
    tableServiceCharge: number;
    taxPercent: number;
    upiEnabled: boolean;
    cashEnabled: boolean;
  };
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  updateCartQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  createOrder: (paymentMethod: string, orderType: 'Pickup' | 'Table' | 'Hostel' | 'Classroom') => Order;
  updateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  updateOrderPaymentStatus: (orderId: number, paymentStatus: 'Pending' | 'Paid') => Promise<void>;
  getTodayOrders: () => Order[];
  getTodayRevenue: () => number;
  updateMenuItem: (itemId: number, updates: Partial<MenuItem>) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  fetchCombos: (vendorId: string) => Promise<void>;
  addCombo: (combo: Omit<Combo, '_id'>) => Promise<void>;
  updateCombo: (id: string, updates: Partial<Combo>) => Promise<void>;
  deleteCombo: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => {
  // Listen for socket events
  socket.on('initial_orders', (initialOrders) => {
    set({ orders: initialOrders });
  });

  socket.on('initial_menu', (initialMenu: any[]) => {
    const mapped = initialMenu.map(item => ({
      ...item,
      id: item.menuId || item.id
    }));
    set({ menu: mapped });
  });

  socket.on('new_order_pulse', (newOrder) => {
    set((state) => ({
      orders: [...state.orders, newOrder],
    }));
  });

  socket.on('order_status_update', (data) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.orderId === data.id ? { ...order, status: data.status } : order
      ),
    }));
  });

  socket.on('order_payment_update', (data: { id: number, paymentStatus: 'Pending' | 'Paid' }) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.orderId === data.id ? { ...order, paymentStatus: data.paymentStatus } : order
      ),
    }));
  });

  socket.on('menu_updated', (updatedItem: any) => {
    const itemWithId = { ...updatedItem, id: updatedItem.menuId || updatedItem.id };
    set((state) => ({
      menu: state.menu.map((item) =>
        item.id === itemWithId.id ? itemWithId : item
      ),
    }));
  });

  socket.on('combos_updated', (data: { type: 'create' | 'update' | 'delete', combo?: Combo, id?: string }) => {
    set((state) => {
      if (data.type === 'create' && data.combo) {
        return { combos: [...state.combos, data.combo] };
      }
      if (data.type === 'update' && data.combo) {
        const updatedCombo = data.combo;
        return {
          combos: state.combos.map(c => c._id === updatedCombo._id ? updatedCombo : c)
        };
      }
      if (data.type === 'delete' && data.id) {
        const deleteId = data.id;
        return {
          combos: state.combos.filter(c => c._id !== deleteId)
        };
      }
      return state;
    });
  });

  return {
    currentVendor: null,
    login: (vendor) => set({ currentVendor: vendor }),
    logout: () => {
      localStorage.removeItem('currentVendor');
      set({ currentVendor: null, orders: [], menu: [] });
    },
    cart: [],
    orders: [],
    menu: [],
    combos: [],
    settings: {
      deliveryCharge: 20,
      tableServiceCharge: 10,
      taxPercent: 5,
      upiEnabled: true,
      cashEnabled: true,
    },

    addToCart: (item) => {
      set((state) => {
        const existingItem = state.cart.find((cartItem) => cartItem.item.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map((cartItem) =>
              cartItem.item.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
          };
        }
        return {
          cart: [...state.cart, { item, quantity: 1 }],
        };
      });
    },

    removeFromCart: (itemId) => {
      set((state) => ({
        cart: state.cart.filter((cartItem) => cartItem.item.id !== itemId),
      }));
    },

    updateCartQuantity: (itemId, quantity) => {
      set((state) => {
        if (quantity <= 0) {
          return {
            cart: state.cart.filter((cartItem) => cartItem.item.id !== itemId),
          };
        }
        return {
          cart: state.cart.map((cartItem) =>
            cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem
          ),
        };
      });
    },

    clearCart: () => {
      set({ cart: [] });
    },

    getCartTotal: () => {
      const state = get();
      return state.cart.reduce((total, cartItem) => {
        return total + cartItem.item.price * cartItem.quantity;
      }, 0);
    },

    createOrder: (paymentMethod, orderType) => {
      const state = get();
      const tokenNumber = state.orders.length + 1;
      const order: Order = {
        orderId: Date.now() as any, // Cast if the interface strictly expects something else
        tokenNumber,
        items: [...state.cart],
        total: state.getCartTotal(),
        paymentMethod,
        orderType,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        orders: [...state.orders, order],
        cart: [],
      }));

      return order;
    },

    updateOrderStatus: async (orderId, status) => {
      try {
        await fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        // The socket event 'order_status_update' will handle the local state update
      } catch (err) {
        console.error('Failed to update order status:', err);
        // Optimistic/Fallback local update
        set((state) => ({
          orders: state.orders.map((order) =>
            order.orderId === orderId ? { ...order, status } : order
          ),
        }));
      }
    },

    updateOrderPaymentStatus: async (orderId, paymentStatus) => {
      try {
        await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus }),
        });
      } catch (err) {
        console.error('Failed to update payment status:', err);
        // Optimistic/Fallback local update
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, paymentStatus } : order
          ),
        }));
      }
    },

    getTodayOrders: () => {
      const state = get();
      if (!state.currentVendor) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.orders.filter((order) => {
        // Must belong to this vendor
        if (order.vendorId && order.vendorId !== state.currentVendor?.vendorId) {
          return false;
        }
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    },

    getTodayRevenue: () => {
      const todayOrders = get().getTodayOrders();
      return todayOrders
        .filter((order) => order.status !== 'Cancelled')
        .reduce((total, order) => total + order.total, 0);
    },

    updateMenuItem: async (itemId, updates) => {
      try {
        await fetch(`${API_URL}/api/menu/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        // The socket event 'menu_updated' will handle the local state update
      } catch (err) {
        console.error('Failed to update menu item:', err);
        // Optimistic/Fallback local update
        set((state) => ({
          menu: state.menu.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
      }
    },
    addMenuItem: async (item) => {
      try {
        const response = await fetch(`${API_URL}/api/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        const data = await response.json();
        if (data.success) {
          // The socket event 'menu_updated' will handle the local state update
          // but we map it just in case
          const newItem = { ...data.item, id: data.item.menuId || data.item.id };
          set((state) => ({
            menu: [...state.menu, newItem]
          }));
        }
      } catch (err) {
        console.error('Failed to add menu item:', err);
      }
    },
    fetchCombos: async (vendorId) => {
      try {
        const response = await fetch(`${API_URL}/api/combos?vendorId=${vendorId}`);
        const data = await response.json();
        if (data.success) {
          set({ combos: data.combos });
        }
      } catch (err) {
        console.error('Failed to fetch combos:', err);
      }
    },
    addCombo: async (combo) => {
      try {
        const response = await fetch(`${API_URL}/api/combos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(combo),
        });
        const data = await response.json();
        if (data.success) {
          // Socket handles update
        }
      } catch (err) {
        console.error('Failed to add combo:', err);
      }
    },
    updateCombo: async (id, updates) => {
      try {
        const response = await fetch(`${API_URL}/api/combos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (data.success) {
          // Socket handles update
        }
      } catch (err) {
        console.error('Failed to update combo:', err);
      }
    },
    deleteCombo: async (id) => {
      try {
        const response = await fetch(`${API_URL}/api/combos/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          // Socket handles update
        }
      } catch (err) {
        console.error('Failed to delete combo:', err);
      }
    },
  };
});
