import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen font-sans">
            {user && <Navbar />}
            <main className={`${user ? 'max-w-7xl mx-auto px-4 md:px-8 pb-12' : ''}`}>
                {children}
            </main>
        </div>
    );
}
