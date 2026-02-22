import { useState } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ORDERS = [
    { id: 'ORD-2023-001', title: 'Calculus Early Transcendentals', price: 600, seller: 'Aditi V.', status: 'Active', date: 'Today, 2:30 PM', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200' },
    { id: 'ORD-2023-002', title: 'Lab Apron', price: 250, seller: 'Rohan M.', status: 'Active', date: 'Yesterday, 11:15 AM', image: 'https://images.unsplash.com/photo-1584968153986-3f59e41cb12b?auto=format&fit=crop&q=80&w=200' },
    { id: 'ORD-2023-003', title: 'Casio Scientific Calculator', price: 800, seller: 'Priya S.', status: 'Completed', date: 'Oct 15, 2023', image: 'https://images.unsplash.com/photo-1620863076579-dd2df8398e40?auto=format&fit=crop&q=80&w=200' },
];

export default function Orders() {
    const [activeTab, setActiveTab] = useState('Active');

    const filteredOrders = ORDERS.filter(order => order.status === activeTab);

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

            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                    <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No {activeTab.toLowerCase()} orders</h3>
                    <p className="text-slate-500 max-w-md mx-auto">When you buy items from other students, your {activeTab.toLowerCase()} orders will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="glass-card p-5 group hover:border-primary-200 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-5 items-center">
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                    <img src={order.image} alt={order.title} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{order.id}</span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {order.status === 'Active' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {order.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{order.title}</h3>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-slate-500">
                                        <span>Seller: <span className="font-medium text-slate-700">{order.seller}</span></span>
                                        <span className="hidden sm:inline text-slate-300">•</span>
                                        <span>Ordered: {order.date}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                    <div className="text-xl font-bold text-slate-900">₹{order.price}</div>
                                    <Link to={`/order/${order.id}`} className="flex items-center gap-1 text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors group-hover:underline decoration-2 underline-offset-4">
                                        View Details
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
