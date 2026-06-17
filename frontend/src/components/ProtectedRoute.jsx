import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// Spinner component
export const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-screen bg-slate-50' : 'p-8'}`}>
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 m-auto h-4 w-4 rounded-full bg-indigo-600 animate-pulse"></div>
      </div>
    </div>
  );
};

// Guard for regular user protected routes
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    // Redirect to auth page, preserving the original route path
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

// Guard for admin-only routes
export const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Strict check: must be logged in, role must be admin, and email must match admin
  if (!user || user.role !== 'admin' || user.email.toLowerCase() !== 'aksharjain034@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return children;
};
