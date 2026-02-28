import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { useStore, API_URL } from '../store/useStore';
import { KeyRound, Store, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function VendorLogin() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [vendorData, setVendorData] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    const navigate = useNavigate();
    const login = useStore((state) => state.login);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsVerifying(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/vendors/verify-token?token=${token}`);
                const data = await response.json();

                if (data.success) {
                    setVendorData(data.vendor);
                } else {
                    setError('Invalid or expired login link');
                }
            } catch (err) {
                setError('Unable to verify login link');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorData) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: vendorData.vendorId,
                    password,
                    token // Include the secret token
                }),
            });

            const data = await response.json();
            if (data.success) {
                login(data.vendor);
                navigate('/admin');
            } else {
                setError(data.message || 'Invalid password');
            }
        } catch (err) {
            setError('Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4">
                <Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" />
            </div>
        );
    }

    if (!token || (!vendorData && error)) {
        return (
            <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <AlertCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Access Denied</h2>
                    <p className="text-[#6B6B6B] mb-8">
                        This login page requires a secure token. Please use the link provided by your Campus Admin.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                        {vendorData?.campusId?.logo ? (
                            <img src={vendorData.campusId.logo} alt="Campus" className="w-full h-full object-cover" />
                        ) : (
                            <Store className="text-white" size={32} />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-[#1E1E1E]">{vendorData?.name}</h2>
                    <p className="text-[#6B6B6B] mt-1">{vendorData?.campusId?.name}</p>
                    <div className="mt-4 inline-block px-3 py-1 bg-orange-50 text-[#FF6B00] text-sm font-bold rounded-full">
                        Secure Vendor Login
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">
                            Admin Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                <KeyRound size={20} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-xl outline-none font-medium transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#FF6B00] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#E66000] border-b-4 border-[#B34B00] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-70 flex items-center justify-center"
                    >
                        {isLoading ? 'Signing in...' : 'Enter Dashboard'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
