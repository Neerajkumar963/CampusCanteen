import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Building2, Search, Plus, MoreVertical, Ban, CheckCircle2 } from 'lucide-react';

export default function VendorManagement() {
    const { vendors, fetchVendors, updateVendorSubscription } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.vendorId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSuspend = async (id: string) => {
        if (confirm('Are you sure you want to suspend this vendor?')) {
            await updateVendorSubscription(id, 'Suspended', new Date().toISOString());
        }
    };

    const handleActivate = async (id: string) => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1); // Activate for 1 month
        await updateVendorSubscription(id, 'Active', d.toISOString());
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E1E1E]">Canteen Network</h1>
                    <p className="text-[#6B6B6B]">Manage vendor subscriptions and access</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF8A00] transition-colors font-medium">
                    <Plus size={20} />
                    Add Canteen
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
                    <input
                        type="text"
                        placeholder="Search by name or Vendor ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F7F4F1] border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E] rounded-tl-xl">Canteen Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Vendor ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Valid Until</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1E1E1E] rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#6B6B6B]">
                                        No canteens found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => {
                                    const isActive = vendor.subscription?.status === 'Active';
                                    const isExpired = vendor.subscription && new Date(vendor.subscription.validUntil) < new Date();

                                    return (
                                        <tr key={vendor.vendorId} className="hover:bg-[#F7F4F1]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#1E1E1E]">{vendor.name}</p>
                                                        <p className="text-sm text-[#6B6B6B]">{vendor.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm text-[#6B6B6B] bg-[#E5E5E5] px-2 py-1 rounded">
                                                    {vendor.vendorId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isActive && !isExpired ? 'bg-[#F0FDF4] text-[#22C55E]' :
                                                        isExpired ? 'bg-[#FEF2F2] text-[#EF4444]' :
                                                            'bg-[#FEF2F2] text-[#EF4444]'
                                                    }`}>
                                                    {isActive && !isExpired ? (
                                                        <><CheckCircle2 size={12} /> Active</>
                                                    ) : (
                                                        <><Ban size={12} /> {isExpired ? 'Expired' : 'Suspended'}</>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-[#1E1E1E]">
                                                    {vendor.subscription ? new Date(vendor.subscription.validUntil).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isActive && !isExpired ? (
                                                        <button
                                                            onClick={() => handleSuspend(vendor._id || vendor.vendorId)}
                                                            className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                                            title="Suspend Vendor"
                                                        >
                                                            <Ban size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(vendor._id || vendor.vendorId)}
                                                            className="px-3 py-1.5 bg-[#22C55E] text-white text-sm font-medium rounded-lg hover:bg-[#16A34A] transition-colors"
                                                        >
                                                            Renew
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-[#6B6B6B] hover:bg-[#E5E5E5] rounded-lg transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
