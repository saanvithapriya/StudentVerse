import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

// Routes that render completely standalone (full-screen, no navbar, no padding)
const STANDALONE_ROUTES = ['/admin-login', '/admin-setup', '/login', '/signup'];

export default function Layout({ children }) {
    const { user } = useAuth();
    const { pathname } = useLocation();

    const isStandalone = STANDALONE_ROUTES.includes(pathname);

    if (isStandalone) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-slate-50 to-slate-100">
            {user && <Navbar />}
            <main className={`${user ? 'max-w-7xl mx-auto px-4 md:px-8 pb-16' : ''}`}>
                {children}
            </main>
        </div>
    );
}
