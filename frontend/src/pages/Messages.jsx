import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Search, MessageSquare, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useParams, useNavigate } from 'react-router-dom';

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
}

export default function Messages() {
    const { user } = useAuth();
    const { refreshMsg } = useNotifications();
    const { userId: routeUserId } = useParams();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeUserId, setActiveUserId] = useState(routeUserId || null);
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [searchConv, setSearchConv] = useState('');
    const messagesEndRef = useRef(null);

    const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    // Fetch conversations
    useEffect(() => {
        const fetch = async () => {
            setLoadingConvs(true);
            try {
                const { data } = await axios.get('/api/messages/conversations', cfg());
                setConversations(data);
            } catch (err) { console.error(err); }
            finally { setLoadingConvs(false); }
        };
        fetch();
    }, []);

    // Fetch messages for active conversation
    useEffect(() => {
        if (!activeUserId) return;
        const fetch = async () => {
            setLoadingMsgs(true);
            try {
                const { data } = await axios.get(`/api/messages/${activeUserId}`, cfg());
                setMessages(data.messages);
                setOtherUser(data.otherUser);
                // Reset unread in sidebar
                setConversations(prev => prev.map(c =>
                    c.otherUser?._id === activeUserId ? { ...c, unread: 0 } : c
                ));
                refreshMsg();
            } catch (err) { console.error(err); }
            finally { setLoadingMsgs(false); }
        };
        fetch();
        // Poll for new messages every 5s
        const interval = setInterval(fetch, 5000);
        return () => clearInterval(interval);
    }, [activeUserId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!content.trim() || !activeUserId) return;
        setSending(true);
        try {
            const { data: msg } = await axios.post('/api/messages', {
                receiverId: activeUserId,
                content: content.trim()
            }, cfg());
            setMessages(prev => [...prev, msg]);
            setContent('');
            // Update last message in conversation list
            setConversations(prev => prev.map(c =>
                c.otherUser?._id === activeUserId
                    ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt, isLastMine: true }
                    : c
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const selectConversation = (userId) => {
        setActiveUserId(userId);
        navigate(`/messages/${userId}`, { replace: true });
    };

    const filteredConvs = conversations.filter(c =>
        !searchConv || c.otherUser?.name?.toLowerCase().includes(searchConv.toLowerCase())
    );

    return (
        <div className="mt-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-primary-600" /> Messages
            </h1>

            <div className="glass-card overflow-hidden flex" style={{ height: '72vh' }}>
                {/* Left: Conversation List */}
                <div className={`w-full lg:w-72 border-r border-slate-100 flex flex-col shrink-0 ${activeUserId ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-3 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                value={searchConv}
                                onChange={e => setSearchConv(e.target.value)}
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {loadingConvs ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
                            </div>
                        ) : filteredConvs.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-400">No conversations yet</p>
                                <p className="text-xs text-slate-300 mt-1">Message a seller from any product page</p>
                            </div>
                        ) : (
                            filteredConvs.map(conv => (
                                <button
                                    key={conv.threadId}
                                    onClick={() => selectConversation(conv.otherUser._id)}
                                    className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-3 ${activeUserId === conv.otherUser._id ? 'bg-primary-50/50' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                                        {conv.otherUser?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800 text-sm truncate">{conv.otherUser?.name}</span>
                                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
                                        </div>
                                        <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                                            {conv.isLastMine ? 'You: ' : ''}{conv.lastMessage}
                                        </p>
                                    </div>
                                    {conv.unread > 0 && (
                                        <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                            {conv.unread}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Chat Window */}
                <div className={`flex-1 flex flex-col ${!activeUserId ? 'hidden lg:flex' : 'flex'}`}>
                    {!activeUserId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-600">Select a conversation</h3>
                            <p className="text-sm text-slate-400 mt-2 max-w-xs">
                                Or message a seller directly from any product listing page.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                <button onClick={() => { setActiveUserId(null); navigate('/messages'); }} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                                    {otherUser?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{otherUser?.name || '...'}</p>
                                    <p className="text-xs text-slate-400">{otherUser?.email}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {loadingMsgs ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 text-sm">
                                        No messages yet. Say hello! 👋
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMine = msg.sender === user._id || msg.sender?._id === user._id ||
                                            msg.sender?.toString() === user._id?.toString();
                                        return (
                                            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                                    isMine
                                                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-br-sm'
                                                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                                                }`}>
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-slate-400'}`}>
                                                        {timeAgo(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="flex items-center gap-3 p-3 border-t border-slate-100">
                                <input
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                    disabled={sending}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                                />
                                <button type="submit" disabled={sending || !content.trim()}
                                    className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
