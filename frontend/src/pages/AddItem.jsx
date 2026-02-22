import { useState } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery', 'Other'];

export default function AddItem() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [dragActive, setDragActive] = useState(false);
    const [image, setImage] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        description: '',
        condition: 'Good',
        sellerEmail: user?.email || '',
        sellerPhone: ''
    });

    const handleChangeForm = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setImage(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!user) {
            setError('You must be logged in to add an item');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post('/api/products', {
                ...formData,
                image: image // Note: In production, upload image to cloud storage and save URL
            }, config);

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post item');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Post an Item</h1>
                <p className="text-slate-500 mt-1">Fill out the details below to sell your item.</p>
            </div>

            <div className="glass-card p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Item Image</label>
                        {!image ? (
                            <div
                                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleChange}
                                />
                                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                <p className="text-sm font-medium text-slate-600">Drag & drop an image here</p>
                                <p className="text-xs text-slate-400 mt-2">or click to browse from your device</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-slate-100 flex items-center justify-center border border-slate-200">
                                <img src={image} alt="Preview" className="max-h-full object-contain" />
                                <button
                                    type="button"
                                    onClick={() => setImage(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/90 text-slate-600 hover:text-red-500 rounded-full shadow-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChangeForm}
                                placeholder="e.g. Engineering Mathematics Vol 1"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChangeForm} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer" required>
                                <option value="" disabled>Select a category</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChangeForm}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                            <textarea
                                rows={4}
                                name="description"
                                value={formData.description}
                                onChange={handleChangeForm}
                                placeholder="Describe your item's condition, features, and reason for selling..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                                required
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Seller Email</label>
                            <input
                                type="email"
                                name="sellerEmail"
                                value={formData.sellerEmail}
                                onChange={handleChangeForm}
                                placeholder="Email ID"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Seller Phone</label>
                            <input
                                type="tel"
                                name="sellerPhone"
                                value={formData.sellerPhone}
                                onChange={handleChangeForm}
                                placeholder="Phone Number"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
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
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {loading ? 'Posting...' : 'Post Item'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
                    <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                    <span className="font-medium">Item posted successfully!</span>
                </div>
            )}
        </div>
    );
}
