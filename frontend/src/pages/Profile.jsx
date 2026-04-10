import { useState, useEffect } from 'react';
import { User, Settings, Package, Star, FileText, Heart, ShieldCheck, LogOut, MessageSquare, X, Phone, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('orders');
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchOrders();
            fetchFullProfile();
        }
    }, [user, navigate]);

    const [fullUser, setFullUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [contactForm, setContactForm] = useState({ phone: '', linkedin: '', portfolio: '' });

    const fetchFullProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/auth/profile', config);
            setFullUser(data);
            if (data.contactInfo) {
                setContactForm({
                    phone: data.contactInfo.phone || '',
                    linkedin: data.contactInfo.linkedin || '',
                    portfolio: data.contactInfo.portfolio || ''
                });
            }
        } catch (error) {
            console.error('Failed to load profile details', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('/api/auth/profile', { contactInfo: contactForm }, config);
            setFullUser(data);
            setShowEditModal(false);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Encountered an error updating profile.');
        }
    };

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/orders/myorders', config);
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    const stats = {
        listings: 0,
        orders: orders.length,
        rating: 5.0,
        reviews: 0,
    };

    return (
        <div className="mt-8 max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="glass-card p-6 md:p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-end px-6">
                    <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer z-20 relative">
                        <Settings className="w-4 h-4" /> Edit Profile
                    </button>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-16">
                    <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 text-4xl font-bold uppercase">
                            {user.name.charAt(0)}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                            {user.name}
                            <ShieldCheck className="w-6 h-6 text-emerald-500" title="Verified College Email" />
                        </h1>
                        <p className="text-slate-500 font-medium mb-4">{user.email}</p>
                        
                        {fullUser?.contactInfo && (fullUser.contactInfo.phone || fullUser.contactInfo.linkedin || fullUser.contactInfo.portfolio) && (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600 font-medium">
                                {fullUser.contactInfo.phone && (
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {fullUser.contactInfo.phone}
                                    </div>
                                )}
                                {fullUser.contactInfo.linkedin && (
                                    <a href={fullUser.contactInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </a>
                                )}
                                {fullUser.contactInfo.portfolio && (
                                    <a href={fullUser.contactInfo.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                                        <LinkIcon className="w-4 h-4 text-slate-500" />
                                        Portfolio
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 pb-2">
                        <div className="flex-1 md:flex-none text-center px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-1">
                                {stats.rating} <Star className="w-5 h-5 fill-amber-400 text-amber-400 -mt-1" />
                            </div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stats.reviews} Reviews</div>
                        </div>
                        <div className="flex-1 md:flex-none text-center px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-2xl font-bold text-primary-600">{stats.orders}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Orders</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-4">
                    <div className="glass-card p-3">
                        {[
                            { id: 'orders', label: 'My Orders', icon: Heart },
                            { id: 'listings', label: 'My Listings', icon: Package },
                            { id: 'notes', label: 'Shared Notes', icon: FileText },
                            { id: 'forum', label: 'Forum Posts', icon: MessageSquare },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all mb-1 last:mb-0 ${activeTab === tab.id
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="glass-card p-3">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="glass-card p-6 min-h-[400px]">
                        <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 capitalize">
                                {activeTab.replace('-', ' ')}
                            </h2>
                            {activeTab === 'listings' && (
                                <Link to="/add-item" className="text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors">
                                    + Add New
                                </Link>
                            )}
                        </div>

                        {activeTab === 'orders' ? (
                            orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold text-slate-800">Order #{order._id.slice(-6)}</div>
                                                <div className="text-sm text-slate-500 text-xs mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div className="mt-2 text-sm text-slate-600">{order.products.length} Items</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-primary-600">₹{order.totalAmount}</div>
                                                <div className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md mt-1 inline-block">
                                                    Completed
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Heart className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No orders found</h3>
                                    <p className="text-slate-500 max-w-sm">
                                        You haven't bought anything yet. Explore the marketplace!
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    {activeTab === 'listings' && <Package className="w-10 h-10 text-slate-300" />}
                                    {activeTab === 'notes' && <FileText className="w-10 h-10 text-slate-300" />}
                                    {activeTab === 'forum' && <MessageSquare className="w-10 h-10 text-slate-300" />}
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No {activeTab.replace('-', ' ')} yet</h3>
                                <p className="text-slate-500 max-w-sm">
                                    When you interact with this section, your activity will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Edit Profile & Contacts</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="p-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg mb-4">
                                    Your contact details will be shared with users when they request to connect with you on the Skill Exchange!
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                                    <input 
                                        type="tel" placeholder="+91 9876543210"
                                        value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn Profile Optional</label>
                                    <input 
                                        type="url" placeholder="https://linkedin.com/in/username"
                                        value={contactForm.linkedin} onChange={e => setContactForm({...contactForm, linkedin: e.target.value})} 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Portfolio/GitHub Optional</label>
                                    <input 
                                        type="url" placeholder="https://github.com/username"
                                        value={contactForm.portfolio} onChange={e => setContactForm({...contactForm, portfolio: e.target.value})} 
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none" 
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-100">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
