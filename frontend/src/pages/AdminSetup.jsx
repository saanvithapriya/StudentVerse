import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AdminSetup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: 'Admin',
        email: '',
        password: '',
        adminSecret: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('/api/auth/seed-admin', formData);
            setSuccess(true);
            setTimeout(() => navigate('/admin-login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-slate-950 to-secondary-900/20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-2xl shadow-primary-500/30 mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">Create Admin Account</h1>
                    <p className="text-slate-400 text-sm mt-1">One-time setup for StudentVerse administration</p>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {success ? (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">Admin Created!</h2>
                            <p className="text-slate-400 text-sm">Redirecting to Admin Login...</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-950/60 border border-red-800 text-red-400 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Admin name"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@studentverse.com"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min 6 characters"
                                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                            minLength={6}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Admin Secret Code</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={formData.adminSecret}
                                            onChange={e => setFormData({ ...formData, adminSecret: e.target.value })}
                                            placeholder="Enter the system admin secret"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Default secret: <span className="text-primary-400 font-mono">STUDENTVERSE_ADMIN_2024</span></p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all mt-2 disabled:opacity-50"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                    {loading ? 'Creating...' : 'Create Admin Account'}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <a href="/admin-login" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                            Already have an admin account? Sign in →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
