// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Note the .jsx extension for Vite
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// 🚨 IMPORTANT: Replace this with your actual Google Client ID 🚨
// This key tells Google which application is requesting the login.
const GOOGLE_CLIENT_ID = "51532875137-i88eutsv5c8tnn954i3f5abuupvn28ae.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App component with the GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);