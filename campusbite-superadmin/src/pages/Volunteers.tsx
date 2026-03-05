import { useState, useEffect } from 'react';
import { useStore, type Volunteer } from '../store/useStore';
import { Search, CheckCircle, XCircle, Eye, Calendar, Phone, School, CreditCard, ZoomIn, X } from 'lucide-react';

export default function Volunteers() {
    const { pendingVolunteers, fetchPendingVolunteers, updateVolunteerStatus } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ src: string; label: string } | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ id: string; status: 'Approved' | 'Rejected' } | null>(null);

    useEffect(() => {
        fetchPendingVolunteers();
    }, [fetchPendingVolunteers]);

    const filteredVolunteers = pendingVolunteers.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        v.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
        setConfirmAction({ id, status });
    };

    const executeAction = async () => {
        if (!confirmAction) return;
        setIsSubmitting(true);
        const success = await updateVolunteerStatus(confirmAction.id, confirmAction.status);
        setIsSubmitting(false);
        setConfirmAction(null);
        if (success) {
            setSelectedVolunteer(null);
        } else {
            alert('Failed to update status.');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E1E1E]">Volunteer Approvals</h1>
                    <p className="text-[#6B6B6B]">Review and approve new volunteer registrations</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
                    <input
                        type="text"
                        placeholder="Search by name, phone or college..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FFFAF5] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FFFAF5] border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E] rounded-tl-xl whitespace-nowrap">Volunteer Details</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E] whitespace-nowrap">College</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E1E1E] whitespace-nowrap">Submitted On</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E1E1E] whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1E1E1E] rounded-tr-xl whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredVolunteers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#6B6B6B]">
                                        No pending volunteers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredVolunteers.map((volunteer) => (
                                    <tr key={volunteer._id} className="hover:bg-[#FFFAF5]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[#1E1E1E]">{volunteer.name}</span>
                                                <span className="text-xs text-[#6B6B6B]">{volunteer.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-[#1E1E1E]">{volunteer.collegeName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm text-[#6B6B6B]">
                                                {new Date(volunteer.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">
                                                {volunteer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => setSelectedVolunteer(volunteer)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(volunteer._id, 'Approved')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(volunteer._id, 'Rejected')}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedVolunteer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
                        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FFFAF5]">
                            <h2 className="text-xl font-bold text-[#1E1E1E]">Volunteer Profile Details</h2>
                            <button
                                onClick={() => setSelectedVolunteer(null)}
                                className="text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors p-1"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Details Section */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                            <Calendar size={12} /> Date of Birth
                                        </p>
                                        <p className="font-bold text-secondary">{selectedVolunteer.dob || 'Not provided'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                            <Phone size={12} /> Phone Number
                                        </p>
                                        <p className="font-bold text-secondary">{selectedVolunteer.phone}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl col-span-2">
                                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                            <School size={12} /> College Name
                                        </p>
                                        <p className="font-bold text-secondary">{selectedVolunteer.collegeName}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl col-span-2">
                                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                            <CreditCard size={12} /> Aadhaar Number
                                        </p>
                                        <p className="font-bold text-secondary font-mono tracking-widest">
                                            {selectedVolunteer.aadhaarNumber || 'XXXXXXXXXXXX'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => handleAction(selectedVolunteer._id, 'Approved')}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95"
                                    >
                                        Approve Volunteer
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedVolunteer._id, 'Rejected')}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-secondary">Uploaded Documents</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400">Aadhaar Card (Front)</p>
                                        <div
                                            className="aspect-video bg-gray-100 rounded-xl overflow-hidden border cursor-pointer relative group"
                                            onClick={() => selectedVolunteer.aadhaarFront && setPreviewImage({ src: selectedVolunteer.aadhaarFront, label: 'Aadhaar Card (Front)' })}
                                        >
                                            {selectedVolunteer.aadhaarFront ? (
                                                <>
                                                    <img src={selectedVolunteer.aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400">Aadhaar Card (Back)</p>
                                        <div
                                            className="aspect-video bg-gray-100 rounded-xl overflow-hidden border cursor-pointer relative group"
                                            onClick={() => selectedVolunteer.aadhaarBack && setPreviewImage({ src: selectedVolunteer.aadhaarBack, label: 'Aadhaar Card (Back)' })}
                                        >
                                            {selectedVolunteer.aadhaarBack ? (
                                                <>
                                                    <img src={selectedVolunteer.aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400">College ID Card</p>
                                        <div
                                            className="aspect-video bg-gray-100 rounded-xl overflow-hidden border cursor-pointer relative group"
                                            onClick={() => selectedVolunteer.idCardPhoto && setPreviewImage({ src: selectedVolunteer.idCardPhoto, label: 'College ID Card' })}
                                        >
                                            {selectedVolunteer.idCardPhoto ? (
                                                <>
                                                    <img src={selectedVolunteer.idCardPhoto} alt="College ID" className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Image Lightbox */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white font-bold text-lg">{previewImage.label}</p>
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="text-white bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <img
                            src={previewImage.src}
                            alt={previewImage.label}
                            className="w-full max-h-[80vh] object-contain rounded-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Custom Confirm Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in-95">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${confirmAction.status === 'Approved' ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                            {confirmAction.status === 'Approved'
                                ? <CheckCircle className="w-8 h-8 text-green-500" />
                                : <XCircle className="w-8 h-8 text-red-500" />
                            }
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">
                                {confirmAction.status === 'Approved' ? 'Approve Volunteer?' : 'Reject Volunteer?'}
                            </h3>
                            <p className="text-sm text-[#6B6B6B]">
                                {confirmAction.status === 'Approved'
                                    ? 'This volunteer will be approved and can start delivering orders.'
                                    : 'This volunteer application will be rejected and they will be notified.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-3 rounded-xl border-2 border-[#E5E5E5] font-bold text-[#6B6B6B] hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                disabled={isSubmitting}
                                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95 ${confirmAction.status === 'Approved'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {isSubmitting ? 'Processing...' : confirmAction.status === 'Approved' ? 'Yes, Approve' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
