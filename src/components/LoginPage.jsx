import React from "react";
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
    <div className="flex h-screen w-screen overflow-hidden m-0 p-0">
      {/* LEFT SIDE: Login */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200">
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

      {/* RIGHT SIDE: FULL IMAGE */}
      <div className="hidden md:block w-1/2 h-full">
        <img
          src="/login-side.png"  // <-- put your image in /public folder
          alt="Login Visual"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
