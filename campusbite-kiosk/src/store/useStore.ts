import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

export interface MenuItem {
    menuId: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    available: boolean;
    vendorId?: string;
}

interface StoreState {
    menu: MenuItem[];
    myOrders: any[];
    fetchMenu: () => Promise<void>;
    addOrder: (order: any) => void;
    updateOrderStatus: (orderId: number, status: string) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => {
            // Listen for real-time menu updates
            socket.on('menu_updated', (updatedItem: MenuItem) => {
                set((state) => ({
                    menu: state.menu.map((item) =>
                        item.menuId === updatedItem.menuId ? updatedItem : item
                    ),
                }));
            });

            // Listen for order status updates from Admin
            socket.on('order_status_update', (data: { id: number, status: string }) => {
                set((state) => ({
                    myOrders: state.myOrders.map(order =>
                        (order.orderId === data.id || order.id === data.id)
                            ? { ...order, status: data.status }
                            : order
                    )
                }));
            });

            return {
                menu: [],
                myOrders: [],

                fetchMenu: async () => {
                    try {
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                        const response = await fetch(`${baseUrl}/api/menu`);
                        const data = await response.json();
                        set({ menu: data });
                    } catch (err) {
                        console.error('Failed to fetch menu:', err);
                    }
                },

                addOrder: (order: any) => set((state) => ({
                    myOrders: [...state.myOrders, order]
                })),

                updateOrderStatus: (orderId: number, status: string) => set((state) => ({
                    myOrders: state.myOrders.map(order =>
                        order.id === orderId ? { ...order, status: status } : order
                    )
                })),
            };
        },
        {
            name: 'campusbite-kiosk-storage', // unique name for localStorage key
            partialize: (state) => ({ myOrders: state.myOrders }), // only persist myOrders
        }
    )
);
