import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CheckCircle, XCircle, FileText, AlertCircle, ShoppingBag,
    Users, ShoppingCart, Trash2, Shield, ShieldOff,
    TrendingUp, BarChart2, Clock, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TABS = [
    { id: 'notes', label: 'Pending Notes', icon: FileText },
    { id: 'pendingProducts', label: 'Pending Products', icon: ShoppingBag },
    { id: 'products', label: 'All Products', icon: ShoppingBag },
    { id: 'orders', label: 'All Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'skills', label: 'Skills', icon: TrendingUp },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('notes');
    const [data, setData] = useState({ notes: [], pendingProducts: [], products: [], orders: [], users: [], skills: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/'); return; }
        fetchAll();
    }, [user, navigate]);

    const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [notesRes, pendingProductsRes, productsRes, ordersRes, usersRes, skillsRes] = await Promise.all([
                axios.get('/api/notes/pending', cfg()),
                axios.get('/api/products/admin/pending', cfg()),
                axios.get('/api/products/admin/all', cfg()),
                axios.get('/api/orders/all', cfg()),
                axios.get('/api/auth/users', cfg()),
                axios.get('/api/skills', cfg()),
            ]);
            setData({
                notes: notesRes.data,
                pendingProducts: pendingProductsRes.data,
                products: productsRes.data,
                orders: ordersRes.data,
                users: usersRes.data,
                skills: skillsRes.data,
            });
        } catch (err) {
            console.error(err);
            setError('Failed to load admin data. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // ---- Pending Product Actions ----
    const handleApproveProduct = async (id) => {
        try {
            await axios.put(`/api/products/${id}/approve`, {}, cfg());
            setData(d => ({
                ...d,
                pendingProducts: d.pendingProducts.filter(p => p._id !== id),
                products: d.products.map(p => p._id === id ? { ...p, status: 'Available' } : p)
            }));
        } catch (err) { alert('Error approving product: ' + (err.response?.data?.message || err.message)); }
    };
    const handleRejectProduct = async (id) => {
        const reason = prompt('Reason for rejection (optional):') ?? '';
        try {
            await axios.put(`/api/products/${id}/reject`, { reason }, cfg());
            setData(d => ({
                ...d,
                pendingProducts: d.pendingProducts.filter(p => p._id !== id),
                products: d.products.map(p => p._id === id ? { ...p, status: 'Rejected' } : p)
            }));
        } catch (err) { alert('Error rejecting product'); }
    };

    // ---- Notes Actions ----
    const handleApprove = async (id) => {
        try {
            await axios.put(`/api/notes/${id}/approve`, {}, cfg());
            setData(d => ({ ...d, notes: d.notes.filter(n => n._id !== id) }));
        } catch (err) { alert('Error approving note: ' + (err.response?.data?.message || err.message)); }
    };
    const handleReject = async (id) => {
        if (!window.confirm('Reject and permanently delete this note?')) return;
        try {
            await axios.delete(`/api/notes/${id}/reject`, cfg());
            setData(d => ({ ...d, notes: d.notes.filter(n => n._id !== id) }));
        } catch (err) { alert('Error rejecting note'); }
    };

    // ---- Product Actions ----
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Permanently delete this product?')) return;
        try {
            await axios.delete(`/api/products/${id}`, cfg());
            setData(d => ({ ...d, products: d.products.filter(p => p._id !== id) }));
        } catch (err) { alert('Error deleting product'); }
    };

    // ---- User Actions ----
    const handleToggleAdmin = async (id) => {
        try {
            const { data: res } = await axios.put(`/api/auth/users/${id}/toggle-admin`, {}, cfg());
            setData(d => ({ ...d, users: d.users.map(u => u._id === id ? res.user : u) }));
        } catch (err) { alert(err.response?.data?.message || 'Error updating admin status'); }
    };
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try {
            await axios.delete(`/api/auth/users/${id}`, cfg());
            setData(d => ({ ...d, users: d.users.filter(u => u._id !== id) }));
        } catch (err) { alert(err.response?.data?.message || 'Error deleting user'); }
    };

    // ---- Skill Actions ----
    const handleDeleteSkill = async (id) => {
        if (!window.confirm('Remove this skill listing?')) return;
        try {
            await axios.delete(`/api/skills/${id}`, cfg());
            setData(d => ({ ...d, skills: d.skills.filter(s => s._id !== id) }));
        } catch (err) { alert('Error deleting skill'); }
    };

    const stats = [
        { label: 'Pending Notes', value: data.notes.length, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Pending Products', value: data.pendingProducts.length, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Total Orders', value: data.orders.length, icon: ShoppingCart, color: 'text-secondary-600', bg: 'bg-secondary-50' },
        { label: 'Registered Users', value: data.users.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
        </div>
    );

    if (error) return (
        <div className="text-center mt-20 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-500 mb-4 text-sm">{error}</p>
            <button onClick={fetchAll} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold">Retry</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto mt-8 px-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-lg shadow-primary-200">
                        <BarChart2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Manage the StudentVerse platform</p>
                    </div>
                </div>
                <button onClick={fetchAll} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
                    ↻ Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="glass-card p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${s.bg}`}>
                                <Icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="glass-card overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-100">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.id === 'notes' && data.notes.length > 0 && (
                                    <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {data.notes.length}
                                    </span>
                                )}
                                {tab.id === 'pendingProducts' && data.pendingProducts.length > 0 && (
                                    <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {data.pendingProducts.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6">
                    {/* ---- NOTES TAB ---- */}
                    {activeTab === 'notes' && (
                        data.notes.length === 0 ? (
                            <div className="text-center py-16">
                                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-slate-700">All caught up!</h2>
                                <p className="text-slate-500 mt-2">No pending notes requiring approval.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {data.notes.map(note => (
                                    <div key={note._id} className="p-5 border border-amber-100 bg-amber-50/30 rounded-2xl flex flex-col relative">
                                        <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">PENDING</span>
                                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                                            <FileText className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{note.title}</h3>
                                        <div className="text-sm text-slate-500 mb-4 space-y-0.5">
                                            <p><span className="font-medium text-slate-600">Subject:</span> {note.subject}</p>
                                            <p><span className="font-medium text-slate-600">Sem:</span> {note.semester}</p>
                                            <p><span className="font-medium text-slate-600">By:</span> {note.uploaderName}</p>
                                        </div>
                                        <div className="mt-auto flex gap-2 pt-3 border-t border-amber-100">
                                            <button onClick={() => handleApprove(note._id)} className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-sm">
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button onClick={() => handleReject(note._id)} className="flex-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-sm">
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* ---- PENDING PRODUCTS TAB ---- */}
                    {activeTab === 'pendingProducts' && (
                        data.pendingProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-slate-700">No pending products!</h2>
                                <p className="text-slate-500 mt-2">All product listings have been reviewed.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {data.pendingProducts.map(p => (
                                    <div key={p._id} className="border border-orange-100 bg-orange-50/30 rounded-2xl overflow-hidden flex flex-col group">
                                        <div className="relative aspect-[4/3] bg-slate-100">
                                            {p.image ? (
                                                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}
                                            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">PENDING</span>
                                            <span className="absolute top-2 right-2 bg-white text-slate-700 text-xs font-semibold px-2 py-1 rounded-md shadow">{p.condition}</span>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-bold text-slate-800 line-clamp-1">{p.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-sm">
                                                <span className="text-primary-600 font-bold">₹{p.price}</span>
                                                <span className="text-slate-400">·</span>
                                                <span className="text-slate-500">{p.category}</span>
                                            </div>
                                            {p.conditionDetails && (
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">"{p.conditionDetails}"</p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-1">by {p.sellerName}</p>
                                            <div className="mt-auto pt-3 flex gap-2">
                                                <button onClick={() => handleApproveProduct(p._id)} className="flex-1 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors rounded-xl font-semibold flex items-center justify-center gap-1.5 text-sm">
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button onClick={() => handleRejectProduct(p._id)} className="flex-1 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-xl font-semibold flex items-center justify-center gap-1.5 text-sm">
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* ---- ALL PRODUCTS TAB ---- */}
                    {activeTab === 'products' && (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">{data.products.length} total products</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-left">
                                            <th className="pb-3 text-slate-600 font-semibold">Product</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Category</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Price</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Seller</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Status</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.products.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50/50">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{p.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-slate-500">{p.category}</td>
                                                <td className="py-3 pr-4 font-semibold text-slate-800">₹{p.price}</td>
                                                <td className="py-3 pr-4 text-slate-500">{p.sellerName}</td>
                                                <td className="py-3 pr-4">
                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                                        p.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                                                        p.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                        p.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                        'bg-slate-100 text-slate-500'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.products.length === 0 && <div className="text-center py-12 text-slate-400">No products found.</div>}
                            </div>
                        </div>
                    )}

                    {/* ---- ORDERS TAB ---- */}
                    {activeTab === 'orders' && (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">{data.orders.length} total orders</p>
                            <div className="space-y-3">
                                {data.orders.map(order => (
                                    <div key={order._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-slate-800">ORD-{order._id.slice(-6)}</div>
                                            <div className="text-sm text-slate-500">Buyer: <span className="font-medium text-slate-700">{order.buyerName}</span></div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                                &nbsp;·&nbsp;{order.products?.length || 0} items
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg text-slate-900">₹{order.totalAmount}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Active' ? 'bg-amber-100 text-amber-700' : order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {data.orders.length === 0 && <div className="text-center py-12 text-slate-400">No orders found.</div>}
                            </div>
                        </div>
                    )}

                    {/* ---- USERS TAB ---- */}
                    {activeTab === 'users' && (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">{data.users.length} registered users</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-left">
                                            <th className="pb-3 text-slate-600 font-semibold">User</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Email</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Role</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Joined</th>
                                            <th className="pb-3 text-slate-600 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.users.map(u => (
                                            <tr key={u._id} className="hover:bg-slate-50/50">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-slate-800">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                                                <td className="py-3 pr-4">
                                                    {u.isAdmin ? (
                                                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-primary-100 text-primary-700">Admin</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">Student</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-1">
                                                        {u._id !== user._id && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleAdmin(u._id)}
                                                                    title={u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                                    className={`p-2 rounded-lg transition-colors ${u.isAdmin ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                                                >
                                                                    {u.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                                </button>
                                                                <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {u._id === user._id && (
                                                            <span className="text-xs text-slate-400 italic">You</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ---- SKILLS TAB ---- */}
                    {activeTab === 'skills' && (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">{data.skills.length} skill listings</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.skills.map(skill => (
                                    <div key={skill._id} className="p-4 rounded-2xl border border-slate-100 bg-white flex flex-col gap-2 relative group">
                                        <button onClick={() => handleDeleteSkill(skill._id)} className="absolute top-3 right-3 p-1.5 text-slate-300 group-hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${skill.type === 'offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {skill.type === 'offer' ? 'Offering' : 'Requesting'}
                                            </span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{skill.category}</span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 line-clamp-2">{skill.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2">{skill.description}</p>
                                        <p className="text-xs text-slate-400 font-medium">by {skill.authorName}</p>
                                    </div>
                                ))}
                                {data.skills.length === 0 && <div className="col-span-3 text-center py-12 text-slate-400">No skill listings found.</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
