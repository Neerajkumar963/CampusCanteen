import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CreditCard, CheckCircle2, Ban } from 'lucide-react';

export default function Subscriptions() {
    const { vendors, fetchVendors } = useStore();

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">Subscription Plans</h1>
                <p className="text-[#6B6B6B]">Monitor active canteens and their renewal dates</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5] overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#F7F4F1] border-b border-[#E5E5E5]">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-[#1E1E1E] rounded-tl-xl whitespace-nowrap">Plan Details</th>
                            <th className="px-6 py-4 font-semibold text-[#1E1E1E] whitespace-nowrap">Location (Campus)</th>
                            <th className="px-6 py-4 font-semibold text-[#1E1E1E] whitespace-nowrap">Renewal Date</th>
                            <th className="px-6 py-4 font-semibold text-[#1E1E1E] text-center rounded-tr-xl whitespace-nowrap">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                        {vendors.map(vendor => {
                            const isActive = vendor.subscription?.status === 'Active';
                            const isExpired = vendor.subscription && new Date(vendor.subscription.validUntil) < new Date();

                            return (
                                <tr key={vendor.vendorId} className="hover:bg-[#F7F4F1]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#1E1E1E]">Standard SaaS License</p>
                                                <p className="text-sm text-[#6B6B6B]">{vendor.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium text-[#1E1E1E]">{vendor.campusId?.name || 'Unassigned'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[#6B6B6B]">
                                            {vendor.subscription ? new Date(vendor.subscription.validUntil).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isActive && !isExpired ? 'bg-[#F0FDF4] text-[#22C55E]' : 'bg-[#FEF2F2] text-[#EF4444]'
                                            }`}>
                                            {isActive && !isExpired ? (
                                                <><CheckCircle2 size={14} /> Active</>
                                            ) : (
                                                <><Ban size={14} /> {isExpired ? 'Expired' : 'Suspended'}</>
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
