// frontend/src/context/AuthContext.jsx
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

  // 🟢 Derived state: Whether user is authenticated or not
  const isAuthenticated = !!getToken() && !!user;

  // ----------------------------
  // Logout function
  // ----------------------------
  const logout = useCallback(async () => {
    const result = await confirm(
      "Confirm Logout",
      "Are you sure you want to log out?"
    );
    if (!result) return;

    clearToken();
    localStorage.removeItem("userName");
    localStorage.removeItem("userPic");
    localStorage.removeItem("authProvider");
    setUser(null);

    navigate("/login", { replace: true });
    showToast("Logged out successfully.", "info");
  }, [navigate, showToast, confirm]);

  // ----------------------------
  // Fetch current user
  // ----------------------------
  const fetchUser = useCallback(
    async (navigateAfterFetch = false, currentPath = location.pathname) => {
      const token = getToken();

      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      try {
        const fetchedUser = await fetchCurrentUser();
        const userForContext = {
          ...fetchedUser,
          id: fetchedUser._id,
        };
        setUser(userForContext);

        // 🔹 Optional navigation after login
        if (
          navigateAfterFetch ||
          currentPath === "/login" ||
          currentPath === "/signup"
        ) {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("❌ Fetch User failed (Token/API Error):", err);
        clearToken();
        setUser(null);

        if (currentPath !== "/login" && currentPath !== "/signup") {
          showToast(
            "Session expired or authentication failed. Please log in.",
            "error"
          );
          navigate("/login", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, showToast, location.pathname]
  );

  // ----------------------------
  // Login Handler
  // ----------------------------
  const login = useCallback(
    async (token) => {
      setToken(token);
      await fetchUser(true);
    },
    [fetchUser]
  );

  // ----------------------------
  // Initial Auth Check
  // ----------------------------
  useEffect(() => {
    const googleToken = checkGoogleTokenInURL();
    if (googleToken) {
      console.log("✅ Google Token found in URL. Processing login.");
      setToken(googleToken);
      fetchUser(true, location.pathname);
      return;
    }

    fetchUser(false, location.pathname);
  }, [fetchUser, location.pathname]);

  // ----------------------------
  // Refresh user (after profile update)
  // ----------------------------
  const refreshUser = useCallback(async () => {
    try {
      await fetchUser(false);
      showToast("Profile refreshed successfully!", "success");
    } catch (err) {
      console.error("❌ Refresh User failed:", err);
    }
  }, [fetchUser, showToast]);

  // ----------------------------
  // Context value
  // ----------------------------
  const contextValue = {
    user,
    isLoading,
    isAuthenticated, // ✅ FIX: now provided
    login,
    logout,
    refreshUser,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
