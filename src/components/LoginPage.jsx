// src/components/LoginPage.jsx

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
// If you are using React Router to navigate, uncomment this:
// import { useNavigate } from 'react-router-dom'; 

// 1. --- Function to handle communication with your Backend (Server) ---
const sendTokenToBackend = async (jwtToken) => {
    // 🚨 REPLACE WITH YOUR BACKEND URL 🚨
    // e.g., 'https://your-server.com/api/auth/google'
    const backendUrl = 'http://localhost:5000/api/auth/google'; 

    console.log("Sending JWT to backend for verification...");

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // The body contains the JWT token received from Google
            body: JSON.stringify({ credential: jwtToken }), 
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Backend verification successful. User data:", data);
            
            // Your backend should return a custom session token (e.g., a JWT for your app)
            // Store this token to keep the user logged in across pages.
            localStorage.setItem('userSession', JSON.stringify(data.token)); 
            
            // NOTE: You'll need to update App.jsx to read this token!

            // 💡 If using React Router, you would redirect the user here:
            // navigate('/dashboard'); 

        } else {
            // Handle specific errors returned by your backend
            console.error("❌ Backend Authentication Failed:", data.message);
        }
    } catch (error) {
        // Handle network errors (e.g., server is down)
        console.error("❌ Network or API Connection Error:", error);
    }
};


// 2. --- The React Component ---
const LoginPage = ({ onLoginSuccess }) => {
    // If you uncommented useNavigate above, uncomment this too:
    // const navigate = useNavigate();

    // This function runs after Google successfully issues a token
    const handleGoogleLoginSuccess = (credentialResponse) => {
        const jwtToken = credentialResponse.credential;
        
        // Decode the token to get user info on the client side
        try {
            const decodedUser = jwtDecode(jwtToken);
            console.log('User logged in:', decodedUser.email, decodedUser.name);
            
            // Call the function that communicates with your server
            sendTokenToBackend(jwtToken);
            
            // Inform the parent component (App.jsx) that login was successful
            onLoginSuccess(); 

        } catch (error) {
            console.error('Error decoding JWT:', error);
        }
    };

    // This function runs if the Google login process fails
    const handleGoogleLoginError = () => {
        console.log('Google Login Failed');
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            textAlign: 'center'
        }}>
            <h1>Sign In to Your Dynamic Website</h1>
            <p>Use your Google account for a quick and secure login.</p>

            {/* The main Google Login Button */}
            <div style={{ marginTop: '20px' }}>
                <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    // You can customize the button's appearance here
                    // theme="filled_blue"
                    // size="large"
                />
            </div>
        </div>
    );
};

export default LoginPage;