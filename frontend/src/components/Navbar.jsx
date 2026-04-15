import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, ChevronDown, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
    { to: '/', label: 'Marketplace' },
    { to: '/notes', label: 'Notes' },
    { to: '/discussion', label: 'Forum' },
    { to: '/skills', label: 'Skills' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const { msgUnreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = cartItems?.length ?? 0;
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 select-none flex-shrink-0">
                        StudentVerse
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(link => (
                            <Link key={link.to} to={link.to}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    isActive(link.to)
                                        ? 'bg-primary-50 text-primary-700 font-semibold'
                                        : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                                }`}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-1">
                        {/* Messages Icon */}
                        <Link to="/messages"
                            className={`relative p-2.5 rounded-xl transition-colors ${isActive('/messages') ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-100'}`}
                            title="Messages">
                            <MessageSquare className="w-5 h-5" />
                            {msgUnreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {msgUnreadCount > 9 ? '9+' : msgUnreadCount}
                                </span>
                            )}
                        </Link>

                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Cart */}
                        <Link to="/cart"
                            className={`relative p-2.5 rounded-xl transition-colors ${isActive('/cart') ? 'bg-secondary-50 text-secondary-600' : 'text-slate-600 hover:bg-slate-100'}`}
                            title="Cart">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Admin Chip */}
                        {user?.isAdmin && (
                            <Link to="/admin"
                                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl hover:shadow-md hover:shadow-primary-500/20 transition-all">
                                <ShieldCheck className="w-3.5 h-3.5" /> Admin
                            </Link>
                        )}

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                id="profile-menu"
                                onClick={() => setDropdownOpen(o => !o)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors ml-1"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="hidden md:block text-sm font-semibold text-slate-700 max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in">
                                    {/* Profile header */}
                                    <div className="px-4 py-3 bg-gradient-to-br from-primary-50 to-secondary-50 border-b border-slate-100">
                                        <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                                    </div>
                                    <div className="p-1.5 space-y-0.5">
                                        {[
                                            { to: '/profile', label: '👤 My Profile' },
                                            { to: '/orders', label: '📦 My Orders' },
                                            { to: '/messages', label: '💬 Messages' },
                                        ].map(item => (
                                            <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)}
                                                className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                                {item.label}
                                            </Link>
                                        ))}
                                        {user?.isAdmin && (
                                            <Link to="/admin" onClick={() => setDropdownOpen(false)}
                                                className="flex items-center w-full px-3 py-2 text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors">
                                                🛡️ Admin Dashboard
                                            </Link>
                                        )}
                                        <div className="border-t border-slate-100 mt-1 pt-1">
                                            <button onClick={handleLogout}
                                                className="flex items-center w-full px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                                🚪 Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile horizontal scroll nav */}
                <div className="md:hidden flex gap-1 pb-2 overflow-x-auto no-scrollbar">
                    {NAV_LINKS.map(link => (
                        <Link key={link.to} to={link.to}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isActive(link.to) ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                            }`}>
                            {link.label}
                        </Link>
                    ))}
                    {user?.isAdmin && (
                        <Link to="/admin" className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold text-primary-700 bg-primary-50">
                            Admin
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
