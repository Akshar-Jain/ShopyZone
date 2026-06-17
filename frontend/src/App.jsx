import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Context Providers
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

// Routing Guards
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';

// Core Layout
import Layout from './components/Layout.jsx';

// Pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Auth from './pages/Auth.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import FAQ from './pages/FAQ.jsx';
import Contact from './pages/Contact.jsx';
import VerifyingPage from './pages/VerifyingPage.jsx';

// Google OAuth Callback Handler
const AuthCallback = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => navigate('/'), 1500);
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm font-medium">Logging you in with Google...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                {/* Storefront Layout */}
                <Route path="/" element={<Layout />}>
                  {/* Public Storefront Routes */}
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="verify" element={<VerifyingPage />} />

                  {/* Google OAuth Callback */}
                  <Route path="auth/callback" element={<AuthCallback />} />

                  {/* Customer Protected Routes */}
                  <Route
                    path="checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Protected Routes */}
                  <Route
                    path="admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                </Route>

                {/* Catch-all Redirect */}
                <Route path="*" element={<Home />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;