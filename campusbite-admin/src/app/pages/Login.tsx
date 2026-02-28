import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useStore, API_URL } from '../store/useStore';
import { KeyRound, User, Eye, EyeOff } from 'lucide-react';

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
                body: JSON.stringify({ vendorId, password }),
            });

            const data = await response.json();
            if (data.success) {
                login(data.vendor);
                navigate('/admin'); // Redirect to dashboard
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">CB</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1E1E1E]">College Admin Portal</h2>
                    <p className="text-[#6B6B6B] mt-2">Sign in to manage your campus</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[#1E1E1E] mb-2">
                            Vendor ID
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-[#6B6B6B]" />
                            </div>
                            <input
                                type="text"
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-xl outline-none font-medium transition-all"
                                placeholder="Admin ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#1E1E1E] mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-[#6B6B6B]" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] rounded-xl outline-none font-medium transition-colors"
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
                        className="w-full bg-[#FF6B00] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#E66000] transition-colors disabled:opacity-70 flex items-center justify-center"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[#6B6B6B] font-medium">
                            Not registered?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register-campus')}
                                className="text-[#FF6B00] hover:underline font-bold"
                            >
                                Register Your Campus
                            </button>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
