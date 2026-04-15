import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const TYPE_ICONS = {
    product_approved: '✅',
    product_rejected: '❌',
    note_approved: '📄',
    new_answer: '💬',
    new_message: '✉️',
    new_review: '⭐',
    item_resolved: '🎉',
};

function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const { notifications, unreadCount, markAllRead, markOneRead, clearAll } = useNotifications();

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = async (notif) => {
        if (!notif.read) await markOneRead(notif._id);
        setOpen(false);
        if (notif.link) navigate(notif.link);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                id="notification-bell"
                onClick={() => setOpen(o => !o)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} title="Mark all read" className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg transition-colors">
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAll} title="Clear all" className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif._id}
                                    onClick={() => handleClick(notif)}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!notif.read ? 'bg-primary-50/30' : ''}`}
                                >
                                    <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || '🔔'}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                                            {!notif.read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                                    </div>
                                    {notif.link && <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-1" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
