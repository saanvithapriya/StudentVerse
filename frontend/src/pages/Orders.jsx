import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/orders/myorders', config);
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'Active') return order.status === 'Active';
        return order.status === 'Completed';
    });

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary-100 rounded-xl">
                    <Package className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
                    <p className="text-slate-500">Track and manage your purchases</p>
                </div>
            </div>

            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8 border border-slate-200/60 w-max">
                <button
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'Active' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('Active')}
                >
                    Active Orders
                </button>
                <button
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'Completed' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('Completed')}
                >
                    Completed
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                    <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No {activeTab.toLowerCase()} orders</h3>
                    <p className="text-slate-500 max-w-md mx-auto">When you buy items from other students, your {activeTab.toLowerCase()} orders will appear here.</p>
                    <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        Browse Marketplace
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="glass-card p-5 group hover:border-primary-200 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-5 items-center">
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                                    {order.products && order.products[0]?.image ? (
                                        <img src={order.products[0].image} alt={order.products[0].title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingCart className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">ORD-{order._id.slice(-6)}</span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {order.status === 'Active' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {order.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                        {order.products && order.products.length > 0 
                                            ? order.products.map(p => p.title).join(', ') 
                                            : `Order #${order._id.slice(-6)}`
                                        }
                                    </h3>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-slate-500">
                                        <span>{order.products?.length || 0} Items</span>
                                        <span className="hidden sm:inline text-slate-300">•</span>
                                        <span>Ordered: {formatDate(order.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                    <div className="text-xl font-bold text-slate-900">₹{order.totalAmount}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
