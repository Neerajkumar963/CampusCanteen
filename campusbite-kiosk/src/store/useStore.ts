import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || '');

export interface MenuItem {
    menuId: number;
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
    _id: string;
    name: string;
    items: number[]; // menuIds
    discount: number;
    enabled: boolean;
    vendorId: string;
    image?: string;
}

interface StoreState {
    menu: MenuItem[];
    combos: Combo[];
    myOrders: any[];
    fetchMenu: () => Promise<void>;
    fetchCombos: (vendorId: string) => Promise<void>;
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

            socket.on('combos_updated', (data: { type: 'create' | 'update' | 'delete', combo?: Combo, id?: string }) => {
                set((state) => {
                    if (data.type === 'create' && data.combo) {
                        return { combos: [...state.combos, data.combo] };
                    }
                    if (data.type === 'update' && data.combo) {
                        const updated = data.combo;
                        return {
                            combos: state.combos.map(c => c._id === updated._id ? updated : c)
                        };
                    }
                    if (data.type === 'delete' && data.id) {
                        const delId = data.id;
                        return {
                            combos: state.combos.filter(c => c._id !== delId)
                        };
                    }
                    return state;
                });
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
                combos: [],
                myOrders: [],

                fetchMenu: async () => {
                    try {
                        const baseUrl = import.meta.env.VITE_API_URL || '';
                        const response = await fetch(`${baseUrl}/api/menu`);
                        const data = await response.json();
                        set({ menu: data });
                    } catch (err) {
                        console.error('Failed to fetch menu:', err);
                    }
                },
                fetchCombos: async (vendorId) => {
                    try {
                        const baseUrl = import.meta.env.VITE_API_URL || '';
                        const response = await fetch(`${baseUrl}/api/combos?vendorId=${vendorId}`);
                        const data = await response.json();
                        if (data.success) {
                            set({ combos: data.combos });
                        }
                    } catch (err) {
                        console.error('Failed to fetch combos:', err);
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
