import { useState, useEffect } from 'react';
import { Search, Mail, Wrench, Users, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Web Dev', 'Design', 'Tutoring', 'Machine Learning', 'Writing', 'Video Editing'];

export default function SkillExchange() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [skills, setSkills] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('offer');
    const [formData, setFormData] = useState({ title: '', category: 'Web Dev', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSkills();
    }, [activeTab, activeCategory]);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/skills?type=${activeTab}&category=${activeCategory}`);
            setSkills(data);
        } catch (error) {
            console.error('Failure fetching skills', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type) => {
        if (!user) {
            alert('You must be logged in to post listings!');
            return navigate('/login');
        }
        setModalType(type);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/skills', { ...formData, type: modalType }, config);
            setShowModal(false);
            setFormData({ title: '', category: 'Web Dev', description: '' });
            fetchSkills();
        } catch (error) {
            console.error(error);
            alert('Failed to submit post.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleContactClick = (skill) => {
        if (!user) {
            alert('Please login to view contact details.');
            return navigate('/login');
        }
        const contact = skill.author?.contactInfo;
        if (!contact || (!contact.phone && !contact.linkedin && !contact.portfolio)) {
            alert(`${skill.authorName} has not added any contact details to their profile yet.`);
            return;
        }
        
        let message = `Connect with ${skill.authorName}:\n\n`;
        if (contact.phone) message += `📞 Phone: ${contact.phone}\n`;
        if (contact.linkedin) message += `🔗 LinkedIn: ${contact.linkedin}\n`;
        if (contact.portfolio) message += `🌐 Portfolio: ${contact.portfolio}\n`;
        
        alert(message);
    };

    return (
        <div className="mt-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 mb-10 text-center py-16 px-6">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-600/40 to-secondary-600/40 mix-blend-overlay"></div>
                <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-4">Skill Exchange</h1>
                    <p className="text-slate-300 text-lg mb-8">Offer your skills or request help from the campus community. Collaborate and grow together.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => handleOpenModal('offer')} 
                            className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg shadow-white/10"
                        >
                            Offer a Skill
                        </button>
                        <button 
                            onClick={() => handleOpenModal('request')} 
                            className="px-8 py-3 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors hover:border-slate-500"
                        >
                            Request Help
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-64 shrink-0 space-y-6">
                    <div className="glass-card p-2 rounded-2xl flex md:flex-col gap-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap md:w-full md:text-left flex items-center gap-2 ${activeTab === 'all' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Users className="w-4 h-4" /> All Boards
                        </button>
                        <button
                            onClick={() => setActiveTab('offer')}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap md:w-full md:text-left flex items-center gap-2 ${activeTab === 'offer' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Wrench className="w-4 h-4" /> Skills Offered
                        </button>
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap md:w-full md:text-left flex items-center gap-2 ${activeTab === 'request' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Search className="w-4 h-4" /> Help Requests
                        </button>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-slate-800 mb-4">Categories</h3>
                        <div className="space-y-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Board Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-500 font-medium">Loading skills...</div>
                        ) : skills.length === 0 ? (
                            <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-500 glass-card">
                                No listings found. Be the first to post something!
                            </div>
                        ) : (
                            skills.map(skill => (
                                <div key={skill._id} className="glass-card p-6 flex flex-col h-full hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 ${skill.type === 'offer' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wide ${skill.type === 'offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {skill.type === 'offer' ? 'Offering' : 'Requesting'}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            {skill.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {skill.title}
                                    </h3>

                                    <p className="text-sm text-slate-600 mb-6 flex-1">
                                        {skill.description}
                                    </p>

                                    <div className="mt-auto border-t border-slate-100 pt-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                    {skill.authorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{skill.authorName}</p>
                                                    <p className="text-xs text-slate-500">{skill.level}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleContactClick(skill)}
                                            className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                                                skill.type === 'offer' ? 'bg-primary-50 text-primary-600 hover:bg-primary-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            <Mail className="w-4 h-4" />
                                            Contact {skill.authorName.split(' ')[0]}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Posting Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {modalType === 'offer' ? 'Offer a Skill' : 'Request Help'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                        <input 
                                            required type="text" maxLength="80" 
                                            placeholder={modalType === 'offer' ? "I can build React websites" : "I need help with DSA"}
                                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                        <select 
                                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        >
                                            {CATEGORIES.slice(1).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                        <textarea 
                                            required rows="4" 
                                            placeholder="Add details about what you're offering or looking for..."
                                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all" 
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        Cancel
                                    </button>
                                    <button disabled={submitting} type="submit" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50">
                                        {submitting ? 'Posting...' : 'Confirm Post'}
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
