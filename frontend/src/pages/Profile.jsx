import { useState, useEffect } from 'react';
import {
    User, Settings, Package, Star, FileText, Heart, ShieldCheck,
    LogOut, MessageSquare, X, Phone, Linkedin, Link as LinkIcon,
    Trash2, CheckCircle2, Clock, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TABS = [
    { id: 'orders', label: 'My Orders', icon: Heart },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'notes', label: 'Shared Notes', icon: FileText },
    { id: 'forum', label: 'Forum Posts', icon: MessageSquare },
];

export default function Profile() {
    const [activeTab, setActiveTab] = useState('orders');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [fullUser, setFullUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [contactForm, setContactForm] = useState({ phone: '', linkedin: '', portfolio: '' });
    const [nameForm, setNameForm] = useState('');

    const [orders, setOrders] = useState([]);
    const [listings, setListings] = useState([]);
    const [myNotes, setMyNotes] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [tabLoading, setTabLoading] = useState({});

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchFullProfile();
        fetchOrders();
    }, [user, navigate]);

    const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    const fetchFullProfile = async () => {
        try {
            const { data } = await axios.get('/api/auth/profile', cfg());
            setFullUser(data);
            if (data.contactInfo) {
                setContactForm({
                    phone: data.contactInfo.phone || '',
                    linkedin: data.contactInfo.linkedin || '',
                    portfolio: data.contactInfo.portfolio || '',
                });
            }
            setNameForm(data.name || '');
        } catch (error) {
            console.error('Failed to load profile', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/orders/myorders', cfg());
            setOrders(data);
        } catch (error) { console.error(error); }
    };

    const fetchListings = async () => {
        if (listings.length > 0) return; // already loaded
        setTabLoading(l => ({ ...l, listings: true }));
        try {
            const { data } = await axios.get('/api/products/my', cfg());
            setListings(data);
        } catch (err) { console.error(err); }
        finally { setTabLoading(l => ({ ...l, listings: false })); }
    };

    const fetchMyNotes = async () => {
        if (myNotes.length > 0) return;
        setTabLoading(l => ({ ...l, notes: true }));
        try {
            const { data } = await axios.get('/api/notes/my', cfg());
            setMyNotes(data);
        } catch (err) { console.error(err); }
        finally { setTabLoading(l => ({ ...l, notes: false })); }
    };

    const fetchMyPosts = async () => {
        if (myPosts.length > 0) return;
        setTabLoading(l => ({ ...l, forum: true }));
        try {
            const { data } = await axios.get('/api/discussions/my', cfg());
            setMyPosts(data);
        } catch (err) { console.error(err); }
        finally { setTabLoading(l => ({ ...l, forum: false })); }
    };

    const handleTabChange = (id) => {
        setActiveTab(id);
        if (id === 'listings') fetchListings();
        if (id === 'notes') fetchMyNotes();
        if (id === 'forum') fetchMyPosts();
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put('/api/auth/profile', {
                name: nameForm,
                contactInfo: contactForm
            }, cfg());
            setFullUser(data);
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            alert('Error updating profile.');
        }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await axios.delete(`/api/products/${id}`, cfg());
            setListings(listings.filter(p => p._id !== id));
        } catch (err) { alert('Failed to delete listing'); }
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            await axios.delete(`/api/notes/${id}`, cfg());
            setMyNotes(myNotes.filter(n => n._id !== id));
        } catch (err) { alert('Failed to delete note: ' + (err.response?.data?.message || err.message)); }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Delete this discussion post?')) return;
        try {
            await axios.delete(`/api/discussions/${id}`, cfg());
            setMyPosts(myPosts.filter(p => p._id !== id));
        } catch (err) { alert('Failed to delete post'); }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    if (!user) return null;

    const stats = {
        orders: orders.length,
        listings: listings.length,
        rating: 5.0,
    };

    const displayName = fullUser?.name || user.name;

    return (
        <div className="mt-8 max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="glass-card mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 flex items-center justify-end px-6">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                        <Settings className="w-4 h-4" /> Edit Profile
                    </button>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-16 p-6 md:p-8">
                    <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl shrink-0">
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 text-4xl font-bold uppercase">
                            {displayName.charAt(0)}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                            {displayName}
                            <ShieldCheck className="w-6 h-6 text-emerald-500" title="Verified College Email" />
                            {user.isAdmin && (
                                <span className="text-sm font-bold bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full">Admin</span>
                            )}
                        </h1>
                        <p className="text-slate-500 font-medium mb-4">{user.email}</p>

                        {fullUser?.contactInfo && (fullUser.contactInfo.phone || fullUser.contactInfo.linkedin || fullUser.contactInfo.portfolio) && (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
                                {fullUser.contactInfo.phone && (
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {fullUser.contactInfo.phone}
                                    </div>
                                )}
                                {fullUser.contactInfo.linkedin && (
                                    <a href={fullUser.contactInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                        <Linkedin className="w-4 h-4" /> LinkedIn
                                    </a>
                                )}
                                {fullUser.contactInfo.portfolio && (
                                    <a href={fullUser.contactInfo.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                                        <LinkIcon className="w-4 h-4 text-slate-500" /> Portfolio
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
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rating</div>
                        </div>
                        <div className="flex-1 md:flex-none text-center px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-2xl font-bold text-primary-600">{stats.orders}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Orders</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-4">
                    <div className="glass-card p-3">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all mb-1 last:mb-0 ${
                                        activeTab === tab.id
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

                    {user.isAdmin && (
                        <Link to="/admin" className="glass-card p-3 flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-primary-700 bg-primary-50/50 hover:bg-primary-50 transition-colors">
                            <ShieldCheck className="w-5 h-5 text-primary-600" />
                            Admin Dashboard
                        </Link>
                    )}

                    <div className="glass-card p-3">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="glass-card p-6 min-h-[400px]">
                        <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                            {activeTab === 'listings' && (
                                <Link to="/add-item" className="text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors">
                                    + Add New
                                </Link>
                            )}
                        </div>

                        {/* ORDERS */}
                        {activeTab === 'orders' && (
                            orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold text-slate-800">Order #{order._id.slice(-6)}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div className="mt-1.5 text-sm text-slate-600">{order.products.length} item(s)</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-primary-600">₹{order.totalAmount}</div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-md mt-1 inline-block ${order.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Heart className="w-10 h-10 text-slate-300" />} title="No orders yet" desc="You haven't bought anything yet. Explore the marketplace!" />
                            )
                        )}

                        {/* LISTINGS */}
                        {activeTab === 'listings' && (
                            tabLoading.listings ? <LoadingSpinner /> :
                            listings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {listings.map(p => (
                                        <div key={p._id} className="border border-slate-100 rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                                            <div className="relative aspect-[4/3] bg-slate-100">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                                )}
                                                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-md ${
                                                    p.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                                                    p.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                    p.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {p.status}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteListing(p._id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-400 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-semibold text-slate-800 line-clamp-1">{p.title}</h4>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-sm font-bold text-primary-600">₹{p.price}</span>
                                                    <span className="text-xs text-slate-400">{p.condition}</span>
                                                </div>
                                                {p.status === 'Rejected' && p.rejectionReason && (
                                                    <p className="text-xs text-red-500 mt-1 italic">Rejected: {p.rejectionReason}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<Package className="w-10 h-10 text-slate-300" />} title="No listings yet" desc="You haven't listed any items for sale. Post your first item!" />
                            )
                        )}

                        {/* NOTES */}
                        {activeTab === 'notes' && (
                            tabLoading.notes ? <LoadingSpinner /> :
                            myNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {myNotes.map(note => (
                                        <div key={note._id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 group transition-colors">
                                            <div className="p-2.5 bg-secondary-50 rounded-xl shrink-0">
                                                <FileText className="w-5 h-5 text-secondary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-slate-800 truncate">{note.title}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{note.subject} · {note.semester}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${note.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {note.isApproved ? (
                                                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                                                    )}
                                                </span>
                                                <button onClick={() => handleDeleteNote(note._id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<FileText className="w-10 h-10 text-slate-300" />} title="No notes shared yet" desc="Upload study materials to help your peers!" />
                            )
                        )}

                        {/* FORUM POSTS */}
                        {activeTab === 'forum' && (
                            tabLoading.forum ? <LoadingSpinner /> :
                            myPosts.length > 0 ? (
                                <div className="space-y-3">
                                    {myPosts.map(post => (
                                        <div key={post._id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 group transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {post.tags?.map(tag => (
                                                            <span key={tag} className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">#{tag}</span>
                                                        ))}
                                                    </div>
                                                    <h4 className="font-semibold text-slate-800 line-clamp-1">{post.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {post.answersCount} answers · {new Date(post.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Link to={`/discussion/${post._id}`} className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors opacity-0 group-hover:opacity-100">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={() => handleDeletePost(post._id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<MessageSquare className="w-10 h-10 text-slate-300" />} title="No forum posts yet" desc="Ask questions and share knowledge with the community!" />
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={nameForm}
                                        onChange={e => setNameForm(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                <div className="p-3 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                                    Contact details are shared with users on the Skill Exchange.
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel" placeholder="+91 9876543210"
                                        value={contactForm.phone}
                                        onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                                    <input
                                        type="url" placeholder="https://linkedin.com/in/username"
                                        value={contactForm.linkedin}
                                        onChange={e => setContactForm({ ...contactForm, linkedin: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Portfolio / GitHub</label>
                                    <input
                                        type="url" placeholder="https://github.com/username"
                                        value={contactForm.portfolio}
                                        onChange={e => setContactForm({ ...contactForm, portfolio: e.target.value })}
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

function EmptyState({ icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm text-sm">{desc}</p>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
        </div>
    );
}
