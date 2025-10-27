import React, { useEffect } from "react";

const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

const LoginPage = ({ onLoginSuccess }) => {
  const GOOGLE_CLIENT_ID =
    "51532875137-i88eutsv5c8tnn954i3f5abuupvn28ae.apps.googleusercontent.com";

  useEffect(() => {
    const checkGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          {
            theme: "outline",
            size: "large",
            width: "250",
          }
        );
      } else {
        setTimeout(checkGoogle, 200);
      }
    };
    checkGoogle();
  }, []);

  const handleCredentialResponse = (response) => {
    const decoded = decodeJWT(response.credential);
    console.log("User:", decoded);
    localStorage.setItem("userSession", response.credential);
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Login Box */}
      <div className="w-full md:w-1/3 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-8">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome to Swift Shop
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in with Google to continue
          </p>
          <div id="signInDiv" className="flex justify-center"></div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block w-full md:w-2/3">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600"
          alt="Shop Background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
