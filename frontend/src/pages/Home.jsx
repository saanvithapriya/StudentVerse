import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, Star, Clock, Heart } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery'];

export default function Home() {
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.category) {
            setActiveCategory(location.state.category);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products');
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch products', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Sidebar Filter */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="glass-card p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
                        <Filter className="w-5 h-5" />
                        <h2>Categories</h2>
                    </div>
                    <div className="space-y-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${activeCategory === cat ? 'bg-primary-50 text-primary-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <Link to="/add-item" className="mt-8 block w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center rounded-xl font-medium shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        + Post an Item
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Campus Marketplace</h1>
                        <p className="text-slate-500 mt-1">Buy and sell essentials with your campus mates.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-700">No products found</h2>
                        <p className="text-slate-500 mt-2">Check back later or be the first to sell something in this category!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <Link key={product._id} to={`/item/${product._id}`} className="group glass-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                                        {product.condition}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.title}</h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-xl font-bold text-slate-800">₹{product.price}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                {product.sellerName ? product.sellerName.charAt(0) : 'U'}
                                            </div>
                                            <span className="truncate max-w-[100px]">{product.sellerName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[80px]">{new Date(product.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
