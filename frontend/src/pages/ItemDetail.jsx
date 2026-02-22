import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, ShieldCheck, MapPin, ChevronRight, AlertCircle, Phone, Mail, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`/api/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError('Product not found');
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        addToCart(product);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    if (loading) {
        return <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full"></div></div>;
    }

    if (error || !product) {
        return <div className="text-center py-20"><h2 className="text-2xl font-bold text-slate-800">{error}</h2></div>;
    }

    return (
        <div className="mt-6 relative">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/" className="hover:text-primary-600 transition-colors">{product.category}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-800 font-medium truncate">{product.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <div className="glass-card aspect-4/3 overflow-hidden rounded-2xl flex items-center justify-center p-4 bg-white/40">
                        <img src={product.image} alt={product.title} className="max-h-full object-contain rounded-xl shadow-sm" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full">
                            {product.condition}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.title}</h1>

                    <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-200">
                        <span className="text-4xl font-extrabold text-slate-900">₹{product.price}</span>
                        {product.status === 'Sold' && (
                            <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded ml-4 uppercase tracking-wider">
                                Sold Out
                            </span>
                        )}
                    </div>

                    <div className="glass-card p-5 mb-8">
                        <h3 className="font-semibold text-slate-800 mb-3">Description</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {product.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Seller</p>
                                <p className="font-medium text-slate-800">{product.sellerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pick up</p>
                                <p className="font-medium text-slate-800">Campus Delivery</p>
                            </div>
                        </div>

                        {/* Seller Details */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Email Seller</p>
                                <p className="font-medium text-slate-800 text-sm">{product.sellerEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Call Seller</p>
                                <p className="font-medium text-slate-800 text-sm">{product.sellerPhone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex gap-4">
                        <button
                            disabled={product.status === 'Sold'}
                            onClick={handleAddToCart}
                            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {product.status === 'Sold' ? 'Sold Out' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
                    <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                    <span className="font-medium">Item added to cart!</span>
                </div>
            )}
        </div>
    );
}
