import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Trash2, User, PlusCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const POPULAR_TAGS = ['Placements', 'Hackathon', 'React', 'DSA', 'Projects', 'Internships', 'Events'];

export default function Discussion() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [discussions, setDiscussions] = useState([]);
    const [activeTab, setActiveTab] = useState('Latest');
    const [activeTag, setActiveTag] = useState('All');
    const [loading, setLoading] = useState(true);

    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
    
    const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDiscussions();
    }, [activeTab, activeTag]);

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/discussions?tab=${activeTab}&tag=${activeTag}`);
            setDiscussions(data);
        } catch (err) {
            console.error('Error fetching discussions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAskSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/discussions', formData, config);
            setShowQuestionModal(false);
            setFormData({ title: '', content: '', tags: '' });
            fetchDiscussions(); // Refresh active view
        } catch (err) {
            console.error(err);
            alert('Failed to post question. Are you logged in?');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (id) => {
        if (!user) return alert('Please login to like');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/discussions/${id}/like`, {}, config);
            // Optimistic update
            setDiscussions(discussions.map(d => d._id === id ? { ...d, likes: d.likes + 1 } : d));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this discussion post?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/discussions/${id}`, config);
            setDiscussions(discussions.filter(d => d._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete post');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="mt-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Discussion Forum</h1>
                    <p className="text-slate-500 mt-1">Ask questions, share advice, and connect with peers.</p>
                </div>

                <button 
                    onClick={() => {
                        if (!user) return alert('Please sign in to ask a question!');
                        setShowQuestionModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Ask Question
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
                        {['Trending', 'Latest', 'Unanswered'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 font-medium text-sm transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                        {activeTag !== 'All' && (
                            <div className="flex items-center ml-auto pr-4 my-auto">
                                <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
                                    Filtered by: {activeTag}
                                    <button onClick={() => setActiveTag('All')} className="hover:text-primary-900"><X className="w-3 h-3" /></button>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Loading discussions...</div>
                        ) : discussions.length === 0 ? (
                            <div className="glass-card p-10 text-center text-slate-500">
                                No discussions found for this category. Be the first to ask!
                            </div>
                        ) : (
                            discussions.map((post) => (
                                <div key={post._id} onClick={() => navigate(`/discussion/${post._id}`)} className="glass-card p-6 group hover:border-primary-200 transition-colors relative cursor-pointer">
                                    {/* Admin Delete Button */}
                                    {user?.isAdmin && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
                                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Post"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}

                                    <div className="flex gap-4">
                                        {/* Voting column */}
                                        <div className="flex flex-col items-center gap-1 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); handleLike(post._id); }} className="p-2 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                                                <ThumbsUp className="w-5 h-5" />
                                            </button>
                                            <span className="font-bold text-slate-700">{post.likes}</span>
                                        </div>

                                        {/* Content column */}
                                        <div className="flex-1 pr-6">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">
                                                {post.title}
                                            </h2>

                                            <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                                {post.content}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="font-medium text-slate-700">{post.authorName}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(post.createdAt)}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 group-hover:text-primary-600 transition-colors">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {post.answers} Answers
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100">
                        <h3 className="font-bold text-slate-800 mb-2">Build your reputation</h3>
                        <p className="text-sm text-slate-600 mb-4">Answer questions, help your peers, and earn badges on your profile.</p>
                        <button 
                            onClick={() => setShowGuidelinesModal(true)}
                            className="w-full py-2.5 bg-white text-primary-600 font-semibold rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors"
                        >
                            View Guidelines
                        </button>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_TAGS.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => setActiveTag(tag)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTag === tag ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ask Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Ask a Question</h3>
                            <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAskSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                    <input 
                                        required type="text" maxLength="100" 
                                        placeholder="Summarize your question (e.g. How to center a div?)"
                                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                                    <textarea 
                                        required rows="6" 
                                        placeholder="Provide all the details needed to answer your question..."
                                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Placements, Technical, React"
                                        value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} 
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowQuestionModal(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        Cancel
                                    </button>
                                    <button disabled={submitting} type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50">
                                        {submitting ? 'Posting...' : 'Post Question'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Guidelines Modal */}
            {showGuidelinesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">Community Guidelines</h3>
                            <button onClick={() => setShowGuidelinesModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
                            <p><strong>Be respectful.</strong> CampusMart is a place for students to help students. No harassment, hate speech, or profanity will be tolerated.</p>
                            <p><strong>Search before you ask.</strong> Your question might have already been answered! Try searching or browsing first.</p>
                            <p><strong>Be clear and concise.</strong> The better you explain your problem, the better answers you'll get.</p>
                            <p><strong>Do not share private data.</strong> Do not ask for or provide phone numbers, sensitive IDs, or passwords in public threads.</p>
                            <div className="p-4 bg-blue-50 text-blue-700 rounded-xl mt-4 font-medium flex gap-2">
                                Admins actively monitor this forum. Unacceptable messages will be removed.
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowGuidelinesModal(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-sm transition-colors">
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
