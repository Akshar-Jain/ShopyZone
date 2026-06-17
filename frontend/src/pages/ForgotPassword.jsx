import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { Mail, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required.');
      return;
    }
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      toast.success(res.message);
      // Redirect to reset page with email filled in
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-theme-primary">
      <div className="max-w-md w-full space-y-8 bg-theme-card p-8 rounded-3xl border border-theme shadow-theme">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/25 mb-4 text-rose-500">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-theme-primary tracking-tight">Forgot Password</h2>
          <p className="mt-2 text-sm text-theme-secondary">
            Enter your email and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail className="h-5 w-5" />
            </span>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-theme-primary border border-theme rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition-all duration-200 text-theme-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 transition-all duration-200"
            >
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full text-center py-2 text-xs font-semibold text-theme-secondary hover:text-theme-primary"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
