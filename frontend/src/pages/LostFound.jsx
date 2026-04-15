import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Search, MapPin, Calendar, Plus, X, CheckCircle2,
    AlertCircle, Laptop, BookOpen, Shirt, CreditCard,
    Key, Package, Briefcase, Gem, Clock, CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TYPES = [
    { value: 'all', label: 'All Items' },
    { value: 'lost', label: '🔴 Lost' },
    { value: 'found', label: '🟢 Found' },
];

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'ID & Cards', 'Keys', 'Bags', 'Accessories', 'Other'];

const CAT_ICONS = {
    Electronics: Laptop, Books: BookOpen, Clothing: Shirt,
    'ID & Cards': CreditCard, Keys: Key, Bags: Briefcase,
    Accessories: Gem, Other: Package
};

export default function LostFound() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState('all');
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('lost');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [form, setForm] = useState({
        title: '', description: '', category: 'Electronics',
        location: '', reporterPhone: '', dateLostFound: ''
    });

    const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = { status: 'active' };
            if (activeType !== 'all') params.type = activeType;
            if (activeCategory !== 'All') params.category = activeCategory;
            const { data } = await axios.get('/api/lostfound', { ...cfg(), params });
            setItems(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, [activeType, activeCategory]);

    const handleImageFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            Object.entries({ ...form, type: modalType }).forEach(([k, v]) => data.append(k, v));
            if (imageFile) data.append('image', imageFile);

            const { data: created } = await axios.post('/api/lostfound', data, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setItems(prev => [created, ...prev]);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setShowModal(false);
                setForm({ title: '', description: '', category: 'Electronics', location: '', reporterPhone: '', dateLostFound: '' });
                setImageFile(null);
                setImagePreview(null);
            }, 2000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await axios.put(`/api/lostfound/${id}/resolve`, {}, cfg());
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (err) { alert('Failed to resolve'); }
    };

    const filtered = items.filter(item =>
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="mt-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="text-3xl">🔍</span> Lost & Found
                    </h1>
                    <p className="text-slate-500 mt-1">Lost something on campus? Or found something? Post it here.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setModalType('lost'); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-md transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Report Lost
                    </button>
                    <button
                        onClick={() => { setModalType('found'); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Report Found
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <aside className="w-full lg:w-56 shrink-0">
                    <div className="glass-card p-4 sticky top-24 space-y-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</p>
                            <div className="space-y-1">
                                {TYPES.map(t => (
                                    <button key={t.value} onClick={() => setActiveType(t.value)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeType === t.value ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                            <div className="space-y-1">
                                <button onClick={() => setActiveCategory('All')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === 'All' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    All Categories
                                </button>
                                {CATEGORIES.map(c => {
                                    const Icon = CAT_ICONS[c] || Package;
                                    return (
                                        <button key={c} onClick={() => setActiveCategory(c)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeCategory === c ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            <Icon className="w-3.5 h-3.5" /> {c}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1">
                    <div className="relative mb-5">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by item name or location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 glass-card">
                            <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-600">No items found</h3>
                            <p className="text-slate-400 mt-2 text-sm">Be the first to post a lost or found item.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map(item => {
                                const isOwn = item.reporter === user._id || item.reporterEmail === user.email;
                                return (
                                    <div key={item._id} className="glass-card overflow-hidden group hover:shadow-lg transition-shadow">
                                        {item.image && (
                                            <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {item.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                                                </span>
                                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{item.category}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 line-clamp-1">{item.title}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{item.description}</p>

                                            <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.location}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(item.dateLostFound || item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-700">{item.reporterName}</p>
                                                    <p className="text-xs text-slate-400">{item.reporterEmail}</p>
                                                    {item.reporterPhone && <p className="text-xs text-slate-400">{item.reporterPhone}</p>}
                                                </div>
                                                {isOwn && (
                                                    <button onClick={() => handleResolve(item._id)}
                                                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                                        <CheckCheck className="w-3.5 h-3.5" /> Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Post Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${modalType === 'lost' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                            <h3 className={`text-lg font-bold ${modalType === 'lost' ? 'text-red-700' : 'text-emerald-700'}`}>
                                {modalType === 'lost' ? '🔴 Report a Lost Item' : '🟢 Report a Found Item'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {success ? (
                                <div className="text-center py-8">
                                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                                    <p className="font-bold text-slate-800 text-lg">Posted successfully!</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Item Title *</label>
                                        <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Black Samsung earbuds" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                                            <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none">
                                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                                            <input type="date" required value={form.dateLostFound} onChange={e => setForm({ ...form, dateLostFound: e.target.value })}
                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Location *</label>
                                        <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                            placeholder="e.g. Library Reading Room, Block B" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Description *</label>
                                        <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Describe the item in detail — color, model, any identifying features..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Your Phone (optional)</label>
                                        <input value={form.reporterPhone} onChange={e => setForm({ ...form, reporterPhone: e.target.value })}
                                            placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Photo (optional)</label>
                                        {!imagePreview ? (
                                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition">
                                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageFile(e.target.files?.[0])} />
                                                <p className="text-sm text-slate-500">Click to upload a photo</p>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-xl overflow-hidden h-32">
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                                                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                    className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-slate-500 hover:text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" disabled={submitting}
                                        className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${modalType === 'lost' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} disabled:opacity-50`}>
                                        {submitting ? 'Posting...' : `Post ${modalType === 'lost' ? 'Lost' : 'Found'} Item`}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
