import React, { useState, useEffect } from "react";
import loginImage from "../assets/login-side.png"; // ✅ Make sure this image exists

// --- Helper to decode Google JWT ---
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

const GOOGLE_CLIENT_ID =
  "51532875137-i88eutsv5c8tnn954i3f5abuupvn28ae.apps.googleusercontent.com";

// --- Main Component ---
export default function LoginPage({ onLoginSuccess, auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("login"); // 'login' | 'forgotPassword' | 'createUser'
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  // --- Google Sign-In Setup ---
  const handleCredentialResponse = (response) => {
    const decoded = decodeJWT(response.credential);
    console.log("Google User Logged In:", decoded);
    onLoginSuccess(decoded.name || "User");
  };

  useEffect(() => {
    if (!document.getElementById("google-client-script")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-client-script";
      document.head.appendChild(script);
    }

    const checkGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("signInDiv"),
          {
            theme: "filled_blue",
            size: "large",
            width: "250",
            shape: "pill",
          }
        );
      } else {
        setTimeout(checkGoogle, 300);
      }
    };
    checkGoogle();
  }, []);

  // --- Manual Login ---
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      if (!auth) {
        setError("Authentication not ready. Please wait...");
        return;
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onLoginSuccess(userCredential.user.displayName || userCredential.user.email);
    } catch (err) {
      console.error("Manual login failed:", err);
      setError("Invalid credentials or Firebase Auth not enabled.");
    }
  };

  // --- Forgot Password ---
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      if (!auth) {
        setError("Authentication not ready. Please wait...");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setIsPasswordResetSent(true);
      setPassword("");
    } catch (err) {
      setError("Failed to send reset email. Check your email and try again.");
    }
  };

  // --- Create User (Sign Up) ---
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError(null);
    setIsAccountCreated(false);
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      if (!auth) {
        setError("Authentication not ready. Please wait...");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setIsAccountCreated(true);
      setPassword("");
      console.log("New User Created:", userCredential.user);
    } catch (err) {
      console.error("Account creation failed:", err);
      setError("Failed to create account. Email may already be in use.");
    }
  };

  // --- UI Forms ---
  const renderLoginForm = () => (
    <form onSubmit={handleManualLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <button
        type="submit"
        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Sign In
      </button>

      <div className="flex justify-between items-center mt-2 text-sm">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode("forgotPassword");
          }}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Forgot Password?
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode("createUser");
          }}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Create Account
        </a>
      </div>

      <div className="flex items-center justify-center space-x-4 pt-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="text-gray-500 text-sm font-medium">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Reset Password
      </h2>
      {isPasswordResetSent ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm">
          Password reset link sent to <b>{email}</b>. Check your inbox.
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          Enter your registered email address to receive a password reset link.
        </p>
      )}
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
        disabled={isPasswordResetSent}
      />
      <button
        type="submit"
        className="w-full py-3 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition"
        disabled={isPasswordResetSent}
      >
        {isPasswordResetSent ? "Link Sent" : "Send Reset Link"}
      </button>
      <div className="text-center pt-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode("login");
            setError(null);
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Sign In
        </a>
      </div>
    </form>
  );

  const renderCreateUserForm = () => (
    <form onSubmit={handleCreateAccount} className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create Account
      </h2>
      {isAccountCreated && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
          Account created successfully! You can now sign in.
        </div>
      )}
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
      <button
        type="submit"
        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 transition"
      >
        Create Account
      </button>
      <div className="text-center pt-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode("login");
            setError(null);
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Sign In
        </a>
      </div>
    </form>
  );

  // --- Main Layout ---
  return (
  <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden font-sans">
    {/* Left Side */}
    <div className="w-full md:w-2/5 flex items-center justify-center bg-gray-50 p-8 h-full">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
          Swift Shop
        </h1>
        <p className="text-gray-600 mb-6">
          {mode === "createUser"
            ? "Join us today! Create your Swift Shop account."
            : mode === "forgotPassword"
            ? "Reset your password quickly."
            : "Welcome back! Sign in below."}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {mode === "login"
          ? renderLoginForm()
          : mode === "forgotPassword"
          ? renderForgotPasswordForm()
          : renderCreateUserForm()}

        {mode === "login" && (
          <div id="signInDiv" className="flex justify-center mt-6"></div>
        )}
      </div>
    </div>

    {/* Right Side */}
    <div className="hidden md:block w-full md:w-3/5 relative h-screen">
      <img
        src={loginImage}
        alt="Shop Background"
        className="w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
    </div>
  </div>
);


}
