import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { Mail, ArrowLeft, Inbox } from 'lucide-react';

const Auth = () => {
  const { sendMagicLink, loginWithGoogle } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState('auth'); // 'auth' or 'check-email'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);

    try {
      const res = await sendMagicLink(email);
      if (res.success) {
        toast.success('Verification link sent!');
        setStep('check-email');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send verification link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-theme-primary">
      <div className="max-w-md w-full space-y-8 bg-theme-card p-8 rounded-3xl border border-theme shadow-theme transition-all duration-300">
        
        {step === 'auth' ? (
          <>
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-theme-primary tracking-tight font-orbitron uppercase bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-2 text-sm text-theme-secondary">
                {activeTab === 'login' ? 'Access your orders and settings' : 'Start your shopping journey with us'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-theme-primary/50 border border-theme p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-theme-card text-theme-primary shadow-sm'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-theme-card text-theme-primary shadow-sm'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Email Form */}
            <form className="mt-8 space-y-6 animate-fade-in" onSubmit={handleAuthSubmit}>
              <div className="space-y-4 rounded-md">
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
                    className="w-full bg-theme-primary border border-theme rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition-all duration-200 text-theme-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {loading ? 'Sending link...' : 'Continue'}
                </button>
              </div>
            </form>

            {/* Divider and OAuth options */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-theme/30"></div>
              <span className="flex-shrink mx-4 text-theme-secondary text-[10px] font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-theme/30"></div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-theme hover:border-indigo-500/35 rounded-xl bg-theme-card hover:bg-theme-primary text-sm font-semibold text-theme-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(79,70,229,0.05)]"
              >
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.77 21.56,11.41 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.92c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.9,0.6 -2.07,0.98 -3.33,0.98 -2.35,0 -4.33,-1.58 -5.04,-3.72H2.86v2.66C4.34,18.98 7.93,20.92 12,20.92z" fill="#34A853" />
                    <path d="M6.96,13.42c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.36H2.86C2.26,8.57 1.92,9.94 1.92,11.72c0,1.78 0.34,3.15 0.94,4.36l4.1,-3.66z" fill="#FBBC05" />
                    <path d="M12,6.78c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.07 14.42,3.42 12,3.42c-4.07,0 -7.66,1.94 -9.14,4.94l4.1,3.14C7.67,9.36 9.65,6.78 12,6.78z" fill="#EA4335" />
                  </g>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </>
        ) : (
          /* CheckEmailPage Waiting Screen */
          <div className="animate-fade-in text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Inbox className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-theme-primary font-orbitron uppercase tracking-wide">Check your inbox</h2>
              <p className="mt-2 text-xs text-theme-secondary leading-relaxed max-w-sm mx-auto">
                We've sent a secure magic link to <span className="font-bold text-theme-primary">{email}</span>. Click the link in the email to log in instantly.
              </p>
            </div>
            
            <div className="pt-2 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-[11px] text-amber-500 font-mono leading-relaxed">
              💡 Dev Mode Hint: Check your backend server console to grab the login link directly if SMTP is not configured!
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <button
                type="button"
                onClick={handleAuthSubmit}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-theme hover:bg-theme-primary rounded-xl text-xs font-semibold text-theme-primary transition-all duration-200 cursor-pointer"
              >
                {loading ? 'Sending link...' : 'Resend Email'}
              </button>
              <button
                type="button"
                onClick={() => setStep('auth')}
                className="w-full text-center py-2.5 text-xs font-semibold text-slate-500 hover:text-theme-primary flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Email Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
