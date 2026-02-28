import { useState, useEffect } from 'react';
import { useStore, API_URL } from '../../store/useStore';
import { motion } from 'motion/react';
import { Store, Plus, X, Link as LinkIcon, QrCode, Copy, Check } from 'lucide-react';

interface CampusVendor {
    _id: string;
    vendorId: string;
    loginToken?: string;
    name: string;
    description: string;
    subscription?: {
        status: 'Active' | 'Suspended';
        validUntil: string;
    };
    ordersToday: number;
    revenueToday: number;
}

export default function ManageCanteens() {
    const currentVendor = useStore((state) => state.currentVendor);
    const [canteens, setCanteens] = useState<CampusVendor[]>([]);
    const [loading, setLoading] = useState(true);

    // Add Canteen Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [canteenName, setCanteenName] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [qrCanteen, setQrCanteen] = useState<CampusVendor | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchCanteens = async () => {
        if (!currentVendor || currentVendor.role !== 'collegeadmin') return;

        try {
            const campusId = typeof currentVendor.campusId === 'object' ? currentVendor.campusId._id : currentVendor.campusId;
            const res = await fetch(`${API_URL}/api/vendors?campusId=${campusId}`);
            const data = await res.json();
            if (data.success) {
                setCanteens(data.vendors);
            }
        } catch (err) {
            console.error('Failed to fetch canteens:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCanteens();
    }, [currentVendor]);

    const handleAddCanteen = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const campusId = typeof currentVendor?.campusId === 'object' ? currentVendor.campusId._id : currentVendor?.campusId;
            const res = await fetch(`${API_URL}/api/vendors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: canteenName,
                    vendorId,
                    password,
                    description,
                    campusId
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setCanteens((prev) => [...prev, data.vendor]);
                setCanteenName('');
                setVendorId('');
                setPassword('');
                setDescription('');
            } else {
                setError(data.message || 'Failed to add canteen');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleVendorStatus = async (vendorId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
            const res = await fetch(`${API_URL}/api/vendors/${vendorId}/subscription`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();

            if (data.success) {
                // Instantly update local state so the UI badge changes
                setCanteens(canteens.map(c => {
                    if (c._id === vendorId) {
                        return {
                            ...c,
                            subscription: {
                                ...c.subscription,
                                status: newStatus as 'Active' | 'Suspended',
                                validUntil: c.subscription?.validUntil || ''
                            }
                        };
                    }
                    return c;
                }));
            }
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };
    const handleCopyLink = (token: string, canteenId: string) => {
        const link = `${window.location.origin}/vendor-login?token=${token}`;
        navigator.clipboard.writeText(link);
        setCopiedId(canteenId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return <div className="p-6 text-center text-[#6B6B6B]">Loading Canteens...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E1E1E]">Manage Canteens</h1>
                    <p className="text-[#6B6B6B]">View canteens operating in your campus</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF8A00] transition-colors font-medium">
                    <Plus className="w-5 h-5" />
                    Add Canteen
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FFFAF5] border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Canteen Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Vendor ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Orders Today</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Revenue Today</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E]">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1E1E1E]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {canteens.map((canteen) => (
                                <tr key={canteen._id} className="hover:bg-[#FFFAF5] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#FFF5EE] rounded-xl flex items-center justify-center">
                                                <Store className="w-5 h-5 text-[#FF6B00]" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[#1E1E1E]">{canteen.name}</div>
                                                <div className="text-sm text-[#6B6B6B]">{canteen.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#6B6B6B]">
                                        {canteen.vendorId}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#1E1E1E]">
                                        {canteen.ordersToday || 0}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#1E1E1E]">
                                        ₹{canteen.revenueToday || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${canteen.subscription?.status === 'Active'
                                            ? 'bg-[#F0FDF4] text-[#22C55E]'
                                            : 'bg-red-50 text-red-600'
                                            }`}>
                                            {canteen.subscription?.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canteen.loginToken && (
                                                <>
                                                    <button
                                                        onClick={() => handleCopyLink(canteen.loginToken!, canteen._id)}
                                                        title="Copy Login Link"
                                                        className={`p-2 rounded-lg transition-all ${copiedId === canteen._id
                                                            ? 'bg-green-50 text-green-600'
                                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                    >
                                                        {copiedId === canteen._id ? <Check size={18} /> : <LinkIcon size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setQrCanteen(canteen)}
                                                        title="Show QR Code"
                                                        className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all"
                                                    >
                                                        <QrCode size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => toggleVendorStatus(canteen._id, canteen.subscription?.status || 'Active')}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${canteen.subscription?.status === 'Active'
                                                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                    : 'text-[#22C55E] bg-[#F0FDF4] hover:bg-green-100'
                                                    }`}
                                            >
                                                {canteen.subscription?.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {canteens.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-[#6B6B6B]">
                                        No canteens found in your campus.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Canteen Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-[#E5E5E5] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#1E1E1E]">Add New Canteen</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-[#FFFAF5] rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-[#6B6B6B]" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCanteen} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Canteen Name</label>
                                <input
                                    required
                                    type="text"
                                    value={canteenName}
                                    onChange={(e) => setCanteenName(e.target.value)}
                                    placeholder="e.g. Science Block Cafe"
                                    className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Login ID (Vendor ID)</label>
                                <input
                                    required
                                    type="text"
                                    value={vendorId}
                                    onChange={(e) => setVendorId(e.target.value)}
                                    placeholder="e.g. science-cafe"
                                    className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Password</label>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter a secure password"
                                    className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Description / Location</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Ground floor near library"
                                    className="w-full px-4 py-2 bg-[#FFFAF5] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors mt-6 ${isSubmitting ? 'bg-[#FFB580]' : 'bg-[#FF6B00] hover:bg-[#FF8A00]'
                                    }`}
                            >
                                {isSubmitting ? 'Adding...' : 'Create Canteen'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {qrCanteen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 text-center border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">{qrCanteen.name}</h3>
                            <p className="text-sm text-gray-500">Secure Backend Login Link</p>
                        </div>

                        <div className="p-8 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/vendor-login?token=${qrCanteen.loginToken}`)}`}
                                    alt="Login QR"
                                    className="w-48 h-48"
                                />
                            </div>
                            <p className="mt-6 text-xs text-gray-400 font-medium uppercase tracking-widest">Scan to access dashboard</p>
                        </div>

                        <div className="p-6 bg-gray-50">
                            <button
                                onClick={() => setQrCanteen(null)}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
