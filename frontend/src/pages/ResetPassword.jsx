import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { Mail, Lock, KeyRound, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const { resetPassword } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !token || !newPassword) {
      toast.error('All fields are required.');
      return;
    }
    setLoading(true);

    try {
      const res = await resetPassword(email, token, newPassword);
      toast.success(res.message);
      navigate('/auth');
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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/25 mb-4 text-indigo-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-theme-primary tracking-tight">Reset Password</h2>
          <p className="mt-2 text-sm text-theme-secondary">
            Enter the OTP code sent to your email to set a new password.
          </p>
          <p className="mt-1 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded-md p-2 inline-block font-mono">
            Hint: If not configured with SMTP, check your backend server console for the reset code!
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <KeyRound className="h-5 w-5" />
            </span>
            <input
              type="text"
              maxLength="6"
              required
              placeholder="6-digit Reset OTP"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-theme-primary border border-theme rounded-xl pl-10 pr-4 py-3 text-center text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition-all duration-200 text-theme-primary"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="h-5 w-5" />
            </span>
            <input
              type="password"
              required
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-theme-primary border border-theme rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition-all duration-200 text-theme-primary"
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 transition-all duration-200"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full text-center py-2 text-xs font-semibold text-theme-secondary hover:text-theme-primary"
            >
              Cancel and Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
