// src/App.jsx

import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx'; // Make sure the path and extension are correct

function App() {
  // State to track if the user is authenticated
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // 1. --- Check for Existing Session on App Load ---
  useEffect(() => {
    const sessionData = localStorage.getItem('userSession'); 
    
    if (sessionData) {
      // In a real app, you would validate this token with your backend 
      // to ensure it's still valid and hasn't expired.
      setIsLoggedIn(true);
      // For a beginner example, we'll assume the session token contains user data
      // setUserProfile(JSON.parse(sessionData).userData); 
    }
  }, []);

  // 2. --- Handlers ---
  
  // Called by LoginPage.jsx upon successful authentication
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // You would fetch and set the user profile here if needed
  };

  const handleLogout = () => {
    // Clear the session token from local storage
    localStorage.removeItem('userSession');
    
    // Clear the application state
    setIsLoggedIn(false);
    setUserProfile(null);
    
    console.log("Logged out successfully.");
  };

  // 3. --- Conditional Rendering (The "Dynamic" Part) ---
  return (
    <div className="App">
      {isLoggedIn ? (
        // Renders the protected content when logged in
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Dashboard (Protected Content)</h1>
          {/* Display user info if you retrieve it */}
          <p>Welcome to the main area of your dynamic website!</p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      ) : (
        // Renders the login page when logged out
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;