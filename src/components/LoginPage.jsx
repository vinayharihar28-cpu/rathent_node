import React, { useEffect } from "react";
import loginImage from "../assets/login-side.png"; // ✅ Import image correctly

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
        window.google.accounts.id.renderButton(document.getElementById("signInDiv"), {
          theme: "outline",
          size: "large",
          width: "250",
        });
      } else {
        setTimeout(checkGoogle, 200);
      }
    };
    checkGoogle();
  }, []);

  const handleCredentialResponse = (response) => {
    const decoded = JSON.parse(atob(response.credential.split(".")[1]));
    localStorage.setItem("userSession", response.credential);
    onLoginSuccess();
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* Left Section */}
      <div className="flex flex-col justify-center items-center w-full md:w-[35%] bg-white z-10 p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Swift Shop
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Sign in with Google to continue
        </p>
        <div id="signInDiv" className="flex justify-center"></div>
      </div>

      {/* Right Section */}
      <div className="hidden md:flex w-[65%] h-full">
        <img
          src={loginImage}
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
