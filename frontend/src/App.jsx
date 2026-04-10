import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';

import AddItem from './pages/AddItem';
import Cart from './pages/Cart';

import Orders from './pages/Orders';
import Notes from './pages/Notes';
import AdminDashboard from './pages/AdminDashboard';

import Discussion from './pages/Discussion';
import DiscussionDetail from './pages/DiscussionDetail';
import SkillExchange from './pages/SkillExchange';

import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 animate-spin rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Protected Routes */}
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
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
