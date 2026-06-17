import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { Loader2, ShieldAlert, CheckCircle } from 'lucide-react';

const VerifyingPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const { verifyMagicLinkToken } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'expired'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('expired');
        setErrorMsg('No verification token was provided.');
        return;
      }

      try {
        const res = await verifyMagicLinkToken(token);
        if (res.success) {
          setStatus('success');
          toast.success('Successfully logged in!');
          
          setTimeout(() => {
            if (res.user.email.toLowerCase() === 'aksharjain034@gmail.com') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          }, 1500);
        }
      } catch (err) {
        setStatus('expired');
        setErrorMsg(err.message || 'Verification link has expired or is invalid.');
        toast.error(err.message || 'Verification failed.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-theme-primary">
      <div className="max-w-md w-full space-y-8 bg-theme-card p-8 rounded-3xl border border-theme shadow-theme text-center transition-all duration-300">
        
        {status === 'verifying' && (
          <div className="space-y-6 animate-pulse">
            <div className="mx-auto flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-theme-primary font-orbitron uppercase tracking-wide">
                Verifying Link
              </h2>
              <p className="mt-2 text-xs text-theme-secondary">
                Securing your session. Please wait a moment while we verify your magic link...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <CheckCircle className="h-8 w-8 animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-theme-primary font-orbitron uppercase tracking-wide">
                Verified!
              </h2>
              <p className="mt-2 text-xs text-theme-secondary">
                Your login has been verified. Redirecting you to the dashboard...
              </p>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-theme-primary font-orbitron uppercase tracking-wide">
                Link Expired
              </h2>
              <p className="mt-2 text-xs text-theme-secondary max-w-xs mx-auto leading-relaxed">
                {errorMsg || 'This magic link is either expired, invalid, or has already been used.'}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/auth"
                className="w-full flex justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
              >
                Resend verification email
              </Link>
              <Link
                to="/"
                className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-theme-primary transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyingPage;
