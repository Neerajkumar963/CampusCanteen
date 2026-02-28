import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router';
import { API_URL } from '../store/useStore';
import { Building2, User, Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterCampus() {
    const [formData, setFormData] = useState({
        campusName: '',
        campusCode: '',
        adminName: '',
        adminId: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/register-campus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1E1E1E] mb-4">Registration Successful!</h2>
                    <p className="text-[#6B6B6B] mb-8 text-lg">Your campus has been registered. Redirecting you to login...</p>
                    <div className="w-full bg-[#FF6B00] h-1 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3 }}
                            className="bg-[#E66000] h-full"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-2xl"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                        <Building2 className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1E1E1E]">Register Your Campus</h2>
                    <p className="text-[#6B6B6B] mt-2">Join CampusBite to digitize your college canteens</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campus Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#FF6B00] uppercase tracking-wider">Campus Details</h3>

                            <div>
                                <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">Campus Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                        <Building2 size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.campusName}
                                        onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                        placeholder="e.g. GGI Campus"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">Campus Code (Short)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                        <KeyRound size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.campusCode}
                                        onChange={(e) => setFormData({ ...formData, campusCode: e.target.value.toUpperCase() })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                        placeholder="e.g. GGI001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Admin Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#FF6B00] uppercase tracking-wider">Admin Credentials</h3>

                            <div>
                                <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">Admin Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">Admin ID (Username)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.adminId}
                                        onChange={(e) => setFormData({ ...formData, adminId: e.target.value.toLowerCase() })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                        placeholder="e.g. ggi_admin"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                            <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">Official Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                    placeholder="admin@college.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#1E1E1E] mb-2 px-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6B6B] group-focus-within:text-[#FF6B00] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#FFFAF5] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                    placeholder="Minimum 6 characters"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#E66000] border-b-4 border-[#B34B00] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    Complete Registration <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[#6B6B6B] font-medium">
                        Already have a campus?{' '}
                        <Link to="/login" className="text-[#FF6B00] hover:underline font-bold">
                            Sign In
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
