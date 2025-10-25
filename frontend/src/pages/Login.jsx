//frontend/src/pages/Login.jsx--

import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext.jsx";
import { API_URL, login as manualLogin } from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ----------------------------
  // Handle Google OAuth redirect token
  // ----------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      const decodedToken = decodeURIComponent(token);

      authLogin(decodedToken, true)
        .then(() => {
          // 💡 FIX 1: Google Login सफल होने पर, नए Home पेज पर नेविगेट करें।
          // use replace: true ताकि यूज़र Login पेज पर वापस न जा सके
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.error("Google Auth Token Error:", err);
          showToast("Google Login failed. Please try again.", "error");
        });

      // Clean URL query params
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    // 'navigate' को dependency array में जोड़ा गया क्योंकि उसका उपयोग useEffect के अंदर हो रहा है।
  }, [authLogin, navigate]);

  // ----------------------------
  // Manual login handler
  // ----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    showToast("Logging in...", "info");

    try {
      // 1. Call manual API login function
      const data = await manualLogin(email.trim().toLowerCase(), password);

      if (data.token) {
        await authLogin(data.token);
        showToast("Logged in successfully!", "success");
        // 💡 FIX 2: Manual Login सफल होने पर, नए Home पेज पर नेविगेट करें।
        navigate("/");
      } else {
        throw new Error(
          data.message || "Invalid credentials or missing token."
        );
      }
    } catch (err) {
      const errorText = err.message || "Login failed due to a network error.";
      console.error("Login Error:", errorText);
      showToast(errorText, "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Google login button (Unchanged)
  // ----------------------------
  const handleGoogleLogin = () => {
    localStorage.clear();
    // ✅ FIX: Google Login URL को /api/auth/google पर बदलें (Unchanged)
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="flex items-center justify-center h-screen neon-bg">
      <div className="bg-gray-900/80 p-10 rounded-2xl shadow-[0_0_20px_#00f0ff] w-96">
        <h1 className="text-4xl font-bold text-neon-blue mb-6 text-center neon-text">
          Login
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-neon-blue outline-none"
            disabled={loading}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 pr-10 w-full rounded-md bg-gray-800 text-white border border-gray-700 focus:border-neon-blue outline-none"
              disabled={loading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-neon-blue"
              disabled={loading}
            >
              {showPassword ? (
                <AiOutlineEye size={20} />
              ) : (
                <AiOutlineEyeInvisible size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="bg-neon-blue py-3 rounded-md text-black font-bold hover:scale-105 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-800 font-semibold py-2 rounded-md flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
          disabled={loading}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>
        <p className="mt-4 text-gray-400 text-center">
          Don't have an account?
          <Link to="/signup" className="text-neon-pink">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
