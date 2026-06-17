import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

const GoogleLoginButton = () => {
  const { loginWithGoogleToken } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const accessToken = tokenResponse.access_token;
        if (!accessToken) {
          throw new Error('No access token returned from Google.');
        }

        const res = await loginWithGoogleToken(accessToken);
        if (res.success) {
          toast.success('Logged in successfully with Google!');
          
          // Redirect based on role / admin email
          if (res.user.email.toLowerCase() === 'aksharjain034@gmail.com') {
            navigate('/admin', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }
      } catch (err) {
        console.error('Google Auth Error:', err);
        toast.error(err.message || 'Google authentication failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Popup Error:', error);
      toast.error('Google Account selection cancelled or failed.');
    },
  });

  return (
    <button
      type="button"
      onClick={() => handleGoogleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-theme hover:border-indigo-500/35 rounded-xl bg-theme-card hover:bg-theme-primary text-sm font-semibold text-theme-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] disabled:bg-slate-400 disabled:cursor-not-allowed select-none"
    >
      <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.77 21.56,11.41 21.35,11.1z" fill="#4285F4" />
          <path d="M12,20.92c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.9,0.6 -2.07,0.98 -3.33,0.98 -2.35,0 -4.33,-1.58 -5.04,-3.72H2.86v2.66C4.34,18.98 7.93,20.92 12,20.92z" fill="#34A853" />
          <path d="M6.96,13.42c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.36H2.86C2.26,8.57 1.92,9.94 1.92,11.72c0,1.78 0.34,3.15 0.94,4.36l4.1,-3.66z" fill="#FBBC05" />
          <path d="M12,6.78c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.07 14.42,3.42 12,3.42c-4.07,0 -7.66,1.94 -9.14,4.94l4.1,3.14C7.67,9.36 9.65,6.78 12,6.78z" fill="#EA4335" />
        </g>
      </svg>
      <span>{loading ? 'Connecting Google...' : 'Continue with Google'}</span>
    </button>
  );
};

export default GoogleLoginButton;
