import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, User, ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DiscussionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [answerContent, setAnswerContent] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    
    // Track which answer is currently being replied to
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        fetchDiscussion();
    }, [id]);

    const fetchDiscussion = async () => {
        try {
            const { data } = await axios.get(`/api/discussions/${id}`);
            setDiscussion(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load discussion or it does not exist.');
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to answer');
        if (!answerContent.trim()) return;

        setSubmittingAnswer(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`/api/discussions/${id}/answers`, { content: answerContent }, config);
            setDiscussion(data);
            setAnswerContent('');
        } catch (err) {
            console.error(err);
            alert('Failed to post answer.');
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const handleReplySubmit = async (e, answerId) => {
        e.preventDefault();
        if (!user) return alert('Please login to reply');
        if (!replyContent.trim()) return;
        
        setSubmittingReply(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`/api/discussions/${id}/answers/${answerId}/replies`, { content: replyContent }, config);
            setDiscussion(data);
            setReplyingTo(null);
            setReplyContent('');
        } catch (err) {
            console.error(err);
            alert('Failed to post reply.');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleLike = async () => {
        if (!user) return alert('Please login to like');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/discussions/${id}/like`, {}, config);
            setDiscussion({ ...discussion, likes: discussion.likes + 1 });
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <div className="mt-20 text-center text-slate-500">Loading topic...</div>;
    if (error) return <div className="mt-20 text-center text-red-500 font-medium">{error}</div>;
    if (!discussion) return null;

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-20 px-4">
            <button 
                onClick={() => navigate('/discussion')}
                className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Discussions
            </button>

            {/* Main Question Post */}
            <div className="glass-card p-6 md:p-8 mb-8 border-t-4 border-t-primary-500">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <button onClick={handleLike} className="p-2 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                            <ThumbsUp className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-lg text-slate-700">{discussion.likes}</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {discussion.tags.map(tag => (
                                <span key={tag} className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">{discussion.title}</h1>
                        <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">
                            {discussion.content}
                        </p>

                        <div className="flex items-center gap-3 text-sm text-slate-500 border-t border-slate-100 pt-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-slate-800">{discussion.authorName}</span>
                            <span>•</span>
                            <span>{formatDate(discussion.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    {discussion.answers.length} Answers
                </h2>

                <div className="space-y-6">
                    {discussion.answers.map(answer => (
                        <div key={answer._id} className="glass-card p-6 rounded-2xl bg-white/60">
                            {/* Answer Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold border border-secondary-200">
                                    {answer.authorName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{answer.authorName}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{formatDate(answer.createdAt)}</p>
                                </div>
                            </div>

                            {/* Answer Content */}
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                                {answer.content}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mb-4">
                                <button 
                                    onClick={() => { setReplyingTo(replyingTo === answer._id ? null : answer._id); setReplyContent(''); }}
                                    className="text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
                                >
                                    Reply Thread
                                </button>
                            </div>

                            {/* Inline Reply Form */}
                            {replyingTo === answer._id && (
                                <form onSubmit={(e) => handleReplySubmit(e, answer._id)} className="flex items-start gap-3 mt-4 mb-6 animation-fade-in">
                                    <div className="w-6 h-6 rounded-full bg-primary-100 shrink-0 mt-2 flex items-center justify-center text-primary-600"><User className="w-3 h-3"/></div>
                                    <div className="flex-1">
                                        <textarea 
                                            value={replyContent} 
                                            onChange={e => setReplyContent(e.target.value)}
                                            placeholder={`Reply to ${answer.authorName}...`}
                                            className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" 
                                            rows="2" required 
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button disabled={submittingReply} type="submit" className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                                {submittingReply ? 'Posting...' : 'Post Reply'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Nested Replies */}
                            {answer.replies && answer.replies.length > 0 && (
                                <div className="pl-4 md:pl-8 mt-4 space-y-4 border-l-[3px] border-slate-200">
                                    {answer.replies.map(reply => (
                                        <div key={reply._id} className="pt-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                    {reply.authorName.charAt(0)}
                                                </div>
                                                <h5 className="text-sm font-bold text-slate-700">{reply.authorName}</h5>
                                                <span className="text-xs text-slate-400 font-medium">• {formatDate(reply.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed ml-8 whitespace-pre-wrap">
                                                {reply.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Answer Form */}
            <div className="glass-card p-6 md:p-8 border-t border-slate-200 bg-white/80 mt-12">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Your Answer</h3>
                {user ? (
                    <form onSubmit={handleAnswerSubmit}>
                        <textarea 
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            placeholder="Write your comprehensive answer here..."
                            rows="5"
                            className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none mb-4 shadow-sm"
                            required
                        />
                        <div className="flex justify-end">
                            <button 
                                disabled={submittingAnswer || !answerContent.trim()} 
                                type="submit" 
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {submittingAnswer ? 'Publishing...' : 'Publish Answer'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <p className="text-slate-600 mb-4 font-medium">You must be logged in to post an answer.</p>
                        <button onClick={() => navigate('/login')} className="px-6 py-2 bg-primary-600 font-bold text-white rounded-lg shadow hover:bg-primary-700 transition">
                            Sign In Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
