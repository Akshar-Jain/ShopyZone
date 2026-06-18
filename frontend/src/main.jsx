import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://shopyzone.onrender.com');


const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '385151190928-ebbgljqpbqing8h3kb39oqn4kp1d9iut.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
