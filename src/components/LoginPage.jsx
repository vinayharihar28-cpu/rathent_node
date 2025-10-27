import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LoginPage = ({ onLoginSuccess }) => {
  const handleGoogleLoginSuccess = (credentialResponse) => {
    const jwtToken = credentialResponse.credential;
    const decodedUser = jwtDecode(jwtToken);
    console.log("Logged in:", decodedUser);
    localStorage.setItem("userSession", jwtToken);
    onLoginSuccess();
  };

  const handleGoogleLoginError = () => {
    console.error("Google Login Failed");
  };

  return (
    <div className="flex w-screen h-screen m-0 p-0 overflow-hidden bg-white">
      {/* LEFT SIDE */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-gradient-to-br from-gray-100 to-gray-300">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-80 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome to Swift Shop
          </h1>
          <p className="text-gray-600 mb-6">Sign in with Google to continue</p>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden md:block w-1/2 h-full">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80"
          alt="Shop Visual"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
