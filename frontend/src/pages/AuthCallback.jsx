import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          const email = session.user?.email;
          if (email && email.toLowerCase() === 'aksharjain034@gmail.com') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('Error in auth callback:', err.message);
        navigate('/auth', { replace: true });
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-theme-primary">
      <div className="text-center space-y-4 bg-theme-card border border-theme p-8 rounded-3xl shadow-theme max-w-sm w-full mx-4">
        <div className="relative w-12 h-12 mx-auto">
          {/* Animated Glow Loader */}
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div>
          <h3 className="text-lg font-bold font-orbitron uppercase tracking-wider text-theme-primary my-0">
            Secure Auth
          </h3>
          <p className="text-xs text-theme-secondary mt-2 m-0 leading-relaxed">
            Initializing your session with Google. Please wait a moment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
