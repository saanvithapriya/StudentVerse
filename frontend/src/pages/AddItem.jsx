import { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { value: 'Books', icon: '📚', desc: 'Textbooks, novels, references' },
    { value: 'Electronics', icon: '💻', desc: 'Laptops, phones, gadgets' },
    { value: 'Furniture', icon: '🪑', desc: 'Chairs, tables, shelves' },
    { value: 'Clothing', icon: '👕', desc: 'Clothes, shoes, accessories' },
    { value: 'Stationery', icon: '✏️', desc: 'Pens, notebooks, art supplies' },
    { value: 'Other', icon: '📦', desc: 'Anything else' },
];

const CONDITIONS = [
    { value: 'Brand New', color: 'emerald', desc: 'Never used, sealed or unused' },
    { value: 'Like New', color: 'teal', desc: 'Used once or twice, no visible wear' },
    { value: 'Good', color: 'blue', desc: 'Minor signs of use, fully functional' },
    { value: 'Fair', color: 'amber', desc: 'Visible wear but works fine' },
    { value: 'Poor', color: 'red', desc: 'Heavy wear, defects present' },
];

const COLOR_MAP = {
    emerald: 'border-emerald-400 bg-emerald-50 text-emerald-700',
    teal: 'border-teal-400 bg-teal-50 text-teal-700',
    blue: 'border-blue-400 bg-blue-50 text-blue-700',
    amber: 'border-amber-400 bg-amber-50 text-amber-700',
    red: 'border-red-400 bg-red-50 text-red-700',
};

export default function AddItem() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [dragActive, setDragActive] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        description: '',
        condition: 'Good',
        conditionDetails: '',
        sellerEmail: user?.email || '',
        sellerPhone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (JPG, PNG, WebP)');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setError('Image must be smaller than 8 MB');
            return;
        }
        setError('');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageFile(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!imageFile) {
            setError('Please upload at least one photo of your item');
            return;
        }
        if (!formData.category) {
            setError('Please select a category');
            return;
        }

        setLoading(true);
        try {
            // Build multipart form data to send image file
            const data = new FormData();
            data.append('image', imageFile);
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('description', formData.description);
            data.append('condition', formData.condition);
            data.append('conditionDetails', formData.conditionDetails);
            data.append('sellerEmail', formData.sellerEmail);
            data.append('sellerPhone', formData.sellerPhone);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    // Do NOT set Content-Type manually — browser sets multipart boundary automatically
                },
            };

            await axios.post('/api/products', data, config);

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate('/profile');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-16 relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Post an Item</h1>
                <p className="text-slate-500 mt-1">Fill out the details below. Your listing will be reviewed by an admin before going live.</p>
            </div>

            {/* Approval notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">Admin Approval Required</p>
                    <p className="text-xs text-amber-700 mt-0.5">All listings are reviewed by our admin team before appearing in the marketplace. This usually takes a few hours.</p>
                </div>
            </div>

            <div className="glass-card p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* ── CATEGORY ── */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                                        formData.category === cat.value
                                            ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">{cat.icon}</div>
                                    <div className={`text-sm font-bold ${formData.category === cat.value ? 'text-primary-700' : 'text-slate-700'}`}>
                                        {cat.value}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">{cat.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── IMAGE UPLOAD ── */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Item Photo <span className="text-red-500">*</span>
                            <span className="ml-2 font-normal text-slate-400 text-xs">Clear photos increase trust and sell faster</span>
                        </label>
                        {!imagePreview ? (
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                                    dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={(e) => handleImageFile(e.target.files?.[0])}
                                />
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">Drag & drop your photo here</p>
                                <p className="text-xs text-slate-400 mt-2">or click to browse — JPG, PNG, WebP up to 8 MB</p>
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 shadow-sm">
                                    <Upload className="w-4 h-4 text-primary-500" />
                                    Choose File
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                <img src={imagePreview} alt="Preview" className="w-full max-h-72 object-contain" />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-500 rounded-full shadow-md transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo selected
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── TITLE + PRICE ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Item Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Engineering Mathematics Vol 1 — R.K. Kanodia"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Seller Phone</label>
                            <input
                                type="tel"
                                name="sellerPhone"
                                value={formData.sellerPhone}
                                onChange={handleChange}
                                placeholder="+91 9876543210 (optional)"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* ── CONDITION ── */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Item Condition <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {CONDITIONS.map(cond => (
                                <button
                                    key={cond.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, condition: cond.value })}
                                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                                        formData.condition === cond.value
                                            ? COLOR_MAP[cond.color] + ' border-2'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                                    }`}
                                >
                                    {cond.value}
                                    <span className="block text-xs font-normal opacity-70 mt-0.5">{cond.desc}</span>
                                </button>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                Describe the condition in detail <span className="text-slate-400">(scratches, missing parts, defects, etc.)</span>
                            </label>
                            <textarea
                                name="conditionDetails"
                                value={formData.conditionDetails}
                                onChange={handleChange}
                                rows={3}
                                placeholder="e.g. Book has minor pencil marks on 3 pages, no major damage. Spine is intact. Cover has small corner crease."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* ── DESCRIPTION ── */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Item Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your item — brand, model, year, reason for selling, what's included, etc."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                            required
                        />
                    </div>

                    {/* ── ACTIONS ── */}
                    <div className="pt-2 flex justify-end gap-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {loading ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in">
                    <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0" />
                    <div>
                        <p className="font-semibold">Listing submitted!</p>
                        <p className="text-xs text-slate-300 mt-0.5">Pending admin approval — redirecting to your profile...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
