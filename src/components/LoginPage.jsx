// src/components/LoginPage.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// --- Function to handle communication with Backend ---
const sendTokenToBackend = async (jwtToken) => {
    const backendUrl = 'http://localhost:5000/api/auth/google';

    console.log("Sending JWT to backend for verification...");

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: jwtToken }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Backend verification successful. User data:", data);
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
            <div className="login-container">
                <h1 className="login-title">Sign In to Your Dynamic Website</h1>
                <p className="login-subtitle">Use your Google account for a quick and secure login.</p>

                <div className="login-button">
                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
