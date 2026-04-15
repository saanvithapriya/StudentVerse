import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [msgUnreadCount, setMsgUnreadCount] = useState(0);

    const cfg = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await axios.get('/api/notifications', cfg());
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (err) { /* silent */ }
    }, [user]);

    const fetchMsgCount = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await axios.get('/api/messages/unread-count', cfg());
            setMsgUnreadCount(data.count);
        } catch (err) { /* silent */ }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setMsgUnreadCount(0);
            return;
        }
        fetchNotifications();
        fetchMsgCount();
        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
            fetchMsgCount();
        }, 30000);
        return () => clearInterval(interval);
    }, [user, fetchNotifications, fetchMsgCount]);

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/read-all', {}, cfg());
            setNotifications(n => n.map(x => ({ ...x, read: true })));
            setUnreadCount(0);
        } catch (err) { /* silent */ }
    };

    const markOneRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`, {}, cfg());
            setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
            setUnreadCount(c => Math.max(0, c - 1));
        } catch (err) { /* silent */ }
    };

    const clearAll = async () => {
        try {
            await axios.delete('/api/notifications', cfg());
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) { /* silent */ }
    };

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, msgUnreadCount,
            markAllRead, markOneRead, clearAll,
            refresh: fetchNotifications, refreshMsg: fetchMsgCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
