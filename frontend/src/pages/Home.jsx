import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, Star, Clock, Heart, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Other'];
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
];

const CONDITION_COLORS = {
    'Brand New': 'text-emerald-700 bg-emerald-50',
    'Like New': 'text-teal-700 bg-teal-50',
    'Good': 'text-blue-700 bg-blue-50',
    'Fair': 'text-amber-700 bg-amber-50',
    'Poor': 'text-red-700 bg-red-50',
};

export default function Home() {
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (location.state?.category) setActiveCategory(location.state.category);
    }, [location.state]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory !== 'All') params.set('category', activeCategory);
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (sort !== 'newest') params.set('sort', sort);
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
            if (selectedConditions.length > 0) params.set('condition', selectedConditions.join(','));

            const { data } = await axios.get(`/api/products?${params.toString()}`);
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, debouncedSearch, sort, minPrice, maxPrice, selectedConditions]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const toggleCondition = (cond) => {
        setSelectedConditions(prev =>
            prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
        );
    };

    const clearFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSelectedConditions([]);
        setSort('newest');
        setActiveCategory('All');
    };

    const hasActiveFilters = search || minPrice || maxPrice || selectedConditions.length > 0 || sort !== 'newest' || activeCategory !== 'All';

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Sidebar Filter */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="glass-card p-5 sticky top-24 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </div>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                                <X className="w-3 h-3" /> Clear all
                            </button>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                        <div className="space-y-1">
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${activeCategory === cat ? 'bg-primary-50 text-primary-600 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Range (₹)</p>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none" />
                            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Condition</p>
                        <div className="space-y-1.5">
                            {CONDITIONS.map(cond => (
                                <label key={cond} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={selectedConditions.includes(cond)} onChange={() => toggleCondition(cond)}
                                        className="w-4 h-4 accent-primary-600 rounded" />
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${CONDITION_COLORS[cond] || 'text-slate-600 bg-slate-100'}`}>{cond}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Link to="/add-item" className="block w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center rounded-xl font-medium shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        + Post an Item
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Title + Search + Sort row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Campus Marketplace</h1>
                        <p className="text-slate-500 mt-1 text-sm">Buy and sell essentials with your campus mates.</p>
                    </div>
                </div>

                {/* Search + Sort */}
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products by name, category..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-sm font-medium text-slate-700 cursor-pointer">
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-sm text-slate-500 mb-4">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                        {debouncedSearch && <> for "<strong>{debouncedSearch}</strong>"</>}
                    </p>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 glass-card">
                        <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700">No products found</h2>
                        <p className="text-slate-500 mt-2 text-sm">Try adjusting your search or filters.</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="mt-4 px-5 py-2 bg-primary-50 text-primary-600 rounded-xl font-semibold text-sm hover:bg-primary-100 transition-colors">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <Link key={product._id} to={`/item/${product._id}`} className="group glass-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${CONDITION_COLORS[product.condition] || 'bg-white/90 text-slate-700'}`}>
                                            {product.condition}
                                        </span>
                                    </div>
                                    <span className="absolute top-3 right-3 text-xs font-semibold bg-white/90 text-slate-600 px-2 py-1 rounded-full shadow-sm">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.title}</h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xl font-bold text-slate-800">₹{product.price}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                {product.sellerName?.charAt(0) || 'U'}
                                            </div>
                                            <span className="truncate max-w-[100px]">{product.sellerName}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
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
