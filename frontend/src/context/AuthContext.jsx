// frontend/src/context/AuthContext.jsx — FINAL FIXED VERSION

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  checkGoogleTokenInURL,
  clearToken,
  fetchCurrentUser,
  getToken,
  setToken,
} from "../utils/api.js";
import { useConfirm } from "./ConfirmContext.jsx";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // ✅ Auth state
  const isAuthenticated = !!getToken() && !!user;

  // ----------------------------
  // 🔴 Logout
  // ----------------------------
  const logout = useCallback(async () => {
    const result = await confirm(
      "Confirm Logout",
      "Are you sure you want to log out?"
    );
    if (!result) return;

    clearToken();
    localStorage.clear();
    setUser(null);

    navigate("/login", { replace: true });
    showToast("Logged out successfully.", "info");
  }, [navigate, showToast, confirm]);

  // ----------------------------
  // 🟢 Fetch current user (FIXED)
  // ----------------------------
  const fetchUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const fetchedUser = await fetchCurrentUser();

      setUser({
        ...fetchedUser,
        id: fetchedUser._id,
      });
    } catch (err) {
      console.error("❌ Fetch User failed:", err);

      clearToken();
      setUser(null);

      if (!location.pathname.includes("/login")) {
        navigate("/login", { replace: true });
        showToast("Session expired. Please login again.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, showToast, location.pathname]);

  // ----------------------------
  // 🔵 Login handler (FIXED)
  // ----------------------------
  const login = useCallback(
    async (token) => {
      if (!token) return;

      setToken(token);

      await fetchUser();

      navigate("/", { replace: true });
    },
    [fetchUser, navigate]
  );

  // ----------------------------
  // 🟡 Initial Auth Check (FIXED)
  // ----------------------------
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // ✅ Google login case
      const googleToken = checkGoogleTokenInURL();

      if (googleToken) {
        console.log("✅ Google Token found");
        setToken(googleToken);
      }

      await fetchUser();
    };

    initAuth();
  }, [fetchUser]);

  // ----------------------------
  // 🔄 Refresh user
  // ----------------------------
  const refreshUser = useCallback(async () => {
    try {
      await fetchUser();
      showToast("Profile refreshed!", "success");
    } catch (err) {
      console.error("❌ Refresh failed:", err);
    }
  }, [fetchUser, showToast]);

  // ----------------------------
  // 📦 Context value
  // ----------------------------
  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
