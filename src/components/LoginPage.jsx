import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const sendTokenToBackend = async (jwtToken) => {
  const backendUrl = 'http://localhost:5000/api/auth/google';
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: jwtToken }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('userSession', JSON.stringify(data.token));
    } else {
      console.error("❌ Backend Authentication Failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Network or API Connection Error:", error);
  }
};

const LoginPage = ({ onLoginSuccess }) => {
  const handleGoogleLoginSuccess = (credentialResponse) => {
    const jwtToken = credentialResponse.credential;
    try {
      const decodedUser = jwtDecode(jwtToken);
      console.log('User logged in:', decodedUser.email, decodedUser.name);
      sendTokenToBackend(jwtToken);
      onLoginSuccess();
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  };

  const handleGoogleLoginError = () => {
    console.log('Google Login Failed');
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h1 className="login-title">Welcome to Swift Shop</h1>
        <p className="login-subtitle">Sign in with Google to continue</p>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginError}
        />
      </div>
    </div>
  );
};

export default LoginPage;
