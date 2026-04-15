import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        if (user && user.isAdmin) {
            navigate('/admin');
        }
    }, [user, navigate]);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/auth/admin-login', { email, password, adminSecret });
            // Manually store the admin user (same as AuthContext login but using the admin-login endpoint)
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Trigger a page reload so AuthContext picks up the new user
            window.location.href = '/admin';
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed. Check your credentials and secret code.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background grid effect */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900/20 via-slate-950 to-secondary-900/20" />

            {/* Glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-2xl shadow-primary-500/30 mb-6">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400 text-sm">StudentVerse Administration Panel</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-400 rounded-xl text-sm font-medium flex items-start gap-3">
                            <span className="mt-0.5 text-red-500">⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAdminLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Admin Secret Code */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                Admin Secret Code
                                <span className="ml-2 text-xs font-normal text-slate-500">(provided by system administrator)</span>
                            </label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    value={adminSecret}
                                    onChange={(e) => setAdminSecret(e.target.value)}
                                    placeholder="Enter secret code"
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Security note */}
                        <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl flex items-start gap-3">
                            <ShieldCheck className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                This portal is for authorized administrators only. All access attempts are monitored and logged.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Access Admin Panel
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/login" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                            ← Back to Student Login
                        </a>
                    </div>
                </div>

                {/* Default credentials hint */}
                <div className="mt-6 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
                    <p className="text-xs text-slate-500 mb-1 font-medium">First time setup?</p>
                    <a
                        href="/admin-setup"
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-semibold"
                    >
                        Create Admin Account →
                    </a>
                </div>
            </div>
        </div>
    );
}
