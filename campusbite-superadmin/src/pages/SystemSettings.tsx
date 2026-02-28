import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Zap, IndianRupee, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SystemSettings() {
    const [platformFeeEnabled, setPlatformFeeEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');

    useEffect(() => {
        // Fetch current settings on mount
        fetch(`${API_URL}/api/settings/platform`)
            .then(r => r.json())
            .then(data => {
                setPlatformFeeEnabled(data.platformFeeEnabled);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleToggle = async () => {
        const newValue = !platformFeeEnabled;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/settings/platform`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platformFeeEnabled: newValue }),
            });
            const data = await res.json();
            setPlatformFeeEnabled(data.platformFeeEnabled);
            setSavedMsg(data.platformFeeEnabled ? '✅ Platform fee enabled — Kiosk updated!' : '✅ Platform fee disabled — Kiosk updated!');
            setTimeout(() => setSavedMsg(''), 3000);
        } catch (err) {
            setSavedMsg('❌ Failed to update. Check server connection.');
            setTimeout(() => setSavedMsg(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#FF6B00]" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#1E1E1E]">System Settings</h1>
                <p className="text-[#6B6B6B]">Platform-wide configuration — changes apply instantly via Socket.IO</p>
            </div>

            {/* Platform Fee Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E5E5]">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                            <IndianRupee size={24} className="text-[#FF6B00]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#1E1E1E]">Platform Fee (₹1)</h2>
                            <p className="text-sm text-[#6B6B6B] mt-1">
                                Charged on <span className="font-medium text-[#1E1E1E]">Hostel Delivery</span> and <span className="font-medium text-[#1E1E1E]">Classroom Delivery</span> orders only.
                                <br />Toggle instantly updates all connected Kiosk screens via Socket.IO.
                            </p>
                            <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${platformFeeEnabled
                                    ? 'bg-[#F0FDF4] text-[#22C55E]'
                                    : 'bg-[#FEF2F2] text-[#EF4444]'
                                }`}>
                                <Zap size={12} />
                                {platformFeeEnabled ? 'Active' : 'Disabled'}
                            </div>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={handleToggle}
                        disabled={saving}
                        className={`flex-shrink-0 transition-all ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                        title={platformFeeEnabled ? 'Click to disable' : 'Click to enable'}
                    >
                        {saving ? (
                            <Loader2 size={48} className="animate-spin text-[#FF6B00]" />
                        ) : platformFeeEnabled ? (
                            <ToggleRight size={52} className="text-[#FF6B00]" />
                        ) : (
                            <ToggleLeft size={52} className="text-[#9CA3AF]" />
                        )}
                    </button>
                </div>

                {/* Status message */}
                {savedMsg && (
                    <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm font-medium ${savedMsg.startsWith('✅') ? 'bg-[#F0FDF4] text-[#22C55E]' : 'bg-[#FEF2F2] text-[#EF4444]'
                        }`}>
                        {savedMsg}
                    </div>
                )}
            </div>

            {/* Info box */}
            <div className="bg-[#FFFAF5] border border-[#FF6B00]/20 rounded-xl p-4 text-sm text-[#6B6B6B]">
                <p className="font-medium text-[#1E1E1E] mb-1">How it works</p>
                <ul className="space-y-1 list-disc list-inside">
                    <li>When <strong>enabled</strong>: ₹1 platform fee is added to every Hostel/Classroom delivery order in the Kiosk</li>
                    <li>When <strong>disabled</strong>: No platform fee is charged — all Kiosk screens update instantly</li>
                    <li>This setting is stored in-memory and resets to <strong>enabled</strong> on server restart</li>
                </ul>
            </div>
        </div>
    );
}
