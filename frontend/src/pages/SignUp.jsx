// frontend/src/pages/SignUp.jsx (UPDATED FOR GOOGLE LOGIN FIX)

import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { useToast } from "../context/ToastContext.jsx"; // Import ToastContext
import { API_URL, signup } from "../utils/api";

export default function SignUp() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // AuthContext login function
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const [showPassword, setShowPassword] = useState(false); // Toggle function (Password visibility)

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    showToast("Signing up...", "info"); // Show loading toast

    try {
      // 1. Call manual API signup function
      const data = await signup(name, email.trim().toLowerCase(), password);

      if (data.token) {
        // 2. Use the central login function from AuthContext
        // AuthContext handles saving token, fetching user data, and navigation.
        await authLogin(data.token);
        showToast("Account created and logged in successfully!", "success"); // Navigation handled by authLogin
      } else {
        // This case should ideally not be hit if API throws error on failure
        throw new Error(data.message || "Registration failed.");
      }
    } catch (err) {
      const errorText =
        err.message || "Registration failed due to a network error.";
      console.error("Registration Error:", errorText);
      showToast(errorText, "error");
    } finally {
      setLoading(false);
    }
  }; // Google Login redirect for Sign Up page

  const handleGoogleLogin = () => {
    // Clear any previous session data before starting OAuth flow, for consistency
    localStorage.clear(); // 🌟 FIX APPLIED HERE: Changed to '/api/auth/google' // Backend's auth routes are mounted at /api/auth, not just /auth.

    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="flex items-center justify-center h-screen neon-bg">
           {" "}
      <div className="bg-gray-900/80 p-10 rounded-2xl shadow-[0_0_20px_#ff0080] w-96">
               {" "}
        <h1 className="text-4xl font-bold text-neon-pink mb-6 text-center neon-text">
                    Sign Up        {" "}
        </h1>
               {" "}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                   {" "}
          <input
            type="text"
            placeholder="Full Name"
            className="p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-neon-pink outline-none"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
                   {" "}
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:border-neon-pink outline-none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
                    {/* PASSWORD INPUT WITH ICONS */}         {" "}
          <div className="relative">
                       {" "}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="p-3 pr-10 w-full rounded-md bg-gray-800 text-white border border-gray-700 focus:border-neon-pink outline-none"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
                       {" "}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-neon-pink"
              disabled={loading}
            >
                           {" "}
              {showPassword ? (
                <AiOutlineEye size={20} />
              ) : (
                <AiOutlineEyeInvisible size={20} />
              )}
                         {" "}
            </button>
                     {" "}
          </div>
                   {" "}
          <button
            type="submit"
            className="bg-neon-pink py-3 rounded-md text-black font-bold hover:scale-105 transition-all disabled:opacity-50"
            disabled={loading}
          >
                        {loading ? "Signing up..." : "Sign Up"}         {" "}
          </button>
                 {" "}
        </form>
                {/* OR divider and Google Button */}       {" "}
        <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gray-600"></div>         {" "}
          <span className="px-3 text-gray-400 text-sm">OR</span>         {" "}
          <div className="flex-1 h-px bg-gray-600"></div>       {" "}
        </div>
               {" "}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-800 font-semibold py-2 rounded-md flex items-center justify-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
          disabled={loading}
        >
                   {" "}
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
                    Continue with Google        {" "}
        </button>
               {" "}
        <p className="mt-4 text-gray-400 text-center">
                    Already have an account?          {" "}
          <Link to="/" className="text-neon-blue">
                        Login          {" "}
          </Link>
                 {" "}
        </p>
             {" "}
      </div>
         {" "}
    </div>
  );
}
