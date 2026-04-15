import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Notes from './pages/Notes';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';
import Discussion from './pages/Discussion';
import DiscussionDetail from './pages/DiscussionDetail';
import SkillExchange from './pages/SkillExchange';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Messages from './pages/Messages';


import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full" />
    </div>
  );
  if (!user) return <Navigate to="/admin-login" />;
  if (!user.isAdmin) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Protected Student Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
        <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
        <Route path="/discussion/:id" element={<ProtectedRoute><DiscussionDetail /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><SkillExchange /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />


        {/* Admin Protected Route */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-setup" element={<AdminSetup />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
