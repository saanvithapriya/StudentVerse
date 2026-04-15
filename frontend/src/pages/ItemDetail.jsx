import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ShoppingCart, Share2, ShieldCheck, MapPin, ChevronRight,
    AlertCircle, Phone, Mail, CheckCircle2, MessageSquare,
    Star, Send, X
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function StarRating({ value, max = 5, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <button
                    key={i}
                    type={onChange ? 'button' : undefined}
                    onClick={() => onChange?.(i + 1)}
                    onMouseEnter={() => onChange && setHovered(i + 1)}
                    onMouseLeave={() => onChange && setHovered(0)}
                    className={onChange ? 'cursor-pointer' : 'cursor-default'}
                >
                    <Star
                        className={`w-5 h-5 transition-colors ${
                            i < (hovered || value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(null);
    const [myReview, setMyReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`/api/products/${id}`);
                setProduct(data);
                setLoading(false);

                // Fetch reviews
                const [revRes, myRevRes] = await Promise.all([
                    axios.get(`/api/reviews/seller/${data.seller}`),
                    user ? axios.get(`/api/reviews/product/${id}`, cfg()) : Promise.resolve({ data: { reviewed: false } })
                ]);
                setReviews(revRes.data.reviews);
                setAvgRating(revRes.data.avgRating);
                if (myRevRes.data.reviewed) setMyReview(myRevRes.data.review);
            } catch (err) {
                setError('Product not found');
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) { navigate('/login'); return; }
        addToCart(product);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleMessageSeller = () => {
        if (!user) { navigate('/login'); return; }
        navigate(`/messages/${product.seller}`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const { data } = await axios.post('/api/reviews', {
                sellerId: product.seller,
                productId: id,
                rating,
                comment
            }, cfg());
            setMyReview(data);
            setReviews(prev => [data, ...prev]);
            setShowReviewForm(false);
            // Recalculate avg
            const all = [data, ...reviews];
            setAvgRating(parseFloat((all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1)));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" /></div>;
    if (error || !product) return <div className="text-center py-20"><h2 className="text-2xl font-bold text-slate-800">{error}</h2></div>;

    const isSeller = user && (product.seller?.toString() === user._id?.toString() || product.sellerEmail === user.email);

    return (
        <div className="mt-6 relative pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/" className="hover:text-primary-600 transition-colors">{product.category}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-800 font-medium truncate">{product.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image */}
                <div className="space-y-4">
                    <div className="glass-card overflow-hidden rounded-2xl flex items-center justify-center p-4 bg-white/40 aspect-square">
                        {product.image ? (
                            <img src={product.image} alt={product.title} className="max-h-full object-contain rounded-xl shadow-sm" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-bold rounded-full">{product.condition}</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-semibold rounded-full">{product.category}</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.title}</h1>

                    <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-200">
                        <span className="text-4xl font-extrabold text-slate-900">₹{product.price}</span>
                        {product.status === 'Sold' && (
                            <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-wider">Sold Out</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="glass-card p-5 mb-4">
                        <h3 className="font-semibold text-slate-800 mb-3">Description</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{product.description}</p>
                    </div>

                    {/* Condition details */}
                    {product.conditionDetails && (
                        <div className="glass-card p-5 mb-4 border-l-4 border-l-amber-400">
                            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" /> Condition Details
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{product.conditionDetails}</p>
                        </div>
                    )}

                    {/* Seller info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                {product.sellerName?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Seller</p>
                                <p className="font-semibold text-slate-800">{product.sellerName}</p>
                                {avgRating && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-semibold text-amber-600">{avgRating}</span>
                                        <span className="text-xs text-slate-400">({reviews.length})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Email Seller</p>
                                <p className="font-medium text-slate-800 text-sm">{product.sellerEmail}</p>
                            </div>
                        </div>
                        {product.sellerPhone && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Call Seller</p>
                                    <p className="font-medium text-slate-800 text-sm">{product.sellerPhone}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pick up</p>
                                <p className="font-medium text-slate-800">Campus Delivery</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            disabled={product.status === 'Sold' || isSeller}
                            onClick={handleAddToCart}
                            className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {product.status === 'Sold' ? 'Sold Out' : isSeller ? 'Your Listing' : 'Add to Cart'}
                        </button>
                        {!isSeller && (
                            <button
                                onClick={handleMessageSeller}
                                className="px-5 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-2"
                                title="Message Seller"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="hidden sm:inline">Message</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Seller Reviews</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {avgRating ? (
                                <>
                                    <StarRating value={Math.round(avgRating)} />
                                    <span className="font-bold text-slate-700">{avgRating}</span>
                                    <span className="text-slate-500 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                                </>
                            ) : (
                                <p className="text-slate-400 text-sm">No reviews yet for this seller.</p>
                            )}
                        </div>
                    </div>
                    {user && !isSeller && !myReview && (
                        <button
                            onClick={() => setShowReviewForm(o => !o)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold rounded-xl text-sm transition-colors"
                        >
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            Leave a Review
                        </button>
                    )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <div className="glass-card p-6 mb-6 border border-amber-100 bg-amber-50/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800">Write a Review</h3>
                            <button onClick={() => setShowReviewForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Rating *</label>
                                <StarRating value={rating} onChange={setRating} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review</label>
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Describe your experience with this seller..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-400 outline-none resize-none text-sm"
                                />
                            </div>
                            <button type="submit" disabled={submittingReview}
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                                <Send className="w-4 h-4" />
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                )}

                {/* My reviewed notice */}
                {myReview && (
                    <div className="glass-card p-4 mb-4 border border-emerald-100 bg-emerald-50/30 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-sm text-emerald-700 font-medium">You reviewed this seller — {myReview.rating} ⭐</p>
                    </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 && (
                    <div className="space-y-4">
                        {reviews.map(rev => (
                            <div key={rev._id} className="glass-card p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                                            {rev.reviewerName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{rev.reviewerName}</p>
                                            <StarRating value={rev.rating} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 shrink-0">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                </div>
                                {rev.comment && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{rev.comment}</p>}
                                {rev.productTitle && <p className="text-xs text-slate-400 mt-2">For: {rev.productTitle}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in z-50">
                    <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                    <span className="font-medium">Item added to cart!</span>
                </div>
            )}
        </div>
    );
}
