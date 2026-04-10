import { Search, ShoppingCart, Menu, X, ChevronDown, User, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <nav className="glass-card sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 px-4 md:px-8 py-4 mb-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
                    StudentVerse
                </Link>

                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search items, notes, skills..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    <div className="relative group">
                        <span className="text-slate-600 font-medium group-hover:text-primary-600 transition-colors cursor-pointer py-2">Categories</span>
                        <div className="absolute top-full left-0 mt-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                <Link to="/" state={{ category: 'All' }} className="block px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">Marketplace</Link>
                                <Link to="/notes" className="block px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">Notes Sharing</Link>
                                <Link to="/discussion" className="block px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">Discussion Forum</Link>
                                <Link to="/skills" className="block px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">Skill Exchange</Link>
                            </div>
                        </div>
                    </div>

                    <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors hover:bg-primary-50 rounded-full">
                        <ShoppingCart className="h-6 w-6" />
                        {user && cartItems.length > 0 && (
                            <span className="absolute top-0 right-0 bg-secondary-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-slate-200 hover:border-primary-300 transition-colors bg-white group">
                                <div className="bg-primary-100 p-1.5 rounded-full group-hover:bg-primary-200 transition-colors">
                                    <span className="font-bold text-sm text-primary-700 w-5 h-5 flex items-center justify-center">
                                        {user.name.charAt(0)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                            </Link>
                            {user.isAdmin && (
                                <Link to="/admin" className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100 transition-colors shadow-sm">
                                    Admin
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-5 py-2 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20">
                            Sign In
                        </Link>
                    )}
                </div>

                <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {isMenuOpen && (
                <div className="md:hidden pt-4 pb-2 space-y-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                        />
                    </div>
                    <div className="flex flex-col space-y-3 font-medium text-slate-600">
                        <Link to="/" state={{ category: 'All' }} onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
                        <Link to="/notes" onClick={() => setIsMenuOpen(false)}>Notes Sharing</Link>
                        <Link to="/discussion" onClick={() => setIsMenuOpen(false)}>Discussion Forum</Link>
                        <Link to="/skills" onClick={() => setIsMenuOpen(false)}>Skill Exchange</Link>

                        <div className="border-t border-slate-100 pt-3 my-1"></div>

                        {user ? (
                            <>
                                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" /> Cart ({cartItems.length})
                                </Link>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                                    <User className="w-5 h-5" /> My Profile
                                </Link>
                                {user.isAdmin && (
                                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-emerald-600 font-bold">
                                        <Package className="w-5 h-5" /> Admin Dashboard
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 text-left">
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-primary-600 font-bold">
                                <LogOut className="w-5 h-5" /> Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
