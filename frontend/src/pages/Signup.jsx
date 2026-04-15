import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const navigate = useNavigate();
    const { signup, user } = useAuth();

    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }
        setLoading(true);
        const res = await signup(formData.name, formData.email, formData.password);
        if (res.success) { navigate('/'); } else { setError(res.message); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-700 flex-col items-center justify-center p-12 text-white">
                <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-primary-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.8s' }} />

                <div className="relative z-10 max-w-xs text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm mb-8 shadow-2xl">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Join StudentVerse</h1>
                    <p className="text-primary-100 text-lg leading-relaxed">
                        Connect with your campus community. Buy, sell, and learn together.
                    </p>

                    <div className="mt-10 space-y-3">
                        {[
                            'VNR VJIET students only',
                            'Secure college email verification',
                            'Free to join, always',
                            'Trusted campus network',
                        ].map(point => (
                            <div key={point} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 text-sm font-medium">
                                <span className="text-green-300">✓</span>
                                {point}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Signup form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    <div className="lg:hidden text-center mb-8">
                        <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
                            StudentVerse
                        </span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">Create account ✨</h2>
                        <p className="text-slate-500 mt-2">Join your campus community today.</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-start gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="text" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="e.g. Aarav Kumar" autoComplete="name"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">College Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="10-digit-ID@vnrvjiet.in" autoComplete="email"
                                    pattern="^[a-zA-Z0-9]{10}@vnrvjiet\.in$"
                                    title="Enter exactly 10 characters followed by @vnrvjiet.in"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                                    placeholder="Minimum 6 characters" autoComplete="new-password" minLength={6}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800"
                                    required />
                                <button type="button" onClick={() => setShowPass(o => !o)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                    placeholder="••••••••" autoComplete="new-password" minLength={6}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800"
                                    required />
                                <button type="button" onClick={() => setShowConfirm(o => !o)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary-500 to-primary-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all mt-2 disabled:opacity-60 disabled:hover:translate-y-0">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <UserPlus className="w-5 h-5" />
                            )}
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
