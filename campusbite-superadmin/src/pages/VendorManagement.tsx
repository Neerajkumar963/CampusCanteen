import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Building2, Search, Plus, MoreVertical, Ban, CheckCircle2, Edit2, X, Wallet } from 'lucide-react';

export default function VendorManagement() {
    const { vendors, fetchVendors, updateVendorSubscription, updateVendor } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const [razorpayId, setRazorpayId] = useState('');

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

    const openEdit = (vendor: any) => {
        setEditingVendor(vendor);
        setRazorpayId(vendor.razorpayAccountId || '');
    };

    const handleUpdate = async () => {
        if (!editingVendor) return;
        const success = await updateVendor(editingVendor._id || editingVendor.vendorId, {
            razorpayAccountId: razorpayId
        });
        if (success) {
            setEditingVendor(null);
            fetchVendors();
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Edit Modal */}
            {editingVendor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E5E5E5]">
                        <div className="p-6 border-b border-[#E5E5E5] flex justify-between items-center bg-[#FFFAF5]">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-[#1E1E1E]">
                                <Edit2 className="text-[#FF6B00]" size={20} />
                                Edit Canteen Details
                            </h2>
                            <button onClick={() => setEditingVendor(null)} className="p-2 hover:bg-[#E5E5E5] rounded-full transition-colors text-[#6B6B6B]">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-1.5">Canteen Name</label>
                                <input
                                    type="text"
                                    disabled
                                    value={editingVendor.name}
                                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl text-[#6B6B6B] cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-1.5 flex items-center gap-2">
                                    <Wallet size={16} className="text-[#FF6B00]" />
                                    Razorpay Account ID
                                </label>
                                <input
                                    type="text"
                                    value={razorpayId}
                                    onChange={(e) => setRazorpayId(e.target.value)}
                                    placeholder="e.g. acc_G7k9x2m4"
                                    className="w-full px-4 py-2.5 bg-[#FFFAF5] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-[#1E1E1E]"
                                />
                                <p className="text-xs text-[#6B6B6B] mt-1.5">Required for automatic revenue splitting via Razorpay Route.</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#E5E5E5] flex gap-3 bg-[#FFFAF5]/30">
                            <button
                                onClick={() => setEditingVendor(null)}
                                className="flex-1 px-4 py-2.5 border border-[#E5E5E5] rounded-xl font-medium text-[#1E1E1E] hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl font-medium hover:bg-[#FF8A00] transition-colors shadow-lg shadow-[#FF6B00]/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
                    <input
                        type="text"
                        placeholder="Search by name or Vendor ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FFFAF5] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FFFAF5] border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E] rounded-tl-xl">Canteen Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Razorpay ID</th>
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
                                        <tr key={vendor.vendorId} className="hover:bg-[#FFFAF5]/50 transition-colors">
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
                                                {vendor.razorpayAccountId ? (
                                                    <span className="font-mono text-sm text-[#FF6B00] bg-[#FFFAF5] border border-[#FF6B00]/20 px-2 py-1 rounded">
                                                        {vendor.razorpayAccountId}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-[#EF4444] font-medium">Not Linked</span>
                                                )}
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
                                                    <button
                                                        onClick={() => openEdit(vendor)}
                                                        className="p-2 text-[#FF6B00] hover:bg-[#FFFAF5] rounded-lg transition-colors"
                                                        title="Edit Vendor"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
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
