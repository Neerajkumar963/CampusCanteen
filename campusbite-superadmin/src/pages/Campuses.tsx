import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Plus, MoreVertical, X } from 'lucide-react';

export default function Campuses() {
    const { campuses, fetchCampuses, createCampus } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', logo: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCampuses();
    }, [fetchCampuses]);

    const filteredCampuses = campuses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await createCampus(formData);
        setIsSubmitting(false);

        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', code: '', logo: '' });
        } else {
            alert('Failed to create campus. Code might already exist.');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#1E1E1E]">Campuses</h1>
                    <p className="text-[#6B6B6B]">Manage all university campuses</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF8A00] transition-colors font-medium"
                >
                    <Plus size={20} />
                    Add Campus
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
                    <input
                        type="text"
                        placeholder="Search campuses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F7F4F1] border-b border-[#E5E5E5]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E] rounded-tl-xl whitespace-nowrap">Campus Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E1E1E] whitespace-nowrap">Campus Code</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E1E1E] whitespace-nowrap">Canteens Count</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E1E1E] whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1E1E1E] rounded-tr-xl whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E5]">
                            {filteredCampuses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-[#6B6B6B]">
                                        No campuses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCampuses.map((campus) => (
                                    <tr key={campus._id} className="hover:bg-[#F7F4F1]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={campus.logo} alt={campus.name} className="w-10 h-10 rounded-lg object-cover bg-[#F7F4F1]" />
                                                <span className="font-semibold text-[#1E1E1E]">{campus.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-[#6B6B6B] bg-[#E5E5E5] px-2 py-1 rounded">
                                                {campus.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] font-semibold text-sm">
                                                {campus.canteensCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${campus.status === 'Active' ? 'bg-[#F0FDF4] text-[#22C55E]' : 'bg-[#FEF2F2] text-[#EF4444]'
                                                }`}>
                                                {campus.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-[#6B6B6B] hover:bg-[#E5E5E5] rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F4F1]">
                            <h2 className="text-xl font-bold text-[#1E1E1E]">Add New Campus</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Campus Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                                    placeholder="e.g. Stanford Main Campus"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Campus Code (Unique)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] uppercase"
                                    placeholder="e.g. STAN-01"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1E1E1E] mb-2">Logo URL (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.logo}
                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-[#E5E5E5] text-[#1E1E1E] rounded-xl hover:bg-[#F7F4F1] transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2.5 bg-[#FF6B00] text-white rounded-xl font-medium transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#FF8A00]'
                                        }`}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Campus'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
