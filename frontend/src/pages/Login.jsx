import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 flex-col items-center justify-center p-12 text-white">
                {/* Animated blobs */}
                <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-secondary-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-primary-400/10 rounded-full blur-2xl" />

                <div className="relative z-10 max-w-xs text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm mb-8 shadow-2xl">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight">StudentVerse</h1>
                    <p className="text-primary-100 text-lg leading-relaxed">
                        Your all-in-one campus companion — buy, sell, learn, and connect.
                    </p>

                    <div className="mt-10 space-y-4 text-left">
                        {[
                            { icon: '🛍️', text: 'Campus Marketplace' },
                            { icon: '📚', text: 'Notes Sharing Hub' },
                            { icon: '💬', text: 'Discussion Forums' },
                            { icon: '🤝', text: 'Skill Exchange' },
                        ].map(f => (
                            <div key={f.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
                                <span className="text-xl">{f.icon}</span>
                                <span className="font-medium text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
                            StudentVerse
                        </span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">Welcome back 👋</h2>
                        <p className="text-slate-500 mt-2">Sign in with your college email to continue.</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-start gap-2">
                            <span className="text-base">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="10-digit-ID@vnrvjiet.in"
                                    autoComplete="email"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-800"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(o => !o)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <LogIn className="w-5 h-5" />
                            )}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                            Create one now
                        </Link>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4 text-center">
                        <Link
                            to="/admin-login"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
