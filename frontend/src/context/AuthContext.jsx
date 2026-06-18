import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to restore session:', err.message);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  // Listen for Supabase Google OAuth callback
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { email, user_metadata } = session.user;
          const name = user_metadata?.full_name || user_metadata?.name || email.split('@')[0];

          try {
            const res = await axios.post('/api/auth/oauth-success', {
              email,
              name,
              provider: 'Google',
            });
            setToken(res.data.token);
            setUser(res.data.user);
          } catch (err) {
            console.error('OAuth sync failed:', err.message);
          }
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/signup', { name, email, password });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await axios.post('/api/auth/verify-email', { email, otp });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Verification failed.');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      if (err.response?.data?.isVerified === false) {
        return { success: false, isVerified: false, email: err.response.data.email };
      }
      throw new Error(err.response?.data?.message || 'Login failed.');
    }
  };

  // REAL GOOGLE LOGIN via Supabase
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) throw new Error(error.message);
  };

  const loginWithGoogleToken = async (googleToken) => {
    try {
      const res = await axios.post('/api/auth/google', { token: googleToken });
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Google login failed.');
    }
  };

  const loginWithOAuth = async (email, name, provider) => {
    try {
      const res = await axios.post('/api/auth/oauth-success', { email, name, provider });
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'OAuth login failed.');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Request failed.');
    }
  };

  const resetPassword = async (email, otpToken, newPassword) => {
    try {
      const res = await axios.post('/api/auth/reset-password', { email, token: otpToken, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Reset failed.');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      setUser(res.data.user);
      return { success: true, message: res.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Update failed.');
    }
  };

  const sendMagicLink = async (email) => {
    try {
      const res = await axios.post('/api/auth/send-link', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send verification link.');
    }
  };

  const verifyMagicLinkToken = async (token) => {
    try {
      const res = await axios.get(`/api/auth/verify?token=${token}`);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Verification failed.');
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, token, loading,
        signup, verifyEmail, login,
        loginWithGoogle, loginWithGoogleToken, loginWithOAuth,
        forgotPassword, resetPassword,
        updateProfile, logout,
        sendMagicLink, verifyMagicLinkToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};