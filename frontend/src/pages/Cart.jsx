import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, CreditCard, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Cart() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, removeFromCart, clearCart } = useCart();

    const [showModal, setShowModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    sellerName: item.sellerName
                })),
                totalAmount: total
            };

            await axios.post('/api/orders', orderData, config);

            // Success
            setIsProcessing(false);
            setShowModal(false);
            clearCart();
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Your Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item._id} className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center">
                            <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl bg-slate-100" />
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-semibold text-slate-800 line-clamp-1">{item.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">Seller: {item.sellerName}</p>
                                <div className="text-lg font-bold text-slate-900 mt-2">₹{item.price}</div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item._id)}
                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove item"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96 order-first lg:order-last">
                    <div className="glass-card p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary-500" />
                            Order Summary
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-slate-600 pb-4 border-b border-slate-100">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span className="font-medium">₹{total}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 pb-4 border-b border-slate-100">
                                <span>Platform Fee</span>
                                <span className="font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-800 pt-2">
                                <span>Total</span>
                                <span className="text-primary-600">₹{total}</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-emerald-50 text-emerald-700 p-3 rounded-xl mb-6 text-sm">
                            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
                            <p>Secure checkout powered by StudentVerse. Buyers and sellers are verified students.</p>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                        >
                            Checkout Now
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isProcessing && setShowModal(false)}></div>
                    <div className="w-full max-w-md bg-white rounded-3xl p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Confirm Purchase</h3>
                        <p className="text-slate-600 mb-6">You are about to place an order for {cartItems.length} items totaling ₹{total}. The sellers will be notified.</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 mb-8">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                                <div className="text-sm text-slate-500 mb-1">Payment Method</div>
                                <div className="font-semibold text-slate-800">Campus Cash Wallet</div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                                <div className="text-sm text-slate-500 mb-1">Pickup Location</div>
                                <div className="font-semibold text-slate-800">Selected via Chat (Default)</div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-secondary-500"></div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isProcessing}
                                className="flex-1 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing
                                    </>
                                ) : (
                                    'Confirm Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
