import { create } from 'zustand';

export const API_URL = import.meta.env.VITE_API_URL || '';

export interface Campus {
    _id: string;
    name: string;
    code: string;
    logo: string;
    status: 'Active' | 'Disabled';
    canteensCount: number;
}

export interface Vendor {
    _id?: string;
    vendorId: string;
    name: string;
    description: string;
    image?: string;
    role: 'vendor' | 'superadmin';
    campusId?: Campus;
    ordersToday?: number;
    revenueToday?: number;
    subscription?: {
        status: 'Active' | 'Suspended';
        validUntil: string;
    };
    razorpayAccountId?: string;
}

export interface Volunteer {
    _id: string;
    name: string;
    phone: string;
    dob: string;
    collegeName: string;
    aadhaarNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
    idCardPhoto: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    campus: Campus;
    createdAt: string;
}

export interface Analytics {
    totalCampuses: number;
    totalCanteens: number;
    totalOrdersToday: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
}

interface StoreState {
    vendors: Vendor[];
    campuses: Campus[];
    analytics: Analytics | null;
    currentVendor: Vendor | null;
    pendingVolunteers: Volunteer[];

    fetchVendors: () => Promise<void>;
    fetchCampuses: () => Promise<void>;
    fetchAnalytics: () => Promise<void>;
    fetchPendingVolunteers: () => Promise<void>;
    updateVolunteerStatus: (id: string, status: string) => Promise<boolean>;
    createCampus: (data: Partial<Campus>) => Promise<boolean>;
    updateVendorSubscription: (id: string, status: string, validUntil: string) => Promise<void>;
    updateVendor: (id: string, data: Partial<Vendor>) => Promise<boolean>;
    login: (vendor: Vendor) => void;
    logout: () => void;
}

export const useStore = create<StoreState>((set) => ({
    vendors: [],
    campuses: [],
    analytics: null,
    currentVendor: null,
    pendingVolunteers: [],

    login: (vendor) => set({ currentVendor: vendor }),

    logout: () => {
        localStorage.removeItem('superAdminSession');
        set({ currentVendor: null, vendors: [], campuses: [], analytics: null });
    },

    fetchAnalytics: async () => {
        try {
            const response = await fetch(`${API_URL}/api/superadmin/analytics`);
            const data = await response.json();
            if (data.success) {
                set({ analytics: data.analytics });
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    },

    fetchCampuses: async () => {
        try {
            const response = await fetch(`${API_URL}/api/campuses`);
            const data = await response.json();
            if (data.success) {
                set({ campuses: data.campuses });
            }
        } catch (error) {
            console.error('Failed to fetch campuses:', error);
        }
    },

    createCampus: async (campusData) => {
        try {
            const response = await fetch(`${API_URL}/api/campuses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campusData)
            });
            const data = await response.json();
            if (data.success) {
                set((state) => ({ campuses: [...state.campuses, data.campus] }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to create campus:', error);
            return false;
        }
    },

    fetchVendors: async () => {
        try {
            const response = await fetch(`${API_URL}/api/vendors`);
            const data = await response.json();
            if (data.success) {
                set({ vendors: data.vendors });
            }
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        }
    },

    updateVendorSubscription: async (id: string, status: string, validUntil: string) => {
        try {
            const response = await fetch(`${API_URL}/api/vendors/${id}/subscription`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, validUntil })
            });
            const data = await response.json();
            if (data.success) {
                set((state) => ({
                    vendors: state.vendors.map(v =>
                        v.vendorId === data.vendor.vendorId ? data.vendor : v
                    )
                }));
            }
        } catch (error) {
            console.error('Failed to update subscription:', error);
        }
    },

    updateVendor: async (id, vendorData) => {
        try {
            const response = await fetch(`${API_URL}/api/vendors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vendorData)
            });
            const data = await response.json();
            if (data.success) {
                set((state) => ({
                    vendors: state.vendors.map(v =>
                        v._id === id || v.vendorId === id ? { ...v, ...data.vendor } : v
                    )
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update vendor:', error);
            return false;
        }
    },

    fetchPendingVolunteers: async () => {
        try {
            const response = await fetch(`${API_URL}/api/volunteers/pending`);
            const data = await response.json();
            if (data.success) {
                set({ pendingVolunteers: data.volunteers });
            }
        } catch (error) {
            console.error('Failed to fetch pending volunteers:', error);
        }
    },

    updateVolunteerStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_URL}/api/volunteers/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (data.success) {
                set((state) => ({
                    pendingVolunteers: state.pendingVolunteers.filter(v => v._id !== id)
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update volunteer status:', error);
            return false;
        }
    }
}));
