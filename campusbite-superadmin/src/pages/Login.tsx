import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore, API_URL } from '../store/useStore';
import { Building2, UtensilsCrossed, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [vendorId, setVendorId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const login = useStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendorId, password })
            });

            const data = await response.json();

            if (data.success) {
                if (data.vendor.role !== 'superadmin') {
                    setError('Access Denied: You are not a Super Admin');
                    setIsLoading(false);
                    return;
                }

                login(data.vendor);
                localStorage.setItem('superAdminSession', JSON.stringify(data.vendor));
                navigate('/superadmin');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed. Is the backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F4F1] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                    <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-[#FF6B00]" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-[#1E1E1E]">CampusBite</h1>
                        <p className="text-[#6B6B6B]">Super Admin Portal</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-[#FEF2F2] text-[#EF4444] rounded-xl text-sm font-medium border border-[#FEE2E2]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                            Super Admin ID
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
                            <input
                                type="text"
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-shadow"
                                placeholder="Enter admin ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 bg-[#F7F4F1] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-shadow"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 bg-[#FF6B00] text-white rounded-xl font-semibold text-lg transition-transform active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#FF8A00]'
                            }`}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In as Super Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
