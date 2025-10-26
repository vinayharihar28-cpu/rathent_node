import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const CLIENT_ID = "51532875137-i88eutsv5c8tnn954i3f5abuupvn28ae.apps.googleusercontent.comE"; // ← replace this

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Keep login persistent after refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("googleUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwt_decode(credentialResponse.credential);
    setUser(decoded);
    localStorage.setItem("googleUser", JSON.stringify(decoded));
  };

  const handleLogout = () => {
    localStorage.removeItem("googleUser");
    setUser(null);
  };

  // ✅ Centered layout (works for login & dashboard)
  const containerStyle = {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #8a2be2, #6c63ff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const cardStyle = {
    background: "#fff",
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: "0 4px 25px rgba(0,0,0,0.2)",
    width: "350px",
    textAlign: "center",
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={containerStyle}>
        {!user ? (
          <div style={cardStyle}>
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>
              Login with Google
            </h2>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => alert("Login Failed")}
            />
          </div>
        ) : (
          <div style={cardStyle}>
            <img
              src={user.picture}
              alt="Profile"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                marginBottom: "10px",
              }}
            />
            <h3 style={{ color: "#333" }}>Welcome, {user.name}! 🎉</h3>
            <p style={{ color: "#666", margin: "10px 0" }}>
              Email: {user.email}
            </p>
            <button
              onClick={handleLogout}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "#6c63ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
